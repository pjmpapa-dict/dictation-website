# 订阅系统实施方案

## 一、价格策略

### 1.1 定价表
| 方案 | 官网价格 | App内价格 | 年度优惠 | 您的收益差异 |
|------|---------|----------|---------|------------|
| 个人版月付 | **HK$25** | HK$28 | - | +16.7% |
| 个人版年付 | **HK$198** | HK$228 | 省HK$102 | +17.6% |
| 家庭版月付 | **HK$42** | HK$48 | - | +16.7% |
| 家庭版年付 | **HK$328** | HK$388 | HK$176 | +17.6% |

### 1.2 引导策略
- 官网首页突出显示 **"官网订阅最优惠"**
- App内显示提示：**"前往官网订阅，享受更多优惠"**
- 邮件营销强调官网订阅优势

---

## 二、技术实施

### 2.1 Stripe 集成

#### 价格配置（Stripe Dashboard）
```javascript
// 个人版月付
price_personal_monthly_web: HK$25/月

// 个人版年付
price_personal_yearly_web: HK$198/年

// 家庭版月付
price_family_monthly_web: HK$42/月

// 家庭版年付
price_family_yearly_web: HK$328/年
```

#### Checkout 流程
```typescript
// 官网订阅按钮
async function handleSubscribe(priceId: string) {
  const user = auth.currentUser;

  // 1. 创建 Checkout Session
  const response = await fetch('/api/create-checkout-session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      priceId,
      userId: user.uid,
      email: user.email,
    }),
  });

  const { sessionId } = await response.json();

  // 2. 重定向到 Stripe Checkout
  const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_KEY);
  await stripe.redirectToCheckout({ sessionId });
}
```

### 2.2 Firebase Cloud Functions

#### 创建 Checkout Session
```typescript
// functions/src/stripe.ts
import * as functions from 'firebase-functions';
import Stripe from 'stripe';
import * as admin from 'firebase-admin';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export const createCheckoutSession = functions.https.onCall(
  async (data, context) => {
    const { priceId, userId } = data;

    // 验证用户
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'User not authenticated');
    }

    // 创建或获取 Stripe Customer
    let customer;
    const userDoc = await admin.firestore().collection('users').doc(userId).get();
    const userData = userDoc.data();

    if (userData?.stripeCustomerId) {
      customer = userData.stripeCustomerId;
    } else {
      const newCustomer = await stripe.customers.create({
        email: context.auth.token.email,
        metadata: { firebaseUID: userId },
      });

      await admin.firestore().collection('users').doc(userId).update({
        stripeCustomerId: newCustomer.id,
      });

      customer = newCustomer.id;
    }

    // 创建 Checkout Session
    const session = await stripe.checkout.sessions.create({
      customer,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.WEBSITE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.WEBSITE_URL}/pricing`,
      metadata: { firebaseUID: userId },
    });

    return { sessionId: session.id };
  }
);
```

#### Webhook 处理
```typescript
// functions/src/stripe-webhook.ts
export const stripeWebhook = functions.https.onRequest(async (req, res) => {
  const sig = req.headers['stripe-signature'] as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      req.rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // 处理订阅事件
  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutCompleted(event.data.object);
      break;

    case 'customer.subscription.updated':
      await handleSubscriptionUpdated(event.data.object);
      break;

    case 'customer.subscription.deleted':
      await handleSubscriptionDeleted(event.data.object);
      break;

    case 'invoice.payment_succeeded':
      await handlePaymentSucceeded(event.data.object);
      break;

    case 'invoice.payment_failed':
      await handlePaymentFailed(event.data.object);
      break;
  }

  res.json({ received: true });
});

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.firebaseUID;

  if (!userId) return;

  const subscription = await stripe.subscriptions.retrieve(
    session.subscription as string
  );

  // 更新 Firestore
  await admin.firestore().collection('users').doc(userId).update({
    subscription: {
      id: subscription.id,
      status: subscription.status,
      priceId: subscription.items.data[0].price.id,
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      source: 'web', // 标记为官网订阅
    },
    isPremium: true,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  // 更新 Firebase Auth Custom Claims
  await admin.auth().setCustomUserClaims(userId, {
    premium: true,
    subscriptionStatus: 'active',
  });
}
```

### 2.3 Firestore 数据结构

```typescript
// users/{userId}
{
  email: string;
  stripeCustomerId: string;
  subscription: {
    id: string;              // Stripe Subscription ID
    status: string;          // active, past_due, canceled, etc.
    priceId: string;         // 价格 ID
    planType: string;        // 'personal' | 'family'
    billingCycle: string;    // 'monthly' | 'yearly'
    currentPeriodEnd: Timestamp;
    cancelAtPeriodEnd: boolean;
    source: string;          // 'web' | 'ios' | 'android'
  };
  isPremium: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### 2.4 Flutter App 集成

#### 检查订阅状态
```dart
// lib/services/subscription_service.dart
class SubscriptionService {
  final FirebaseAuth _auth = FirebaseAuth.instance;
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;

  // 获取订阅状态
  Future<SubscriptionStatus> getSubscriptionStatus() async {
    final user = _auth.currentUser;
    if (user == null) return SubscriptionStatus.none;

    // 从 Firestore 获取
    final doc = await _firestore.collection('users').doc(user.uid).get();
    final data = doc.data();

    if (data == null || data['subscription'] == null) {
      return SubscriptionStatus.none;
    }

    final subscription = data['subscription'] as Map<String, dynamic>;
    final status = subscription['status'] as String;
    final currentPeriodEnd = (subscription['currentPeriodEnd'] as Timestamp).toDate();

    // 检查是否过期
    if (currentPeriodEnd.isBefore(DateTime.now())) {
      return SubscriptionStatus.expired;
    }

    return status == 'active'
      ? SubscriptionStatus.active
      : SubscriptionStatus.inactive;
  }

  // 监听订阅状态变化
  Stream<bool> get isPremiumStream {
    final user = _auth.currentUser;
    if (user == null) return Stream.value(false);

    return _firestore
      .collection('users')
      .doc(user.uid)
      .snapshots()
      .map((doc) {
        final data = doc.data();
        return data?['isPremium'] as bool? ?? false;
      });
  }

  // 引导用户到官网订阅
  void redirectToWebSubscription() {
    final url = 'https://yourdomain.com/pricing?userId=${_auth.currentUser?.uid}';
    // 打开浏览器
    launchUrl(Uri.parse(url));
  }
}
```

#### App 内订阅提示
```dart
// lib/widgets/subscription_prompt_dialog.dart
class SubscriptionPromptDialog extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: Text('升級至專業版'),
      content: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text('選擇訂閱方式：'),
          SizedBox(height: 16),

          // 官网订阅（推荐）
          Card(
            color: Colors.blue.shade50,
            child: ListTile(
              leading: Icon(Icons.language, color: Colors.blue),
              title: Text('官網訂閱'),
              subtitle: Text('HK\$25/月 · 最優惠 💰'),
              trailing: Chip(
                label: Text('省 11%'),
                backgroundColor: Colors.green,
              ),
              onTap: () {
                Navigator.pop(context);
                SubscriptionService().redirectToWebSubscription();
              },
            ),
          ),

          SizedBox(height: 8),

          // App 内订阅
          ListTile(
            leading: Icon(Icons.phone_iphone),
            title: Text('App 內訂閱'),
            subtitle: Text('HK\$28/月'),
            onTap: () {
              Navigator.pop(context);
              // 打开 App 内订阅页面
              _showAppSubscription(context);
            },
          ),
        ],
      ),
    );
  }
}
```

---

## 三、App 内购买（备选方案）

### 3.1 iOS In-App Purchase
```dart
// lib/services/iap_service.dart
import 'package:in_app_purchase/in_app_purchase.dart';

class IAPService {
  final InAppPurchase _iap = InAppPurchase.instance;

  // 产品 ID（在 App Store Connect 配置）
  static const String personalMonthly = 'personal_monthly';
  static const String personalYearly = 'personal_yearly';
  static const String familyMonthly = 'family_monthly';
  static const String familyYearly = 'family_yearly';

  Future<void> purchaseSubscription(String productId) async {
    final available = await _iap.isAvailable();
    if (!available) return;

    // 获取产品信息
    final response = await _iap.queryProductDetails({productId});
    if (response.productDetails.isEmpty) return;

    final product = response.productDetails.first;

    // 发起购买
    final purchaseParam = PurchaseParam(productDetails: product);
    await _iap.buyNonConsumable(purchaseParam: purchaseParam);
  }
}
```

### 3.2 Android In-App Billing
```dart
// 使用 in_app_purchase 包同样支持 Android
// 在 Google Play Console 配置相同的产品 ID
```

---

## 四、用户流程

### 4.1 官网订阅流程
```
用户访问官网
    ↓
点击"订阅"按钮
    ↓
登录/注册 (Firebase Auth)
    ↓
选择套餐（个人版/家庭版，月付/年付）
    ↓
跳转到 Stripe Checkout
    ↓
输入信用卡信息
    ↓
支付成功
    ↓
Webhook 更新 Firestore
    ↓
App 自动同步订阅状态
    ↓
解锁专业版功能
```

### 4.2 App 内订阅流程
```
用户在 App 内点击订阅
    ↓
显示提示对话框
    ├─ 推荐：前往官网订阅（更优惠）
    └─ 备选：App 内订阅
         ↓
    使用 Apple/Google 支付
         ↓
    验证购买凭证
         ↓
    更新 Firestore
         ↓
    解锁专业版功能
```

---

## 五、实施步骤

### Phase 1: 基础设施（1-2周）
- [ ] 注册 Stripe 账户
- [ ] 配置 Stripe Products 和 Prices
- [ ] 设置 Stripe Webhook
- [ ] 部署 Firebase Cloud Functions

### Phase 2: 官网集成（1周）
- [ ] 创建登录/注册页面
- [ ] 创建订阅页面
- [ ] 集成 Stripe Checkout
- [ ] 实现成功/失败页面

### Phase 3: App 集成（1周）
- [ ] 实现订阅状态检查
- [ ] 添加订阅提示对话框
- [ ] 实现官网跳转
- [ ] 集成 In-App Purchase (iOS/Android)

### Phase 4: 测试（1周）
- [ ] 测试官网订阅流程
- [ ] 测试 App 订阅同步
- [ ] 测试续费和取消
- [ ] 测试退款流程

### Phase 5: 上线（1周）
- [ ] 正式部署
- [ ] 监控订阅数据
- [ ] 准备客服支持

---

## 六、成本分析

### 6.1 官网订阅（Stripe）
```
个人版月付 HK$25:
- Stripe 手续费: 2.9% + HK$2.35 = HK$3.08
- 您的净收入: HK$21.92 (87.7%)

个人版年付 HK$198:
- Stripe 手续费: 2.9% + HK$2.35 = HK$8.09
- 您的净收入: HK$189.91 (95.9%)
```

### 6.2 App 内订阅（Apple/Google）
```
个人版月付 HK$28:
- Apple/Google 佣金: 30% = HK$8.4
- 您的净收入: HK$19.6 (70%)

个人版年付 HK$228:
- Apple/Google 佣金: 30% = HK$68.4
- 您的净收入: HK$159.6 (70%)
```

### 6.3 收益对比
```
官网年付 vs App年付:
HK$189.91 vs HK$159.6
多赚 HK$30.31 (+19%)
```

---

## 七、营销策略

### 7.1 官网引导
- 首页横幅：**"官网订阅享受 11-13% 优惠"**
- 价格页面突出显示官网价格
- 社交媒体推广官网订阅链接

### 7.2 App 内引导
- 设置页面添加 **"前往官网订阅，更优惠"** 按钮
- 首次打开 App 显示提示
- 付费功能被锁定时，优先推荐官网订阅

### 7.3 邮件营销
- 注册用户发送欢迎邮件，附带官网订阅链接
- 免费用户定期发送升级提醒
- 订阅即将到期提醒续费

---

## 八、法律合规

### 8.1 Apple App Store 规则
- 必须提供 In-App Purchase 选项
- 不能在 App 内直接引导到外部支付（但可以在设置中提供网站链接）
- 可以通过邮件、网站等 App 外渠道推广

### 8.2 隐私政策
- 更新隐私政策，说明使用 Stripe 处理支付
- 说明订阅数据的存储和使用

### 8.3 退款政策
- 明确退款条款
- Stripe 支持部分退款
- Apple/Google 有各自的退款政策

---

## 九、监控和优化

### 9.1 关键指标
- 官网订阅 vs App 订阅比例
- 月付 vs 年付比例
- 订阅续费率
- 流失率

### 9.2 A/B 测试
- 测试不同价格点
- 测试不同引导文案
- 测试不同优惠幅度

---

**总结**: 通过官网订阅，您可以多赚约 17-19% 的收益，同时为用户提供更优惠的价格，实现双赢！

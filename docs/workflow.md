# 📋 WORKFLOW — Luồng Hoạt Động Hệ Thống

> **Dự án:** Vĩnh Khánh Digital Audio Guide
> **Mô tả:** Hệ thống gồm 3 nhóm người dùng chính: **User (Khách du lịch)**, **Merchant (Chủ quán)**, và **Admin**. Tài liệu này mô tả luồng hoạt động chi tiết của từng nhóm.

---

## Mục Lục

1. [Luồng User (Khách du lịch)](#1-luồng-user-khách-du-lịch)
2. [Luồng Merchant (Chủ quán)](#2-luồng-merchant-chủ-quán)
3. [Luồng Admin](#3-luồng-admin)
4. [Luồng GPS và Geofencing](#4-luồng-gps-và-geofencing)
5. [Luồng Narration và Dịch thuật Tự động](#5-luồng-narration-và-dịch-thuật-tự-động)
6. [Luồng Thanh toán và Kích hoạt gói](#6-luồng-thanh-toán-và-kích-hoạt-gói)
7. [Luồng Tổng thể hệ thống](#7-luồng-tổng-thể-hệ-thống)

---

## 1. Luồng User (Khách du lịch)

> **Nền tảng:** Mobile App (React Native + Expo)

---

### 1.1 Lần đầu mở app

```
User mở app
  ↓
Chọn ngôn ngữ yêu thích (Language Picker từ server)
  ↓
Cho phép truy cập GPS (expo-location)
  ↓
Đăng ký / Đăng nhập tài khoản
  ↓
preferred_language được lưu vào DB (bảng users)
```

**Database ghi nhận:**

| Bảng   | Trường               | Giá trị ví dụ      |
|--------|----------------------|--------------------|
| `users` | `preferred_language` | `en`, `ko`, `vi`   |
| `users` | `is_online`          | `true`             |

---

### 1.2 Khám phá quán gần đó

```
User mở màn hình Map
  ↓
App gọi: GET /api/v1/stores (lấy toàn bộ quán active)
  ↓
Backend query DB: store.findMany({status: "active"})
  ↓
Trả về danh sách tất cả quán kèm lat/lng
  ↓
Client tính khoảng cách Haversine để xác định quán trong bán kính 50m
  ↓
Hiển thị markers trên bản đồ (react-native-maps)
```

**Query Backend (Prisma):**

```ts
this.prisma.store.findMany({
    where: { status: 'active' },
    select: { id: true, name: true, address: true, lat: true, lng: true, coverImage: true }
});
```

---

### 1.3 Khi user đến gần quán (Geofencing < 50m)

```
User di chuyển (watchPositionAsync — mỗi 10m)
  ↓
App tính Haversine distance với tất cả stores trong bộ nhớ
  ↓
Nếu distance <= 50m VÀ store chưa bị dismiss
  ↓
Hiển thị ProximityAlert popup (tên quán, ảnh bìa)
  ↓
User bỏ qua → store thêm vào dismissedSet → xem store kế tiếp trong queue
User xác nhận → navigate /stall/{storeId} → phát narration
```

> ⚠️ **Lưu ý:** Toàn bộ tính toán khoảng cách diễn ra tại **client-side**, không gửi GPS lên server theo thời gian thực — giúp tiết kiệm pin và bảo vệ riêng tư.

---

### 1.4 Nghe thuyết minh

```
User vào màn hình chi tiết quán (/stall/{id})
  ↓
App gọi: GET /api/v1/narrations/store/{storeId}?lang={selectedLang}
  ↓
┌── Có narration theo ngôn ngữ đã chọn
│     ↓ POST /api/v1/narrations/{id}/listen {source: "gps"}
│     ↓ Kiểm tra giới hạn theo gói subscription
│     ↓ expo-speech.speak(textContent, {language: "ko-KR"})
│
└── Không có → có text tiếng Việt (nguồn gốc)
      ↓ POST /api/v1/languages/translate {text, targetLang}
      ↓ MyMemory API dịch VI → targetLang
      ↓ Cache bản dịch vào DB (narration.upsert)
      ↓ expo-speech.speak(translatedText)
```

**Giới hạn nghe theo gói:**

| Gói | Giới hạn |
|-----|---------|
| `free` | 10 lần / ngày |
| `monthly` | 30 lần / ngày |
| `yearly` | Không giới hạn |

---

### 1.5 Trường hợp GPS không chính xác → Quét QR

```
User mở QR Scanner (expo-camera)
  ↓
Scan mã QR tại quán → decode deeplink: "smarttour://stall/{storeId}?autoplay=1"
  ↓
App gọi: POST /api/v1/qr/scan {code: "qr_code_string"}
  ↓
Backend resolve code → tìm store + narration theo preferredLanguage
Backend ghi: listenHistory.create({source: "qr"})
  ↓
API trả về: {storeId, store, narrationId, preferredLanguage}
  ↓
App navigate /stall/{storeId} → tự động phát narration
```

---

### 1.6 Lịch sử nghe

> Sau khi nghe xong, hệ thống ghi lại.

**Database ghi nhận:**

| Bảng             | Trường         | Mô tả                     |
|------------------|----------------|---------------------------|
| `listen_history` | `user_id`      | ID của người dùng         |
|                  | `store_id`     | ID của quán               |
|                  | `narration_id` | ID của bản thuyết minh    |
|                  | `source`       | `"gps"` hoặc `"qr"`      |
|                  | `listened_at`  | Thời điểm nghe            |

---

### 1.7 Nâng cấp Premium

```
User vào trang Profile → chọn gói Premium
  ↓
Chọn phương thức: VNPAY (redirect) hoặc MoMo (deeplink/webview)
  ↓
POST /api/v1/payments/{vnpay|momo}/create {planKey}
  ↓
Backend tạo Transaction pending + ghi PaymentVnpay/MoMo record
  ↓
User hoàn tất thanh toán
  ↓
VNPAY: GET /return?code=00 | MoMo: POST /momo/ipn {resultCode: 0}
  ↓
Backend verify chữ ký → transaction.status = "success"
  ↓
Auto kích hoạt subscription.create({plan: "monthly"|"yearly"})
```

---

## 2. Luồng Merchant (Chủ quán)

> **Nền tảng:** Web Dashboard (React 18 + Tailwind CSS + Vite)

---

### 2.1 Merchant đăng ký tài khoản

```
Merchant điền form đăng ký (businessName, taxCode, email, password)
  ↓
POST /api/v1/auth/register {role: "merchant", businessName, taxCode}
  ↓
Backend tạo: user {isActive: false, role: "merchant"}
Backend tạo: merchant {userId, businessName, status: "pending"}
  ↓
Trả về message "Tài khoản đang chờ duyệt..." (KHÔNG có accessToken)
  ↓
Merchant chờ Admin duyệt (không thể đăng nhập)
```

---

### 2.2 Admin duyệt Merchant → Merchant đăng nhập được

```
Admin approve merchant
  ↓
user.isActive = true | merchant.status = "approved"
merchantSubscription.create(plan: "starter", maxPOI: 1)  ← auto
  ↓
Merchant POST /auth/login → nhận accessToken + refreshToken
  ↓
Merchant có thể dùng Web Dashboard
```

---

### 2.3 Merchant tạo quán (POI)

```
Merchant → POST /api/v1/stores hoặc /merchant/stores
  ↓
Backend kiểm tra:
  - store.count({merchantId}) < maxPOI (từ planMetadata)
  - merchantSubscription.status = "active"
  ↓
Nếu vượt giới hạn → 403 "Đã đạt giới hạn {maxPOI} POI. Nâng cấp gói!"
Nếu còn quota → store.create({status: "pending"})
  ↓
Store chờ Admin duyệt
```

---

### 2.4 Upload Narration + Auto-Translate

```
Merchant upload text tiếng Việt
  ↓
POST /merchant/stores/{storeId}/narrations {languageId: "vi_uuid", textContent: "..."}
  ↓
Backend upsert narration {storeId, languageId, textContent}
  ↓
Backend tự động: language.findMany({isActive: true, code: {not: "vi"}})
  ↓
Loop qua từng ngôn ngữ active (en, ko, ja, zh, fr...):
  MyMemory API dịch VI → target
  narration.upsert({storeId, languageId, textContent: translated})
  ↓
Cache toàn bộ — user sau không cần dịch lại
```

---

### 2.5 Store được publish (Admin duyệt)

```
Admin xem danh sách stores pending
  ↓
PATCH /api/v1/admin/stores/{id}/approve
  ↓
stores.status = "active"
  ↓
Quán xuất hiện trên app Mobile cho user thấy
```

---

### 2.6 Merchant xem Analytics

| Chỉ số | Nguồn dữ liệu |
|--------|---------------|
| 📊 Số lượt nghe | `listen_history` |
| 🌏 Top ngôn ngữ | `listen_history` JOIN `narrations` JOIN `languages` |
| 📅 Lượt nghe theo ngày | `listen_history.listened_at` group by date |

---

## 3. Luồng Admin

> **Nền tảng:** Web Dashboard (cùng ứng dụng React, phân quyền role = `admin`)

---

### 3.1 Admin đăng nhập

```
Admin POST /auth/login {email, password}
  ↓
Backend kiểm tra role = "admin"
  ↓
Nhận accessToken → vào Admin Dashboard
```

---

### 3.2 Quản lý Merchant

```
GET /admin/merchants?status=pending
  ↓
Xem xét thông tin
  ↓
PATCH /admin/merchants/{id}/approve → auto Starter plan
PATCH /admin/merchants/{id}/reject {reason: "..."}
```

---

### 3.3 Quản lý Store

```
GET /admin/stores?status=pending
  ↓
Kiểm tra: tên quán, địa chỉ, ảnh, narration
  ↓
PATCH /admin/stores/{id}/approve → stores.status = "active"
PATCH /admin/stores/{id}/hide   → stores.status = "hidden"
```

---

### 3.4 Quản lý Narration

> Admin có thể can thiệp vào nội dung thuyết minh:

- ✏️ **Edit** — PATCH `/admin/narrations/:id`
- 🗑️ **Delete** — DELETE `/admin/narrations/:id`
- 🚫 **Toggle Active** — PATCH `/admin/narrations/:id/toggle-active`

---

### 3.5 Analytics toàn hệ thống

```
GET /api/v1/admin/stats
```

| Chỉ số | Mô tả |
|--------|-------|
| 👥 Total Users | Tổng số user (role = "user") |
| 🟢 Online Users | user.is_online = true |
| 🏪 Total Stores | Tổng số quán active |
| 💰 Total Revenue | Sum giao dịch status = "success" |
| 📈 Top POI | Quán được nghe nhiều nhất tháng này |
| 🏆 Top Merchant | Merchant có nhiều store nhất |
| ⭐ Top Client | User nghe nhiều nhất tháng này |
| 📊 Monthly Revenue | Doanh thu 12 tháng gần nhất |

---

## 4. Luồng GPS và Geofencing

> Đây là **nghiệp vụ cốt lõi** mang lại trải nghiệm tự động cho người dùng.

```
User mở app → GPS Permission
  ↓
App: watchPositionAsync(Balanced accuracy, distanceInterval: 10m)
  ↓
Mỗi 10m di chuyển: tính Haversine với tất cả stores đã load
  ↓
Nếu distance <= 50m VÀ store chưa dismiss
  ↓
push vào proximityQueue → hiện ProximityAlert popup
  ↓
User bỏ qua → dismissedSet.add(storeId) → queue tiếp theo
User xem → navigate → phát narration → ghi listenHistory
```

> ⚠️ **Bán kính chuẩn: 50m** — không phải 20m. Toàn bộ logic tính tại client-side, không poll server liên tục.

---

## 5. Luồng Narration và Dịch thuật Tự động

> Hệ thống hỗ trợ đa ngôn ngữ với cơ chế **Dịch thuật On-demand + Cache**.

```
User muốn nghe ngôn ngữ "Korean" (ko)
  ↓
App kiểm tra: có narration (storeId, lang=ko) trong DB?
  ↓
┌── CÓ → phát text bằng expo-speech({language: "ko-KR"})
│
└── KHÔNG CÓ → gọi POST /languages/translate {text: "...(VI)", targetLang: "ko"}
                ↓
              MyMemory API: translate(vi → ko)
                ↓
              Cache: narration.upsert({storeId, langId_ko, textContent: dịch})
                ↓
              expo-speech.speak(translatedText)
```

> 📌 **Ưu tiên:** MP3 audio (đã thu âm) → text TTS (expo-speech).

---

## 6. Luồng Thanh toán và Kích hoạt gói

### VNPAY
```
User chọn gói → POST /payments/vnpay/create {planKey}
  ↓
Backend: planMetadata.findUnique({planKey}) → amount
transaction.create({status: "pending"}) + paymentVnpay.create()
Build params + HMAC-SHA512 → paymentUrl
  ↓
User redirect → VNPAY portal → nhập thẻ → xác nhận
  ↓
VNPAY: GET /payments/vnpay/return?vnp_ResponseCode=00&vnp_SecureHash=...
Backend: verify HMAC-SHA512 → transaction.status = "success"
  ↓
handlePostPayment: subscription.create({plan, startDate, endDate})
```

### MoMo
```
User chọn gói → POST /payments/momo/create {planKey}
  ↓
Backend: gọi MoMo API (captureWallet) → payUrl + deeplink + qrCodeUrl
  ↓
User mở MoMo app → xác nhận
  ↓
MoMo: POST /payments/momo/ipn {orderId, resultCode: 0, signature}
Backend: verify HMAC-SHA256 → transaction.status = "success"
  ↓
handlePostPayment: subscription.create({plan, startDate, endDate})
```

---

## 7. Luồng Tổng thể hệ thống

> Cái nhìn bird-eye từ khi merchant tạo quán đến khi user nghe thuyết minh.

```
[MERCHANT] Đăng ký → chờ Admin duyệt
  ↓
[ADMIN] Approve merchant → auto Starter plan
  ↓
[MERCHANT] Tạo quán (POI) + upload narration (vi) → auto-translate
  ↓
[ADMIN] Approve store → stores.status = "active"
  ↓
[USER] Đến gần quán (GPS detect khoảng cách <= 50m)
  ↓
[APP] Hiển thị ProximityAlert popup
  ↓
[USER] Xác nhận → App phát narration bằng expo-speech (ngôn ngữ ưa thích)
  ↓
[HỆ THỐNG] Ghi listen_history vào database
  ↓
[MERCHANT / ADMIN] Xem analytics & thống kê
```

---

*Tài liệu này được duy trì bởi nhóm phát triển dự án Seminar SGU.*  
*Cập nhật lần cuối: 2026-05-10*
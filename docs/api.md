# 🔌 API Documentation — Restaurant Audio Guide

> **Base URL:** `https://api.yourdomain.com/v1`
> **Authentication:** Bearer Token (JWT)
> **Format:** JSON
> **Version:** v1.0

---

## Mục Lục

| Nhóm | Prefix | Mô tả |
|------|--------|-------|
| [Auth](#1-auth) | `/auth` | Đăng ký, đăng nhập, refresh token |
| [Users](#2-users) | `/users` | Quản lý hồ sơ người dùng |
| [Stores](#3-stores) | `/stores` | Tìm kiếm & xem thông tin quán |
| [Narrations](#4-narrations) | `/narrations` | Thuyết minh audio |
| [Menus](#5-menus) | `/menus` | Món ăn trong quán |
| [Listen History](#6-listen-history) | `/listen-history` | Lịch sử nghe |
| [QR Codes](#7-qr-codes) | `/qr` | Quét mã QR |
| [Subscriptions](#8-subscriptions) | `/subscriptions` | Gói Premium user |
| [Payments](#9-payments) | `/payments` | VNPAY & MoMo |
| [Merchant](#10-merchant) | `/merchant` | Dashboard chủ quán |
| [Admin](#11-admin) | `/admin` | Quản trị hệ thống |
| [Languages](#12-languages) | `/languages` | Ngôn ngữ hỗ trợ |

---

## Implementation Status (Auto-check 2026-04-14)

Trong trạng thái code hiện tại, các phân hệ chính đã được kích hoạt:
- **Auth**: Đầy đủ Register, Login, Refresh, Logout.
- **Languages**: Bổ sung endpoint **Translate** (xử lý AI).
- **Stores/Narrations**: Đã có các endpoint lấy danh sách và thông tin chi tiết phục vụ Mobile.
- **Cảnh báo Tiệm cận**: Đã chuyển sang xử lý Client-side (Haversine 50m).


## Convention

### HTTP Status Codes

| Code | Ý nghĩa |
|------|---------|
| `200` | OK — Thành công |
| `201` | Created — Tạo mới thành công |
| `204` | No Content — Xóa thành công |
| `400` | Bad Request — Dữ liệu không hợp lệ |
| `401` | Unauthorized — Chưa đăng nhập |
| `403` | Forbidden — Không có quyền |
| `404` | Not Found — Không tìm thấy |
| `409` | Conflict — Trùng lặp (email đã tồn tại…) |
| `422` | Unprocessable Entity — Validation lỗi |
| `500` | Internal Server Error |

### Response format chuẩn

```json
// Thành công
{
  "success": true,
  "data": { ... },
  "message": "OK"
}

// Lỗi
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Email không hợp lệ"
  }
}

// Danh sách có phân trang
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

---

## 1. Auth

### `POST /auth/register`
> Đăng ký tài khoản mới (user hoặc merchant).

**Body:**
```json
{
  "name": "Nguyễn Văn A",
  "email": "user@example.com",
  "password": "StrongPass123!",
  "phone": "0901234567",
  "role": "user"
}
```

**Response `201`:**
```json
{
  "success": true,
  "data": {
    "user": { "id": "uuid", "name": "Nguyễn Văn A", "email": "...", "role": "user" },
    "accessToken": "eyJhbGci...",
    "refreshToken": "eyJhbGci..."
  }
}
```

---

### `POST /auth/login`
> Đăng nhập bằng email & password.

**Body:**
```json
{
  "email": "user@example.com",
  "password": "StrongPass123!"
}
```

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "user": { "id": "uuid", "name": "...", "role": "user" },
    "accessToken": "eyJhbGci...",
    "refreshToken": "eyJhbGci..."
  }
}
```

---

### `POST /auth/refresh`
> Lấy access token mới bằng refresh token.

**Body:**
```json
{ "refreshToken": "eyJhbGci..." }
```

**Response `200`:**
```json
{
  "success": true,
  "data": { "accessToken": "eyJhbGci..." }
}
```

---

### `POST /auth/logout`
> Đăng xuất (invalidate refresh token).

**Headers:** `Authorization: Bearer <accessToken>`

**Response `204`:** *(No Content)*

---

### `POST /auth/forgot-password`
> Gửi email reset mật khẩu.

**Body:**
```json
{ "email": "user@example.com" }
```

---

### `POST /auth/reset-password`
> Đặt lại mật khẩu bằng token từ email.

**Body:**
```json
{
  "token": "reset_token_from_email",
  "newPassword": "NewPass456!"
}
```

---

## 2. Users

> 🔐 **Yêu cầu:** Bearer Token (role: `user`)

### `GET /users/me`
> Lấy thông tin hồ sơ cá nhân.

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Nguyễn Văn A",
    "email": "user@example.com",
    "phone": "0901234567",
    "preferredLanguage": "vi",
    "avatarUrl": "https://cdn.../avatar.jpg",
    "isPremium": true
  }
}
```

---

### `PATCH /users/me`
> Cập nhật hồ sơ cá nhân.

**Body:** *(multipart/form-data)*
```
name: "Tên mới"
phone: "0987654321"
preferredLanguage: "en"
avatar: <file>
```

---

### `GET /users/me/listen-history`
> Lịch sử nghe của bản thân. *(Xem thêm mục 6)*

---

### `GET /users/me/favorites`
> Danh sách quán yêu thích.

---

### `POST /users/me/favorites/:storeId`
> Thêm quán vào yêu thích.

---

### `DELETE /users/me/favorites/:storeId`
> Xóa quán khỏi yêu thích.

---

## 3. Stores

### `GET /stores/nearby`
> Tìm quán gần vị trí GPS hiện tại.

> 🔓 **Public** (không cần đăng nhập)

**Query Params:**
| Param | Type | Mô tả |
|-------|------|-------|
| `lat` | float | Vĩ độ GPS |
| `lng` | float | Kinh độ GPS |
| `radius` | int | Bán kính (mét), default: `500` |
| `limit` | int | Số lượng kết quả, default: `20` |

**Response `200`:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Bún Bò Huế Mẹ Ghẻ",
      "address": "123 Lê Lợi, Q1, TP.HCM",
      "distance": 87.5,
      "coverImage": "https://cdn.../cover.jpg",
      "openTime": "07:00",
      "closeTime": "21:00",
      "status": "active",
      "location": { "lat": 10.7769, "lng": 106.7009 }
    }
  ]
}
```

---

### `GET /stores/:id`
> Xem chi tiết 1 quán.

> 🔓 **Public**

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Bún Bò Huế Mẹ Ghẻ",
    "description": "Quán bún bò nổi tiếng...",
    "address": "...",
    "location": { "lat": 10.7769, "lng": 106.7009 },
    "openTime": "07:00",
    "closeTime": "21:00",
    "coverImage": "...",
    "images": [ { "id": "uuid", "url": "...", "sortOrder": 1 } ],
    "menus": [ { "id": "uuid", "name": "Bún Bò", "price": 45000, "imageUrl": "..." } ],
    "availableLanguages": ["vi", "en", "ko"],
    "merchant": { "id": "uuid", "businessName": "..." }
  }
}
```

---

### `GET /stores/search`
> Tìm kiếm quán theo từ khóa.

**Query Params:**
| Param | Type | Mô tả |
|-------|------|-------|
| `q` | string | Từ khóa tìm kiếm |
| `page` | int | Trang, default: `1` |
| `limit` | int | Số lượng, default: `20` |

---

## 4. Narrations

### `GET /stores/:storeId/narrations`
> Danh sách narration của quán theo ngôn ngữ.

> 🔓 **Public**

**Query Params:**
| Param | Type | Mô tả |
|-------|------|-------|
| `lang` | string | Mã ngôn ngữ (vi, en, ko…) |

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "storeId": "uuid",
    "language": "en",
    "narration": {
      "id": "uuid",
      "audioUrl": "https://cdn.../audio.mp3",
      "textContent": "Welcome to Bun Bo Hue...",
      "duration": 120
    }
  }
}
```

> **Fallback logic:** Nếu không có narration theo `lang` → tự động trả về tiếng Anh (`en`).

---

## 5. Menus

### `GET /stores/:storeId/menus`
> Danh sách món ăn của quán.

> 🔓 **Public**

---

## 6. Listen History

> 🔐 **Yêu cầu:** Bearer Token

### `POST /listen-history`
> Ghi nhận lượt nghe.

**Body:**
```json
{
  "storeId": "uuid",
  "narrationId": "uuid",
  "source": "gps"
}
```

---

### `GET /users/me/listen-history`
> Lịch sử nghe của user hiện tại.

**Response `200`:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "store": { "id": "uuid", "name": "Bún Bò Huế", "coverImage": "..." },
      "narration": { "id": "uuid", "language": "en" },
      "source": "gps",
      "listenedAt": "2026-03-16T05:00:00Z"
    }
  ],
  "pagination": { "page": 1, "limit": 20, "total": 50 }
}
```

---

## 7. QR Codes

### `GET /qr/:code`
> Tra cứu thông tin quán từ mã QR.

> 🔓 **Public**

**Response `200`:** *(giống `GET /stores/:id`)*

---

## 8. Subscriptions

> 🔐 **Yêu cầu:** Bearer Token (role: `user`)

### `GET /subscriptions/plans`
> Danh sách gói Premium và giá.

> 🔓 **Public**

**Response `200`:**
```json
{
  "success": true,
  "data": [
    { "plan": "monthly", "price": 49000, "currency": "VND", "description": "Gói tháng" },
    { "plan": "yearly",  "price": 399000, "currency": "VND", "description": "Gói năm (tiết kiệm 32%)" }
  ]
}
```

---

### `GET /subscriptions/me`
> Xem gói đang dùng.

---

### `POST /subscriptions`
> Khởi tạo đăng ký gói Premium (trả về payment URL).

**Body:**
```json
{
  "plan": "monthly",
  "paymentMethod": "vnpay"
}
```

**Response `201`:**
```json
{
  "success": true,
  "data": {
    "transactionId": "uuid",
    "paymentUrl": "https://sandbox.vnpayment.vn/paymentv2/..."
  }
}
```

---

## 9. Payments

### `POST /payments/vnpay/create`
> Tạo URL thanh toán VNPAY.

**Body:**
```json
{
  "transactionId": "uuid",
  "returnUrl": "https://app.yourdomain.com/payment/result"
}
```

**Response `200`:**
```json
{
  "success": true,
  "data": { "paymentUrl": "https://sandbox.vnpayment.vn/..." }
}
```

---

### `GET /payments/vnpay/return`
> Endpoint redirect sau khi user thanh toán VNPAY xong (redirect từ VNPAY về app).

**Query Params (do VNPAY gửi):** `vnp_ResponseCode`, `vnp_TxnRef`, `vnp_SecureHash`, ...

---

### `POST /payments/vnpay/ipn`
> Webhook IPN từ VNPAY server gửi về để confirm giao dịch.

> ⚠️ **Server-to-server** — Không cần JWT, dùng `vnp_SecureHash` để xác thực.

---

### `POST /payments/momo/create`
> Tạo URL / deeplink thanh toán MoMo.

**Body:**
```json
{
  "transactionId": "uuid",
  "redirectUrl": "myapp://payment/result",
  "ipnUrl": "https://api.yourdomain.com/v1/payments/momo/ipn"
}
```

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "payUrl": "https://payment.momo.vn/...",
    "deeplink": "momo://...",
    "qrCodeUrl": "https://..."
  }
}
```

---

### `POST /payments/momo/ipn`
> Webhook IPN từ MoMo server gửi về.

> ⚠️ **Server-to-server** — Xác thực bằng HMAC-SHA256 `signature`.

---

### `GET /payments/history`
> Lịch sử giao dịch của user hiện tại.

> 🔐 **Yêu cầu:** Bearer Token

---

## 10. Merchant

> 🔐 **Yêu cầu:** Bearer Token (role: `merchant`, status: `approved`)

### `POST /merchant/register`
> Đăng ký thông tin doanh nghiệp (sau khi có tài khoản).

**Body:**
```json
{
  "businessName": "Công ty TNHH Ẩm Thực ABC",
  "taxCode": "0123456789"
}
```

---

### `GET /merchant/profile`
> Xem trạng thái merchant.

---

### Quản lý Stores

#### `GET /merchant/stores`
> Danh sách quán của merchant.

#### `POST /merchant/stores`
> Tạo quán mới.

**Body:** *(multipart/form-data)*
```
name: "Bún Bò Huế Mẹ Ghẻ"
description: "Quán bún bò nổi tiếng..."
address: "123 Lê Lợi, Q1, TP.HCM"
lat: 10.7769
lng: 106.7009
openTime: "07:00"
closeTime: "21:00"
coverImage: <file>
```

#### `PATCH /merchant/stores/:id`
> Cập nhật thông tin quán.

#### `DELETE /merchant/stores/:id`
> Xóa quán (chỉ khi status = pending).

---

### Quản lý Store Images

#### `POST /merchant/stores/:storeId/images`
> Upload ảnh quán. *(multipart/form-data)*

#### `DELETE /merchant/stores/:storeId/images/:imageId`
> Xóa ảnh.

#### `PATCH /merchant/stores/:storeId/images/reorder`
> Sắp xếp thứ tự ảnh.

**Body:**
```json
{ "order": ["uuid1", "uuid2", "uuid3"] }
```

---

### Quản lý Menus

#### `GET /merchant/stores/:storeId/menus`
> Danh sách món ăn.

#### `POST /merchant/stores/:storeId/menus`
> Thêm món ăn. *(multipart/form-data)*

#### `PATCH /merchant/stores/:storeId/menus/:menuId`
> Sửa món ăn.

#### `DELETE /merchant/stores/:storeId/menus/:menuId`
> Xóa món ăn.

---

### Quản lý Narrations

#### `GET /merchant/stores/:storeId/narrations`
> Danh sách narration.

#### `POST /merchant/stores/:storeId/narrations`
> Thêm narration. *(multipart/form-data)*

```
languageId: "uuid"
audio: <file>          ← upload audio trực tiếp
# HOẶC
textContent: "Welcome..." ← dùng TTS để generate audio
```

#### `PATCH /merchant/stores/:storeId/narrations/:narrationId`
> Sửa narration.

#### `DELETE /merchant/stores/:storeId/narrations/:narrationId`
> Xóa narration.

---

### Quản lý QR Codes

#### `GET /merchant/stores/:storeId/qr`
> Lấy mã QR của quán.

#### `POST /merchant/stores/:storeId/qr`
> Tạo mã QR mới.

---

### Analytics

#### `GET /merchant/analytics`
> Thống kê tổng quát của merchant.

**Query Params:**
| Param | Type | Mô tả |
|-------|------|-------|
| `from` | date | Từ ngày (YYYY-MM-DD) |
| `to` | date | Đến ngày |

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "totalListens": 1240,
    "topStores": [ { "storeId": "uuid", "name": "...", "listens": 540 } ],
    "topLanguages": [ { "lang": "en", "count": 720 }, { "lang": "ko", "count": 300 } ],
    "listensByDay": [ { "date": "2026-03-15", "count": 45 } ]
  }
}
```

---

### Merchant Subscriptions

#### `GET /merchant/subscription`
> Xem gói đang dùng.

#### `POST /merchant/subscription`
> Đăng ký / nâng cấp gói (trả về payment URL).

**Body:**
```json
{
  "plan": "business",
  "paymentMethod": "momo"
}
```

---

## 11. Admin

> 🔐 **Yêu cầu:** Bearer Token (role: `admin`)

### Quản lý Users

#### `GET /admin/users`
> Danh sách tất cả users.

**Query Params:** `role`, `isActive`, `search`, `page`, `limit`

#### `GET /admin/users/:id`
> Chi tiết user.

#### `PATCH /admin/users/:id/toggle-active`
> Kích hoạt / vô hiệu hóa tài khoản.

---

### Quản lý Merchants

#### `GET /admin/merchants`
> Danh sách merchants. **Query:** `status`, `search`, `page`, `limit`

#### `GET /admin/merchants/:id`
> Chi tiết merchant.

#### `POST /admin/merchants/:id/approve`
> Duyệt merchant.

#### `POST /admin/merchants/:id/reject`
> Từ chối merchant.

**Body:**
```json
{ "reason": "Thông tin doanh nghiệp không hợp lệ" }
```

---

### Quản lý Stores

#### `GET /admin/stores`
> Danh sách stores. **Query:** `status`, `search`, `page`, `limit`

#### `POST /admin/stores/:id/approve`
> Duyệt store → `status = active`.

#### `POST /admin/stores/:id/hide`
> Ẩn store → `status = hidden`.

---

### Quản lý Narrations

#### `GET /admin/narrations`
> Danh sách tất cả narrations.

#### `PATCH /admin/narrations/:id`
> Sửa nội dung narration.

#### `DELETE /admin/narrations/:id`
> Xóa narration.

#### `PATCH /admin/narrations/:id/toggle-active`
> Ẩn / hiện narration.

---

### Quản lý Giao Dịch

#### `GET /admin/transactions`
> Danh sách giao dịch. **Query:** `status`, `paymentMethod`, `from`, `to`, `page`

#### `GET /admin/transactions/:id`
> Chi tiết giao dịch + raw response VNPAY / MoMo.

#### `GET /admin/transactions/stats`
> Thống kê doanh thu.

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "totalRevenue": 12500000,
    "byMethod": { "vnpay": 8000000, "momo": 4500000 },
    "byStatus": { "success": 11, "failed": 2, "pending": 1 }
  }
}
```

---

### Analytics Hệ Thống

#### `GET /admin/analytics`
> Tổng quan toàn hệ thống.

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "totalUsers": 5420,
    "totalMerchants": 87,
    "totalStores": 215,
    "totalListens": 34200,
    "topStores": [ ... ],
    "newUsersThisMonth": 320
  }
}
```

---

## 12. Languages

### `GET /languages`
> Danh sách ngôn ngữ đang hỗ trợ.

> 🔓 **Public**

**Response `200`:**
```json
{
  "success": true,
  "data": [
    { "id": "uuid", "code": "vi", "name": "Vietnamese", "flagIcon": "🇻🇳" },
    { "id": "uuid", "code": "en", "name": "English",    "flagIcon": "🇬🇧" },
    { "id": "uuid", "code": "ko", "name": "Korean",     "flagIcon": "🇰🇷" },
    { "id": "uuid", "code": "ja", "name": "Japanese",   "flagIcon": "🇯🇵" },
    { "id": "uuid", "code": "zh", "name": "Chinese",    "flagIcon": "🇨🇳" }
  ]
}
```

---

### `POST /admin/languages`
> Thêm ngôn ngữ mới. *(Admin only)*

### `PATCH /admin/languages/:id`
> Cập nhật ngôn ngữ. *(Admin only)*

### `PATCH /admin/languages/:id/toggle-active`
> Ẩn / hiện ngôn ngữ. *(Admin only)*

---

### `POST /languages/translate`
> Dịch văn bản thuyết minh sang ngôn ngữ yêu cầu bằng AI.

**Body:**
```json
{
  "text": "Chào mừng bạn đến với nhà hàng...",
  "targetLang": "ko"
}
```

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "translatedText": "환영합니다...",
    "sourceLang": "vi",
    "targetLang": "ko"
  }
}
```

---

*Tài liệu này được duy trì bởi nhóm phát triển dự án Seminar SGU.*
*Cập nhật lần cuối: 2026-04-14*


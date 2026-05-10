# 🔌 API Documentation — Vĩnh Khánh Audio Guide

> **Base URL:** `http://localhost:3000/api/v1` (dev) — `https://yourdomain.com/api/v1` (prod)
> **Authentication:** Bearer Token (JWT)
> **Format:** JSON
> **Version:** v1.0
> **Swagger UI:** `GET /api` (tự động sinh từ decorators)

---

## Mục Lục

| Nhóm | Prefix | Mô tả |
|------|--------|-------|
| [Auth](#1-auth) | `/auth` | Đăng ký, đăng nhập, refresh token, logout |
| [Users](#2-users) | `/users` | Quản lý hồ sơ người dùng |
| [Stores](#3-stores) | `/stores` | Tìm kiếm & xem thông tin quán |
| [Narrations](#4-narrations) | `/narrations` | Thuyết minh audio |
| [Menus](#5-menus) | `/menus` | Món ăn trong quán |
| [QR Codes](#6-qr-codes) | `/qr` | Quét mã QR |
| [Subscriptions](#7-subscriptions) | `/subscriptions` | Gói Premium user |
| [Payments](#8-payments) | `/payments` | VNPAY & MoMo |
| [Merchant](#9-merchant) | `/merchant` | Dashboard chủ quán |
| [Admin](#10-admin) | `/admin` | Quản trị hệ thống |
| [Languages](#11-languages) | `/languages` | Ngôn ngữ hỗ trợ |

---

## Convention

### HTTP Status Codes

| Code | Ý nghĩa |
|------|---------|
| `200` | OK — Thành công |
| `201` | Created — Tạo mới thành công |
| `204` | No Content — Xóa thành công |
| `400` | Bad Request — Dữ liệu không hợp lệ |
| `401` | Unauthorized — Chưa đăng nhập / token hết hạn |
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

> ⚠️ Nếu `role = "merchant"`: tài khoản được tạo nhưng `isActive = false`, không nhận token, phải chờ Admin duyệt.

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
> Lấy access token mới bằng refresh token (token rotation).

**Body:**
```json
{ "refreshToken": "eyJhbGci..." }
```

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGci...",
    "refreshToken": "eyJhbGci..."
  }
}
```

---

### `POST /auth/logout`
> Đăng xuất (invalidate refresh token, set isOnline = false).

**Headers:** `Authorization: Bearer <accessToken>`

**Body:**
```json
{ "refreshToken": "eyJhbGci..." }
```

**Response `200`:** OK

---

## 2. Users

> 🔐 **Yêu cầu:** Bearer Token

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
    "avatarUrl": null,
    "isActive": true,
    "role": "user"
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

## 3. Stores

### `GET /stores`
> Lấy toàn bộ danh sách quán active. Client tự tính Haversine để geofencing.

> 🔓 **Public**

**Response `200`:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Bún Bò Huế Mẹ Ghẻ",
      "address": "123 Vĩnh Khánh, Q4, TP.HCM",
      "lat": 10.7769,
      "lng": 106.7009,
      "coverImage": "/uploads/cover.jpg",
      "openTime": "07:00",
      "closeTime": "21:00",
      "status": "active"
    }
  ]
}
```

---

### `GET /stores/:id`
> Xem chi tiết 1 quán (bao gồm ảnh, menu, narrations).

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
    "lat": 10.7769,
    "lng": 106.7009,
    "openTime": "07:00",
    "closeTime": "21:00",
    "coverImage": "/uploads/cover.jpg",
    "images": [ { "id": "uuid", "imageUrl": "...", "sortOrder": 1 } ],
    "menus": [ { "id": "uuid", "name": "Bún Bò", "price": 45000, "imageUrl": "..." } ],
    "narrations": [ { "id": "uuid", "languageId": "uuid", "textContent": "...", "audioUrl": null } ],
    "merchant": { "id": "uuid", "businessName": "..." }
  }
}
```

---

## 4. Narrations

### `GET /narrations/store/:storeId`
> Danh sách narration của quán.

> 🔓 **Public**

**Query Params:**
| Param | Type | Mô tả |
|-------|------|-------|
| `lang` | string | Mã ngôn ngữ (vi, en, ko…) — nếu không truyền, trả tất cả |

---

### `POST /narrations/:id/listen`
> Ghi nhận lượt nghe (kiểm tra giới hạn theo gói subscription).

> 🔐 **Yêu cầu:** Bearer Token

**Body:**
```json
{
  "source": "gps"
}
```

> **Giới hạn:** Free = 10/ngày, Monthly = 30/ngày, Yearly = không giới hạn.

---

## 5. Menus

### `GET /stores/:storeId/menus`
> Danh sách món ăn của quán.

> 🔓 **Public**

---

## 6. QR Codes

### `POST /qr/scan`
> Tra cứu thông tin quán từ mã QR (resolve code → store + narration theo preferredLanguage).

> 🔓 **Public** (có thể kèm Bearer Token để lấy preferredLanguage)

**Body:**
```json
{ "code": "qr_code_string" }
```

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "storeId": "uuid",
    "store": { "id": "uuid", "name": "...", ... },
    "narrationId": "uuid",
    "preferredLanguage": "vi"
  }
}
```

> **Fallback:** preferredLanguage → `"vi"` → null nếu không có narration.

---

## 7. Subscriptions

### `GET /subscriptions/plans`
> Danh sách gói Premium và giá (lấy từ plan_metadata).

> 🔓 **Public**

**Response `200`:**
```json
{
  "success": true,
  "data": [
    { "planKey": "user_monthly", "name": "Gói Tháng", "price": 49000, "currency": "VND" },
    { "planKey": "user_yearly",  "name": "Gói Năm",   "price": 399000, "currency": "VND" }
  ]
}
```

---

### `GET /subscriptions/me`
> Xem gói đang dùng.

> 🔐 **Yêu cầu:** Bearer Token

---

### `POST /subscriptions`
> Khởi tạo đăng ký gói Premium (tạo transaction, trả về payment URL).

> 🔐 **Yêu cầu:** Bearer Token

**Body:**
```json
{
  "planKey": "user_monthly",
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

## 8. Payments

### `POST /payments/vnpay/create`
> Tạo URL thanh toán VNPAY.

> 🔐 **Yêu cầu:** Bearer Token

**Body:**
```json
{
  "planKey": "user_monthly"
}
```

**Response `200`:**
```json
{
  "success": true,
  "data": { "paymentUrl": "https://sandbox.vnpayment.vn/...", "transactionId": "uuid" }
}
```

---

### `GET /payments/vnpay/return`
> Endpoint redirect sau khi user thanh toán VNPAY (VNPAY redirect về đây).

> ⚠️ **Không cần JWT** — xác thực bằng `vnp_SecureHash` (HMAC-SHA512)

**Query Params (do VNPAY gửi):** `vnp_ResponseCode`, `vnp_TxnRef`, `vnp_SecureHash`, ...

**Xử lý:** Verify hash → cập nhật transaction → kích hoạt subscription.

---

### `POST /payments/momo/create`
> Tạo URL / deeplink thanh toán MoMo.

> 🔐 **Yêu cầu:** Bearer Token

**Body:**
```json
{
  "planKey": "merchant_business"
}
```

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "payUrl": "https://payment.momo.vn/...",
    "deeplink": "momo://...",
    "qrCodeUrl": "https://...",
    "transactionId": "uuid"
  }
}
```

---

### `POST /payments/momo/ipn`
> Webhook IPN từ MoMo server gửi về để confirm giao dịch.

> ⚠️ **Server-to-server** — Không cần JWT, xác thực bằng HMAC-SHA256 `signature`.

---

### `GET /payments/history`
> Lịch sử giao dịch của user hiện tại.

> 🔐 **Yêu cầu:** Bearer Token

---

## 9. Merchant

> 🔐 **Yêu cầu:** Bearer Token (role: `merchant`, status: `approved`)

### `POST /merchant/register`
> Đăng ký thông tin doanh nghiệp (sau khi có tài khoản user role=merchant).

**Body:**
```json
{
  "businessName": "Công ty TNHH Ẩm Thực ABC",
  "taxCode": "0123456789"
}
```

---

### `GET /merchant/profile`
> Xem trạng thái và thông tin merchant.

---

### Quản lý Stores

#### `GET /merchant/stores`
> Danh sách quán của merchant.

#### `POST /merchant/stores`
> Tạo quán mới (status = pending, đợi Admin duyệt). Kiểm tra giới hạn maxPOI.

**Body:** *(multipart/form-data)*
```
name: "Bún Bò Huế Mẹ Ghẻ"
description: "Quán bún bò nổi tiếng..."
address: "123 Vĩnh Khánh, Q4"
lat: 10.7769
lng: 106.7009
openTime: "07:00"
closeTime: "21:00"
coverImage: <file>
```

#### `PATCH /merchant/stores/:id`
> Cập nhật thông tin quán.

#### `DELETE /merchant/stores/:id`
> Xóa quán (cascade xóa images + narrations + file vật lý).

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
> Danh sách narration của quán.

#### `POST /merchant/stores/:storeId/narrations`
> Thêm narration. *(multipart/form-data)*

```
languageId: "uuid"
audio: <file>        ← upload audio trực tiếp (MP3/WAV)
# HOẶC
textContent: "Chào mừng..."  ← nhập text, TTS phát khi nghe
```

> **Auto-Translate:** Nếu `languageId` là tiếng Việt (`vi`) và có `textContent`, hệ thống tự động dịch sang tất cả ngôn ngữ active qua MyMemory API và lưu vào DB.

#### `PATCH /merchant/stores/:storeId/narrations/:narrationId`
> Sửa narration.

#### `DELETE /merchant/stores/:storeId/narrations/:narrationId`
> Xóa narration.

---

### Quản lý QR Codes

#### `GET /merchant/stores/:storeId/qr`
> Lấy mã QR hiện tại của quán.

#### `POST /merchant/stores/:storeId/qr`
> Tạo mã QR mới (deactivate tất cả QR cũ). Deeplink: `smarttour://stall/{storeId}?autoplay=1`.

---

### Analytics

#### `GET /merchant/analytics`
> Thống kê tổng quát của merchant.

**Query Params:**
| Param | Type | Mô tả |
|-------|------|-------|
| `from` | date | Từ ngày (YYYY-MM-DD) |
| `to` | date | Đến ngày |

---

### Merchant Subscriptions

#### `GET /merchant/subscription`
> Xem gói đang dùng.

#### `POST /merchant/subscription`
> Đăng ký / nâng cấp gói (trả về payment URL).

**Body:**
```json
{
  "planKey": "merchant_business",
  "paymentMethod": "momo"
}
```

---

## 10. Admin

> 🔐 **Yêu cầu:** Bearer Token (role: `admin`)

### Quản lý Users

#### `GET /admin/users`
> Danh sách tất cả users.

**Query Params:** `role`, `isActive`, `search`, `page`, `limit`

#### `GET /admin/users/:id`
> Chi tiết user.

#### `POST /admin/users`
> Tạo user mới (bao gồm tạo account merchant).

#### `PATCH /admin/users/:id/toggle-active`
> Kích hoạt / vô hiệu hóa tài khoản.

---

### Quản lý Merchants

#### `GET /admin/merchants`
> Danh sách merchants. **Query:** `status`, `search`, `page`, `limit`

#### `GET /admin/merchants/:id`
> Chi tiết merchant.

#### `PATCH /admin/merchants/:id/approve`
> Duyệt merchant → `user.isActive = true`, `merchant.status = approved`, tạo gói Starter tự động.

#### `PATCH /admin/merchants/:id/reject`
> Từ chối merchant.

**Body:**
```json
{ "reason": "Thông tin doanh nghiệp không hợp lệ" }
```

---

### Quản lý Stores

#### `GET /admin/stores`
> Danh sách stores. **Query:** `status`, `search`, `page`, `limit`

#### `PATCH /admin/stores/:id/approve`
> Duyệt store → `status = active`.

#### `PATCH /admin/stores/:id/hide`
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

#### `GET /admin/stats`
> Thống kê tổng quan cho Admin Dashboard.

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "userCount": 5420,
    "userOnlineCount": 120,
    "merchantCount": 87,
    "merchantCountPending": 12,
    "storeCount": 215,
    "storeCountActive": 200,
    "transactionCount": 1500,
    "totalRevenue": 12500000,
    "userGrowth": 10.5,
    "storeGrowth": 5.2,
    "revenueGrowth": 15.0,
    "monthlyRevenue": [10000, 20000, 30000, 40000, 15000, 25000, 50000, 0, 0, 0, 0, 0],
    "topPOI": { "name": "Bún Bò Huế Mẹ Ghẻ", "listenCount": 120 },
    "topMerchant": { "name": "Công ty TNHH Ẩm Thực ABC", "storeCount": 15 },
    "topClient": { "name": "Nguyễn Văn A", "listenCount": 45 }
  }
}
```

---

### Quản lý Subscriptions

#### `GET /admin/subscriptions`
> Danh sách gói (user + merchant).

#### `PATCH /admin/subscriptions/:id`
> Cập nhật gói subscription.

---

## 11. Languages

### `GET /languages`
> Danh sách ngôn ngữ đang hỗ trợ.

> 🔓 **Public**

**Response `200`:**
```json
{
  "success": true,
  "data": [
    { "id": "uuid", "code": "vi", "name": "Vietnamese", "flagIcon": "🇻🇳", "isActive": true },
    { "id": "uuid", "code": "en", "name": "English",    "flagIcon": "🇬🇧", "isActive": true },
    { "id": "uuid", "code": "ko", "name": "Korean",     "flagIcon": "🇰🇷", "isActive": true }
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
> Dịch văn bản sang ngôn ngữ yêu cầu bằng MyMemory API.

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

## Upload

### `POST /upload`
> Upload file ảnh (jpg/png/webp) hoặc audio (mp3/wav) lên server.

> 🔐 **Yêu cầu:** Bearer Token

**Body:** *(multipart/form-data)*
```
file: <file>
```

**Response `201`:**
```json
{
  "success": true,
  "data": { "url": "/uploads/1234567890-filename.jpg" }
}
```

---

*Tài liệu này được duy trì bởi nhóm phát triển dự án Seminar SGU.*  
*Cập nhật lần cuối: 2026-05-10*

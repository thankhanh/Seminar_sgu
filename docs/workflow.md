# 📋 WORKFLOW — Luồng Hoạt Động Hệ Thống

> **Dự án:** Ứng dụng thuyết minh ẩm thực du lịch (Restaurant Audio Guide)
> **Mô tả:** Hệ thống gồm 3 nhóm người dùng chính: **User (Khách du lịch)**, **Merchant (Chủ quán)**, và **Admin**. Tài liệu này mô tả luồng hoạt động chi tiết của từng nhóm.

---

## Mục Lục

1. [Luồng User (Khách du lịch)](#1-luồng-user-khách-du-lịch)
2. [Luồng Merchant (Chủ quán)](#2-luồng-merchant-chủ-quán)
3. [Luồng Admin](#3-luồng-admin)
4. [Luồng GPS của hệ thống](#4-luồng-gps-của-hệ-thống)
5. [Luồng Narration theo ngôn ngữ](#5-luồng-narration-theo-ngôn-ngữ)
6. [Luồng Tổng thể hệ thống](#6-luồng-tổng-thể-hệ-thống)

---

## 1. Luồng User (Khách du lịch)

> **Nền tảng:** Mobile App (React Native)

---

### 1.1 Lần đầu mở app

```
User mở app
  ↓
Chọn ngôn ngữ yêu thích
  ↓
Cho phép truy cập GPS
  ↓
Tạo profile người dùng
  ↓
Lưu preferred_language vào DB
```

**Database ghi nhận:**

| Bảng   | Trường              | Giá trị ví dụ |
|--------|---------------------|---------------|
| `users` | `preferred_language` | `en`, `ko`, `vi` |

---

### 1.2 Khám phá quán gần đó

```
User mở app
  ↓
App lấy tọa độ GPS (lat, lng)
  ↓
Gửi request: GET /stores/nearby?lat=...&lng=...
  ↓
Backend query PostGIS (tìm quán trong bán kính 50m)
  ↓
Trả về danh sách quán gần
  ↓
Hiển thị trên bản đồ (Map View)
```

**Query PostGIS ví dụ:**

```sql
SELECT *
FROM stores
WHERE ST_DWithin(
  location,
  ST_MakePoint(lng, lat)::geography,
  50  -- bán kính 50 mét
);
```

---

### 1.3 Khi user đến gần quán (< 20m)

```
User đi gần quán
  ↓
App phát hiện khoảng cách < 20m
  ↓
Hiển thị popup thông báo
```

**Popup mẫu:**
> 📍 *Bạn đang gần quán Bún Bò Huế — Nghe thuyết minh?*

**User có thể chọn:**
- 🎵 Nghe audio thuyết minh
- 📋 Xem menu
- 🖼️ Xem hình ảnh quán

---

### 1.4 Nghe thuyết minh

```
User nhấn Play
  ↓
App gọi API: GET /stores/:id/narration?lang=en
  ↓
Backend tìm bản narration theo ngôn ngữ
  ↓
Trả về audio_url
  ↓
App phát audio cho user nghe
```

---

### 1.5 Trường hợp GPS không chính xác → Quét QR

```
User mở QR Scanner trên app
  ↓
Scan mã QR tại quán (chứa store_id)
  ↓
App gọi API: GET /stores/:id
  ↓
Hiển thị thông tin quán
  ↓
Tự động phát narration
```

---

### 1.6 Lịch sử nghe

> Sau khi nghe xong, hệ thống tự động ghi lại lịch sử.

**Database ghi nhận:**

| Bảng              | Trường         | Mô tả                     |
|-------------------|----------------|---------------------------|
| `listen_history`  | `user_id`      | ID của người dùng         |
|                   | `store_id`     | ID của quán               |
|                   | `narration_id` | ID của bản thuyết minh    |
|                   | `timestamp`    | Thời điểm nghe            |

---

### 1.7 Nâng cấp Premium

```
User vào trang Profile
  ↓
Chọn gói Premium
  ↓
Thanh toán (in-app)
  ↓
Backend tạo subscription cho user
  ↓
User mở khóa quyền:
  - Nghe tất cả ngôn ngữ
  - Tải về nghe offline
```

---

## 2. Luồng Merchant (Chủ quán)

> **Nền tảng:** Web Dashboard (React)

---

### 2.1 Merchant đăng ký tài khoản

```
Merchant điền form đăng ký
  ↓
Hệ thống tạo tài khoản với role = "merchant"
  ↓
Tạo record trong bảng merchants
  ↓
Trạng thái: status = "pending" (chờ duyệt)
```

---

### 2.2 Admin duyệt Merchant

```
Admin xem danh sách merchant đang chờ duyệt
  ↓
Kiểm tra thông tin
  ↓
Approve hoặc Reject
  ↓
merchants.status = "approved" (nếu duyệt)
  ↓
Merchant được phép tạo quán
```

---

### 2.3 Merchant tạo quán

```
Merchant đăng nhập Dashboard
  ↓
Nhấn "Create Store"
  ↓
Nhập thông tin:
  - Tên quán
  - Địa chỉ
  - Tọa độ GPS (location)
  - Hình ảnh đại diện
  ↓
stores.status = "pending" (chờ admin duyệt)
```

---

### 2.4 Upload menu

```
Merchant vào trang quản lý Store
  ↓
Nhấn "Add Menu Item"
  ↓
Upload ảnh món ăn
  ↓
Nhập tên món & giá
  ↓
Lưu vào bảng menus
```

---

### 2.5 Upload Narration (Thuyết minh)

```
Merchant chọn ngôn ngữ (ví dụ: Tiếng Anh, Tiếng Hàn...)
  ↓
Upload file audio HOẶC nhập text để TTS tạo audio
  ↓
Lưu vào bảng narrations
```

**Database ghi nhận:**

| Bảng         | Trường        | Mô tả                     |
|--------------|---------------|---------------------------|
| `narrations` | `store_id`    | ID quán thuộc về          |
|              | `language_id` | Ngôn ngữ của bản thuyết minh |
|              | `audio_url`   | Đường dẫn file audio      |

---

### 2.6 Store được publish (Admin duyệt)

```
Admin kiểm tra quán
  ↓
Approve
  ↓
stores.status = "active"
  ↓
Quán xuất hiện trên app cho user thấy
```

---

### 2.7 Merchant xem Analytics

> Merchant có dashboard phân tích dữ liệu của quán mình:

| Chỉ số                | Nguồn dữ liệu    |
|-----------------------|-----------------|
| 📊 Số lượt nghe       | `listen_history` |
| 🍜 Top món được quan tâm | `listen_history` join `menus` |
| 🌏 Top ngôn ngữ nghe nhiều | `listen_history` join `narrations` |

---

## 3. Luồng Admin

> **Nền tảng:** Web Dashboard (chỉ dành cho Admin nội bộ)

---

### 3.1 Admin đăng nhập

```
Admin đăng nhập với tài khoản role = "admin"
  ↓
Vào Admin Dashboard
  ↓
Có toàn quyền quản lý hệ thống
```

---

### 3.2 Quản lý Merchant

```
Admin xem danh sách merchants
  ↓
Approve / Reject từng merchant
  ↓
Cập nhật: merchants.status
```

---

### 3.3 Quản lý Store

```
Admin xem danh sách stores đang "pending"
  ↓
Kiểm tra:
  - Hình ảnh quán
  - Menu món ăn
  - Narration (thuyết minh)
  ↓
Approve → stores.status = "active"
```

---

### 3.4 Quản lý Narration

> Admin có thể can thiệp vào nội dung thuyết minh:

- ✏️ **Edit** — Chỉnh sửa nội dung narration
- 🗑️ **Delete** — Xóa narration vi phạm
- 🚫 **Hide** — Ẩn tạm thời khỏi app

---

### 3.5 Analytics toàn hệ thống

> Admin xem tổng quan toàn bộ hệ thống:

| Chỉ số                | Mô tả                           |
|-----------------------|---------------------------------|
| 👥 Total Users        | Tổng số người dùng đăng ký      |
| 🏪 Total Stores       | Tổng số quán active             |
| 🎵 Total Listens      | Tổng số lượt nghe thuyết minh   |
| ⭐ Top Stores         | Quán được nghe nhiều nhất       |

---

## 4. Luồng GPS của hệ thống

> Đây là **core logic quan trọng nhất** của toàn bộ ứng dụng.

```
User mở app
  ↓
App liên tục lấy tọa độ GPS (lat, lng) của user
  ↓
Gửi lat/lng lên server theo chu kỳ (hoặc khi di chuyển đáng kể)
  ↓
Server query PostGIS → tìm store trong bán kính 20-50m
  ↓
Nếu có store gần → trả về thông tin store
  ↓
App hiển thị popup thông báo cho user
```

> ⚠️ **Lưu ý:** Cần cân nhắc tần suất gửi GPS để tiết kiệm pin và băng thông.

---

## 5. Luồng Narration theo ngôn ngữ

> Hệ thống hỗ trợ đa ngôn ngữ với cơ chế **fallback**.

```
User có preferred_language = "Korean" (ko)
  ↓
Backend tìm narration với language = "ko" cho store đó
  ↓
┌── Nếu CÓ bản "ko" → Trả audio tiếng Hàn về app
└── Nếu KHÔNG CÓ → Fallback về English (en)
                      ↓
                   Trả audio tiếng Anh về app
```

> 📌 **Fallback chain:** `user_language` → `English (en)` → Thông báo "Chưa có thuyết minh"

---

## 6. Luồng Tổng thể hệ thống

> Cái nhìn bird-eye về toàn bộ vòng đời từ khi merchant tạo quán đến khi user nghe thuyết minh.

```
[MERCHANT] Tạo quán + upload menu + narration
  ↓
[ADMIN] Xem xét và duyệt quán
  ↓
[HỆ THỐNG] stores.status = "active" → Quán live trên app
  ↓
[USER] Đến gần quán (GPS detect khoảng cách < 20m)
  ↓
[APP] Hiển thị popup thông báo
  ↓
[USER] Nhấn nghe → App phát narration theo ngôn ngữ
  ↓
[HỆ THỐNG] Lưu listen_history vào database
  ↓
[MERCHANT / ADMIN] Xem analytics & thống kê
```

---

*Tài liệu này được duy trì bởi nhóm phát triển dự án Seminar SGU.*
*Cập nhật lần cuối: 2026-03-16*
# 🗄️ DATABASE SCHEMA — Chi Tiết

> **Hệ quản trị CSDL:** PostgreSQL 15 (Supabase hosted)
> **ORM:** Prisma 5 — Haversine distance tính tại client-side (không dùng PostGIS)
> **Kiểu ID:** UUID v4 cho tất cả bảng
> **Múi giờ:** UTC (lưu `timestamp with time zone`)

---

## Mục Lục

| #    | Bảng                       | Mô tả                          |
|------|----------------------------|--------------------------------|
| 1.1  | `users`                    | Tài khoản hệ thống             |
| 1.2  | `languages`                | Ngôn ngữ hỗ trợ               |
| 1.3  | `merchants`                | Thông tin chủ quán             |
| 1.4  | `stores`                   | Quán ăn                        |
| 1.5  | `store_images`             | Ảnh quán                       |
| 1.6  | `menus`                    | Món ăn trong quán              |
| 1.7  | `narrations`               | Audio thuyết minh              |
| 1.8  | `listen_history`           | Lịch sử nghe của user         |
| 1.9  | `subscriptions`            | Gói Premium của khách          |
| 1.10 | `merchant_subscriptions`   | Gói đăng ký của merchant       |
| 1.11 | `plan_metadata`            | Cấu hình giá gói               |
| 1.12 | `transactions`             | Giao dịch thanh toán tổng hợp |
| 1.13 | `payment_vnpay`            | Chi tiết thanh toán VNPAY      |
| 1.14 | `payment_momo`             | Chi tiết thanh toán MoMo       |
| 1.15 | `qr_codes`                 | Mã QR gắn tại quán            |
| 1.16 | `refresh_tokens`           | Token rotation store           |

---

## 1.1 `users`

> Lưu tất cả tài khoản trong hệ thống (user / merchant / admin).

| Column              | Type                              | Constraint       | Mô tả                         |
|---------------------|-----------------------------------|------------------|-------------------------------|
| `id`                | `uuid`                            | PK, NOT NULL     | ID người dùng                 |
| `name`              | `varchar(100)`                    | NOT NULL         | Tên hiển thị                  |
| `email`             | `varchar(255)`                    | UNIQUE, NOT NULL | Email đăng nhập               |
| `password_hash`     | `text`                            | NOT NULL         | Mật khẩu đã hash (bcrypt 12)  |
| `phone`             | `varchar(20)`                     | NULLABLE         | Số điện thoại                 |
| `role`              | `enum('user','merchant','admin')` | NOT NULL         | Phân quyền người dùng         |
| `preferred_language`| `varchar(10)`                     | DEFAULT `'vi'`   | Ngôn ngữ mặc định (ISO 639-1) |
| `avatar_url`        | `text`                            | NULLABLE         | URL ảnh đại diện              |
| `is_active`         | `boolean`                         | DEFAULT `true`   | Trạng thái tài khoản          |
| `is_online`         | `boolean`                         | DEFAULT `false`  | Trạng thái online hiện tại    |
| `created_at`        | `timestamptz`                     | DEFAULT NOW()    | Ngày tạo tài khoản            |
| `updated_at`        | `timestamptz`                     | DEFAULT NOW()    | Lần cập nhật cuối             |

---

## 1.2 `languages`

> Danh sách ngôn ngữ hỗ trợ cho thuyết minh.

| Column      | Type           | Constraint     | Mô tả                      |
|-------------|----------------|----------------|----------------------------|
| `id`        | `uuid`         | PK             | ID ngôn ngữ                |
| `code`      | `varchar(10)`  | UNIQUE         | Mã ISO 639-1 (vi, en, ko…) |
| `name`      | `varchar(50)`  | NOT NULL       | Tên ngôn ngữ               |
| `flag_icon` | `text`         | NULLABLE       | URL icon quốc kỳ           |
| `is_active` | `boolean`      | DEFAULT `true` | Ẩn/hiện ngôn ngữ           |

**Dữ liệu mặc định (seed):**

| `code` | `name`       |
|--------|--------------|
| `vi`   | Vietnamese   |
| `en`   | English      |
| `zh`   | Chinese      |
| `ko`   | Korean       |
| `ja`   | Japanese     |
| `fr`   | French       |

---

## 1.3 `merchants`

> Thông tin doanh nghiệp của chủ quán (1 user → 1 merchant).

| Column          | Type                                                   | Constraint              | Mô tả                    |
|-----------------|--------------------------------------------------------|-------------------------|--------------------------|
| `id`            | `uuid`                                                 | PK                      | ID merchant              |
| `user_id`       | `uuid`                                                 | FK → `users.id`, UNIQUE | Tài khoản liên kết       |
| `business_name` | `varchar(200)`                                         | NOT NULL                | Tên doanh nghiệp         |
| `tax_code`      | `varchar(50)`                                          | NULLABLE                | Mã số thuế               |
| `status`        | `enum('pending','approved','rejected','blocked')`      | DEFAULT `'pending'`     | Trạng thái duyệt         |
| `reject_reason` | `text`                                                 | NULLABLE                | Lý do từ chối (nếu có)   |
| `created_at`    | `timestamptz`                                          | DEFAULT NOW()           | Ngày đăng ký             |

---

## 1.4 `stores`

> Thông tin quán ăn (POI). Tọa độ GPS lưu dạng `float`, Haversine tính tại client.

| Column         | Type                                    | Constraint          | Mô tả                            |
|----------------|-----------------------------------------|---------------------|----------------------------------|
| `id`           | `uuid`                                  | PK                  | ID quán                          |
| `merchant_id`  | `uuid`                                  | FK → `merchants.id` | Chủ quán                         |
| `name`         | `varchar(200)`                          | NOT NULL            | Tên quán                         |
| `description`  | `text`                                  | NULLABLE            | Mô tả quán                       |
| `address`      | `text`                                  | NOT NULL            | Địa chỉ văn bản                  |
| `lat`          | `float`                                 | NOT NULL            | Vĩ độ (Latitude)                 |
| `lng`          | `float`                                 | NOT NULL            | Kinh độ (Longitude)              |
| `open_time`    | `varchar(5)`                            | NULLABLE            | Giờ mở cửa (định dạng "HH:MM")  |
| `close_time`   | `varchar(5)`                            | NULLABLE            | Giờ đóng cửa (định dạng "HH:MM")|
| `cover_image`  | `text`                                  | NULLABLE            | URL ảnh bìa                      |
| `status`       | `enum('pending','active','hidden')`     | DEFAULT `'pending'` | Trạng thái quán                  |
| `created_at`   | `timestamptz`                           | DEFAULT NOW()       | Ngày tạo                         |
| `updated_at`   | `timestamptz`                           | DEFAULT NOW()       | Lần cập nhật cuối                |

---

## 1.5 `store_images`

> Bộ ảnh của quán (nhiều ảnh / quán).

| Column       | Type          | Constraint           | Mô tả               |
|--------------|---------------|----------------------|---------------------|
| `id`         | `uuid`        | PK                   | ID ảnh              |
| `store_id`   | `uuid`        | FK → `stores.id`     | Quán sở hữu ảnh     |
| `image_url`  | `text`        | NOT NULL             | URL ảnh             |
| `sort_order` | `int`         | DEFAULT `0`          | Thứ tự hiển thị     |
| `created_at` | `timestamptz` | DEFAULT NOW()        | Ngày upload         |

---

## 1.6 `menus`

> Danh sách món ăn của quán.

| Column        | Type             | Constraint       | Mô tả              |
|---------------|------------------|------------------|--------------------|
| `id`          | `uuid`           | PK               | ID món             |
| `store_id`    | `uuid`           | FK → `stores.id` | Quán sở hữu món    |
| `name`        | `varchar(200)`   | NOT NULL         | Tên món ăn         |
| `description` | `text`           | NULLABLE         | Mô tả món          |
| `price`       | `numeric(12,0)`  | NOT NULL         | Giá (VND)          |
| `image_url`   | `text`           | NULLABLE         | Ảnh món ăn         |
| `is_available`| `boolean`        | DEFAULT `true`   | Còn bán hay không  |
| `created_at`  | `timestamptz`    | DEFAULT NOW()    | Ngày thêm          |

---

## 1.7 `narrations`

> Nội dung audio thuyết minh theo từng ngôn ngữ.

| Column          | Type          | Constraint                        | Mô tả                        |
|-----------------|---------------|-----------------------------------|------------------------------|
| `id`            | `uuid`        | PK                                | ID narration                 |
| `store_id`      | `uuid`        | FK → `stores.id`                  | Quán thuộc về                |
| `language_id`   | `uuid`        | FK → `languages.id`               | Ngôn ngữ của bản thuyết minh |
| `audio_url`     | `text`        | NULLABLE                          | URL file audio               |
| `text_content`  | `text`        | NULLABLE                          | Nội dung text (cho TTS)      |
| `duration`      | `int`         | NULLABLE                          | Thời lượng audio (giây)      |
| `is_active`     | `boolean`     | DEFAULT `true`                    | Hiện/ẩn narration            |
| `created_at`    | `timestamptz` | DEFAULT NOW()                     | Ngày tạo                     |

> **Unique constraint:** `(store_id, language_id)` — mỗi quán chỉ có 1 bản narration / ngôn ngữ.

---

## 1.8 `listen_history`

> Ghi lại mỗi lần user nghe thuyết minh.

| Column         | Type               | Constraint               | Mô tả                   |
|----------------|--------------------|--------------------------|-------------------------|
| `id`           | `uuid`             | PK                       | ID record               |
| `user_id`      | `uuid`             | FK → `users.id`          | Người nghe              |
| `store_id`     | `uuid`             | FK → `stores.id`         | Quán được nghe          |
| `narration_id` | `uuid`             | FK → `narrations.id`     | Bản narration được nghe |
| `source`       | `enum('gps','qr')` | DEFAULT `'gps'`          | Cách tìm quán           |
| `listened_at`  | `timestamptz`      | DEFAULT NOW()            | Thời điểm nghe          |

---

## 1.9 `subscriptions`

> Gói Premium dành cho **User (khách du lịch)**.

| Column       | Type                                        | Constraint       | Mô tả               |
|--------------|---------------------------------------------|------------------|---------------------|
| `id`         | `uuid`                                      | PK               | ID subscription     |
| `user_id`    | `uuid`                                      | FK → `users.id`  | User đăng ký        |
| `plan`       | `enum('free','monthly','yearly')`           | NOT NULL         | Loại gói            |
| `start_date` | `date`                                      | NOT NULL         | Ngày bắt đầu        |
| `end_date`   | `date`                                      | NOT NULL         | Ngày hết hạn        |
| `status`     | `enum('active','expired','cancelled')`      | NOT NULL         | Trạng thái          |
| `created_at` | `timestamptz`                               | DEFAULT NOW()    | Ngày mua            |

> **Giới hạn nghe theo gói:** `free` = 10 lần/ngày, `monthly` = 30 lần/ngày, `yearly` = không giới hạn.

---

## 1.10 `merchant_subscriptions`

> Gói đăng ký dành cho **Merchant (chủ quán)**.

| Column        | Type                                     | Constraint           | Mô tả               |
|---------------|------------------------------------------|----------------------|---------------------|
| `id`          | `uuid`                                   | PK                   | ID subscription     |
| `merchant_id` | `uuid`                                   | FK → `merchants.id`  | Merchant đăng ký    |
| `plan`        | `enum('starter','business','premium')`   | NOT NULL             | Loại gói            |
| `max_store`   | `int`                                    | NOT NULL             | Số quán tối đa      |
| `max_poi`     | `int`                                    | DEFAULT `1`          | Số lượng POI tối đa |
| `start_date`  | `date`                                   | NOT NULL             | Ngày bắt đầu        |
| `end_date`    | `date`                                   | NOT NULL             | Ngày hết hạn        |
| `status`      | `enum('active','expired','cancelled')`   | NOT NULL             | Trạng thái          |
| `created_at`  | `timestamptz`                            | DEFAULT NOW()        | Ngày mua            |

> **Gói Starter** được kích hoạt tự động khi Admin duyệt merchant. `maxPOI` lấy từ `plan_metadata`.

---

## 1.11 `plan_metadata`

> Bảng cấu hình chi tiết cho các gói dịch vụ — do Admin quản lý, không hardcode.

| Column        | Type             | Constraint    | Mô tả                   |
|---------------|------------------|---------------|-------------------------|
| `plan_key`    | `varchar(100)`   | PK            | Mã gói (vd: `merchant_business`) |
| `name`        | `varchar(200)`   | NOT NULL      | Tên gói hiển thị        |
| `description` | `text`           | NULLABLE      | Mô tả gói               |
| `price`       | `numeric(15,0)`  | NOT NULL      | Giá gói (VND)           |
| `max_store`   | `int`            | DEFAULT `1`   | Giới hạn số quán        |
| `max_poi`     | `int`            | DEFAULT `1`   | Giới hạn số POI         |
| `features`    | `jsonb`          | NULLABLE      | Tính năng kèm theo      |
| `created_at`  | `timestamptz`    | DEFAULT NOW() | Ngày tạo                |
| `updated_at`  | `timestamptz`    | DEFAULT NOW() | Cập nhật lần cuối       |

---

## 1.12 `transactions`

> Bảng **trung tâm** ghi nhận mọi giao dịch thanh toán trong hệ thống.

| Column             | Type                                                               | Constraint       | Mô tả                          |
|--------------------|-------------------------------------------------------------------|------------------|--------------------------------|
| `id`               | `uuid`                                                            | PK               | ID giao dịch (nội bộ)          |
| `user_id`          | `uuid`                                                            | FK → `users.id`  | Người thực hiện thanh toán     |
| `amount`           | `numeric(15,0)`                                                   | NOT NULL         | Số tiền (VND)                  |
| `currency`         | `varchar(10)`                                                     | DEFAULT `'VND'`  | Loại tiền tệ                   |
| `type`             | `enum('user_subscription','merchant_subscription','food_order')`  | NOT NULL         | Mục đích thanh toán            |
| `payment_method`   | `enum('vnpay','momo','cash')`                                     | NOT NULL         | Phương thức thanh toán         |
| `payment_ref_id`   | `varchar`                                                         | NULLABLE         | FK tham chiếu payment_vnpay/momo |
| `status`           | `enum('pending','success','failed','refunded')`                   | DEFAULT `'pending'` | Trạng thái giao dịch        |
| `description`      | `text`                                                            | NULLABLE         | Ghi chú (chứa `[KEY=plan_key]` cho post-payment) |
| `plan_key`         | `varchar`                                                         | NULLABLE         | Mã gói để kích hoạt sau thanh toán |
| `created_at`       | `timestamptz`                                                     | DEFAULT NOW()    | Thời điểm tạo giao dịch        |
| `updated_at`       | `timestamptz`                                                     | DEFAULT NOW()    | Lần cập nhật cuối              |

---

## 1.13 `payment_vnpay`

> Lưu chi tiết callback/response từ **VNPAY**.

| Column               | Type           | Constraint              | Mô tả                                 |
|----------------------|----------------|-------------------------|---------------------------------------|
| `id`                 | `uuid`         | PK                      | ID record                             |
| `transaction_id`     | `uuid`         | FK → `transactions.id`, UNIQUE | Giao dịch nội bộ              |
| `vnp_txn_ref`        | `varchar(100)` | UNIQUE                  | Mã tham chiếu gửi lên VNPAY           |
| `vnp_amount`         | `bigint`       | NOT NULL                | Số tiền × 100 (theo chuẩn VNPAY)      |
| `vnp_order_info`     | `text`         | NULLABLE                | Thông tin đơn hàng                    |
| `vnp_response_code`  | `varchar(10)`  | NULLABLE                | Mã phản hồi (`00` = thành công)       |
| `vnp_transaction_no` | `varchar(100)` | NULLABLE                | Mã giao dịch phía VNPAY              |
| `vnp_bank_code`      | `varchar(50)`  | NULLABLE                | Mã ngân hàng                          |
| `vnp_pay_date`       | `varchar(20)`  | NULLABLE                | Ngày thanh toán (định dạng VNPAY)     |
| `vnp_secure_hash`    | `text`         | NULLABLE                | Chữ ký bảo mật xác thực callback      |
| `raw_response`       | `jsonb`        | NULLABLE                | Toàn bộ response JSON từ VNPAY        |
| `created_at`         | `timestamptz`  | DEFAULT NOW()           | Thời điểm nhận callback               |

---

## 1.14 `payment_momo`

> Lưu chi tiết callback/response từ **MoMo**.

| Column              | Type           | Constraint              | Mô tả                                     |
|---------------------|----------------|-------------------------|-------------------------------------------|
| `id`                | `uuid`         | PK                      | ID record                                 |
| `transaction_id`    | `uuid`         | FK → `transactions.id`, UNIQUE | Giao dịch nội bộ                  |
| `order_id`          | `varchar(100)` | UNIQUE                  | Mã đơn hàng gửi lên MoMo                 |
| `request_id`        | `varchar(100)` | NULLABLE                | Request ID của MoMo                       |
| `amount`            | `bigint`       | NOT NULL                | Số tiền (VND)                             |
| `order_info`        | `text`         | NULLABLE                | Thông tin đơn hàng                        |
| `momo_trans_id`     | `varchar(100)` | NULLABLE                | Mã giao dịch phía MoMo                    |
| `result_code`       | `int`          | NULLABLE                | Mã kết quả (`0` = thành công)             |
| `message`           | `text`         | NULLABLE                | Thông báo từ MoMo                         |
| `pay_type`          | `varchar(50)`  | NULLABLE                | Loại thanh toán (app / web / pos…)        |
| `signature`         | `text`         | NULLABLE                | Chữ ký HMAC-SHA256 xác thực callback      |
| `raw_response`      | `jsonb`        | NULLABLE                | Toàn bộ response JSON từ MoMo             |
| `created_at`        | `timestamptz`  | DEFAULT NOW()           | Thời điểm nhận callback                   |

---

## 1.15 `qr_codes`

> Mã QR được gắn tại quán để user quét khi GPS không chính xác.

| Column         | Type           | Constraint       | Mô tả                       |
|----------------|----------------|------------------|-----------------------------|
| `id`           | `uuid`         | PK               | ID QR                       |
| `store_id`     | `uuid`         | FK → `stores.id` | Quán gắn QR                 |
| `code`         | `varchar(100)` | UNIQUE, NOT NULL | Chuỗi mã (encode store_id)  |
| `qr_image_url` | `text`         | NULLABLE         | URL ảnh QR để in            |
| `is_active`    | `boolean`      | DEFAULT `true`   | Trạng thái mã QR (chỉ 1 active/store) |
| `created_at`   | `timestamptz`  | DEFAULT NOW()    | Ngày tạo                    |

---

## 1.16 `refresh_tokens`

> Lưu refresh token cho cơ chế **Token Rotation** (max 5 token đồng thời / user).

| Column       | Type          | Constraint       | Mô tả                         |
|--------------|---------------|------------------|-------------------------------|
| `id`         | `uuid`        | PK               | ID record                     |
| `user_id`    | `uuid`        | FK → `users.id`  | Chủ sở hữu token              |
| `token_hash` | `text`        | UNIQUE           | Hash bcrypt của refresh token |
| `expires_at` | `timestamptz` | NOT NULL         | Thời điểm hết hạn             |
| `created_at` | `timestamptz` | DEFAULT NOW()    | Ngày tạo                      |

> **Bảo mật:** Nếu phát hiện token đã dùng lại (reuse attack) → revoke toàn bộ session của user (xóa tất cả refresh_tokens).

---

## Enums

| Enum | Giá trị |
|------|---------|
| `UserRole` | `user`, `merchant`, `admin` |
| `MerchantStatus` | `pending`, `approved`, `rejected`, `blocked` |
| `StoreStatus` | `pending`, `active`, `hidden` |
| `SubscriptionPlan` | `free`, `monthly`, `yearly` |
| `MerchantPlan` | `starter`, `business`, `premium` |
| `SubscriptionStatus` | `active`, `expired`, `cancelled` |
| `TransactionType` | `user_subscription`, `merchant_subscription`, `food_order` |
| `PaymentMethod` | `momo`, `cash`, `vnpay` |
| `TransactionStatus` | `pending`, `success`, `failed`, `refunded` |
| `ListenSource` | `gps`, `qr` |

---

## Quan hệ giữa các bảng (Foreign Keys tóm tắt)

```
users ──────────────── merchants (user_id)
users ──────────────── subscriptions (user_id)
users ──────────────── transactions (user_id)
users ──────────────── listen_history (user_id)
users ──────────────── refresh_tokens (user_id)

merchants ──────────── stores (merchant_id)
merchants ──────────── merchant_subscriptions (merchant_id)

stores ─────────────── store_images (store_id)
stores ─────────────── menus (store_id)
stores ─────────────── narrations (store_id)
stores ─────────────── qr_codes (store_id)
stores ─────────────── listen_history (store_id)

languages ──────────── narrations (language_id)

narrations ─────────── listen_history (narration_id)

transactions ───────── payment_vnpay (transaction_id)
transactions ───────── payment_momo (transaction_id)
```

---

*Tài liệu này được duy trì bởi nhóm phát triển dự án Seminar SGU.*  
*Cập nhật lần cuối: 2026-05-10*
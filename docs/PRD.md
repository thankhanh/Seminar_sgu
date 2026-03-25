# 📋 PRD — Product Requirements Document
# VĨNH KHÁNH DIGITAL AUDIO GUIDE PLATFORM

**Phiên bản:** v1.0  
**Ngày cập nhật:** 24/03/2026  
**Trường:** Đại học Sài Gòn (SGU)  
**Team:** 4 developers  

---

## 1. TỔNG QUAN SẢN PHẨM (Product Overview)

### 1.1 Tầm nhìn (Vision)
Xây dựng nền tảng **thuyết minh ẩm thực tự động** dựa trên vị trí GPS, giúp khách du lịch nước ngoài dễ dàng tìm hiểu các quán ăn tại khu Vĩnh Khánh — mà không cần biết tiếng Việt.

### 1.2 Vấn đề cần giải quyết (Problem Statement)

| Vấn đề | Ảnh hưởng |
|--------|-----------|
| Khách du lịch không biết tiếng Việt | Khó tìm hiểu món ăn, văn hóa ẩm thực |
| Không có hướng dẫn viên cho từng quán | Trải nghiệm rời rạc, thiếu chiều sâu |
| Quán ăn nhỏ thiếu công cụ tiếp cận khách quốc tế | Mất cơ hội kinh doanh |
| GPS/Bản đồ thông thường không cung cấp ngữ cảnh | Khách chỉ thấy vị trí, không hiểu câu chuyện |

### 1.3 Giải pháp (Solution)
Hệ thống kết hợp **GPS Geofencing + Audio Narration đa ngôn ngữ + QR Code fallback** để tự động phát thuyết minh khi khách đến gần quán ăn.

### 1.4 Đối tượng sử dụng (Target Users)

| Persona | Mô tả | Nhu cầu chính |
|---------|-------|---------------|
| 🧳 **User (Khách du lịch)** | Khách quốc tế, 20-50 tuổi, yêu ẩm thực | Nghe giới thiệu quán bằng ngôn ngữ mẹ đẻ |
| 🍜 **Merchant (Chủ quán)** | Chủ quán ăn khu Vĩnh Khánh | Quảng bá quán đến khách quốc tế, analytics |
| 🛡️ **Admin (Quản trị viên)** | Nhóm vận hành nền tảng | Kiểm soát chất lượng, duyệt nội dung |

---

## 2. MỤC TIÊU SẢN PHẨM (Product Goals)

### 2.1 Mục tiêu kinh doanh
- Thu hút **500+ khách du lịch** sử dụng app trong 6 tháng đầu
- Onboard **50+ quán ăn** khu Vĩnh Khánh
- Tạo nguồn doanh thu từ gói **Premium** (user) và gói **Business** (merchant)

### 2.2 Mục tiêu kỹ thuật
- Độ chính xác GPS **< 20m** trong khu vực ẩm thực
- Thời gian phản hồi API **< 500ms** cho query geofencing
- Hỗ trợ **6 ngôn ngữ**: Tiếng Việt, Anh, Trung, Hàn, Nhật, Pháp
- Uptime **99%** cho backend API

### 2.3 Metrics đo lường (KPIs)

| KPI | Mục tiêu | Cách đo |
|-----|----------|---------|
| DAU (Daily Active Users) | 50+ | Analytics |
| Lượt nghe narration / ngày | 200+ | `listen_history` table |
| Tỷ lệ chuyển đổi Premium | > 5% | `subscriptions` table |
| Số quán active | 50+ | `stores` (status=active) |
| NPS (Net Promoter Score) | > 7/10 | Khảo sát in-app |

---

## 3. PHẠM VI SẢN PHẨM (Scope)

### 3.1 Trong phạm vi (In Scope) — MVP v1.0

#### 📱 Mobile App (User)
| # | Tính năng | Mô tả | Ưu tiên |
|---|-----------|-------|---------|
| F1 | Đăng ký / Đăng nhập | Email + Password, chọn ngôn ngữ | 🔴 P0 |
| F2 | Bản đồ GPS | Hiển thị quán gần đó trong bán kính 500m | 🔴 P0 |
| F3 | Geofencing tự động | Popup thông báo khi đến gần quán (< 20m) | 🔴 P0 |
| F4 | Audio narration | Phát thuyết minh đa ngôn ngữ + player controls | 🔴 P0 |
| F5 | QR Scanner | Quét QR tại quán khi GPS không chính xác | 🔴 P0 |
| F6 | Chi tiết quán | Ảnh, mô tả, menu, giờ mở cửa | 🟡 P1 |
| F7 | Lịch sử nghe | Danh sách quán đã nghe thuyết minh | 🟡 P1 |
| F8 | Gói Premium | Mua gói tháng/năm qua VNPAY/MoMo | 🟢 P2 |
| F9 | Yêu thích | Bookmark quán yêu thích | 🟢 P2 |

#### 🖥️ Web Dashboard (Merchant)
| # | Tính năng | Mô tả | Ưu tiên |
|---|-----------|-------|---------|
| M1 | Đăng ký Merchant | Form đăng ký + thông tin doanh nghiệp | 🔴 P0 |
| M2 | Tạo / quản lý quán | CRUD thông tin quán + chọn GPS trên bản đồ | 🔴 P0 |
| M3 | Upload narration | Upload audio hoặc nhập text cho TTS | 🔴 P0 |
| M4 | Quản lý menu | Thêm/sửa/xóa món ăn + ảnh | 🟡 P1 |
| M5 | QR Code | Tạo và tải QR code về in | 🟡 P1 |
| M6 | Analytics | Thống kê lượt nghe, top ngôn ngữ | 🟢 P2 |
| M7 | Gói đăng ký | Mua gói Starter/Business/Premium | 🟢 P2 |

#### 🖥️ Web Dashboard (Admin)
| # | Tính năng | Mô tả | Ưu tiên |
|---|-----------|-------|---------|
| A1 | Duyệt Merchant | Approve/Reject merchant đăng ký | 🔴 P0 |
| A2 | Duyệt Store | Approve/Hide store mới tạo | 🔴 P0 |
| A3 | Quản lý Users | Xem, kích hoạt/vô hiệu hóa tài khoản | 🟡 P1 |
| A4 | Quản lý Narration | Kiểm duyệt nội dung thuyết minh | 🟡 P1 |
| A5 | Analytics hệ thống | Dashboard tổng quan: users, stores, revenue | 🟢 P2 |
| A6 | Quản lý giao dịch | Xem chi tiết thanh toán VNPAY/MoMo | 🟢 P2 |

### 3.2 Ngoài phạm vi (Out of Scope) — MVP v1.0
- ❌ Social login (Google/Apple/Facebook)
- ❌ Chat/Messaging giữa user và merchant
- ❌ AI-powered recommendation (gợi ý quán)
- ❌ Offline mode hoàn chỉnh
- ❌ Multi-tenant cho nhiều khu ẩm thực khác

---

## 4. YÊU CẦU CHỨC NĂNG CHI TIẾT (Functional Requirements)

### 4.1 Module Authentication (FR-AUTH)

| ID | Yêu cầu | Chi tiết |
|----|---------|---------|
| FR-AUTH-01 | Đăng ký tài khoản | Email + password + name + phone (optional) + role (user/merchant) |
| FR-AUTH-02 | Đăng nhập | Email + password → JWT Access Token (15 phút) + Refresh Token (7 ngày) |
| FR-AUTH-03 | Refresh Token | Rotation strategy — mỗi lần refresh sẽ cấp cặp token mới |
| FR-AUTH-04 | Đăng xuất | Invalidate refresh token trong DB |
| FR-AUTH-05 | Phân quyền Role | `user`, `merchant`, `admin` — middleware guard kiểm tra role |

### 4.2 Module GPS & Geofencing (FR-GPS)

| ID | Yêu cầu | Chi tiết |
|----|---------|---------|
| FR-GPS-01 | Tracking vị trí | Mobile app watch GPS mỗi 10-15 giây |
| FR-GPS-02 | Tìm quán gần đó | API query PostGIS `ST_DWithin` bán kính configurable (default 500m) |
| FR-GPS-03 | Geofence trigger | Khi khoảng cách < 20m → hiện popup thông báo |
| FR-GPS-04 | Chống lặp | Không trigger lại cho cùng quán trong 30 phút |
| FR-GPS-05 | QR fallback | Khi GPS sai > 20m → user scan QR code tại quán |

### 4.3 Module Audio Narration (FR-NAR)

| ID | Yêu cầu | Chi tiết |
|----|---------|---------|
| FR-NAR-01 | Đa ngôn ngữ | Mỗi quán có narration cho mỗi ngôn ngữ (1:N) |
| FR-NAR-02 | Fallback chain | `preferred_language` → `English (en)` → "Chưa có thuyết minh" |
| FR-NAR-03 | Audio player | Play/Pause, seek bar, tốc độ phát (0.5x-2x) |
| FR-NAR-04 | Ghi lịch sử | Tự động log vào `listen_history` (user_id, store_id, narration_id, source) |
| FR-NAR-05 | Upload audio | Merchant upload file MP3 hoặc nhập text (TTS generate) |

### 4.4 Module Store Management (FR-STORE)

| ID | Yêu cầu | Chi tiết |
|----|---------|---------|
| FR-STORE-01 | CRUD quán | Merchant tạo/sửa/xóa quán + chọn vị trí GPS trên bản đồ |
| FR-STORE-02 | Approval flow | Quán mới → `pending` → Admin duyệt → `active` |
| FR-STORE-03 | Ảnh quán | Upload nhiều ảnh, sắp xếp thứ tự hiển thị |
| FR-STORE-04 | Menu quán | CRUD món ăn (tên, giá VND, ảnh, trạng thái còn bán) |
| FR-STORE-05 | QR Code | Tự động generate QR code encode `store_id` |

### 4.5 Module Payment (FR-PAY)

| ID | Yêu cầu | Chi tiết |
|----|---------|---------|
| FR-PAY-01 | VNPAY | Redirect flow → IPN callback → verify secure hash |
| FR-PAY-02 | MoMo | Deeplink / webview → IPN callback → verify HMAC signature |
| FR-PAY-03 | Idempotency | Không tạo duplicate transaction khi IPN gọi nhiều lần |
| FR-PAY-04 | Transaction log | Mọi giao dịch ghi vào `transactions` + `payment_vnpay/momo` |

---

## 5. YÊU CẦU PHI CHỨC NĂNG (Non-Functional Requirements)

| ID | Hạng mục | Yêu cầu |
|----|----------|---------|
| NFR-01 | **Performance** | API response < 500ms (P95), GPS query < 200ms |
| NFR-02 | **Scalability** | Hỗ trợ 1000 concurrent users |
| NFR-03 | **Security** | Bcrypt password hash, JWT + HTTPS, SQL injection prevention |
| NFR-04 | **Availability** | Uptime 99%, auto-restart khi crash |
| NFR-05 | **Compatibility** | iOS 15+, Android 10+, Chrome/Safari/Firefox (Web) |
| NFR-06 | **Localization** | 6 ngôn ngữ UI + audio, thêm ngôn ngữ mới không cần redeploy |
| NFR-07 | **Data Privacy** | Không lưu lịch trình GPS chi tiết, chỉ log khi trigger geofence |
| NFR-08 | **Accessibility** | Contrast ratio > 4.5:1, font size adjustable, screen reader support |

---

## 6. TECH STACK

| Layer | Công nghệ | Ghi chú |
|-------|-----------|---------|
| **Backend** | NestJS + TypeScript | Monolith, Prisma ORM |
| **Database** | PostgreSQL + PostGIS | Supabase hosted, GEOGRAPHY(POINT, 4326) |
| **Web Frontend** | React + Tailwind CSS + Vite | CMS cho Merchant & Admin |
| **Mobile** | React Native (Expo) | GPS, QR, Audio player |
| **Auth** | JWT + Refresh Token + Session | Bcrypt, token rotation |
| **Payment** | VNPAY SDK + MoMo OpenAPI v2 | Sandbox → Production |
| **Storage** | Supabase Storage | Audio MP3, images |
| **API Docs** | Swagger / OpenAPI | Auto-generated |

---

## 7. DATABASE SCHEMA TỔNG QUAN

Hệ thống sử dụng **14 bảng** PostgreSQL:

```
users ← merchants ← stores ← store_images
                           ← menus
                           ← narrations (linked to languages)
                           ← qr_codes
                           ← listen_history
users ← subscriptions
users ← transactions ← payment_vnpay
                     ← payment_momo
merchants ← merchant_subscriptions
```

> Chi tiết schema: xem [database.md](./database.md)

---

## 8. KIẾN TRÚC HỆ THỐNG

```
┌──────────────────────────────────────────────────────────────┐
│                      CLIENT LAYER                            │
│  📱 Mobile App (Expo)          🖥️ Web Dashboard (React)      │
│  GPS │ QR │ Audio Player      Merchant CMS │ Admin Panel     │
└──────────────┬───────────────────────────────┬───────────────┘
               │         HTTPS + JWT           │
┌──────────────▼───────────────────────────────▼───────────────┐
│                   BACKEND API (NestJS)                        │
│  Auth │ Stores │ Narrations │ QR │ Payments │ Admin          │
│  Prisma ORM │ JWT Guard │ Role Guard │ Swagger UI            │
└──────────────────────────┬───────────────────────────────────┘
                           │
        ┌──────────────────▼──────────────────┐
        │     SUPABASE (PostgreSQL + PostGIS)  │
        │  14 tables │ GIST spatial index      │
        │  Supabase Storage (MP3 + Images)     │
        └─────────────────────────────────────┘
```

---

## 9. RELEASE PLAN

| Phase | Timeline | Deliverables |
|-------|----------|-------------|
| **Phase 1: Core** | Tuần 1-4 | Auth API, Store CRUD, PostGIS query, Narration CRUD |
| **Phase 2: Web CMS** | Tuần 3-6 | Merchant Dashboard UI, Admin Dashboard UI, kết nối API |
| **Phase 3: Mobile MVP** | Tuần 5-8 | GPS tracking, Map view, Audio player, QR Scanner |
| **Phase 4: Payment** | Tuần 7-9 | VNPAY + MoMo integration, Premium/Subscription |
| **Phase 5: Polish** | Tuần 9-10 | Bug fixes, UI polish, performance optimization, testing |

---

## 10. RỦI RO VÀ GIẢI PHÁP

| Rủi ro | Xác suất | Giải pháp |
|--------|----------|-----------|
| GPS không chính xác trong khu vực hẹp | Cao | QR Code fallback, cho phép adjust bán kính geofence |
| Merchant không chủ động upload narration | Trung bình | Cung cấp text-to-speech (TTS), team hỗ trợ record |
| Latency cao khi nhiều user đồng thời | Thấp | PostGIS spatial index, caching Redis (tương lai) |
| VNPAY/MoMo sandbox khác production | Trung bình | Test kỹ trên sandbox, có error handling + retry |
| Pin phone hao nhanh do GPS liên tục | Cao | Giảm tần suất tracking khi user đứng yên, dùng significant location changes |

---

## 11. APPENDIX

### A. Glossary

| Thuật ngữ | Giải thích |
|-----------|-----------|
| **POI** (Point of Interest) | Điểm quan tâm trên bản đồ, ở đây = quán ăn |
| **Geofencing** | Vùng ảo quanh POI, khi user vào vùng → trigger sự kiện |
| **Narration** | Bản thuyết minh audio giới thiệu quán ăn |
| **PostGIS** | Extension PostgreSQL xử lý dữ liệu địa lý |
| **ST_DWithin** | Hàm PostGIS kiểm tra 2 điểm có nằm trong khoảng cách cho trước |
| **TTS** (Text-to-Speech) | Chuyển văn bản thành giọng nói tự động |
| **IPN** (Instant Payment Notification) | Webhook server-to-server từ cổng thanh toán |

### B. Tài liệu liên quan
- [yeucau.md](./yeucau.md) — Master Document
- [workflow.md](./workflow.md) — Luồng hoạt động 3 vai trò
- [database.md](./database.md) — Schema 14 bảng
- [api.md](./api.md) — REST API ~40 endpoints
- [database_analysis.md](./database_analysis.md) — ERD + phân tích thanh toán

---

*Tài liệu này được duy trì bởi nhóm phát triển dự án Seminar SGU.*  
*Cập nhật lần cuối: 24/03/2026*

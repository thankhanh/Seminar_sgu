# 📋 PRD — Product Requirements Document
# VĨNH KHÁNH DIGITAL AUDIO GUIDE PLATFORM

**Phiên bản:** v1.1  
**Ngày cập nhật:** 2026-05-09  
**Trường:** Đại học Sài Gòn (SGU)  
**Team:** 2 developers  

---

## 1. TỔNG QUAN SẢN PHẨM (Product Overview)

### 1.1 Tầm nhìn (Vision)
Xây dựng nền tảng **thuyết minh ẩm thực tự động** dựa trên vị trí GPS, giúp khách du lịch nước ngoài dễ dàng tìm hiểu các quán ăn tại khu Vĩnh Khánh — mà không cần biết tiếng Việt, không cần hướng dẫn viên.

### 1.2 Vấn đề cần giải quyết (Problem Statement)

| Vấn đề | Ảnh hưởng |
|--------|-----------|
| Khách du lịch không biết tiếng Việt | Khó tìm hiểu món ăn, văn hóa ẩm thực |
| Không có hướng dẫn viên cho từng quán | Trải nghiệm rời rạc, thiếu chiều sâu |
| Quán ăn nhỏ thiếu công cụ tiếp cận khách quốc tế | Mất cơ hội kinh doanh |
| GPS/Bản đồ thông thường không cung cấp ngữ cảnh | Khách chỉ thấy vị trí, không hiểu câu chuyện |

### 1.3 Giải pháp (Solution)
Hệ thống kết hợp **GPS Geofencing + Text-to-Speech (TTS) đa ngôn ngữ + AI Auto-Translate + QR Code fallback** để tự động phát thuyết minh khi khách đến gần quán ăn.

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
- Tạo nguồn doanh thu từ gói **Premium** (user) và gói **Business/Premium** (merchant)

### 2.2 Mục tiêu kỹ thuật
- Độ chính xác GPS **< 50m** trong khu vực ẩm thực (trigger geofence)
- Thời gian phản hồi API **< 500ms** cho query stores
- Hỗ trợ ngôn ngữ động — thêm ngôn ngữ mới không cần redeploy
- Auto-translate từ tiếng Việt sang mọi ngôn ngữ active, cache vào DB

### 2.3 Metrics đo lường (KPIs)

| KPI | Mục tiêu | Cách đo |
|-----|----------|---------| 
| DAU (Daily Active Users) | 50+ | Analytics |
| Lượt nghe narration / ngày | 200+ | `listen_history` table |
| Tỷ lệ chuyển đổi Premium | > 5% | `subscriptions` table |
| Số quán active | 50+ | `stores` (status=active) |
| Thời gian load bản đồ | < 3s | Performance monitoring |

---

## 3. PHẠM VI SẢN PHẨM (Scope)

### 3.1 Đã triển khai (Implemented) — MVP v1.0

#### 📱 Mobile App (User)
| # | Tính năng | Trạng thái |
|---|-----------|------------|
| F1 | Đăng ký / Đăng nhập (JWT + Refresh Token) | ✅ Done |
| F2 | Bản đồ GPS (react-native-maps, markers có ảnh quán) | ✅ Done |
| F3 | Geofencing auto-detect (50m proximity alert + queue) | ✅ Done |
| F4 | TTS Player (expo-speech, đa ngôn ngữ) | ✅ Done |
| F5 | Auto-Translate (MyMemory API + DB cache) | ✅ Done |
| F6 | QR Scanner → navigate stall + ghi listen history | ✅ Done |
| F7 | Chi tiết quán (ảnh, menu, narrations, giờ mở cửa) | ✅ Done |
| F8 | Language Picker (từ server, dynamic) | ✅ Done |
| F9 | Giới hạn nghe theo gói (free: 10/ngày, monthly: 30, yearly: ∞) | ✅ Done |
| F10 | Mua gói Premium (VNPAY / MoMo) | ✅ Done |
| F11 | Offline image cache (OfflineService) | ✅ Done |

#### 🖥️ Merchant Dashboard (Web)
| # | Tính năng | Trạng thái |
|---|-----------|------------|
| M1 | Đăng ký Merchant (chờ Admin duyệt) | ✅ Done |
| M2 | Tạo / quản lý POI (CRUD, GPS picker, gallery) | ✅ Done |
| M3 | Upload narration (file audio + text content) | ✅ Done |
| M4 | Auto-translate từ text VI sang tất cả ngôn ngữ | ✅ Done |
| M5 | Quản lý menu (CRUD + ảnh + giá VNĐ) | ✅ Done |
| M6 | QR Code (generate deeplink `smarttour://stall/{id}`, tải về) | ✅ Done |
| M7 | Gói đăng ký (Starter/Business/Premium, giới hạn maxPOI) | ✅ Done |
| M8 | Xem thông tin merchant và subscription hiện tại | ✅ Done |

#### 🖥️ Admin Dashboard (Web)
| # | Tính năng | Trạng thái |
|---|-----------|------------|
| A1 | Duyệt Merchant (approve → auto starter plan / reject + reason) | ✅ Done |
| A2 | Duyệt Store (approve/hide) | ✅ Done |
| A3 | Quản lý Users (danh sách, toggle active) | ✅ Done |
| A4 | Tạo User mới (bao gồm tạo account merchant) | ✅ Done |
| A5 | Quản lý Narrations (xem, tìm kiếm, lọc theo ngôn ngữ) | ✅ Done |
| A6 | Quản lý Subscriptions (user + merchant, cập nhật gói) | ✅ Done |
| A7 | Xem Transactions (lịch sử thanh toán VNPAY/MoMo) | ✅ Done |
| A8 | System Analytics Dashboard (users, stores, revenue, growth %) | ✅ Done |
| A9 | Top Rankings (Top POI, Top Merchant, Top Client tháng này) | ✅ Done |
| A10 | Biểu đồ doanh thu 12 tháng | ✅ Done |
| A11 | Quản lý Ngôn ngữ (thêm/ẩn/hiện) | ✅ Done |

### 3.2 Ngoài phạm vi (Out of Scope)
- ❌ Social login (Google/Apple)
- ❌ Chat/Messaging giữa user và merchant
- ❌ Recommendation AI (gợi ý quán theo sở thích)
- ❌ Multi-tenant nhiều khu ẩm thực
- ❌ Push notification (FCM)

---

## 4. YÊU CẦU CHỨC NĂNG CHI TIẾT (Functional Requirements)

### 4.1 Module Authentication (FR-AUTH)

| ID | Yêu cầu | Chi tiết |
|----|---------|----------|
| FR-AUTH-01 | Đăng ký tài khoản | Email + password (bcrypt 12 rounds) + name + phone + role |
| FR-AUTH-02 | Đăng nhập | Email + password → Access Token (15m) + Refresh Token (7d) |
| FR-AUTH-03 | Refresh Token | Rotation: mỗi refresh xóa token cũ, cấp cặp mới, max 5 tokens/user |
| FR-AUTH-04 | Đăng xuất | Xóa refresh token khỏi DB, isOnline = false |
| FR-AUTH-05 | Security | Reuse attack: phát hiện token đã dùng → revoke toàn bộ session user |
| FR-AUTH-06 | Merchant pending | Merchant đăng ký → isActive=false → không nhận token → chờ admin duyệt |

### 4.2 Module GPS & Geofencing (FR-GPS)

| ID | Yêu cầu | Chi tiết |
|----|---------|----------|
| FR-GPS-01 | Location tracking | `expo-location.watchPositionAsync` (Balanced accuracy, distanceInterval: 10m) |
| FR-GPS-02 | Stores API | `GET /stores` → tất cả stores active, tính Haversine distance client-side |
| FR-GPS-03 | Geofence trigger | Khoảng cách <= 50m → ProximityAlert popup (có queue nhiều stores) |
| FR-GPS-04 | Dismiss logic | User bỏ qua → store vào dismissedSet, tiếp tục show store kế tiếp |
| FR-GPS-05 | QR fallback | Khi GPS không chính xác → scan QR → deeplink → mở stall detail |

### 4.3 Module Narration & TTS (FR-NAR)

| ID | Yêu cầu | Chi tiết |
|----|---------|----------|
| FR-NAR-01 | Đa ngôn ngữ | Mỗi store có narration per language (unique: storeId + languageId) |
| FR-NAR-02 | TTS playback | `expo-speech.speak(text, {language: "vi-VN"})` |
| FR-NAR-03 | Auto-translate | MyMemory API (free, no key), cache vào DB sau khi dịch |
| FR-NAR-04 | Sync translations | Upload text VI → tự động upsert narration cho tất cả ngôn ngữ active |
| FR-NAR-05 | Listen limit | Free: 10/ngày, Monthly: 30/ngày, Yearly: không giới hạn |
| FR-NAR-06 | Listen history | Ghi log {userId, storeId, narrationId, source: gps|qr} |
| FR-NAR-07 | Upload audio | File MP3/WAV → local `/uploads/`, trả về URL |

### 4.4 Module Store Management (FR-STORE)

| ID | Yêu cầu | Chi tiết |
|----|---------|----------|
| FR-STORE-01 | CRUD POI | Merchant: tạo/sửa/xóa store (tên, địa chỉ, lat/lng, giờ, ảnh) |
| FR-STORE-02 | Approval flow | Store mới → status:"pending" → Admin duyệt → "active" |
| FR-STORE-03 | POI limit | maxPOI từ planMetadata (starter:1, business:5, premium:N) |
| FR-STORE-04 | Gallery images | Nhiều ảnh (StoreImage), sort order, tự xóa file cũ khi update |
| FR-STORE-05 | Cascade delete | Xóa store → xóa images + narrations + file vật lý trên disk |
| FR-STORE-06 | findNearby API | Haversine distance trong `stores.service.ts`, sort theo khoảng cách |

### 4.5 Module QR Code (FR-QR)

| ID | Yêu cầu | Chi tiết |
|----|---------|----------|
| FR-QR-01 | Generate QR | Deeplink: `smarttour://stall/{storeId}?autoplay=1` |
| FR-QR-02 | QR image | `api.qrserver.com` generate QR image 300x300 |
| FR-QR-03 | Deactivate old | Khi generate QR mới → deactivate tất cả QR cũ của store |
| FR-QR-04 | Scan QR | Resolve code → store + narrations, ghi listenHistory source:"qr" |
| FR-QR-05 | Language fallback | preferredLanguage → "vi" → null |

### 4.6 Module Payment (FR-PAY)

| ID | Yêu cầu | Chi tiết |
|----|---------|----------|
| FR-PAY-01 | VNPAY | Redirect flow, amount×100, HMAC-SHA512, return URL verify |
| FR-PAY-02 | MoMo | captureWallet requestType, HMAC-SHA256, IPN server callback |
| FR-PAY-03 | planKey | Transaction description chứa `[KEY=plan_key]` để post-payment kích hoạt đúng gói |
| FR-PAY-04 | Post-payment | Sau giao dịch success → tự động tạo subscription/merchantSubscription |
| FR-PAY-05 | Transaction log | Mọi giao dịch ghi transactions + payment_vnpay/momo (rawResponse JSON) |

### 4.7 Module Subscription (FR-SUB)

| ID | Yêu cầu | Chi tiết |
|----|---------|----------|
| FR-SUB-01 | User plans | `free` (100 năm — mặc định), `monthly` (+1 tháng), `yearly` (+1 năm) |
| FR-SUB-02 | Queue logic | Mua yearly khi đang có monthly → yearly bắt đầu sau khi monthly kết thúc |
| FR-SUB-03 | Merchant plans | starter (auto khi approved), business, premium |
| FR-SUB-04 | maxPOI | Lấy từ planMetadata (admin cấu hình), không hardcode |
| FR-SUB-05 | Admin override | Admin có thể update gói user/merchant qua dashboard |

---

## 5. YÊU CẦU PHI CHỨC NĂNG (Non-Functional Requirements)

| ID | Hạng mục | Yêu cầu |
|----|----------|---------| 
| NFR-01 | **Performance** | API response < 500ms, GPS check < 100ms (Haversine) |
| NFR-02 | **Security** | Bcrypt 12 rounds, JWT HTTPS, token rotation, Helmet headers |
| NFR-03 | **Compatibility** | iOS 15+, Android 10+, Chrome/Safari/Firefox (Web Dashboard) |
| NFR-04 | **Localization** | Ngôn ngữ dynamic (DB), thêm không cần redeploy |
| NFR-05 | **Data Privacy** | Chỉ log khi trigger narration, không track GPS liên tục server-side |
| NFR-06 | **File Storage** | Local disk `/uploads/` cho MVP, sẵn sàng migrate sang S3 |
| NFR-07 | **Validation** | class-validator + whitelist: true trên tất cả DTOs |

---

## 6. TECH STACK

| Layer | Công nghệ | Ghi chú |
|-------|-----------|---------|
| **Backend** | NestJS 10 + TypeScript 5 | Monolith, Prisma ORM v5 |
| **Database** | PostgreSQL 15 | Supabase hosted |
| **Web Frontend** | React 18 + Tailwind CSS + Vite | Merchant & Admin CMS |
| **Mobile** | React Native (Expo SDK) | GPS, QR, TTS expo-speech |
| **Auth** | JWT Access (15m) + Refresh (7d) Rotation | bcryptjs, cookie-parser |
| **Payment** | VNPAY SHA-512 + MoMo OpenAPI v2 HMAC-SHA256 | Sandbox mode |
| **Translation** | MyMemory API (free tier) | Cache vào DB |
| **AI** | Google Gemini API | `@google/generative-ai` |
| **Storage** | Local disk `/uploads/` | Sẵn sàng migrate S3 |
| **API Docs** | Swagger / OpenAPI | Auto-generated tại `/api` |

---

## 7. DATABASE SCHEMA

Hệ thống sử dụng **14 models** PostgreSQL (Prisma ORM):

```
User → Merchant → Store → StoreImage
                         → Menu  
                         → Narration → Language
                         → QrCode
                         → ListenHistory

User → Subscription (user plans: free/monthly/yearly)
User → Transaction → PaymentVnpay
                   → PaymentMomo

Merchant → MerchantSubscription (starter/business/premium)

PlanMetadata (admin-managed: price, maxPOI, maxStore, features JSON)

RefreshToken (token rotation store, max 5/user)
```

> Chi tiết schema: [database.md](./database.md)

### Enum Summary

| Enum | Values |
|------|--------|
| `UserRole` | user, merchant, admin |
| `MerchantStatus` | pending, approved, rejected, blocked |
| `StoreStatus` | pending, active, hidden |
| `SubscriptionPlan` | free, monthly, yearly |
| `MerchantPlan` | starter, business, premium |
| `SubscriptionStatus` | active, expired, cancelled |
| `TransactionType` | user_subscription, merchant_subscription, food_order |
| `PaymentMethod` | momo, cash, vnpay |
| `TransactionStatus` | pending, success, failed, refunded |
| `ListenSource` | gps, qr |

---

## 8. KIẾN TRÚC HỆ THỐNG

```
┌──────────────────────────────────────────────────────────────┐
│                      CLIENT LAYER                            │
│  📱 Mobile App (Expo)          🖥️ Web Dashboard (React)      │
│  GPS │ QR │ TTS expo-speech    Merchant CMS │ Admin Panel    │
│  NativeWind (Tailwind RN)      Tailwind CSS │ Vite           │
└──────────────┬───────────────────────────────┬───────────────┘
               │         HTTPS + JWT Bearer    │
┌──────────────▼───────────────────────────────▼───────────────┐
│                   BACKEND API (NestJS 10)                     │
│  /api/v1/auth      — JWT + Refresh Token Rotation            │
│  /api/v1/stores    — CRUD + findNearby (Haversine)           │
│  /api/v1/narrations — TTS text + Auto-translate + History    │
│  /api/v1/qr        — Generate deeplink QR + Scan             │
│  /api/v1/payments  — VNPAY + MoMo IPN + Post-payment         │
│  /api/v1/admin     — Dashboard stats + Approve flow          │
│  /api/v1/upload    — Multer disk storage (/uploads/)         │
│  Prisma ORM | JwtGuard | RolesGuard | ValidationPipe         │
│  Swagger /api | Helmet | Throttler | HttpExceptionFilter      │
└──────────────────────────┬───────────────────────────────────┘
                           │
        ┌──────────────────▼──────────────────┐
        │   SUPABASE (PostgreSQL 15)          │
        │   14 models | Prisma migrations     │
        └─────────────────────────────────────┘
                           │
        ┌──────────────────▼──────────────────┐
        │   External APIs                     │
        │   MyMemory (auto-translate free)    │
        │   VNPAY Sandbox                     │
        │   MoMo Sandbox                      │
        │   Google Gemini AI (optional)       │
        └─────────────────────────────────────┘
```

---

## 9. RELEASE PLAN

| Phase | Timeline | Deliverables | Status |
|-------|----------|-------------|--------|
| **Phase 1: Core API** | Tuần 1-3 | Auth, Store CRUD, Narration, Haversine GPS | ✅ Done |
| **Phase 2: Web CMS** | Tuần 3-5 | Merchant Dashboard, Admin Dashboard | ✅ Done |
| **Phase 3: Mobile MVP** | Tuần 4-7 | Map, GPS Geofencing, TTS, QR Scanner | ✅ Done |
| **Phase 4: Payment** | Tuần 6-8 | VNPAY + MoMo, Subscription system | ✅ Done |
| **Phase 5: AI/Translate** | Tuần 7-9 | Auto-translate, DB cache, MyMemory integration | ✅ Done |
| **Phase 6: Polish** | Tuần 9-10 | Analytics dashboard, Rankings, Bug fixes | ✅ Done |

---

## 10. RỦI RO VÀ GIẢI PHÁP

| Rủi ro | Xác suất | Giải pháp |
|--------|----------|-----------| 
| GPS không chính xác trong khu vực hẹp | Cao | QR Code fallback, adjust bán kính 50m |
| MyMemory API rate limit | Trung bình | Cache bản dịch vào DB, chỉ dịch 1 lần |
| Merchant không upload narration | Trung bình | Text input → TTS, team hỗ trợ |
| VNPAY/MoMo IPN không gửi về được | Thấp | polling `/transactions/:id/status` từ mobile |
| Pin điện thoại hao do GPS | Cao | `distanceInterval: 10m`, chỉ poll khi di chuyển |

---

## 11. APPENDIX

### A. Glossary

| Thuật ngữ | Giải thích |
|-----------|-----------|
| **POI** (Point of Interest) | Điểm quan tâm = quán ăn đăng ký trên hệ thống |
| **Geofencing** | Vùng ảo (50m) quanh POI, khi user vào → trigger ProximityAlert |
| **TTS** (Text-to-Speech) | expo-speech đọc text bằng ngôn ngữ đã chọn |
| **Narration** | Bản thuyết minh text + audio giới thiệu quán ăn |
| **IPN** (Instant Payment Notification) | Webhook server-to-server từ cổng thanh toán |
| **Token Rotation** | Mỗi lần refresh token → cấp cặp mới, xóa cũ |
| **maxPOI** | Số POI tối đa merchant được tạo theo gói đăng ký |
| **planKey** | Khóa định danh gói trong planMetadata (vd: `merchant_business`) |

### B. Tài liệu liên quan
- [diagrams.md](./diagrams.md) — ERD + 10 Sequence Diagrams + 3 Activity Diagrams
- [database.md](./database.md) — Schema 14 bảng chi tiết
- [api.md](./api.md) — REST API ~40 endpoints
- [workflow.md](./workflow.md) — Luồng hoạt động 3 vai trò

---

*Tài liệu này được duy trì bởi nhóm phát triển dự án Seminar SGU.*  
*Cập nhật lần cuối: 2026-05-10*

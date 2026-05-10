# 🍜 Vĩnh Khánh Digital Audio Guide — Seminar SGU

> Ứng dụng **thuyết minh ẩm thực tự động theo vị trí GPS**, đa ngôn ngữ với AI dịch thuật tự động.  
> Khi khách đến gần quán ăn, GPS Geofencing tự động kích hoạt và phát thuyết minh bằng ngôn ngữ của họ.

---

## 📖 Giới thiệu

| | |
|---|---|
| **Tên dự án** | Vĩnh Khánh Digital Audio Guide |
| **Nhóm** | Seminar SGU |
| **Phiên bản** | v1.0.0 |
| **Kiến trúc** | Monolithic (NestJS + PostgreSQL) |
| **Cập nhật** | 2026-05-10 |

### Vấn đề giải quyết
Khách du lịch nước ngoài thường gặp khó khăn khi tìm hiểu về quán ăn địa phương do rào cản ngôn ngữ. Ứng dụng này tự động:
- 📍 Nhận diện vị trí qua GPS (Geofencing) trong bán kính **50m**
- 🎵 Phát thuyết minh text-to-speech bằng ngôn ngữ của khách
- 🌐 Tự động dịch (MyMemory API) và cache bản dịch vào DB

---

## 🏗️ Kiến trúc hệ thống

```
┌─── Mobile App (React Native + Expo) ───────────────────────────┐
│  GPS Geofencing (50m) → Proximity Alert → Stall Detail         │
│  Map Screen (react-native-maps) → Language Picker → TTS        │
│  QR Scanner (expo-camera) → Stall Narration                    │
└─────────────────────────────────────────────────────────────────┘
                        │ REST API (HTTPS / JWT Bearer)
┌─── Backend API (NestJS 10 + TypeScript) ───────────────────────┐
│  /api/v1/auth         — Register, Login, Refresh, Logout       │
│  /api/v1/stores       — CRUD + findNearby (Haversine)          │
│  /api/v1/narrations   — Audio + Text + Auto-Translate (AI)     │
│  /api/v1/qr           — Generate, Scan, Resolve QR             │
│  /api/v1/payments     — VNPAY + MoMo IPN                       │
│  /api/v1/admin        — Dashboard, Approve, Stats              │
│  /api/v1/merchant     — Profile, Subscription                  │
│  /api/v1/upload       — File upload (image/audio) → /uploads   │
└─────────────────────────────────────────────────────────────────┘
                        │
┌─── PostgreSQL (Supabase hosted) ───┐  ┌─── Local File Storage ─┐
│  15 models, Haversine GPS distance │  │  /uploads/ (image/mp3) │
└────────────────────────────────────┘  └────────────────────────┘

┌─── Web Dashboard (React 18 + Vite + TailwindCSS) ──────────────┐
│  Merchant: POI CRUD, Audio/Menu, QR, Analytics, Subscription   │
│  Admin: Duyệt merchant/store, Users, Transactions, System Stats│
└─────────────────────────────────────────────────────────────────┘
```

---

## 👥 Vai trò người dùng

| Role | Nền tảng | Mô tả |
|------|----------|-------|
| **User** | Mobile App (React Native) | Khách du lịch — nghe thuyết minh, xem bản đồ, mua Premium |
| **Merchant** | Web Dashboard (React) | Chủ quán — tạo POI, upload narration, xem analytics, mua gói |
| **Admin** | Web Dashboard (React) | Quản trị viên — duyệt merchant/store, quản lý hệ thống |

---

## 🛠️ Tech Stack

### Backend
| Thành phần | Công nghệ |
|-----------|-----------|
| Runtime | Node.js 20+ |
| Framework | **NestJS 10** |
| Language | **TypeScript 5** |
| Architecture | Monolith |
| ORM | **Prisma 5** |
| Database | **PostgreSQL 15** (Supabase) |
| Auth | JWT Access Token (15m) + Refresh Token (7d, Rotation) |
| Validation | class-validator + class-transformer |
| File Storage | Local disk (`/uploads/`) |
| Payment | VNPAY (SHA-512) + MoMo OpenAPI v2 (HMAC-SHA256) |
| Translation | MyMemory API (miễn phí, không cần key) |
| AI | Google Gemini API (`@google/generative-ai`) |
| API Docs | Swagger / OpenAPI (`/api`) |
| Security | Helmet, bcryptjs (rounds=12), cookie-parser, Throttler |

### Frontend — Web Dashboard
| Thành phần | Công nghệ |
|-----------|-----------|
| Framework | **React 18** |
| Styling | **Tailwind CSS** |
| Build tool | **Vite** |
| Language | TypeScript |

### Frontend — Mobile App
| Thành phần | Công nghệ |
|-----------|-----------|
| Framework | **React Native** (Expo SDK 54) |
| Routing | **expo-router** (file-based routing) |
| GPS / Location | **expo-location** (watchPositionAsync) |
| Maps | **react-native-maps** |
| TTS / Audio | **expo-speech** (Text-to-Speech) |
| QR Scanner | **expo-camera** (barcode scanning) |
| Styling | **NativeWind** (TailwindCSS cho RN) |
| State | **React Context** (LanguageContext, AuthContext) |

---

## 📁 Cấu trúc thư mục

```
Seminar_sgu/
├── README.md
├── backend/                          # NestJS API Server
│   ├── src/
│   │   ├── main.ts                   # Bootstrap (port 3000, CORS, Swagger)
│   │   ├── app.module.ts             # Root module
│   │   ├── common/
│   │   │   ├── guards/               # JwtAuthGuard, RolesGuard
│   │   │   ├── filters/              # HttpExceptionFilter
│   │   │   ├── interceptors/         # ResponseInterceptor
│   │   │   └── utils/               # haversine.util, file.util
│   │   └── modules/
│   │       ├── auth/                 # Register, Login, Refresh, Logout
│   │       ├── users/                # Profile, PreferredLanguage
│   │       ├── stores/               # Store CRUD + findNearby
│   │       ├── narrations/           # Audio + Auto-Translate + Listen History
│   │       ├── menus/                # Món ăn (CRUD + ảnh)
│   │       ├── qr/                   # Generate / Scan / Resolve QR
│   │       ├── payments/             # VNPAY + MoMo payment + IPN
│   │       ├── subscriptions/        # User subscription (free/monthly/yearly)
│   │       ├── merchant/             # Merchant profile
│   │       ├── merchant-subscriptions/ # Merchant plan (starter/business/premium)
│   │       ├── plan-metadata/        # Cấu hình giá gói dịch vụ
│   │       ├── admin/                # Admin CRUD + Stats + Rankings
│   │       ├── languages/            # Quản lý ngôn ngữ hỗ trợ
│   │       └── upload/               # File upload endpoint
│   └── prisma/
│       └── schema.prisma             # 15 models
│
├── frontend/
│   ├── app/                          # React Native (Expo)
│   │   ├── app/
│   │   │   ├── (auth)/               # Login, Register screens
│   │   │   ├── (tabs)/
│   │   │   │   ├── home/             # Trang chủ, danh sách quán
│   │   │   │   ├── map/              # Bản đồ + GPS + Geofencing
│   │   │   │   ├── guide/            # Hướng dẫn sử dụng
│   │   │   │   ├── explore/          # Khám phá quán
│   │   │   │   └── profile/          # Hồ sơ, gói Premium
│   │   │   ├── stall/[id].tsx        # Chi tiết quán + TTS player
│   │   │   ├── scanner/              # QR Scanner
│   │   │   └── plans/                # Màn hình mua gói Premium
│   │   ├── components/               # ProximityAlert, MapView, ...
│   │   ├── contexts/                 # LanguageContext, AuthContext
│   │   ├── services/                 # OfflineService (cache ảnh)
│   │   └── constants/                # API helpers, config
│   │
│   └── web/                          # React + Vite — Web Dashboard
│       └── src/
│           ├── pages/
│           │   ├── Dashboard.tsx         # Admin dashboard stats
│           │   ├── StoreManagement.tsx   # Admin quản lý stores
│           │   ├── MerchantApproval.tsx  # Admin duyệt merchant
│           │   ├── UserManagement.tsx    # Admin quản lý users
│           │   ├── AudioManagement.tsx   # Merchant upload narration
│           │   ├── MenuManagement.tsx    # Merchant quản lý menu
│           │   ├── POIManagement.tsx     # Merchant tạo/sửa POI
│           │   ├── StoreInfo.tsx         # Merchant thông tin quán
│           │   ├── SubscriptionManagement.tsx # Admin/Merchant gói đăng ký
│           │   ├── Translations.tsx      # Quản lý bản dịch
│           │   ├── Login.tsx / Register.tsx
│           │   └── ...
│           └── contexts/             # AuthContext web
│
└── docs/
    ├── README.md                     ← file này
    ├── PRD.md                        # Product Requirements Document
    ├── diagrams.md                   # Sequence + Activity Diagrams (Mermaid)
    ├── database.md                   # Schema 15 models chi tiết
    ├── api.md                        # REST API documentation
    ├── workflow.md                   # Luồng hoạt động 3 vai trò
    └── migration.sql                 # SQL tạo toàn bộ database
```

---

## ⚡ Tính năng chính

### 📱 Mobile App (User — Khách du lịch)

| Tính năng | Chi tiết |
|-----------|---------|
| 🗺️ **Bản đồ GPS tương tác** | Hiển thị tất cả POI (quán) trên bản đồ react-native-maps, marker có ảnh bìa quán |
| 🔔 **Geofencing auto-detect** | Theo dõi GPS mỗi 10m dịch chuyển, popup ProximityAlert khi vào vùng **50m** quanh quán |
| 🌐 **Chọn ngôn ngữ** | Language Picker từ danh sách ngôn ngữ active trên server (VI, EN, ZH, KO, JA, ...) |
| 🎵 **TTS Player** | Phát thuyết minh bằng `expo-speech` theo ngôn ngữ đã chọn |
| 🔄 **Auto-Translate** | Tự động dịch (MyMemory API) nếu chưa có bản dịch, cache vào DB |
| 📷 **QR Scanner** | Quét QR tại quán → mở chi tiết quán + phát narration theo ngôn ngữ ưa thích |
| 🏪 **Chi tiết quán** | Xem ảnh, menu, giờ mở cửa, bản đồ, danh sách narrations |
| 📊 **Giới hạn theo gói** | Free: 10 lần nghe/ngày; Monthly: 30 lần; Yearly: không giới hạn |
| 💎 **Premium** | Mua gói Monthly/Yearly qua VNPAY / MoMo |
| 👤 **Hồ sơ cá nhân** | Xem gói hiện tại, ngôn ngữ ưa thích, đăng xuất |
| 💾 **Offline Cache** | OfflineService cache ảnh cục bộ giúp app mượt hơn |

### 🖥️ Merchant Dashboard (Chủ quán)

| Tính năng | Chi tiết |
|-----------|---------|
| 📝 **Đăng ký Merchant** | Form đăng ký (tên doanh nghiệp, mã số thuế) → chờ Admin duyệt |
| 🏪 **Quản lý POI** | CRUD quán (tên, địa chỉ, lat/lng, giờ mở cửa, ảnh bìa, gallery) |
| 🎙️ **Upload Narration** | Upload file audio (MP3/WAV) HOẶC nhập text → lưu textContent |
| 🔄 **Auto-Translate** | Nhập text VI → hệ thống tự dịch sang toàn bộ ngôn ngữ active |
| 📋 **Quản lý Menu** | CRUD món ăn (tên, giá VNĐ, ảnh, trạng thái còn bán) |
| 📱 **QR Code** | Generate QR code (deeplink `smarttour://stall/{id}`), tải về in |
| 💳 **Gói đăng ký Merchant** | Starter / Business / Premium (max POI theo plan_metadata) |
| 📊 **Analytics** | Xem lượt nghe, thống kê theo ngày |

### 🖥️ Admin Dashboard (Quản trị viên)

| Tính năng | Chi tiết |
|-----------|---------|
| ✅ **Duyệt Merchant** | Approve (kích hoạt gói Starter tự động) / Reject (kèm lý do) |
| ✅ **Duyệt Store** | Approve/Hide store → chỉ store `active` mới hiện trên app |
| 👥 **Quản lý Users** | Xem danh sách, toggle active/inactive tài khoản |
| 👨‍💼 **Quản lý Merchants** | Xem danh sách, tạo user mới có role merchant |
| 💰 **Quản lý Transactions** | Xem lịch sử giao dịch VNPAY/MoMo, trạng thái |
| 📈 **System Analytics** | Dashboard: tổng users, stores, merchants pending, doanh thu 12 tháng, Top POI/Merchant/Client |
| 🌐 **Quản lý Ngôn ngữ** | Thêm/ẩn/hiện ngôn ngữ hỗ trợ |
| 🎙️ **Quản lý Narrations** | Xem, tìm kiếm, xóa nội dung thuyết minh |
| 💎 **Quản lý Subscriptions** | Xem gói user/merchant, cập nhật gói |

---

## 💳 Tích hợp thanh toán

### VNPAY (SHA-512)
- **Phương thức:** Redirect URL → `paymentUrl`
- **Xác thực:** `vnp_SecureHash` (HMAC-SHA512)
- **Callback:** `GET /api/v1/payments/vnpay/return` — verify hash → cập nhật transaction → kích hoạt gói
- **Sandbox:** `https://sandbox.vnpayment.vn/`

### MoMo OpenAPI v2 (HMAC-SHA256)
- **Phương thức:** `captureWallet` → `payUrl` + `deeplink` + `qrCodeUrl`
- **Xác thực:** HMAC-SHA256 `signature`
- **IPN:** `POST /api/v1/payments/momo/ipn` — verify sig → cập nhật transaction → kích hoạt gói
- **Sandbox:** `https://test-payment.momo.vn/`

---

## 🔐 Bảo mật

| Cơ chế | Chi tiết |
|--------|---------|
| **Password** | Bcrypt hash (rounds = 12) |
| **JWT** | Access Token 15 phút, Refresh Token 7 ngày |
| **Token Rotation** | Mỗi lần refresh cấp cặp token mới, token cũ bị xóa khỏi DB |
| **Multi-device** | Tối đa 5 refresh token đồng thời / user |
| **Blacklist detect** | Nếu token đã dùng → revoke toàn bộ session của user |
| **Role Guard** | 3 role: `user`, `merchant`, `admin` |
| **Merchant isolation** | Merchant chỉ CRUD data của chính mình, admin bypass |
| **File filter** | Upload chỉ chấp nhận jpg/png/webp/mp3/wav, max 5MB |

---

## 🚀 Khởi chạy dự án

### Yêu cầu
- Node.js >= 20
- PostgreSQL >= 15 (hoặc Supabase)
- npm

### Backend (NestJS)

```bash
cd backend
npm install

# Copy và điền biến môi trường
cp .env.example .env

# Tạo database với Prisma
npx prisma migrate dev

# Seed dữ liệu mặc định (ngôn ngữ, plan metadata)
npm run db:seed

# Chạy server dev (port 3000)
npm run start:dev
# → http://localhost:3000
# → Swagger docs: http://localhost:3000/api
```

### Web Dashboard

```bash
cd frontend/web
npm install
npm run dev
# → http://localhost:5173
```

### Mobile App

```bash
cd frontend/app
npm install
npx expo start
# → Scan QR bằng Expo Go hoặc chạy emulator
```

---

## 🌍 Biến môi trường (backend/.env)

```env
# Server
PORT=3000
NODE_ENV=development

# Database (PostgreSQL / Supabase)
DATABASE_URL=postgresql://user:password@host:5432/dbname?sslmode=require

# JWT
JWT_SECRET=your_super_secret_key
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your_refresh_secret
JWT_REFRESH_EXPIRES_IN=7d

# VNPAY (Sandbox)
VNPAY_TMN_CODE=your_tmn_code
VNPAY_HASH_SECRET=your_hash_secret
VNPAY_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNPAY_RETURN_URL=http://localhost:3000/api/v1/payments/vnpay/return

# MoMo (Sandbox)
MOMO_PARTNER_CODE=MOMO
MOMO_ACCESS_KEY=your_access_key
MOMO_SECRET_KEY=your_secret_key
MOMO_ENDPOINT=https://test-payment.momo.vn/v2/gateway/api/create
MOMO_IPN_URL=http://localhost:3000/api/v1/payments/momo/ipn
MOMO_REDIRECT_URL=http://localhost:5173/payment/result

# Google Gemini (AI)
GEMINI_API_KEY=your_gemini_api_key
```

---

## 🗄️ Database — 15 Models

| Model | Mô tả |
|-------|-------|
| `User` | Tài khoản (role: user/merchant/admin), online status |
| `Merchant` | Thông tin doanh nghiệp, trạng thái duyệt |
| `Store` | POI (lat/lng, giờ mở cửa, status: pending/active/hidden) |
| `StoreImage` | Gallery ảnh quán (nhiều ảnh, sort order) |
| `Menu` | Món ăn (giá VNĐ, ảnh, isAvailable) |
| `Narration` | Thuyết minh (audioUrl + textContent + languageId, unique store+lang) |
| `Language` | Ngôn ngữ hỗ trợ (code, flagIcon, isActive) |
| `ListenHistory` | Lịch sử nghe (source: gps\|qr) |
| `QrCode` | QR codes (deeplink, isActive — chỉ 1 active / store) |
| `Subscription` | Gói user (free/monthly/yearly) |
| `MerchantSubscription` | Gói merchant (starter/business/premium, maxPOI) |
| `PlanMetadata` | Bảng cấu hình giá gói (admin quản lý, features JSON) |
| `Transaction` | Giao dịch (type: user_subscription/merchant_subscription/food_order) |
| `PaymentVnpay` | Chi tiết thanh toán VNPAY (raw response) |
| `PaymentMomo` | Chi tiết thanh toán MoMo (raw response) |
| `RefreshToken` | Token rotation store (max 5/user) |

---

## 📚 Tài liệu dự án (`docs/`)

| File | Mô tả |
|------|-------|
| [docs/PRD.md](./PRD.md) | 📋 Product Requirements Document — scope, KPIs, release plan |
| [docs/diagrams.md](./diagrams.md) | 📐 Sequence Diagrams + ERD (Mermaid.js) |
| [docs/database.md](./database.md) | 🗄️ Schema 15 models PostgreSQL — đầy đủ constraint |
| [docs/api.md](./api.md) | 🔌 REST API documentation |
| [docs/workflow.md](./workflow.md) | 🔄 Luồng hoạt động 3 vai trò |
| [docs/migration.sql](./migration.sql) | 🛠️ SQL tạo toàn bộ database |

---

## 👨‍💻 Nhóm phát triển

| Thành viên | Vai trò |
|-----------|---------|
| Vinh | Backend / Database / Deployment |
| Khánh | Frontend / Mobile / UI/UX |

---

*Dự án Seminar SGU — Vĩnh Khánh Digital Audio Guide*  
*Cập nhật lần cuối: 2026-05-10*

# 🍜 Restaurant Audio Guide — Seminar SGU

> Ứng dụng **thuyết minh ẩm thực đa ngôn ngữ** dành cho khách du lịch. Khi khách đến gần quán ăn, GPS tự động kích hoạt và phát audio thuyết minh về quán bằng ngôn ngữ của họ.

---

## 📖 Giới thiệu

| | |
|---|---|
| **Tên dự án** | Restaurant Audio Guide |
| **Nhóm** | Seminar SGU |
| **Phiên bản** | v1.0.0 |
| **Cập nhật** | 2026-03-16 |

### Vấn đề giải quyết
Khách du lịch nước ngoài thường gặp khó khăn khi tìm hiểu về quán ăn địa phương do rào cản ngôn ngữ. Ứng dụng này tự động phát thuyết minh bằng tiếng mẹ đẻ của khách khi họ đến gần quán.

---

## 🏗️ Kiến trúc hệ thống

```
┌─── Mobile App (React Native) ──────────────────────────────────┐
│  Khách du lịch: GPS detect → Narration audio → QR scanner      │
└─────────────────────────────────────────────────────────────────┘
                        │ REST API (HTTPS/JWT)
┌─── Backend API (Node.js / NestJS) ─────────────────────────────┐
│  Auth │ Store │ Narration │ Payment (VNPAY, MoMo) │ Analytics  │
└─────────────────────────────────────────────────────────────────┘
                        │
┌─── PostgreSQL + PostGIS ───────────┐  ┌─── Cloud Storage ──────┐
│  14 bảng, spatial index GPS        │  │  Audio files, Images   │
└────────────────────────────────────┘  └───────────────────────-┘

┌─── Web Dashboard (React) ──────────────────────────────────────┐
│  Merchant: quản lý quán, menu, narration, analytics            │
│  Admin: duyệt merchant/store, quản lý hệ thống                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 👥 Vai trò người dùng

| Role | Nền tảng | Mô tả |
|------|----------|-------|
| **User** | Mobile App | Khách du lịch — nghe thuyết minh, mua Premium |
| **Merchant** | Web Dashboard | Chủ quán — tạo quán, upload narration, xem analytics |
| **Admin** | Web Dashboard | Quản trị viên — duyệt merchant/store, quản lý hệ thống |

---

## 🛠️ Tech Stack

### Backend
| Thành phần | Công nghệ |
|-----------|-----------|
| Runtime | Node.js 20+ |
| Framework | NestJS (hoặc Express) |
| Database | PostgreSQL 15 + PostGIS |
| ORM | TypeORM / Prisma |
| Auth | JWT (Access + Refresh Token) |
| File Storage | AWS S3 / Cloudinary |
| Payment | VNPAY SDK, MoMo OpenAPI v2 |
| Cache | Redis (optional) |
| API Docs | Swagger / OpenAPI |

### Frontend — Mobile App
| Thành phần | Công nghệ |
|-----------|-----------|
| Framework | React Native (Expo) |
| Maps | react-native-maps |
| GPS | expo-location |
| QR Scanner | expo-barcode-scanner |
| Audio | expo-av |
| State | Redux Toolkit / Zustand |

### Frontend — Web Dashboard
| Thành phần | Công nghệ |
|-----------|-----------|
| Framework | React 18 |
| Build tool | Vite |
| UI Library | Ant Design / MUI |
| Charts | Recharts / Chart.js |
| Maps | Leaflet.js |
| State | Redux Toolkit |

---

## 📁 Cấu trúc thư mục

```
Seminar_sgu/
├── backend/                    # Node.js API server
│   ├── src/
│   │   ├── auth/               # Authentication module
│   │   ├── users/              # User management
│   │   ├── stores/             # Store CRUD + PostGIS
│   │   ├── narrations/         # Audio narration
│   │   ├── menus/              # Menu items
│   │   ├── payments/           # VNPAY + MoMo integration
│   │   ├── merchant/           # Merchant dashboard APIs
│   │   ├── admin/              # Admin APIs
│   │   └── common/             # Middleware, guards, utils
│   ├── prisma/                 # Database migrations
│   │   └── migrations/
│   └── .env.example
│
├── mobile/                     # React Native app
│   ├── src/
│   │   ├── screens/
│   │   ├── components/
│   │   ├── navigation/
│   │   ├── services/           # API calls
│   │   └── store/              # Redux store
│   └── app.json
│
├── dashboard/                  # React web dashboard
│   ├── src/
│   │   ├── pages/
│   │   │   ├── merchant/
│   │   │   └── admin/
│   │   ├── components/
│   │   └── services/
│   └── vite.config.ts
│
└── docs/                       # 📚 Tài liệu dự án
    ├── README.md               ← file này
    ├── workflow.md             # Luồng hoạt động
    ├── database.md             # Schema chi tiết
    ├── database_analysis.md   # ERD + phân tích
    ├── api.md                  # API documentation
    └── migration.sql           # SQL tạo database
```

---

## ⚡ Tính năng chính

### 📱 Mobile App (User)
- 🗺️ **Bản đồ GPS** — hiển thị quán gần đó trong bán kính 500m
- 🔔 **Auto-detect** — popup khi user đến gần quán (< 20m)
- 🎵 **Audio player** — phát thuyết minh với seek bar
- 🌐 **Đa ngôn ngữ** — VI, EN, KO, JA, ZH + fallback tự động
- 📷 **QR Scanner** — dự phòng khi GPS không chính xác
- ⭐ **Yêu thích** — bookmark các quán hay
- 💎 **Premium** — thanh toán VNPAY / MoMo

### 🖥️ Merchant Dashboard
- 📊 **Analytics** — lượt nghe, top món, top ngôn ngữ
- 🏪 **Quản lý quán** — tạo/sửa quán với bản đồ chọn vị trí
- 🎙️ **Upload narration** — hỗ trợ upload audio hoặc TTS từ text
- 📋 **Quản lý menu** — thêm/sửa/xóa món ăn có ảnh
- 📱 **QR Code** — tạo và tải về QR để in dán tại quán

### 🖥️ Admin Dashboard
- ✅ **Duyệt merchant & store** — approve/reject với lý do
- 👥 **Quản lý users** — kích hoạt/vô hiệu hóa tài khoản
- 💰 **Quản lý giao dịch** — xem chi tiết VNPAY/MoMo
- 📈 **Analytics toàn hệ thống** — tổng quan tăng trưởng

---

## 💳 Tích hợp thanh toán

### VNPAY
- **Phương thức:** Redirect (webview trong app)
- **Xác thực:** `vnp_SecureHash` (SHA-512 HMAC)
- **IPN:** Server-to-server callback để confirm giao dịch
- **Sandbox:** `https://sandbox.vnpayment.vn/`
- **Docs:** [https://sandbox.vnpayment.vn/apis/](https://sandbox.vnpayment.vn/apis/)

### MoMo
- **Phương thức:** Deeplink app / webview
- **Xác thực:** HMAC-SHA256 `signature`
- **IPN:** Server-to-server callback
- **Sandbox:** `https://test-payment.momo.vn/`
- **Docs:** [https://developers.momo.vn/](https://developers.momo.vn/)

---

## 🚀 Khởi chạy dự án

### Yêu cầu
- Node.js >= 20
- PostgreSQL >= 15 (với extension PostGIS)
- npm hoặc yarn

### Backend

```bash
# 1. Cài dependencies
cd backend
npm install

# 2. Copy file môi trường
cp .env.example .env
# Điền các biến: DATABASE_URL, JWT_SECRET, VNPAY_*, MOMO_*

# 3. Chạy migration (tạo database)
npm run migration:run
# HOẶC chạy file SQL thủ công:
# psql -U postgres -d your_db -f docs/migration.sql

# 4. Chạy server dev
npm run start:dev
```

### Web Dashboard

```bash
cd dashboard
npm install
npm run dev
# → http://localhost:5173
```

### Mobile App

```bash
cd mobile
npm install
npx expo start
```

---

## 🌍 Biến môi trường (.env)

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/audio_guide

# JWT
JWT_SECRET=your_super_secret_key
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# VNPAY
VNPAY_TMN_CODE=your_tmn_code
VNPAY_HASH_SECRET=your_hash_secret
VNPAY_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNPAY_RETURN_URL=https://yourdomain.com/payment/vnpay/return

# MoMo
MOMO_PARTNER_CODE=your_partner_code
MOMO_ACCESS_KEY=your_access_key
MOMO_SECRET_KEY=your_secret_key
MOMO_ENDPOINT=https://test-payment.momo.vn/v2/gateway/api/create
MOMO_IPN_URL=https://api.yourdomain.com/v1/payments/momo/ipn

# File Storage
AWS_S3_BUCKET=your_bucket
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=ap-southeast-1
```

---

## 📚 Tài liệu

| File | Nội dung |
|------|----------|
| [workflow.md](./workflow.md) | Luồng hoạt động chi tiết 3 vai trò |
| [database.md](./database.md) | Schema 14 bảng PostgreSQL |
| [database_analysis.md](./database_analysis.md) | ERD + phân tích VNPAY/MoMo + UI checklist |
| [api.md](./api.md) | Tài liệu REST API đầy đủ |
| [migration.sql](./migration.sql) | SQL tạo toàn bộ database |

---

## 👨‍💻 Nhóm phát triển

| Thành viên | Vai trò |
|-----------|---------|
| Vinh | Backend / Database |
| Khánh | Frontend / Mobile |

---

*Tài liệu này được duy trì bởi nhóm phát triển dự án Seminar SGU.*
*Cập nhật lần cuối: 2026-03-16*

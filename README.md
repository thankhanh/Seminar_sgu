# 🍜 Vĩnh Khánh Digital Audio Guide — Seminar SGU

> Hệ thống thuyết minh ẩm thực **tự động theo vị trí GPS**, đa ngôn ngữ. Khi khách đến gần quán ăn, hệ thống tự nhận diện vị trí qua **Geofencing** và phát audio thuyết minh bằng ngôn ngữ của họ.

---

## 📖 Giới thiệu

| | |
|---|---|
| **Tên dự án** | Vĩnh Khánh Digital Audio Guide |
| **Nhóm** | Seminar SGU |
| **Phiên bản** | v1.0.0 |
| **Kiến trúc** | Monolithic |
| **Team size** | 4 developers |
| **Cập nhật** | 2026-03-16 |

### Vấn đề giải quyết
Khách du lịch nước ngoài gặp rào cản ngôn ngữ khi tìm hiểu về quán ăn địa phương. Hệ thống này tự động:
- 📍 Nhận diện vị trí qua GPS (Geofencing / POI)  
- 🏪 Hiển thị thông tin quán ăn gần đó  
- 🎵 Phát audio thuyết minh bằng ngôn ngữ của khách

---

## 🏗️ Kiến trúc hệ thống

```
┌─── Mobile App (React Native) ──────────────────────────────────┐
│  GPS Geofencing → POI detect → Narration audio → QR scanner    │
└─────────────────────────────────────────────────────────────────┘
                        │ REST API (HTTPS / JWT)
┌─── Backend API (NestJS + TypeScript) ──────────────────────────┐
│  Auth │ Stores │ Narration │ Payment (VNPAY, MoMo) │ Analytics │
└─────────────────────────────────────────────────────────────────┘
                        │
┌─── PostgreSQL + PostGIS ───────────┐  ┌─── Cloud Storage ──────┐
│  14 bảng, spatial index GPS        │  │  Audio files, Images   │
└────────────────────────────────────┘  └────────────────────────┘

┌─── Web Dashboard (React + Tailwind CSS) ───────────────────────┐
│  Merchant: quản lý quán, menu, narration, analytics            │
│  Admin: duyệt merchant/store, quản lý hệ thống                 │
└─────────────────────────────────────────────────────────────────┘
```

**Lý do chọn Monolith:** Team nhỏ, phát triển nhanh, dễ maintain, AI assistant hiểu context tốt hơn.

---

## 👥 Vai trò người dùng

| Role | Nền tảng | Mô tả |
|------|----------|-------|
| **User** | Mobile App (React Native) | Khách du lịch — nghe thuyết minh, mua Premium |
| **Merchant** | Web Dashboard (React) | Chủ quán — tạo quán, upload narration, analytics |
| **Admin** | Web Dashboard (React) | Quản trị viên — duyệt merchant/store, quản lý hệ thống |

---

## 🛠️ Tech Stack

### Backend
| Thành phần | Công nghệ |
|-----------|-----------|
| Runtime | Node.js 20+ |
| Framework | **NestJS** |
| Language | **TypeScript** |
| Architecture | Monolith |
| ORM | **Prisma** |
| Database | **PostgreSQL 15 + PostGIS** |
| Auth | JWT (Access + Refresh Token) |
| Validation | class-validator + class-transformer |
| File Storage | AWS S3 / Cloudinary |
| Payment | VNPAY SDK + MoMo OpenAPI v2 |
| API Docs | Swagger / OpenAPI |

### Frontend — Web Dashboard
| Thành phần | Công nghệ |
|-----------|-----------|
| Framework | **React 18** |
| Styling | **Tailwind CSS** |
| Build tool | Vite |
| Charts | Recharts |
| Maps | **Google Maps / Leaflet.js** |
| State | Zustand |

### Frontend — Mobile App
| Thành phần | Công nghệ |
|-----------|-----------|
| Framework | **React Native** (Expo) |
| GPS / Geofencing | expo-location |
| Maps | react-native-maps |
| QR Scanner | expo-barcode-scanner |
| Audio | expo-av |
| State | Zustand |

---

## 📁 Cấu trúc thư mục

```
Seminar_sgu/                          ← Root project
├── README.md                         ← file này
│
├── backend/                          # NestJS + TypeScript — API Server
│   ├── src/
│   │   ├── app.module.ts             # Root module
│   │   ├── main.ts                   # Entry point (bootstrap)
│   │   ├── config/                   # Cấu hình env, DB, JWT
│   │   └── modules/
│   │       ├── auth/                 # Đăng ký, đăng nhập, JWT
│   │       ├── users/                # Quản lý user
│   │       ├── stores/               # Store CRUD + PostGIS GPS
│   │       ├── narrations/           # Audio thuyết minh
│   │       ├── menus/                # Món ăn
│   │       ├── payments/             # VNPAY + MoMo
│   │       ├── merchant/             # API cho Merchant dashboard
│   │       ├── admin/                # API cho Admin dashboard
│   │       ├── languages/            # Ngôn ngữ hỗ trợ
│   │       └── qr/                   # QR Code
│   ├── prisma/
│   │   └── schema.prisma             # Prisma schema (14 models)
│   ├── .env.example
│   ├── .gitignore
│   ├── nest-cli.json
│   ├── tsconfig.json
│   └── package.json
│
├── frontend/
│   ├── app/                          # React Native (Expo) — Mobile App
│   │   ├── app/                      # Expo Router screens
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── constants/
│   │   ├── assets/
│   │   └── package.json
│   │
│   └── web/                          # React + Tailwind — Web Dashboard
│       ├── src/
│       │   ├── pages/
│       │   │   ├── merchant/
│       │   │   └── admin/
│       │   ├── components/
│       │   └── services/             # API calls
│       ├── tailwind.config.js
│       └── vite.config.ts
│
└── docs/                             # 📚 Tài liệu dự án
    ├── PRD.md                        # Tài liệu yêu cầu sản phẩm (Master Doc)
    ├── workflow.md                   # Luồng hoạt động chi tiết 3 vai trò
    ├── database.md                   # Lược đồ 14 bảng PostgreSQL
    ├── diagrams.md                   # Sơ đồ ERD, Sequence và Activity
    ├── api.md                        # Tài liệu hướng dẫn REST API
    ├── migration.sql                 # SQL thiết lập cơ sở dữ liệu
    └── bao_cao_du_an.md              # Báo cáo tổng kết dự án
```

---

## ⚡ Tính năng chính

### 📱 Mobile App (User — Khách du lịch)
- 🗺️ **Bản đồ GPS** — hiển thị POI (quán) gần đó trong bán kính 500m
- 🔔 **Geofencing auto-detect** — popup khi vào vùng < 20m quanh quán
- 🎵 **Audio player** — phát narration với seek bar, điều chỉnh tốc độ
- 🌐 **Đa ngôn ngữ** — VI, EN, KO, JA, ZH + fallback tự động
- 📷 **QR Scanner** — dự phòng khi GPS không chính xác
- ⭐ **Yêu thích** — bookmark quán hay
- 💎 **Premium** — thanh toán VNPAY / MoMo

### 🖥️ Merchant Dashboard (Chủ quán)
- 📊 **Analytics** — lượt nghe, top món, top ngôn ngữ, biểu đồ theo ngày
- 🏪 **Quản lý quán** — tạo/sửa với bản đồ chọn vị trí GPS
- 🎙️ **Upload narration** — upload audio hoặc nhập text dùng TTS
- 📋 **Quản lý menu** — thêm/sửa/xóa món ăn có ảnh
- 📱 **QR Code** — tạo và tải QR về in dán tại quán
- 💳 **Gói đăng ký** — thanh toán VNPAY / MoMo

### 🖥️ Admin Dashboard (Quản trị viên)
- ✅ **Duyệt merchant & store** — approve/reject với lý do
- 👥 **Quản lý users** — kích hoạt / vô hiệu hóa tài khoản
- 💰 **Quản lý giao dịch** — xem chi tiết VNPAY/MoMo callback
- 📈 **Analytics toàn hệ thống** — users, stores, listens, doanh thu
- 🌐 **Quản lý ngôn ngữ** — thêm/ẩn ngôn ngữ hỗ trợ

---

## 💳 Tích hợp thanh toán

### VNPAY
- **Phương thức:** Redirect (webview trong app)
- **Xác thực:** `vnp_SecureHash` (SHA-512 HMAC)
- **IPN:** Server-to-server callback để confirm giao dịch
- **Sandbox:** `https://sandbox.vnpayment.vn/`

### MoMo
- **Phương thức:** Deeplink app / webview
- **Xác thực:** HMAC-SHA256 `signature`
- **IPN:** Server-to-server callback
- **Sandbox:** `https://test-payment.momo.vn/`

---

## 🚀 Khởi chạy dự án

### Yêu cầu
- Node.js >= 20
- PostgreSQL >= 15 (với extension PostGIS)
- npm hoặc yarn

### Backend (NestJS)

```bash
cd backend
npm install

# Copy và điền biến môi trường
cp .env.example .env

# Tạo database với Prisma
npx prisma migrate dev

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
```

---

## 🌍 Biến môi trường (backend/.env)

```env
# Server
PORT=3000
NODE_ENV=development

# Database (PostgreSQL + PostGIS)
DATABASE_URL=postgresql://user:password@localhost:5432/vinh_khanh_audio_guide

# JWT
JWT_SECRET=your_super_secret_key
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your_refresh_secret
JWT_REFRESH_EXPIRES_IN=7d

# VNPAY (Sandbox)
VNPAY_TMN_CODE=your_tmn_code
VNPAY_HASH_SECRET=your_hash_secret
VNPAY_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNPAY_RETURN_URL=https://yourdomain.com/payment/vnpay/return

# MoMo (Sandbox)
MOMO_PARTNER_CODE=your_partner_code
MOMO_ACCESS_KEY=your_access_key
MOMO_SECRET_KEY=your_secret_key
MOMO_ENDPOINT=https://test-payment.momo.vn/v2/gateway/api/create
MOMO_IPN_URL=https://api.yourdomain.com/v1/payments/momo/ipn

# File Storage (AWS S3 / Cloudinary)
AWS_S3_BUCKET=your_bucket
AWS_ACCESS_KEY_ID=your_key_id
AWS_SECRET_ACCESS_KEY=your_secret
AWS_REGION=ap-southeast-1
```

---

## 📚 Tài liệu dự án (`docs/`)

| File | Mô tả |
|------|-------|
| [docs/PRD.md](./docs/PRD.md) | 📋 Product Requirements Document — Mục tiêu, phạm vi & Release plan |
| [docs/workflow.md](./docs/workflow.md) | 🔄 Luồng hoạt động chi tiết 3 vai trò (User / Merchant / Admin) |
| [docs/database.md](./docs/database.md) | 🗄️ Schema 14 bảng PostgreSQL — đầy đủ constraint, chú thích |
| [docs/diagrams.md](./docs/diagrams.md) | 📐 Sơ đồ ERD, Sequence Diagrams + Activity Diagrams (Mermaid.js) |
| [docs/api.md](./docs/api.md) | 🔌 REST API documentation — ~40 endpoints đầy đủ |
| [docs/migration.sql](./docs/migration.sql) | 🛠️ SQL tạo toàn bộ database (14 bảng, indexes, functions GPS) |
| [docs/bao_cao_du_an.md](./docs/bao_cao_du_an.md) | 📄 Báo cáo tổng kết dự án Seminar SGU |

---

## 👨‍💻 Nhóm phát triển

| Thành viên | Vai trò |
|-----------|---------|
| Vinh | Backend / Database |
| Khánh | Frontend / Mobile |

---

*Dự án Seminar SGU — Vĩnh Khánh Digital Audio Guide*
*Cập nhật lần cuối: 2026-03-16*

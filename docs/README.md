# 🍜 Restaurant Audio Guide — Seminar SGU

> Ứng dụng **thuyết minh ẩm thực đa ngôn ngữ** dành cho khách du lịch. Khi khách đến gần quán ăn, GPS tự động kích hoạt và phát audio thuyết minh về quán bằng ngôn ngữ của họ.

---

## 📖 Giới thiệu

| | |
|---|---|
| **Tên dự án** | Restaurant Audio Guide |
| **Nhóm** | Seminar SGU |
| **Phiên bản** | v1.1.0 |
| **Cập nhật** | 2026-04-17 |

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
├── backend/                    # Node.js API server (NestJS)
│   ├── src/                    # Source code API (Auth, Stores, Narrations...)
│   ├── prisma/                 # Database migrations & schema
│   └── .env.example
│
├── frontend/
│   ├── app/                    # React Native app (Mobile App)
│   │   ├── app/                # Expo Router screens
│   │   ├── components/         # Reusable UI components
│   │   ├── services/           # APIs, Offline Caching (OfflineService.ts)
│   │   └── constants/          # Consts & Config
│   │
│   └── web/                    # React Web Dashboard (Vite)
│       ├── src/
│       │   ├── pages/          # Admin & Merchant screens
│       │   ├── components/
│       │   └── contexts/
│       └── vite.config.ts
│
└── docs/                       # 📚 Tài liệu dự án
    ├── README.md               ← file này
    ├── PRD.md                  # Yêu cầu sản phẩm (Product Requirements)
    ├── workflow.md             # Luồng hoạt động
    ├── database.md             # Schema chi tiết
    ├── database_analysis.md    # ERD + phân tích dự án
    ├── api.md                  # API documentation
    └── migration.sql           # SQL tạo database
```

---

## ⚡ Tính năng chính

### 📱 Mobile App (User)
- 🗺️ **Bản đồ GPS** — hiển thị quán gần đó với logic khoanh vùng
- 🔔 **Cảnh báo Tiệm cận (Geofencing)** — Modal tự động phát audio khi cách < 50m
- 💾 **Offline Caching** — thuật toán quét Local FS tải dự phòng Media giúp app mượt mà
- 🎵 **Media Player** — fallback auto TTS khi file âm thanh thiếu
- 🌐 **Đa ngôn ngữ & Dịch AI** — Tự động gọi API dịch thông minh khi khác ngôn ngữ đích
- 📷 **QR Scanner** — dự phòng khi định vị GPS sai sót
- ⭐ **Hồ Sơ Cá Nhân** — Cập nhật thông tin profile dễ dàng
- 💎 **Premium** — thanh toán bằng VNPAY / MoMo (sandbox)

### 🖥️ Merchant Dashboard
- 📊 **Analytics** — lượt nghe, top quán, top đánh giá
- 🏪 **Quản lý quán** — tạo/sửa thông tin quán chi tiết, tích hợp UI File Uploads xịn xò
- 🎙️ **Upload narration** — upload audio và văn bản đa chiều
- 📋 **Quản lý menu & store img** — thêm/sửa/xóa album quán + menu với quản lý lưu trữ rác tự động
- 📱 **QR Code** — tạo mã check-in in ấn

### 🖥️ Admin Dashboard
- ✅ **Duyệt merchant & store** — approve/reject gian thương vào hệ thống
- 👥 **Quản lý users** — chỉnh sửa trạng thái thành viên (Active/Inactive)
- 💰 **Quản lý giao dịch** — xem lịch sử VNPAY/MoMo
- 📈 **Bảng xếp hạng hệ thống** — Top POI, Merchant, Khách hàng nổi bật nhất tháng hiển thị Dashboard

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
| [mobile_business_logic.md](./mobile_business_logic.md) | **Nghiệp vụ Mobile chi tiết (GPS, Caching, AI)** |
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
*Cập nhật lần cuối: 2026-04-17*

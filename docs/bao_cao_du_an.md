# BÁO CÁO DỰ ÁN ĐỒ ÁN SEMINAR
# VĨNH KHÁNH DIGITAL AUDIO GUIDE PLATFORM

**Trường:** Đại học Sài Gòn (SGU)  
**Ngày cập nhật:** 24/03/2026  
**Team size:** 4 developer  
**Kiến trúc:** Client-Server (NestJS + PostgreSQL/PostGIS + React Native + React/Vite)

---

## 1. TỔNG QUAN DỰ ÁN

### 1.1 Mục tiêu
Xây dựng hệ thống thuyết minh tự động theo vị trí GPS dành cho **khu ẩm thực Vĩnh Khánh**. Khi khách hàng đến gần một quán ăn, hệ thống sẽ:

1. Nhận diện vị trí GPS của khách
2. Tìm quán ăn gần nhất trong bán kính geofence (PostGIS)
3. Tự động phát audio giới thiệu đa ngôn ngữ (Tiếng Việt, Anh, Trung, Hàn, Nhật, Pháp)

### 1.2 Ý tưởng cốt lõi

| Khái niệm | Mô tả |
|---|---|
| **POI** (Point Of Interest) | Tọa độ GPS của cửa hàng, lưu bằng PostGIS GEOGRAPHY(POINT, 4326) |
| **Geofencing** | Phát hiện người dùng vào vùng POI bằng `ST_DWithin` |
| **Audio narration** | Thuyết minh tự động đa ngôn ngữ, file MP3 lưu Supabase Storage |

> **Thiết kế quan trọng:** POI = Store (không tách module riêng). Mỗi Store đã chứa tọa độ GPS `GEOGRAPHY(POINT, 4326)`. Khi 2 store chồng vùng geofence, backend luôn ưu tiên store **gần nhất** (`ORDER BY distance ASC LIMIT 1`).

---

## 2. TECH STACK

### Backend
| Thành phần | Công nghệ | Trạng thái |
|---|---|---|
| Framework | **NestJS + TypeScript** | ✅ Đã triển khai |
| ORM | **Prisma** | ✅ Đã triển khai |
| Database | **PostgreSQL (Supabase)** | ✅ Đã kết nối |
| PostGIS Extension | **GEOGRAPHY(POINT, 4326)** | ✅ Đã có trong migration.sql |
| Auth | **JWT + Refresh Token + Session** | ✅ Đã triển khai |
| API Docs | **Swagger UI** | ✅ Đã triển khai |

### Frontend Web (CMS - Quản lý cho Merchant & Admin)
| Thành phần | Công nghệ | Trạng thái |
|---|---|---|
| Framework | **React + TypeScript** | ✅ Đã triển khai |
| Styling | **Tailwind CSS v4** | ✅ Đã triển khai |
| Build tool | **Vite** | ✅ Đang chạy port 5173 |
| Map tích hợp | **Leaflet / Google Maps** | ⏳ Chưa tích hợp |

### Mobile App
| Thành phần | Công nghệ | Trạng thái |
|---|---|---|
| Framework | **React Native (Expo)** | ✅ Đã hoàn thiện |
| GPS tracking | `expo-location` | ✅ Đã triển khai |
| QR scanner | `expo-barcode-scanner` | ✅ Đã triển khai |
| Audio player | `expo-av` | ✅ Đã triển khai |

---

## 3. KIẾN TRÚC HỆ THỐNG

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT LAYER                         │
│  [Frontend Web CMS]    [Mobile App - React Native]      │
│  React + Tailwind      GPS / QR / Audio Player          │
└────────────────────────┬────────────────────────────────┘
                         │ HTTPS REST API
┌────────────────────────▼────────────────────────────────┐
│                   BACKEND (NestJS)                      │
│  Auth | Stores | Narrations | QR | Payments | Admin     │
│  JWT + Session | Prisma ORM | Swagger UI                │
└────────────────────────┬────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────┐
│              SUPABASE (PostgreSQL + PostGIS)             │
│  GEOGRAPHY index (GIST) | find_nearby_stores() function │
│  Supabase Storage (Audio MP3 files)                     │
└─────────────────────────────────────────────────────────┘
```

---

## 4. CẤU TRÚC DATABASE (PostgreSQL + PostGIS)

### 4.1 Bảng chính

| Bảng | Mô tả | Ghi chú quan trọng |
|---|---|---|
| `users` | Tài khoản: user / merchant / admin | Role-based |
| `merchants` | Thông tin doanh nghiệp chủ quán | 1 user → 1 merchant |
| `stores` | **Quán ăn + tọa độ GPS (PostGIS)** | **`location GEOGRAPHY(POINT,4326)`** |
| `store_images` | Bộ ảnh của quán | Nhiều ảnh / quán |
| `menus` | Danh sách món ăn | Giá VND |
| `narrations` | Audio thuyết minh đa ngôn ngữ | 1 bản / ngôn ngữ / quán |
| `languages` | Danh sách ngôn ngữ hỗ trợ | vi, en, zh, ko, ja, fr |
| `listen_history` | Lịch sử nghe của user | Source: gps hoặc qr |
| `qr_codes` | Mã QR gắn tại quán | Fallback khi GPS không chính xác |
| `subscriptions` | Gói Premium của user | monthly / yearly |
| `merchant_subscriptions` | Gói đăng ký của merchant | starter / business / premium |
| `plan_metadata` | Cấu hình giá và giới hạn gói | Chứa metadata JSON |
| `transactions` | Giao dịch thanh toán | VNPay / MoMo / Cash |

### 4.2 PostGIS đã triển khai

```sql
-- ✅ Extension đã bật
CREATE EXTENSION IF NOT EXISTS "postgis";

-- ✅ Column trong bảng stores
location GEOGRAPHY(POINT, 4326) NOT NULL

-- ✅ Spatial index (tối ưu query GPS)
CREATE INDEX idx_stores_location ON stores USING GIST (location);

-- ✅ Function tìm quán gần vị trí user
CREATE FUNCTION find_nearby_stores(p_lng, p_lat, p_radius_meters)
RETURNS TABLE (id, name, address, distance_meters, ...)
-- Dùng ST_DWithin + ST_Distance + ORDER BY distance ASC
```

---

## 5. CÁC MODULE BACKEND ĐÃ TRIỂN KHAI

### 5.1 Danh sách module
| Module | Endpoint chính | Chức năng |
|---|---|---|
| **Auth** | `POST /auth/register`, `/auth/login`, `/auth/refresh`, `/auth/logout` | JWT + Refresh Token + Session |
| **Users** | `GET /users/me`, `PATCH /users/me` | Profile người dùng |
| **Merchant** | `POST /merchant/register`, `GET /merchant/me` | Đăng ký làm chủ quán |
| **Stores** | `CRUD /stores` | Quản lý cửa hàng + GPS |
| **Menus** | `CRUD /stores/:id/menus` | Quản lý thực đơn |
| **Narrations** | `CRUD /narrations` | Audio thuyết minh đa ngôn ngữ |
| **QR** | `POST /qr/generate`, `GET /qr/scan/:code` | Tạo và quét QR |
| **Payments** | `POST /payments/vnpay`, `/payments/momo` | Tích hợp thanh toán trực tuyến |

### 5.2 Authentication Flow
- **Access Token:** JWT, expire 15 phút, lưu trong memory (Authorization header).
- **Refresh Token:** Hashed trong DB table `refresh_tokens`, expire 7 ngày.
- **Session:** Express-session với connect-pg-simple (PostgreSQL store).

### 5.3 Tính năng thông minh: Auto-Translation & Caching
Hệ thống tích hợp logic tự động dịch thuật để hỗ trợ Merchant:
- **Tự động dịch:** Khi tải lên nội dung thuyết minh Tiếng Việt, hệ thống tự động gọi MyMemory API để dịch sang các ngôn ngữ khác (En, Ko, Ja...).
- **Caching:** Các bản dịch được lưu trực tiếp vào database để tối ưu hiệu năng và chi phí API.

---

## 6. FRONTEND WEB (CMS)

### 6.1 Các trang đã có
| Trang | Đường dẫn | Chức năng |
|---|---|---|
| Đăng nhập | `/login` | Đăng nhập tài khoản |
| Đăng ký | `/register` | Tạo tài khoản mới |
| Hồ sơ cửa hàng | `/dashboard/store` | Thông tin + Liên hệ + Vị trí quán |
| Quản lý Menu | `/dashboard/menu` | Thêm/sửa/xóa món ăn |
| Audio thuyết minh | `/dashboard/audio` | Quản lý file audio đa ngôn ngữ |

### 6.2 Nhận xét UI/UX
- **Design:** Hiện đại, sidebar điều hướng rõ ràng, sử dụng Tailwind CSS v4.
- **Tình trạng:** Đã hoàn thiện kết nối 100% với Backend API thông qua Axios Interceptors.

---

## 7. CÁC TÍNH NĂNG NỔI BẬT VÀ ĐỊNH HƯỚNG

- **Geofencing thông minh:** Sử dụng thuật toán Haversine kết hợp PostGIS để kích hoạt thuyết minh trong bán kính 20m.
- **Thanh toán đa phương thức:** Hỗ trợ VNPAY và MoMo với quy trình đối soát tự động.

### 7.1 Hướng phát triển tương lai
- **AI Voice Cloning:** Chuyển văn bản thành giọng nói mang âm hưởng địa phương.
- **Offline Mode:** Hỗ trợ tải xuống nội dung để dùng khi không có mạng.
- **Thực tế tăng cường (AR):** Nhận diện quán ăn qua camera.

---

## 8. THÔNG TIN KỸ THUẬT BỔ SUNG

### 8.1 Chạy dự án
```bash
# Backend (NestJS)
cd backend && npm run start:dev

# Frontend Web (React + Vite)
cd frontend/web && npm run dev

# Mobile App (Expo)
cd frontend/app && npx expo start
```

---

## 9. TỔNG KẾT TIẾN ĐỘ

| Hạng mục | Tiến độ |
|---|---|
| Backend NestJS (API + Auth + Modules) | **100%** hoàn thành |
| Database Schema + PostGIS Migration | **100%** hoàn thành |
| Frontend Web CMS (UI/UX + API) | **100%** hoàn thành |
| Mobile App (GPS, QR, Audio, Maps) | **100%** hoàn thành |
| Payments (VNPAY, MoMo) | **100%** hoàn thành |
    ORDER BY distance ASC LIMIT 1
  `;
}
2. ✅ Map tích hợp — Dùng Leaflet (miễn phí)
bash
cd frontend/web
npm install leaflet react-leaflet
Dùng trên trang POI/Dashboard để hiển thị vị trí store trên bản đồ. Leaflet miễn phí, không cần API key như Google Maps.

3. ✅ React Native (Mobile) — Tạo app riêng
bash
cd frontend
npx create-expo-app app --template blank-typescript
Cấu trúc frontend/app/ — tách biệt hoàn toàn với frontend/web/.

Thư viện cần:

Tính năng	Package
GPS tracking	expo-location
QR scanner	expo-barcode-scanner
Audio player	expo-av
Map hiển thị	react-native-maps
4. ✅ GPS Geofencing — Flow hoạt động
[Mobile app]
  └─ expo-location.watchPositionAsync() → mỗi 10-15 giây gửi GPS lên backend
  
[Backend API] POST /stores/nearby  { lat, lng }
  └─ ST_DWithin query → trả về store gần nhất
  
[Mobile app]
  └─ Nhận store → gọi GET /narrations?storeId&lang=vi → play audio
5. ✅ Audio Narration — Lưu file trên Supabase Storage
Merchant upload file .mp3 qua CMS web
Backend lưu URL vào narrations.audio_url
Mobile fetch URL → dùng expo-av phát trực tiếp từ URL
Thứ tự ưu tiên nên làm
1️⃣ Enable PostGIS + thêm column location + API findNearby  (~2-3 giờ)
2️⃣ Tạo Expo app mobile + tích hợp GPS + gọi API findNearby  (~1 ngày)
3️⃣ Tích hợp expo-av phát audio + expo-barcode-scanner QR    (~4-5 giờ)
4️⃣ Tích hợp Leaflet vào frontend web cho trang POI           (~2 giờ)  
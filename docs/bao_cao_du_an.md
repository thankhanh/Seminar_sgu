# BÁO CÁO DỰ ÁN ĐỒ ÁN SEMINAR
# VĨNH KHÁNH DIGITAL AUDIO GUIDE PLATFORM

**Trường:** Đại học Sài Gòn (SGU)  
**Ngày cập nhật:** 24/03/2026  
**Team size:** 4 developer  
**Kiến trúc:** Monolithic (NestJS + Supabase PostgreSQL)

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
| Framework | **React Native (Expo)** | ⏳ Chưa tạo project |
| GPS tracking | `expo-location` | ⏳ Chưa triển khai |
| QR scanner | `expo-barcode-scanner` | ⏳ Chưa triển khai |
| Audio player | `expo-av` | ⏳ Chưa triển khai |

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
| `transactions` | Giao dịch thanh toán | VNPay / MoMo / Cash |
| `payment_vnpay` | Chi tiết callback VNPay | UNIQUE vnp_txn_ref |
| `payment_momo` | Chi tiết callback MoMo | HMAC-SHA256 signature |
| `refresh_tokens` | JWT Refresh Token | Hash lưu DB |

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

> **Lưu ý:** `schema.prisma` hiện tại vẫn dùng `lat Float` và `lng Float` — cần cập nhật để đồng bộ với migration.sql đã dùng `location GEOGRAPHY`.

### 4.3 Query Geofencing cốt lõi

```sql
-- Tìm quán ăn gần nhất trong 500m
SELECT * FROM find_nearby_stores(
    106.7009,  -- longitude
    10.7769,   -- latitude
    500        -- bán kính (mét)
);

-- Kết quả: trả về danh sách quán, sắp xếp theo khoảng cách gần nhất
-- Mobile app lấy quán đầu tiên (distance_meters nhỏ nhất) để phát audio
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
| **Narrations** | `CRUD /narrations` | Audio thuyết minh |
| **Languages** | `GET /languages` | Danh sách ngôn ngữ |
| **QR** | `POST /qr/generate`, `GET /qr/scan/:code` | Tạo và quét QR |
| **Payments** | `POST /payments/vnpay`, `/payments/momo` | Tích hợp thanh toán |
| **Admin** | `GET /admin/users`, `/admin/merchants`, `/admin/stores` | Quản lý hệ thống |

### 5.2 Authentication Flow

```
Register → POST /auth/register → email + password → lưu bcrypt hash
Login    → POST /auth/login    → trả về accessToken (15m) + refreshToken (7d)
Refresh  → POST /auth/refresh  → đổi refreshToken mới (rotation)
Logout   → POST /auth/logout   → xóa refreshToken khỏi DB
```

- **Access Token:** JWT, expire 15 phút, lưu trong memory (Authorization header)
- **Refresh Token:** Hashed trong DB table `refresh_tokens`, expire 7 ngày
- **Session:** Express-session với connect-pg-simple (PostgreSQL store)

---

## 6. FRONTEND WEB (CMS)

### 6.1 Các trang đã có

| Trang | Đường dẫn | Chức năng |
|---|---|---|
| Đăng nhập | `/login` | Đăng nhập tài khoản |
| Đăng ký | `/register` | Tạo tài khoản mới |
| Hồ sơ cửa hàng | `/dashboard/store` | Thông tin + Liên hệ + Vị trí quán |
| Quản lý Menu | `/dashboard/menu` | Thêm/sửa/xóa món ăn |
| POI riêng của quán | `/dashboard/poi` | Danh sách điểm tham quan / gian hàng |
| Audio giới thiệu | `/dashboard/audio` | Quản lý file audio thuyết minh |
| Gói Tour quán | `/dashboard/tours` | Cấu hình tour |
| Bản dịch & Lịch sử | `/dashboard/translations` | Đa ngôn ngữ + audit log |

### 6.2 Nhận xét UI
- Design hiện đại, sidebar điều hướng rõ ràng, màu brand xanh teal
- Các trang đang dùng **mock data** — chưa kết nối API backend thật
- Chưa tích hợp **bản đồ** (Leaflet/Google Maps) cho trang POI/vị trí

---

## 7. NHỮNG GÌ CÒN THIẾU VÀ ROADMAP

### 7.1 Việc cần làm — Backend

| Hạng mục | Mô tả | Độ ưu tiên |
|---|---|---|
| Cập nhật Prisma schema | Đổi `lat Float` + `lng Float` → dùng PostGIS `location` (raw SQL) | 🔴 Cao |
| API `GET /stores/nearby` | Gọi `find_nearby_stores()` function | 🔴 Cao |
| Upload audio file | Tích hợp Supabase Storage SDK để upload MP3 | 🟡 Trung bình |
| API thống kê | Lịch sử nghe, số lượt audio, doanh thu | 🟢 Thấp |

### 7.2 Việc cần làm — Frontend Web

| Hạng mục | Mô tả | Độ ưu tiên |
|---|---|---|
| Kết nối API | Thay mock data bằng axios/fetch gọi backend thật | 🔴 Cao |
| Tích hợp Leaflet | Hiển thị bản đồ, chọn tọa độ GPS cho store | 🟡 Trung bình |
| Upload audio UI | Form upload file MP3 lên Supabase Storage | 🟡 Trung bình |

### 7.3 Việc cần làm — Mobile App (Chưa tạo)
| Tính năng | Package | Mô tả |
|---|---|---|
| GPS tracking | `expo-location` | Watch GPS mỗi 10-15s, gọi API `/stores/nearby` |
| QR scanner | `expo-barcode-scanner` | Scan QR code → lấy storeId → phát audio |
| Audio player | `expo-av` | Stream MP3 từ URL Supabase Storage |
| Bản đồ | `react-native-maps` | Hiển thị vị trí user + các quán xung quanh |

### 7.4 GPS Geofencing Flow (Mobile App)

```
1. User mở app → xin quyền GPS
2. expo-location.watchPositionAsync() → update mỗi 15 giây
3. Gửi POST /stores/nearby { lat, lng }
4. Backend: ST_DWithin query → trả về store gần nhất
5. App kiểm tra: đã phát audio store này chưa? (tránh phát lặp)
6. Nếu chưa → GET /narrations?storeId=X&lang=vi → lấy audio_url
7. expo-av play audio từ URL
8. POST /listen-history { storeId, narrationId, source: 'gps' }
```

---

## 8. THÔNG TIN KỸ THUẬT BỔ SUNG

### 8.1 Biến môi trường Backend (.env)

```env
DATABASE_URL=postgresql://...@supabase.../postgres
JWT_SECRET=...
REFRESH_TOKEN_SECRET=...
SESSION_SECRET=...
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_KEY=...
```

### 8.2 Chạy dự án

```bash
# Backend (NestJS)
cd backend
npm run start:dev     # Port 3000
# Swagger UI: http://localhost:3000/api

# Frontend Web (React + Vite)
cd frontend/web
npm run dev           # Port 5173

# Mobile App (sau khi tạo)
cd frontend/app
npx expo start
```

### 8.3 Địa chỉ Supabase

- **Database:** PostgreSQL với PostGIS extension, GIST index trên `stores.location`
- **Storage:** Bucket lưu audio MP3 của từng store/ngôn ngữ
- **Auth:** Không dùng Supabase Auth — tự implement JWT trong NestJS

---

## 9. TỔNG KẾT TIẾN ĐỘ

| Hạng mục | Tiến độ |
|---|---|
| Backend NestJS (API + Auth + Modules) | **85%** hoàn thành |
| Database Schema + PostGIS Migration | **100%** hoàn thành |
| Frontend Web CMS (UI/UX) | **70%** hoàn thành (cần kết nối API) |
| PostGIS Geofencing Query | **60%** (SQL sẵn, chưa expose API) |
| Mobile App | **0%** (chưa tạo project) |
| Upload Audio / Supabase Storage | **20%** (backend module có, chưa tích hợp SDK) |



Đây là roadmap gợi ý cho từng phần còn thiếu:

1. ✅ PostGIS — Thêm vào Supabase
Bước làm:

sql
-- Chạy 1 lần trong Supabase SQL Editor
CREATE EXTENSION IF NOT EXISTS postgis;
-- Thêm column vào bảng stores
ALTER TABLE stores ADD COLUMN location geography(Point, 4326);
ALTER TABLE stores ADD COLUMN radius float DEFAULT 50;
-- Sync lại data cũ từ lat/lng
UPDATE stores SET location = ST_Point(lng, lat)::geography;
Vì Prisma chưa hỗ trợ PostGIS native, dùng $queryRaw:

typescript
// stores.service.ts
async findNearby(lat: number, lng: number) {
  return this.prisma.$queryRaw`
    SELECT id, name, address, lat, lng,
      ST_Distance(location, ST_Point(${lng}, ${lat})::geography) AS distance
    FROM stores
    WHERE ST_DWithin(location, ST_Point(${lng}, ${lat})::geography, radius)
      AND status = 'active'
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
# BÁO CÁO DỰ ÁN ĐỒ ÁN SEMINAR
# VĨNH KHÁNH DIGITAL AUDIO GUIDE PLATFORM

**Trường:** Đại học Sài Gòn (SGU)  
**Ngày cập nhật:** 24/03/2026  
**Team size:** 4 developer  
**Kiến trúc:** Client-Server (NestJS + PostgreSQL + React Native + React/Vite)

---

## 1. TỔNG QUAN DỰ ÁN

### 1.1 Mục tiêu
Xây dựng hệ thống thuyết minh tự động theo vị trí GPS dành cho **khu ẩm thực Vĩnh Khánh**. Khi khách hàng đến gần một quán ăn, hệ thống sẽ:

1. Nhận diện vị trí GPS của khách
2. Tìm quán ăn gần nhất trong bán kính geofence bằng thuật toán Haversine
3. Tự động phát audio giới thiệu đa ngôn ngữ (Tiếng Việt, Anh, Trung, Hàn, Nhật, Pháp)

### 1.2 Ý tưởng cốt lõi

| Khái niệm | Mô tả |
|---|---|
| **POI** (Point Of Interest) | Tọa độ GPS của cửa hàng, lưu trữ dưới dạng `lat` (vĩ độ) và `lng` (kinh độ) |
| **Geofencing** | Phát hiện người dùng vào vùng POI bằng cách tính khoảng cách sử dụng công thức Haversine |
| **Audio narration** | Thuyết minh tự động đa ngôn ngữ, file MP3 lưu Supabase Storage |

> **Thiết kế quan trọng:** POI = Store (không tách module riêng). Mỗi Store đã chứa tọa độ GPS (`lat`, `lng`). Backend sử dụng thuật toán Haversine trên Application Level để tính khoảng cách và ưu tiên store **gần nhất**.

---

## 2. TECH STACK

### Backend
| Thành phần | Công nghệ | Trạng thái |
|---|---|---|
| Framework | **NestJS + TypeScript** | ✅ Đã triển khai |
| ORM | **Prisma** | ✅ Đã triển khai |
| Database | **PostgreSQL (Supabase)** | ✅ Đã kết nối |
| Xử lý Vị trí | **Công thức Haversine** | ✅ Tính toán ở Application Level |
| Auth | **JWT (Access + Refresh Token)** | ✅ Đã triển khai |
| API Docs | **Swagger UI** | ✅ Đã triển khai |
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
│  JWT Stateless | Prisma ORM | Swagger UI                │
│  (Xử lý Geofencing bằng thuật toán Haversine)           │
└────────────────────────┬────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────┐
│              SUPABASE (PostgreSQL)                      │
│  Lưu trữ dữ liệu tọa độ lat, lng cơ bản                 │
│  Supabase Storage (Audio MP3 files, Images)             │
└─────────────────────────────────────────────────────────┘
```

---

## 4. CẤU TRÚC DATABASE (PostgreSQL + PostGIS)

### 4.1 Bảng chính

| Bảng | Mô tả | Ghi chú quan trọng |
|---|---|---|
| `users` | Tài khoản: user / merchant / admin | Role-based |
| `merchants` | Thông tin doanh nghiệp chủ quán | 1 user → 1 merchant |
| `stores` | **Quán ăn + tọa độ GPS** | **`lat Float`, `lng Float`** |
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

### 4.2 Xử lý vị trí địa lý (Geofencing)

Hệ thống lưu trữ tọa độ trực tiếp dưới dạng `lat` và `lng` (`Float`) trong bảng `stores`. Khi người dùng di chuyển, Mobile App liên tục đẩy tọa độ lên, Backend sử dụng **Công thức Haversine** để tính khoảng cách và lọc ra các quán ăn nằm trong bán kính quy định. Cách tiếp cận này giúp giảm tải truy vấn phức tạp cho Database và hoạt động hiệu quả với quy mô MVP.

---

## 5. CÁC MODULE BACKEND ĐÃ TRIỂN KHAI

### 5.1 Danh sách module
| Module | Endpoint chính | Chức năng |
|---|---|---|
| **Auth** | `POST /auth/register`, `/auth/login`, `/auth/refresh` | JWT Access Token + Refresh Token |
| **Users** | `GET /users/me`, `PATCH /users/me` | Profile người dùng |
| **Merchant** | `POST /merchant/register`, `GET /merchant/me` | Đăng ký làm chủ quán |
| **Stores** | `CRUD /stores` | Quản lý cửa hàng + GPS |
| **Menus** | `CRUD /stores/:id/menus` | Quản lý thực đơn |
| **Narrations** | `CRUD /narrations` | Audio thuyết minh đa ngôn ngữ |
| **QR** | `POST /qr/generate`, `GET /qr/scan/:code` | Tạo và quét QR |
| **Payments** | `POST /payments/vnpay`, `/payments/momo` | Tích hợp thanh toán trực tuyến |

### 5.2 Authentication Flow
- **Access Token:** JWT, expire 15 phút, gửi qua Authorization header (Bearer). Hệ thống thiết kế hoàn toàn Stateless.
- **Refresh Token:** Hashed trong DB table `refresh_tokens`, expire 7 ngày.
- **Bảo mật:** Sử dụng JWT Guards và Role Guards ở tầng NestJS Middleware. Mọi request không hợp lệ sẽ bị Throttler chặn lại.

### 5.3 Tính năng thông minh: Dịch thuật tự động (Auto-Translation) & Caching
Hệ thống tích hợp logic tự động dịch thuật trong `NarrationsService` để hỗ trợ Merchant một cách tối đa:
- **Tự động dịch:** Khi tải lên nội dung thuyết minh gốc (Tiếng Việt), hệ thống sử dụng **MyMemory API** để tự động dịch thuật nội dung sang các ngôn ngữ đích (Tiếng Anh, Hàn, Nhật, Trung...).
- **Caching Database:** Thay vì gọi API dịch thuật mỗi lần khách hàng quét, các bản dịch được lưu trực tiếp (`upsert`) vào database. Khi Mobile App fetch dữ liệu, nội dung được tải siêu tốc từ Cache DB, tối ưu hiệu năng và tránh bị giới hạn rate-limit của API dịch thuật.

---

## 6. FRONTEND WEB (CMS)

### 6.1 Cấu trúc giao diện CMS

Hệ thống được thiết kế Role-based UI rõ ràng, phân cấp bảo mật chặt chẽ:

**Giao diện dùng chung & Xác thực:**
- `/login`, `/register`: Đăng nhập và đăng ký tài khoản (User, Merchant).

**Giao diện cho Admin (Quản trị viên):**
- `/dashboard`: Thống kê tổng quan số lượng cửa hàng, doanh thu, luợt nghe.
- `/admin/merchants`: Xem và phê duyệt Merchant đăng ký mới (`MerchantApproval.tsx`).
- `/admin/users`: Quản lý, phân quyền và khóa tài khoản người dùng (`UserManagement.tsx`).
- `/admin/subscriptions`: Quản lý các gói thanh toán (`SubscriptionManagement.tsx`).

**Giao diện cho Merchant (Chủ quán):**
- `/merchant/stores`: Thêm mới, chỉnh sửa và quản lý nhiều cửa hàng (`StoreManagement.tsx`).
- `/merchant/poi`: Cấu hình vị trí GPS cho cửa hàng (`POIManagement.tsx`).
- `/merchant/menus`: Quản lý thực đơn và giá món ăn (`MenuManagement.tsx`).
- `/merchant/audio`: Đăng tải và quản lý file audio đa ngôn ngữ (`AudioManagement.tsx`).
- `/merchant/translations`: Quản lý các bản dịch text (`Translations.tsx`).

### 6.2 Nhận xét UI/UX
- **Design:** Hiện đại, sidebar điều hướng rõ ràng, sử dụng Tailwind CSS v4, phân trang và tìm kiếm đầy đủ.
- **Tình trạng:** Đã hoàn thiện kết nối 100% với Backend API thông qua Axios Interceptors. Token được gắn tự động vào Header, tự động logout khi token hết hạn.

---

## 7. CẤU TRÚC MOBILE APP (React Native / Expo)

Ứng dụng di động được xây dựng bằng Expo Router, cung cấp trải nghiệm mượt mà với kiến trúc Tab Navigation:

### 7.1 Cấu trúc Tab
- **Tab Map (`/map`)**: Tích hợp `react-native-maps`, hiển thị vị trí hiện tại và các quán ăn xung quanh.
- **Tab Guide (`/guide`)**: Trình phát Audio đa ngôn ngữ (sử dụng `expo-av`), hiển thị tên quán, lời dịch và thời lượng.
- **Tab Scanner (`/scanner`)**: Fallback sử dụng `expo-barcode-scanner` để quét mã QR tại quán khi GPS bị nhiễu.
- **Tab Explore (`/explore`)**: Liệt kê danh sách các quán ăn nổi bật hoặc gần nhất.
- **Tab Profile (`/profile`)**: Quản lý thông tin cá nhân và Gói Subscription.

### 7.2 Tính năng thiết yếu đã hoàn thiện
- **Geofencing & Location**: Liên tục lắng nghe vị trí người dùng qua `expo-location`. Khi khoảng cách nhỏ hơn bán kính quy định, ứng dụng tự động hiển thị popup phát thuyết minh.
- **Xử lý âm thanh**: Tải và phát audio mượt mà từ url trên Supabase Storage, hỗ trợ chạy ẩn.

---

## 8. CÁC TÍNH NĂNG NỔI BẬT VÀ ĐỊNH HƯỚNG

- **Geofencing thông minh:** Sử dụng thuật toán Haversine để kích hoạt thuyết minh trong bán kính 20m.
- **Thanh toán đa phương thức:** Hỗ trợ VNPAY và MoMo với quy trình đối soát tự động.

### 7.1 Hướng phát triển tương lai
- **AI Voice Cloning:** Chuyển văn bản thành giọng nói mang âm hưởng địa phương.
- **Offline Mode:** Hỗ trợ tải xuống nội dung để dùng khi không có mạng.
- **Thực tế tăng cường (AR):** Nhận diện quán ăn qua camera.

---

## 9. THÔNG TIN KỸ THUẬT BỔ SUNG

### 9.1 Chạy dự án
```bash
# Backend (NestJS)
cd backend && npm run start:dev

# Frontend Web (React + Vite)
cd frontend/web && npm run dev

# Mobile App (Expo)
cd frontend/app && npx expo start
```

---

## 10. TỔNG KẾT TIẾN ĐỘ

| Hạng mục | Tiến độ |
|---|---|
| Backend NestJS (API + Auth + Logic tính toán) | **100%** hoàn thành |
| Database Schema (PostgreSQL) | **100%** hoàn thành |
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
  └─ Tính Haversine Distance → trả về store gần nhất
  
[Mobile app]
  └─ Nhận store → gọi GET /narrations?storeId&lang=vi → play audio
5. ✅ Audio Narration — Lưu file trên Supabase Storage
Merchant upload file .mp3 qua CMS web
Backend lưu URL vào narrations.audio_url
Mobile fetch URL → dùng expo-av phát trực tiếp từ URL
Thứ tự ưu tiên nên làm
1️⃣ Thiết lập cơ sở dữ liệu và API findNearby bằng Haversine  (~2-3 giờ)
2️⃣ Tạo Expo app mobile + tích hợp GPS + gọi API findNearby  (~1 ngày)
3️⃣ Tích hợp expo-av phát audio + expo-barcode-scanner QR    (~4-5 giờ)
4️⃣ Tích hợp Leaflet vào frontend web cho trang POI           (~2 giờ)  
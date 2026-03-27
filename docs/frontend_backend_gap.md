# 📊 Báo Cáo Tương Thích: Frontend ↔ Database ↔ API

## 🔴 Kết luận: Frontend CHƯA tương thích — Toàn bộ dùng Mock Data

---

## 1. 🔐 Authentication & User

### So sánh field: [Register.tsx](file:///f:/Seminar_sgu/frontend/web/src/pages/Register.tsx) → [RegisterDto](file:///f:/Seminar_sgu/backend/src/modules/auth/dto/register.dto.ts#4-33) → [User](file:///f:/Seminar_sgu/frontend/web/src/contexts/AuthContext.tsx#3-10) table

| Field UI | DTO Backend | DB Schema | Tương thích? |
|---|---|---|---|
| `name` | `name` ✅ | `name VARCHAR(100)` | ✅ OK |
| `email` | `email` ✅ | `email UNIQUE VARCHAR(255)` | ✅ OK |
| `password` | `password` (min 8) | `password_hash` (bcrypt) | ⚠️ UI chỉ check ≥ 6 ký tự, backend yêu cầu ≥ 8 |
| `confirmPassword` | ❌ Không có | ❌ Không có | ℹ️ Chỉ validate phía FE, OK |
| ❌ Không có | `phone` (optional) | `phone VARCHAR(20)` | ⚠️ UI thiếu field phone |
| ❌ Không có | `role` (user/merchant) | `UserRole enum` | 🔴 UI không cho chọn role |
| ❌ Không có | `preferredLanguage` | `preferred_language` | ℹ️ Optional, không bắt buộc |

### Role trong AuthContext vs DB
| Frontend | Database |
|---|---|
| `'admin' \| 'manager'` | `user \| merchant \| admin` |

> [!WARNING]
> **Lỗi nghiêm trọng**: Frontend dùng role `'manager'` nhưng DB dùng `'merchant'`. Cần đổi role mapping.

---

## 2. 🏪 Stores (Cửa hàng)

### So sánh field: [StoreManagement.tsx](file:///f:/Seminar_sgu/frontend/web/src/pages/StoreManagement.tsx) → [CreateStoreDto](file:///f:/Seminar_sgu/backend/src/modules/stores/dto/create-store.dto.ts#5-49) → [Store](file:///f:/Seminar_sgu/backend/src/modules/stores/dto/create-store.dto.ts#5-49) table

| Field UI (Mock) | DTO Backend | DB Schema | Tương thích? |
|---|---|---|---|
| `name` | `name` ✅ | `name VARCHAR(200)` | ✅ OK |
| `owner` (tên chủ) | ❌ Không có trong DTO | ❌ Không có trong Store | 🔴 Sai kiến trúc — Store thuộc về [Merchant](file:///f:/Seminar_sgu/backend/src/modules/merchant/merchant.controller.ts#26-29), không cần field `owner` riêng |
| `phone` | ❌ Không có | ❌ Không có trong Store | 🔴 Phone thuộc về [User](file:///f:/Seminar_sgu/frontend/web/src/contexts/AuthContext.tsx#3-10), không phải Store |
| `email` | ❌ Không có | ❌ Không có trong Store | 🔴 Email thuộc về [User](file:///f:/Seminar_sgu/frontend/web/src/contexts/AuthContext.tsx#3-10), không phải Store |
| `location` (text) | ❌ Không có | ❌ Không có | 🔴 DB dùng `address` (text) + `lat`/`lng` (float) |
| ❌ Không có | `address` | `address TEXT` | 🔴 UI thiếu field address |
| ❌ Không có | `lat`, `lng` | `lat FLOAT, lng FLOAT` | 🔴 UI thiếu tọa độ GPS |
| ❌ Không có | `openTime`, `closeTime` | `open_time, close_time VARCHAR(5)` | ⚠️ UI thiếu giờ hoạt động |
| ❌ Không có | `coverImage` | `cover_image` | ⚠️ UI thiếu ảnh bìa |
| `revenue` | ❌ Không có | ❌ Không có trong Store | 🔴 DB không có field doanh thu trực tiếp |
| `status: 'active'\|'inactive'` | — | `pending \| active \| hidden` | ⚠️ UI dùng `'inactive'` nhưng DB dùng `'hidden'` |

---

## 3. 🍽️ Menu (Thực đơn)

### So sánh field: [MenuManagement.tsx](file:///f:/Seminar_sgu/frontend/web/src/pages/MenuManagement.tsx) → [CreateMenuDto](file:///f:/Seminar_sgu/backend/src/modules/menus/dto/create-menu.dto.ts#5-32) → [Menu](file:///f:/Seminar_sgu/backend/src/modules/menus/dto/create-menu.dto.ts#5-32) table

| Field UI (Mock) | DTO Backend | DB Schema | Tương thích? |
|---|---|---|---|
| `name` | `name` ✅ | `name VARCHAR(200)` | ✅ OK |
| `price` (string "35,000 ₫") | `price` (number) | `price DECIMAL(12,0)` | 🔴 UI lưu string, backend cần number |
| `category` (Khai vị, Món chính…) | ❌ Không có | ❌ Không có trong DB | 🔴 DB không có field category — cần thêm vào nếu muốn |
| `image` (URL) | `imageUrl` | `image_url` | ✅ Concept OK, tên field khác |
| ❌ Không có | `description` | `description TEXT` | ⚠️ UI thiếu mô tả |
| ❌ Không có | `isAvailable` | `is_available BOOLEAN` | ⚠️ UI thiếu trạng thái có sẵn |
| ❌ Không có | liên kết `storeId` | `store_id` (FK) | 🔴 UI không biết đang thao tác store nào |

---

## 4. 🎙️ Narrations & Audio

### [AudioManagement.tsx](file:///f:/Seminar_sgu/frontend/web/src/pages/AudioManagement.tsx) vs `Narration` table

> ℹ️ Chưa đọc [AudioManagement.tsx](file:///f:/Seminar_sgu/frontend/web/src/pages/AudioManagement.tsx) chi tiết, nhưng DB `Narration` có:
> `storeId`, `languageId`, `audioUrl`, `textContent`, `duration`, `isActive`

---

## 5. 📍 POI Management

> Trang [POIManagement.tsx](file:///f:/Seminar_sgu/frontend/web/src/pages/POIManagement.tsx) đang hoạt động nhưng DB **không có bảng POI** — đây có thể là màn hình quản lý Store theo góc nhìn admin.

---

## 6. 👤 User Management

> [UserManagement.tsx](file:///f:/Seminar_sgu/frontend/web/src/pages/UserManagement.tsx) cần so khớp với [User](file:///f:/Seminar_sgu/frontend/web/src/contexts/AuthContext.tsx#3-10) model: `id, name, email, phone, role, preferredLanguage, avatarUrl, isActive, createdAt`

---

## ✅ Những gì có thể tích hợp ngay

| Việc cần làm | Ưu tiên | Files cần sửa |
|---|---|---|
| Kết nối login/register thật | 🔴 Cao | [AuthContext.tsx](file:///f:/Seminar_sgu/frontend/web/src/contexts/AuthContext.tsx) |
| Sửa role `'manager'` → `'merchant'` | 🔴 Cao | [AuthContext.tsx](file:///f:/Seminar_sgu/frontend/web/src/contexts/AuthContext.tsx) |
| Fix password min length: 6 → 8 | 🟡 Trung bình | [Register.tsx](file:///f:/Seminar_sgu/frontend/web/src/pages/Register.tsx) |
| Thêm field `address`, `lat`, `lng` vào form thêm store | 🔴 Cao | [StoreManagement.tsx](file:///f:/Seminar_sgu/frontend/web/src/pages/StoreManagement.tsx) |
| Xóa field `owner`, `phone`, `email` khỏi Store form | 🔴 Cao | [StoreManagement.tsx](file:///f:/Seminar_sgu/frontend/web/src/pages/StoreManagement.tsx) |
| Đổi `price` từ string sang number | 🟡 Trung bình | [MenuManagement.tsx](file:///f:/Seminar_sgu/frontend/web/src/pages/MenuManagement.tsx) |
| Thêm `storeId` context cho Menu | 🔴 Cao | [MenuManagement.tsx](file:///f:/Seminar_sgu/frontend/web/src/pages/MenuManagement.tsx) |
| Thêm `isAvailable` toggle cho Menu | 🟢 Thấp | [MenuManagement.tsx](file:///f:/Seminar_sgu/frontend/web/src/pages/MenuManagement.tsx) |
| Tạo `api.ts` với axios + `withCredentials: true` | 🔴 Cao | `src/services/api.ts` (mới) |
| Cấu hình CORS backend (`localhost:5173`) | 🔴 Cao | [main.ts](file:///f:/Seminar_sgu/backend/src/main.ts) |

---

## 🔑 Đăng nhập ngay (chế độ mock hiện tại)

- **Chủ quán**: `merchant@gmail.com` / `password`
- **Admin**: bất kỳ email nào / `password`

# MASTER PROJECT DOCUMENT
# VĨNH KHÁNH AUDIO GUIDE PLATFORM

---

## 1. PROJECT OVERVIEW

### 1.1 Tên dự án
**Vĩnh Khánh Digital Audio Guide**

### 1.2 Mục tiêu
Xây dựng hệ thống thuyết minh tự động theo vị trí GPS dành cho khu ẩm thực.

Khách hàng khi đến gần một quán ăn sẽ:
- Được hệ thống nhận diện vị trí
- Hiển thị thông tin quán
- Phát audio giới thiệu đa ngôn ngữ

---

### 1.3 Ý tưởng cốt lõi

Hệ thống hoạt động dựa trên:

| Khái niệm | Mô tả |
|-----------|-------|
| **POI** (Point Of Interest) | Tọa độ GPS của cửa hàng |
| **Geofencing** | Phát hiện người dùng vào vùng POI |
| **Audio narration** | Thuyết minh tự động đa ngôn ngữ |

---

### 1.4 Kiến trúc hệ thống

> **Architecture: Monolithic**

**Lý do chọn Monolith:**
- Team nhỏ (4 dev)
- Phát triển nhanh
- Dễ maintain
- AI code hiểu context tốt

**Backend sẽ được viết bằng NestJS**

---

## 2. TECH STACK

### Backend

| Thành phần | Công nghệ |
|-----------|-----------|
| Framework | **NestJS** |
| Language | **TypeScript** |
| Architecture | Monolith |
| ORM | **Prisma** / TypeORM |

### Database

| Thành phần | Công nghệ |
|-----------|-----------|
| Database | **PostgreSQL** |

> **Lý do dùng PostgreSQL:**
> - Ổn định, bảo mật cao
> - Hỗ trợ tính khoảng cách bằng Haversine hiệu quả

---

### Frontend Web

| Thành phần | Công nghệ |
|-----------|-----------|
| Framework | **React** |
| Styling | **Tailwind CSS** |
| Map | Google Maps / Leaflet |

---

### Mobile App

| Thành phần | Công nghệ |
|-----------|-----------|
| Framework | **React Native** |

**Features:**
- GPS tracking
- QR scanner
- Audio player

---

## 16. GOAL OF SYSTEM

- 🌏 Tăng trải nghiệm du lịch
- 🍜 Quảng bá ẩm thực địa phương
- 📣 Tạo nền tảng quảng bá cho quán ăn

---

*Tài liệu gốc: Vĩnh Khánh Audio Guide Platform Master Document*
*Cập nhật lần cuối: 2026-03-16*

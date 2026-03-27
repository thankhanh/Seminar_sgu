# Kịch bản Demo Dự án (Dành cho Giảng viên)

Để demo tốt nhất trên 1 máy tính, bạn nên chuẩn bị sẵn 3 cửa sổ: 
1. **Trình duyệt (Web Admin)**: `http://localhost:5173`
2. **Máy ảo Android/iOS (Mobile App)**: Chạy qua Expo.
3. **Swagger (Technical Proof)**: `http://localhost:3000/api`

---

## Bước 1: Giới thiệu Tổng quan (2 phút)
- **Chủ đề**: Hệ thống Hướng dẫn viên ảo (Digital Audio Guide) cho phố ẩm thực Vĩnh Khánh.
- **Vấn đề giải quyết**: Giúp du khách (đặc biệt là khách quốc tế) hiểu về các món ăn, câu chuyện đằng sau mỗi quán khi đang đi bộ trên phố.
- **Công nghệ**: NestJS (Backend), React (Web), Expo (Mobile), Gemini AI (Tự động dịch thuật), Prisma (Database).

---

## Bước 2: Demo Hệ quản trị Web (3-4 phút)
- **Đăng nhập**: Dùng tài khoản Admin (tài khoản mẫu: `admin@vinhkhanh.vn` / `Admin@123`).
- **Dashboard**: Cho thầy xem biểu đồ hoặc danh sách quán (nếu có).
- **POI Management**: Cho xem danh sách các điểm tham quan/quán ăn.
- **Audio & Translation**: 
  - Chọn một quán chưa có thuyết minh Tiếng Anh.
  - Ấn nút **Translate** (nếu có trên giao diện) hoặc giải thích rằng hệ thống dùng **Gemini AI** để tự động dịch từ bản gốc Tiếng Việt sang 6 ngôn ngữ khác nhau (EN, ZH, KO, JA...).
  - Điều này giúp Merchant không cần phải biết nhiều ngoại ngữ vẫn có thể phục vụ khách quốc tế.

---

## Bước 3: Demo Trải nghiệm Mobile App (5 phút - Quan trọng nhất)
- **Mở Map**: Cho thầy thấy vị trí của mình trên bản đồ (đang ở Vĩnh Khánh).
- **Trải nghiệm thuyết minh (The "WOW" Moment)**:
  - Mở công cụ giả lập GPS của máy ảo.
  - Nhập tọa độ: `10.4983, 105.1163` (Quán Thanh Khanh).
  - Ngay khi chấm xanh di chuyển đến quán, App sẽ tự động phát âm thanh: *"Chào mừng bạn đến với Thanh Khanh Food Flagship..."*
  - **Nhấn mạnh**: Thông tin này được lấy **Real-time** và tự động phát dựa trên geofencing (vòng tròn địa lý).

---

## Bước 4: Demo Kỹ thuật (Nếu thầy hỏi sâu - 2 phút)
- **Swagger UI**: Mở [http://localhost:3000/api](http://localhost:3000/api) để cho thầy thấy hệ thống API được thiết kế chuẩn RESTful và có tài liệu đầy đủ.
- **Dữ liệu**: Mở **Prisma Studio** (`http://localhost:5555`) để cho thấy dữ liệu được lưu trữ cấu trúc rõ ràng.

---

## Lời khuyên khi Demo:
- **Tắt các thông báo**: Để tránh bị làm phiền khi đang trình chiếu.
- **Âm thanh**: Kiểm tra loa máy tính để thầy nghe được tiếng thuyết minh từ App.
- **Tốc độ**: Nói chậm rãi, giải thích lý do tại sao tính năng đó lại hữu ích cho người dùng thực tế.

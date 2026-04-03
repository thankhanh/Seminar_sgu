# 📊 Phân Tích Cụ Thể Lộ Trình Hoàn Thiện Dự Án

Dựa theo trạng thái hiện tại (frontend đang dùng Mock UI và API backend đã dựng khung), dưới đây là **danh sách các công việc cụ thể (To-Do List)** chi tiết cho từng phần của dự án. Lộ trình được sắp xếp từ ưu tiên cao nhất, giải quyết ngay những điểm "nghẽn".

---

## 🏗️ 1. Web Dashboard (React/Vite) — [Cần Làm Gấp]
*Hiện tại Frontend đang ráp sai schema và dùng Mock Data. Cần sửa các form và gọi API thật.*

### Auth & Security (Đăng nhập / Đăng ký)
- [ ] **Sửa mapping Role:** Vào `AuthContext.tsx`, đổi tất cả role `'manager'` thành `'merchant'` để khớp với Enum của Database.
- [ ] **Validation Password:** Ở trang Đăng ký ([Register.tsx](file:///f:/Seminar_sgu/frontend/web/src/pages/Register.tsx)), chỉnh sửa min-length của password từ 6 ký tự lên 8 ký tự.
- [ ] **Setup Axios:** Tạo file `src/services/api.ts` import Axios, cấu hình `baseURL` và tự động gắn token / config `withCredentials: true`.
- [ ] **Nối API Auth:** Thay thế logic Mock Đăng nhập/Đăng ký bằng việc `POST /auth/login` và lưu JWT token vào LocalStorage + State.

### Quản Lý Quán Ăn (StoreManagement)
- [ ] **Sửa UI Form Thêm Quán:**
    - **Thêm** input cho: Tọa độ (`lat`, `lng`), Giờ mở/đóng cửa (`openTime`, `closeTime`), Ảnh bìa (`coverImage`), và Địa chỉ cụ thể (`address`).
    - **Xóa** input rác không khớp DB: Số điện thoại (`phone`), Email, và Tên chủ quán (`owner`) - vì thông tin này được lấy từ account Merchant.
- [ ] **Nối API Store:** Gọi API `GET /stores/merchant` để tải danh sách quán của chủ quán hiện tại + `POST /stores` để tạo quán mới.

### Quản Lý Thực Đơn (MenuManagement)
- [ ] **Sửa kiểu dữ liệu Giá tiền:** Input `price` phải xuất ra số nguyên (number) thay vì chuỗi kiểu `"35,000 ₫"`.
- [ ] **Xác định Quán (StoreContext):** Truyền `storeId` khi tạo một món ăn mới (vì 1 món phải thuộc về 1 quán, UI hiện tại đang không rõ ràng).
- [ ] **Bổ sung UI:** Thêm mô tả (`description`) và công tắc Bật/Tắt có hàng (`isAvailable`).

### Các chức năng khác
- [ ] **Nối API Quản lý Thuyết Minh (Narrations):** Đảm bảo upload file âm thanh (`audioUrl`) và gửi kèm `languageId`.
- [ ] **Admin Pages:** Nếu đang đăng nhập bằng tài khoản admin, cần gọi API từ controller `admin` để duyệt (approve/hide) quán.

---

## ⚙️ 2. Backend API (NestJS) — [Đã Hoàn Thiện ~90%]
*Backend đang có cấu trúc tốt, nhưng cần cân chỉnh nhỏ để Frontend có thể giao tiếp dễ dàng.*

### Networking & Security
- [ ] **CORS Error:** Cấu hình Cors trong `main.ts` (`app.enableCors()`) để cho phép origin `http://localhost:5173`.
- [ ] **Static Assets:** Nếu backend lưu trữ file ảnh / map nội bộ cục bộ, hãy mở chặn folder serve tĩnh `app.useStaticAssets()`.

### Payment (VNPAY / MoMo)
- [ ] **Ngrok Test Local:** Set up Ngrok forwarding port 3000 ra môi trường public để VNPAY và MOmo sandbox có thể gọi về callback `/ipn` khi dev.

---

## 📱 3. Mobile App (Expo/React Native) — [Bắt Đầu Triển Khai]
*Đây là phần người dùng ứng dụng chính, dường như chưa được phát triển nhiều.*

### Core Khách Du Lịch (MVP)
- [ ] **Dựng UI Cơ bản:** Splash screen, Login/Guest mode, Bottom Navigation (Bản đồ, Lịch sử, Cá nhân).
- [ ] **Tích hợp Bản Đồ (Expo-Location & RN-Maps):**
    - Xin phép quyền truy cập Vị trí (`foreground` và `background`).
    - Gọi API `/stores/nearby` với tham số là tọa độ GPS hiện tại.
    - Render quán ăn thành điểm POI trên Google Map/Apple Map.
- [ ] **Logic Geofencing (Tính năng ăn tiền):**
    - Function kiểm tra khoảng cách liên tục: So sánh vị trí user so với vị trí quán.
    - Nếu khoảng cách `< 20m` -> Kích hoạt Pop-up phát nhạc hoặc thông báo.
- [ ] **QR Scanner (Phòng vệ):**
    - Tích hợp `expo-barcode-scanner`. User quét QR -> Gọi thẳng vào `/stores/:id/narrations` để bỏ qua lỗi GPS lệch.
- [ ] **Audio Player:** Cài module `expo-av` để play file mp3 thuyết minh từ URL có sẵn. Logic switch language theo ngữ cảnh.

---

## 🚀 4. Đề Xuất Trình Tự Thực Hiện Tối Ưu

Đừng làm song song quá nhiều, bạn nên xử lý theo thứ tự giải quyết nghẽn cổ chai:

1. **[Ngay Lập Tức - Frontend]**
   - Viết tính năng gọi API `axios` thay cho Mock Data trong React.
   - Sửa form `StoreManagement` vì hiện tại nếu không tạo được quán chuẩn DB thì không thêm được Món / File âm thanh.
2. **[Ngay Lập Tức - Backend]**
   - Update config CORS ở `main.ts` để web frontend không bị văng lỗi khi Login gọi API.
3. **[Tiếp Theo - Admin/Merchant]** Đăng nhập thử vào Merchant -> Thêm một quán với tọa độ GPS thật khu Vĩnh Khánh -> Up thử 1 file âm thanh.
4. **[Cuối Cùng - Mobile]** Sau khi Backend có 1 quán mẫu thật hoàn chỉnh với âm thanh đầy đủ -> Tiến hành code Mobile App để làm tính năng tự động nhận diện GPS và load bài âm thanh đó.

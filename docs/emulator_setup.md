# Hướng dẫn Cài đặt Máy ảo (Android Emulator) & Setup Demo

Để chạy được App Mobile trên máy tính Windows, bạn cần cài đặt **Android Studio** và tạo một thiết bị ảo (Virtual Device).

## 1. Cài đặt Android Studio
1. Tải Android Studio tại: [developer.android.com/studio](https://developer.android.com/studio)
2. Cài đặt theo các bước mặc định (Standard installation).
3. Trong quá trình cài đặt, hãy đảm bảo đã tích chọn:
   - **Android SDK**
   - **Android SDK Platform**
   - **Android Virtual Device**

---

## 2. Tạo Máy ảo (AVD)
1. Mở **Android Studio**.
2. Chọn **More Actions** -> **Virtual Device Manager**.
3. Nhấn **Create Device**.
4. Chọn một mẫu máy (Ví dụ: **Pixel 7** hoặc **Pixel 6**).
5. Chọn một phiên bản Android (Recommend: **API 34** hoặc **API 33** - Tải về nếu chưa có).
6. Nhấn **Finish**. Bây giờ bạn sẽ thấy máy ảo trong danh sách. Nhấn nút **Play** (tam giác xanh) để khởi động máy ảo.

---

## 3. Khởi chạy App trên Máy ảo
1. Đảm bảo máy ảo đã khởi động xong và đang ở màn hình chính.
2. Mở terminal tại thư mục dự án: `f:\Seminar_sgu\frontend\app`
3. Chạy lệnh: `npm run dev`
4. Khi terminal hiện ra các tùy chọn, hãy nhấn phím **`a`** trên bàn phím (Open on Android).
5. Expo sẽ tự động cài đặt app **Expo Go** vào máy ảo và mở dự án của bạn lên.

---

## 4. Cách Setup Demo để "Ghi điểm"
Để demo tính năng Audio Guide mượt mà, bạn làm như sau:

### Cách giả lập di chuyển (Mock Location):
1. Trên thanh công cụ của máy ảo (cột bên phải), nhấn vào **dấu 3 chấm (...)**.
2. Chọn mục **Location**.
3. **Tìm kiếm tọa độ**: Bạn có thể tìm địa chỉ "Vĩnh Khánh, Quận 4" trên bản đồ nhỏ trong cửa sổ này.
4. **Lưu các điểm quan trọng**: Nhập tọa độ mình đã cho (`10.4983, 105.1163`) và nhấn **SAVE POINT**. Đặt tên là "Quán Thanh Khanh".
5. **Khi Demo**: Bạn chỉ cần nhấn vào điểm đã lưu và chọn **Set Location**, App sẽ ngay lập tức nhận diện bạn đã đến quán và phát tiếng thuyết minh.

### Tip Demo 1 máy tính:
- Dùng phím `Alt + Tab` để chuyển nhanh giữa Web và App.
- Hoặc dùng tính năng **Split Screen** (Chia đôi màn hình) của Windows: Kéo cửa sổ trình duyệt sang sát mép trái, máy ảo sang sát mép phải. Thầy sẽ thấy cả quá trình bạn chỉnh sửa dữ liệu trên Web -> App cập nhật và đọc thuyết minh ngay lập tức.

# 📱 Mobile Business Logic — Chi Tiết Nghiệp vụ

Tài liệu này mô tả các logic xử lý phức tạp được hiện thực hóa trong Mobile App (React Native), giúp hệ thống hoạt động thông minh, tối ưu hóa trải nghiệm người dùng và chi phí API.

---

## 1. Hệ thống Cảnh báo Tiệm cận (Proximity Alert v2.0)

Thay vì gửi GPS liên tục lên Server để tính toán (tốn pin và lag), App sử dụng logic kiểm tra vị trí ngay tại Client.

-   **Bán kính kích hoạt (Radius)**: **50 mét**.
-   **Thuật toán**: Sử dụng công thức **Haversine** để tính khoảng cách đường chim bay chính xác theo đơn vị mét giữa GPS hiện tại và tọa độ quán.
-   **Giao diện**: Khi User đi vào vùng 50m, một **Proximity Modal** (Popup cảnh báo tiệm cận) sẽ xuất hiện với các tùy chọn:
    -   *Nghe thuyết minh ngay*: Tự động chuyển vào màn hình chi tiết và phát âm thanh.
    -   *Xem menu*: Xem danh sách món ăn.
    -   *Đóng*: Bỏ qua cảnh báo cho quán này trong phiên làm việc hiện tại.
-   **Chế độ Simulation (Dev)**: Trong code có cờ `SIMULATE_GPS` cho phép mô phỏng việc di chuyển đến các quán mà không cần di chuyển ngoài thực tế (Dùng cho Testing).

---

## 2. Hệ thống Lưu trữ Offline Thông minh (Intelligent Caching)

Hệ thống tự động tải tài nguyên để đảm bảo App hoạt động mượt mà ngay cả khi mạng yếu hoặc mất mạng.

-   **Điều kiện kích hoạt**: Bộ nhớ trống của thiết bị phải **> 500MB**.
-   **Tài nguyên được tải (Sync Targets)**:
    -   Ảnh bìa (Cover images) của tất cả các quán.
    -   File âm thanh thuyết minh (MP3) của **ngôn ngữ hiện đang chọn**.
-   **Thời điểm đồng bộ (Triggers)**:
    -   Ngay sau khi **Đăng nhập (Login)** hoặc **Đăng ký (Register)** thành công.
    -   Khi mở lại App (Startup) nếu người dùng đã đăng nhập từ trước.
-   **Cơ chế lưu trữ**:
    -   Thư mục: `FileSystem.documentDirectory/offline_cache/`.
    -   Manifest: Ánh xạ URL từ Server sang URI cục bộ lưu trong `AsyncStorage`.
-   **Xóa dữ liệu (Cleanup)**: Toàn bộ dữ liệu cache sẽ bị **xóa sạch ngay lập tức** khi người dùng nhấn **Đăng xuất (Logout)** để đảm bảo an toàn bộ nhớ và bảo mật.

---

## 3. Chiến lược Phát Phương tiện (Media Strategy)

App ưu tiên trải nghiệm mượt mã nhất theo thứ tự ưu tiên sau:

1.  **Priority 1: MP3 Cục bộ**: Nếu file MP3 đã được tải về bởi hệ thống Caching, App sẽ phát ngay lập tức từ máy (không tốn data, không trễ).
2.  **Priority 2: MP3 Server**: Nếu chưa có cache nhưng quán có file Audio trên server, App sẽ stream file đó.
3.  **Priority 3: TTS (Text-to-Speech)**: Nếu quán không có file ghi âm sẵn cho ngôn ngữ đó, App sẽ sử dụng công nghệ `expo-speech` để đọc đoạn văn bản narration bằng giọng máy của hệ điều hành.

---

## 4. Dịch thuật theo yêu cầu (On-demand Translation)

Đây là tính năng cầu nối khi quán chưa có bản dịch bằng ngôn ngữ mà User đang chọn.

-   **Kịch bản**: User chọn tiếng Hàn (ko), nhưng quán chỉ mới có thuyết minh tiếng Việt (vi).
-   **Quy trình**:
    1.  User nhấn nút Play.
    2.  App phát hiện thiếu thuyết minh ngôn ngữ `ko`.
    3.  App gọi API: `POST /languages/translate` gửi text gốc (vi) và mã đích (ko).
    4.  Backend gọi AI (Google Translate) để dịch và trả về đoạn text đã dịch.
    5.  App nhận text và dùng **TTS** đọc lên cho khách nghe ngay lập tức.
    6.  *Lưu ý*: Backend sẽ tự động lưu lại bản dịch này để lần sau khách khác dùng không cần gọi AI lại (tiết kiệm chi phí).

---

## 5. Tóm tắt Tham số Nghiệp vụ

| Tham số | Giá trị | Ý nghĩa |
| :--- | :--- | :--- |
| **Proximity Radius** | 50m | Khoảng cách bắt đầu hiện Popup cảnh báo |
| **Storage Threshold** | 500MB | Dung lượng tối thiểu để cho phép tải Offline |
| **Default Language** | `vi` | Ngôn ngữ gốc dùng để dịch sang các tiếng khác |
| **Cache Location** | `offline_cache/` | Thư mục lưu trữ ảnh và audio trên điện thoại |

---
*Tài liệu này mô tả chính xác trạng thái nghiệp vụ tính đến ngày 14/04/2026.*

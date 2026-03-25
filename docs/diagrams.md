# 📐 SEQUENCE DIAGRAM & ACTIVITY DIAGRAM
# VĨNH KHÁNH DIGITAL AUDIO GUIDE

**Ngày cập nhật:** 24/03/2026  
**Công cụ vẽ:** Mermaid.js

---

## MỤC LỤC

### Sequence Diagrams
1. [SD1 — Đăng ký & Đăng nhập](#sd1--đăng-ký--đăng-nhập)
2. [SD2 — Tìm quán gần đó (GPS Geofencing)](#sd2--tìm-quán-gần-đó-gps-geofencing)
3. [SD3 — Nghe Audio Narration](#sd3--nghe-audio-narration)
4. [SD4 — Quét QR Code](#sd4--quét-qr-code)
5. [SD5 — Merchant tạo quán & Upload Narration](#sd5--merchant-tạo-quán--upload-narration)
6. [SD6 — Admin duyệt Merchant & Store](#sd6--admin-duyệt-merchant--store)
7. [SD7 — Thanh toán VNPAY](#sd7--thanh-toán-vnpay)
8. [SD8 — Thanh toán MoMo](#sd8--thanh-toán-momo)

### Activity Diagrams
1. [AD1 — Luồng User khám phá quán](#ad1--luồng-user-khám-phá-quán)
2. [AD2 — Luồng Merchant đăng ký & tạo quán](#ad2--luồng-merchant-đăng-ký--tạo-quán)
3. [AD3 — Luồng Admin duyệt](#ad3--luồng-admin-duyệt)
4. [AD4 — Luồng thanh toán tổng quát](#ad4--luồng-thanh-toán-tổng-quát)
5. [AD5 — Luồng Narration Fallback đa ngôn ngữ](#ad5--luồng-narration-fallback-đa-ngôn-ngữ)

---

## SEQUENCE DIAGRAMS

---

### SD1 — Đăng ký & Đăng nhập

```mermaid
sequenceDiagram
    autonumber
    actor U as User / Merchant
    participant App as Mobile App / Web
    participant API as NestJS Backend
    participant DB as PostgreSQL

    Note over U,DB: === ĐĂNG KÝ ===
    U->>App: Nhập email, password, name, role
    App->>API: POST /auth/register
    API->>API: Validate input + hash password (bcrypt)
    API->>DB: INSERT INTO users (email, password_hash, role)
    DB-->>API: User created (uuid)
    
    alt role = merchant
        API->>DB: INSERT INTO merchants (user_id, status='pending')
        DB-->>API: Merchant created
    end

    API->>API: Generate JWT Access Token (15min)
    API->>DB: INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
    DB-->>API: Refresh token saved
    API-->>App: 201 { user, accessToken, refreshToken }
    App-->>U: Đăng ký thành công!

    Note over U,DB: === ĐĂNG NHẬP ===
    U->>App: Nhập email + password
    App->>API: POST /auth/login
    API->>DB: SELECT * FROM users WHERE email = ?
    DB-->>API: User record
    API->>API: Verify bcrypt(password, hash)
    
    alt Password đúng
        API->>API: Generate Access Token + Refresh Token
        API->>DB: INSERT refresh_tokens
        API-->>App: 200 { user, accessToken, refreshToken }
        App-->>U: Đăng nhập thành công
    else Password sai
        API-->>App: 401 Unauthorized
        App-->>U: Sai mật khẩu!
    end
```

---

### SD2 — Tìm quán gần đó (GPS Geofencing)

```mermaid
sequenceDiagram
    autonumber
    actor U as User
    participant App as Mobile App
    participant GPS as expo-location
    participant API as NestJS Backend
    participant PG as PostgreSQL + PostGIS

    U->>App: Mở app
    App->>GPS: watchPositionAsync() mỗi 15 giây
    GPS-->>App: { lat: 10.7769, lng: 106.7009 }
    
    App->>API: GET /stores/nearby?lat=10.7769&lng=106.7009&radius=500
    API->>PG: SELECT * FROM find_nearby_stores(106.7009, 10.7769, 500)
    
    Note over PG: ST_DWithin + ST_Distance<br/>ORDER BY distance ASC
    
    PG-->>API: [{id, name, distance: 87.5m}, {id, name, distance: 230m}]
    API-->>App: 200 { stores: [...] }
    App->>App: Hiển thị markers trên bản đồ

    Note over U,PG: === GEOFENCE TRIGGER (< 20m) ===
    
    GPS-->>App: { lat: 10.7770, lng: 106.7010 }
    App->>API: GET /stores/nearby?lat=...&lng=...&radius=20
    API->>PG: find_nearby_stores(lng, lat, 20)
    PG-->>API: [{id: "store-uuid", name: "Bún Bò Huế", distance: 12m}]
    API-->>App: 200 { stores: [Bún Bò Huế] }
    
    App->>App: Kiểm tra: đã trigger store này trong 30 phút chưa?
    
    alt Chưa trigger
        App-->>U: 📍 Popup "Bạn đang gần Bún Bò Huế — Nghe thuyết minh?"
    else Đã trigger rồi
        App->>App: Bỏ qua (tránh spam)
    end
```

---

### SD3 — Nghe Audio Narration

```mermaid
sequenceDiagram
    autonumber
    actor U as User
    participant App as Mobile App
    participant API as NestJS Backend
    participant DB as PostgreSQL
    participant S3 as Supabase Storage

    U->>App: Nhấn "Nghe thuyết minh" (store_id)
    App->>API: GET /stores/{storeId}/narrations?lang=ko
    
    API->>DB: SELECT * FROM narrations<br/>WHERE store_id = ? AND language_id = ?
    
    alt Có bản narration tiếng Hàn
        DB-->>API: { audioUrl, textContent, duration }
    else Không có → Fallback sang English
        API->>DB: SELECT * FROM narrations<br/>WHERE store_id = ? AND language = 'en'
        DB-->>API: { audioUrl (English), duration }
    end
    
    API-->>App: 200 { narration: { audioUrl, language, duration } }
    
    App->>S3: Stream audio từ audioUrl (MP3)
    S3-->>App: Audio data stream
    App->>App: expo-av: Play audio
    App-->>U: 🎵 Đang phát thuyết minh...
    
    U->>App: Điều khiển (Pause / Seek / Speed)
    
    Note over U,S3: === GHI LỊCH SỬ ===
    
    App->>API: POST /listen-history<br/>{ storeId, narrationId, source: "gps" }
    API->>DB: INSERT INTO listen_history
    DB-->>API: OK
    API-->>App: 201 Created
```

---

### SD4 — Quét QR Code

```mermaid
sequenceDiagram
    autonumber
    actor U as User
    participant App as Mobile App
    participant Cam as Camera / QR Scanner
    participant API as NestJS Backend
    participant DB as PostgreSQL

    U->>App: Mở QR Scanner
    App->>Cam: Bật camera (expo-barcode-scanner)
    U->>Cam: Đưa camera vào mã QR tại quán
    Cam-->>App: QR data: "VKAUDIO_STORE_abc123"
    
    App->>App: Parse QR code → extract store code
    App->>API: GET /qr/abc123
    API->>DB: SELECT s.* FROM qr_codes q<br/>JOIN stores s ON q.store_id = s.id<br/>WHERE q.code = 'abc123' AND q.is_active = true
    
    alt QR code hợp lệ
        DB-->>API: Store info + menus + images
        API-->>App: 200 { store: { name, description, menus, narrations } }
        App-->>U: Hiển thị thông tin quán
        App->>App: Tự động phát narration (preferred_language)
    else QR code không hợp lệ
        DB-->>API: Not found
        API-->>App: 404 { error: "QR code không tồn tại" }
        App-->>U: ❌ Mã QR không hợp lệ
    end
```

---

### SD5 — Merchant tạo quán & Upload Narration

```mermaid
sequenceDiagram
    autonumber
    actor M as Merchant
    participant Web as Web Dashboard
    participant API as NestJS Backend
    participant DB as PostgreSQL
    participant S3 as Supabase Storage

    Note over M,S3: === TẠO QUÁN MỚI ===
    M->>Web: Nhấn "Create Store"
    M->>Web: Nhập tên, địa chỉ, chọn GPS trên bản đồ, upload ảnh
    Web->>API: POST /merchant/stores<br/>(multipart: name, address, lat, lng, coverImage)
    
    API->>S3: Upload cover image
    S3-->>API: imageUrl
    API->>DB: INSERT INTO stores<br/>(merchant_id, name, address, location, cover_image, status='pending')
    DB-->>API: Store created (uuid)
    API-->>Web: 201 { store: { id, status: "pending" } }
    Web-->>M: ✅ Quán đã tạo — đang chờ Admin duyệt

    Note over M,S3: === UPLOAD NARRATION ===
    M->>Web: Chọn quán → "Add Narration"
    M->>Web: Chọn ngôn ngữ (English) + Upload file audio.mp3
    Web->>API: POST /merchant/stores/{id}/narrations<br/>(multipart: languageId, audio file)
    
    API->>S3: Upload audio MP3
    S3-->>API: audioUrl
    API->>DB: INSERT INTO narrations<br/>(store_id, language_id, audio_url, duration)
    DB-->>API: Narration created
    API-->>Web: 201 { narration }
    Web-->>M: ✅ Thuyết minh tiếng Anh đã upload!

    Note over M,S3: === UPLOAD MENU ===
    M->>Web: "Add Menu Item"
    M->>Web: Nhập tên món, giá, upload ảnh
    Web->>API: POST /merchant/stores/{id}/menus<br/>(multipart: name, price, image)
    API->>S3: Upload menu image
    S3-->>API: imageUrl
    API->>DB: INSERT INTO menus (store_id, name, price, image_url)
    DB-->>API: Menu item created
    API-->>Web: 201 { menu }
    Web-->>M: ✅ Đã thêm món "Bún Bò" — 45,000đ
```

---

### SD6 — Admin duyệt Merchant & Store

```mermaid
sequenceDiagram
    autonumber
    actor A as Admin
    participant Web as Admin Dashboard
    participant API as NestJS Backend
    participant DB as PostgreSQL

    Note over A,DB: === DUYỆT MERCHANT ===
    A->>Web: Vào "Quản lý Merchant" → xem danh sách pending
    Web->>API: GET /admin/merchants?status=pending
    API->>DB: SELECT * FROM merchants WHERE status = 'pending'
    DB-->>API: [{id, business_name, tax_code, user}]
    API-->>Web: 200 { merchants: [...] }
    Web-->>A: Hiển thị danh sách chờ duyệt

    A->>Web: Xem chi tiết → nhấn "Approve"
    Web->>API: POST /admin/merchants/{id}/approve
    API->>DB: UPDATE merchants SET status = 'approved' WHERE id = ?
    DB-->>API: Updated
    API-->>Web: 200 { message: "Merchant đã được duyệt" }
    Web-->>A: ✅ Merchant approved!

    Note over A,DB: === DUYỆT STORE ===
    A->>Web: Vào "Quản lý Store" → xem danh sách pending
    Web->>API: GET /admin/stores?status=pending
    API->>DB: SELECT * FROM stores WHERE status = 'pending'
    DB-->>API: [{id, name, address, merchant, menus, narrations}]
    API-->>Web: 200 { stores: [...] }

    A->>Web: Kiểm tra ảnh, menu, narration → nhấn "Approve"
    Web->>API: POST /admin/stores/{id}/approve
    API->>DB: UPDATE stores SET status = 'active' WHERE id = ?
    DB-->>API: Updated
    API-->>Web: 200 { message: "Store đã active" }
    Web-->>A: ✅ Quán đã xuất hiện trên app!

    Note over A,DB: === REJECT MERCHANT ===
    A->>Web: Nhấn "Reject" + nhập lý do
    Web->>API: POST /admin/merchants/{id}/reject<br/>{ reason: "Thông tin không hợp lệ" }
    API->>DB: UPDATE merchants SET status='rejected', reject_reason='...'
    DB-->>API: Updated
    API-->>Web: 200 { message: "Đã từ chối" }
    Web-->>A: ❌ Merchant rejected
```

---

### SD7 — Thanh toán VNPAY

```mermaid
sequenceDiagram
    autonumber
    actor U as User
    participant App as Mobile App
    participant API as NestJS Backend
    participant DB as PostgreSQL
    participant VN as VNPAY Gateway

    U->>App: Chọn gói Premium Monthly → VNPAY
    App->>API: POST /subscriptions<br/>{ plan: "monthly", paymentMethod: "vnpay" }
    
    API->>DB: INSERT INTO transactions<br/>(user_id, amount: 49000, type: "user_subscription",<br/>payment_method: "vnpay", status: "pending")
    DB-->>API: transaction_id
    
    API->>API: Tạo VNPAY payment URL<br/>(vnp_TxnRef, vnp_Amount, vnp_SecureHash)
    API->>DB: INSERT INTO payment_vnpay<br/>(transaction_id, vnp_txn_ref, vnp_amount)
    
    API-->>App: 201 { paymentUrl: "https://sandbox.vnpay.vn/..." }
    App->>App: Mở WebView → redirect đến VNPAY
    
    U->>VN: Chọn ngân hàng + thanh toán
    VN-->>App: Redirect về returnUrl?vnp_ResponseCode=00

    Note over API,VN: === IPN CALLBACK (Server-to-Server) ===
    VN->>API: POST /payments/vnpay/ipn<br/>(vnp_TxnRef, vnp_ResponseCode, vnp_SecureHash)
    
    API->>API: Verify vnp_SecureHash (SHA-512 HMAC)
    
    alt Hash hợp lệ + ResponseCode = "00"
        API->>DB: UPDATE transactions SET status = 'success'
        API->>DB: UPDATE payment_vnpay SET vnp_response_code, raw_response
        API->>DB: INSERT INTO subscriptions<br/>(user_id, plan, start_date, end_date, status='active')
        API-->>VN: { RspCode: "00", Message: "Confirm Success" }
    else Hash không hợp lệ hoặc lỗi
        API->>DB: UPDATE transactions SET status = 'failed'
        API-->>VN: { RspCode: "97", Message: "Invalid Checksum" }
    end
    
    App-->>U: 🎉 Thanh toán thành công! Premium đã kích hoạt
```

---

### SD8 — Thanh toán MoMo

```mermaid
sequenceDiagram
    autonumber
    actor U as User
    participant App as Mobile App
    participant API as NestJS Backend
    participant DB as PostgreSQL
    participant MM as MoMo Gateway

    U->>App: Chọn gói Premium → MoMo
    App->>API: POST /subscriptions<br/>{ plan: "yearly", paymentMethod: "momo" }
    
    API->>DB: INSERT INTO transactions (status='pending')
    DB-->>API: transaction_id
    
    API->>MM: POST /v2/gateway/api/create<br/>(partnerCode, orderId, amount, signature HMAC-SHA256)
    MM-->>API: { payUrl, deeplink, qrCodeUrl }
    
    API->>DB: INSERT INTO payment_momo (transaction_id, order_id)
    API-->>App: 201 { payUrl, deeplink }
    
    App->>App: Mở MoMo app qua deeplink
    U->>MM: Xác nhận thanh toán trong MoMo

    Note over API,MM: === IPN CALLBACK ===
    MM->>API: POST /payments/momo/ipn<br/>(orderId, resultCode, momoTransId, signature)
    
    API->>API: Verify HMAC-SHA256 signature
    
    alt resultCode = 0 (thành công)
        API->>DB: UPDATE transactions SET status = 'success'
        API->>DB: UPDATE payment_momo SET result_code, momo_trans_id, raw_response
        API->>DB: INSERT INTO subscriptions (status='active')
        API-->>MM: 204 OK
    else resultCode != 0
        API->>DB: UPDATE transactions SET status = 'failed'
        API-->>MM: 204 OK
    end
    
    App-->>U: 🎉 Thanh toán MoMo thành công!
```

---

## ACTIVITY DIAGRAMS

---

### AD1 — Luồng User khám phá quán

```mermaid
flowchart TD
    A([🧳 User mở app]) --> B{Đã đăng nhập?}
    
    B -->|Chưa| C[Đăng nhập / Đăng ký]
    C --> D[Chọn ngôn ngữ yêu thích]
    D --> E[Cho phép truy cập GPS]
    
    B -->|Rồi| E
    
    E --> F{GPS khả dụng?}
    
    F -->|Có| G[App lấy tọa độ GPS hiện tại]
    G --> H[Gửi API: GET /stores/nearby]
    H --> I[Hiển thị quán trên bản đồ]
    
    F -->|Không| J[Hiển thị gợi ý: Quét QR Code]
    J --> K[Mở Camera QR Scanner]
    K --> L[Scan mã QR tại quán]
    L --> M{QR hợp lệ?}
    M -->|Có| N[Hiển thị thông tin quán]
    M -->|Không| O[❌ Thông báo lỗi]
    O --> K
    
    I --> P{Khoảng cách < 20m?}
    
    P -->|Chưa| Q[User tiếp tục di chuyển]
    Q --> G
    
    P -->|Có| R[📍 Popup: Bạn đang gần quán XYZ]
    R --> S{User chọn hành động?}
    
    S -->|Nghe thuyết minh| T[GET /narrations?lang=...]
    T --> U{Có narration?}
    U -->|Có theo ngôn ngữ| V[🎵 Phát audio]
    U -->|Không có → Fallback EN| V
    U -->|Không có gì| W[Thông báo: Chưa có thuyết minh]
    
    S -->|Xem menu| X[Hiển thị danh sách món ăn + giá]
    S -->|Xem ảnh| Y[Hiển thị gallery ảnh quán]
    S -->|Bỏ qua| Q
    
    V --> Z[Ghi vào listen_history]
    Z --> AA([✅ Hoàn tất])
    
    N --> T

    style A fill:#4CAF50,color:#fff
    style AA fill:#4CAF50,color:#fff
    style R fill:#FF9800,color:#fff
    style V fill:#2196F3,color:#fff
    style O fill:#f44336,color:#fff
```

---

### AD2 — Luồng Merchant đăng ký & tạo quán

```mermaid
flowchart TD
    A([🍜 Merchant truy cập web]) --> B{Có tài khoản?}
    
    B -->|Chưa| C[Đăng ký tài khoản role=merchant]
    C --> D[Nhập thông tin doanh nghiệp<br/>business_name, tax_code]
    D --> E["merchants.status = 'pending'"]
    E --> F[⏳ Chờ Admin duyệt]
    
    B -->|Có| G[Đăng nhập]
    G --> H{Merchant status?}
    
    H -->|pending| F
    H -->|rejected| I[❌ Xem lý do từ chối]
    I --> J{Muốn đăng ký lại?}
    J -->|Có| D
    J -->|Không| K([Kết thúc])
    
    H -->|approved| L[✅ Vào Merchant Dashboard]
    F -->|Admin Approve| L
    
    L --> M{Chọn chức năng?}
    
    M -->|Tạo quán mới| N[Nhập thông tin quán<br/>Tên, địa chỉ, GPS, ảnh bìa]
    N --> O["stores.status = 'pending'"]
    O --> P[⏳ Chờ Admin duyệt quán]
    P -->|Admin Approve| Q["stores.status = 'active'<br/>✅ Quán live trên app!"]
    
    M -->|Upload Narration| R[Chọn quán → Chọn ngôn ngữ]
    R --> S{Upload audio hay text?}
    S -->|Upload MP3| T[Upload file → Supabase Storage]
    S -->|Nhập text| U[TTS generate audio]
    T --> V[Lưu narrations record]
    U --> V
    
    M -->|Quản lý Menu| W[Thêm / Sửa / Xóa món ăn]
    M -->|Xem Analytics| X[📊 Dashboard thống kê]
    M -->|QR Code| Y[Tạo và tải QR code]
    
    Q --> Z([✅ Merchant setup hoàn tất])

    style A fill:#FF9800,color:#fff
    style L fill:#4CAF50,color:#fff
    style Q fill:#4CAF50,color:#fff
    style I fill:#f44336,color:#fff
    style F fill:#FFC107,color:#333
```

---

### AD3 — Luồng Admin duyệt

```mermaid
flowchart TD
    A([🛡️ Admin đăng nhập]) --> B[Vào Admin Dashboard]
    B --> C{Chọn quản lý?}
    
    C -->|Merchant| D[Xem danh sách<br/>merchants status=pending]
    D --> E[Xem chi tiết:<br/>business_name, tax_code, user info]
    E --> F{Quyết định?}
    
    F -->|Approve| G["UPDATE status = 'approved'"]
    G --> H[✅ Merchant được phép tạo quán]
    
    F -->|Reject| I[Nhập lý do từ chối]
    I --> J["UPDATE status = 'rejected',<br/>reject_reason = '...'"]
    J --> K[❌ Thông báo cho Merchant]
    
    C -->|Store| L[Xem danh sách<br/>stores status=pending]
    L --> M[Kiểm tra: Ảnh, Menu, Narration]
    M --> N{Đầy đủ nội dung?}
    
    N -->|Đủ| O{Nội dung hợp lệ?}
    O -->|Có| P["UPDATE status = 'active'"]
    P --> Q[✅ Quán xuất hiện trên app]
    O -->|Không| R["UPDATE status = 'hidden'"]
    R --> S[Liên hệ Merchant chỉnh sửa]
    
    N -->|Thiếu| S
    
    C -->|Narration| T[Xem tất cả narrations]
    T --> U{Nội dung vi phạm?}
    U -->|Có| V[Delete / Hide narration]
    U -->|Không| W[✅ Giữ nguyên]
    
    C -->|Analytics| X[📊 Xem tổng quan hệ thống<br/>Total Users, Stores, Listens, Revenue]
    
    C -->|Giao dịch| Y[Xem lịch sử transactions<br/>Chi tiết VNPAY/MoMo callback]

    style A fill:#9C27B0,color:#fff
    style Q fill:#4CAF50,color:#fff
    style H fill:#4CAF50,color:#fff
    style K fill:#f44336,color:#fff
    style V fill:#f44336,color:#fff
```

---

### AD4 — Luồng thanh toán tổng quát

```mermaid
flowchart TD
    A([User / Merchant chọn gói]) --> B{Chọn phương thức?}
    
    B -->|VNPAY| C[Gọi API: POST /payments/vnpay/create]
    B -->|MoMo| D[Gọi API: POST /payments/momo/create]
    
    C --> E["Tạo transaction (status='pending')"]
    D --> E
    
    E --> F{Phương thức?}
    
    F -->|VNPAY| G[Tạo URL + vnp_SecureHash SHA-512]
    G --> H[Redirect WebView → VNPAY]
    H --> I[User thanh toán tại VNPAY]
    I --> J[VNPAY gọi IPN callback]
    J --> K{Verify SecureHash?}
    
    F -->|MoMo| L[Tạo request + HMAC-SHA256 signature]
    L --> M[Mở MoMo app via deeplink]
    M --> N[User xác nhận trong MoMo]
    N --> O[MoMo gọi IPN callback]
    O --> P{Verify Signature?}
    
    K -->|Hợp lệ| Q{ResponseCode = 00?}
    K -->|Không hợp lệ| R["❌ status = 'failed'"]
    
    P -->|Hợp lệ| S{resultCode = 0?}
    P -->|Không hợp lệ| R
    
    Q -->|Thành công| T["✅ status = 'success'"]
    Q -->|Thất bại| R
    
    S -->|Thành công| T
    S -->|Thất bại| R
    
    T --> U[Tạo subscription<br/>status=active, start_date, end_date]
    U --> V[🎉 Thông báo thành công cho user]
    
    R --> W[Thông báo thất bại]
    W --> X{Thử lại?}
    X -->|Có| A
    X -->|Không| Y([Kết thúc])
    
    V --> Y

    style A fill:#FF9800,color:#fff
    style T fill:#4CAF50,color:#fff
    style R fill:#f44336,color:#fff
    style V fill:#2196F3,color:#fff
```

---

### AD5 — Luồng Narration Fallback đa ngôn ngữ

```mermaid
flowchart TD
    A([User yêu cầu nghe<br/>narration cho Store X]) --> B["Lấy preferred_language<br/>(vd: Korean 'ko')"]
    
    B --> C{"Có narration<br/>language = 'ko'?"}
    
    C -->|✅ Có| D["Trả về audio tiếng Hàn<br/>audioUrl (ko)"]
    
    C -->|❌ Không| E{"Fallback: Có narration<br/>language = 'en'?"}
    
    E -->|✅ Có| F["Trả về audio tiếng Anh<br/>audioUrl (en) + thông báo fallback"]
    
    E -->|❌ Không| G{"Có narration<br/>language = 'vi'?"}
    
    G -->|✅ Có| H["Trả về audio tiếng Việt<br/>audioUrl (vi) + thông báo fallback"]
    
    G -->|❌ Không| I["❌ Thông báo:<br/>Chưa có thuyết minh cho quán này"]
    
    D --> J[🎵 App phát audio]
    F --> J
    H --> J
    
    J --> K["POST /listen-history<br/>(user_id, store_id, narration_id, source)"]
    K --> L([✅ Ghi lịch sử thành công])
    
    I --> M([User được gợi ý<br/>quét QR hoặc xem menu])

    style A fill:#2196F3,color:#fff
    style D fill:#4CAF50,color:#fff
    style F fill:#FF9800,color:#fff
    style H fill:#FF9800,color:#fff
    style I fill:#f44336,color:#fff
    style J fill:#9C27B0,color:#fff
```

---

## TỔNG HỢP DIAGRAMS

| Loại | Mã | Mô tả | Actor chính |
|------|-----|-------|-------------|
| Sequence | SD1 | Đăng ký & Đăng nhập | User/Merchant |
| Sequence | SD2 | GPS Geofencing tìm quán | User + PostGIS |
| Sequence | SD3 | Nghe Audio Narration | User + Storage |
| Sequence | SD4 | Quét QR Code | User + Camera |
| Sequence | SD5 | Merchant tạo quán + Upload | Merchant |
| Sequence | SD6 | Admin duyệt Merchant/Store | Admin |
| Sequence | SD7 | Thanh toán VNPAY | User + VNPAY |
| Sequence | SD8 | Thanh toán MoMo | User + MoMo |
| Activity | AD1 | Luồng khám phá quán | User |
| Activity | AD2 | Luồng Merchant setup | Merchant |
| Activity | AD3 | Luồng Admin duyệt | Admin |
| Activity | AD4 | Luồng thanh toán tổng quát | User/Merchant |
| Activity | AD5 | Narration fallback đa ngôn ngữ | System |

---

*Tài liệu này được duy trì bởi nhóm phát triển dự án Seminar SGU.*  
*Cập nhật lần cuối: 24/03/2026*

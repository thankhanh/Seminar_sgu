# 📐 SEQUENCE DIAGRAM & ACTIVITY DIAGRAM
# VĨNH KHÁNH DIGITAL AUDIO GUIDE

**Ngày cập nhật:** 18/04/2026  
**Công cụ vẽ:** Mermaid.js

---

## MỤC LỤC

### Sequence Diagrams
1. [SD1 — Đăng ký & Đăng nhập](#sd1--đăng-ký--đăng-nhập)
2. [SD2 — Tìm quán gần đó (GPS + Haversine)](#sd2--tìm-quán-gần-đó-gps--haversine)
3. [SD3 — Nghe Audio Narration](#sd3--nghe-audio-narration)
4. [SD4 — Quét QR Code](#sd4--quét-qr-code)
5. [SD5 — Merchant tạo quán & Upload Narration](#sd5--merchant-tạo-quán--upload-narration)
6. [SD6 — Admin duyệt Merchant](#sd6--admin-duyệt-merchant)
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

    Note over U,DB: === ĐĂNG KÝ (role = user) ===
    U->>App: Nhập email, password, name, role=user
    App->>API: POST /auth/register
    API->>API: Validate input + hash password (bcrypt, 12 rounds)
    API->>DB: INSERT INTO users (email, password_hash, role, is_active=true)
    DB-->>API: User created (uuid)
    API->>API: Generate JWT Access Token (15min) + Refresh Token (7 ngày)
    API->>DB: INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
    DB-->>API: Refresh token saved
    API-->>App: Set HttpOnly Cookie (access_token, refresh_token)
    API-->>App: 201 { user, accessToken, refreshToken }
    App-->>U: Đăng ký thành công!

    Note over U,DB: === ĐĂNG KÝ (role = merchant) ===
    U->>App: Nhập email, password, name, role=merchant, business_name
    App->>API: POST /auth/register
    API->>DB: INSERT INTO users (is_active=false, role=merchant)
    DB-->>API: User created (uuid)
    API->>DB: INSERT INTO merchants (user_id, business_name, status='pending')
    DB-->>API: Merchant created
    API-->>App: 201 { user, message: "Tài khoản đang chờ duyệt" }
    Note right of API: Không có token cho Merchant mới (chờ Admin duyệt)
    App-->>U: ⏳ Tài khoản Merchant đang chờ duyệt!

    Note over U,DB: === ĐĂNG NHẬP ===
    U->>App: Nhập email + password
    App->>API: POST /auth/login
    API->>DB: SELECT * FROM users WHERE email = ?
    DB-->>API: User record
    API->>API: Verify bcrypt(password, hash) + kiểm tra is_active

    alt Password đúng & is_active = true
        API->>API: Generate Access Token + Refresh Token
        API->>DB: INSERT refresh_tokens (giới hạn tối đa 5 sessions/user)
        API-->>App: Set HttpOnly Cookie + 200 { user, accessToken, refreshToken }
        App-->>U: Đăng nhập thành công
    else Password sai hoặc tài khoản chưa kích hoạt
        API-->>App: 401 Unauthorized
        App-->>U: Sai mật khẩu hoặc tài khoản chưa được duyệt!
    end
```

---

### SD2 — Tìm quán gần đó (GPS + Haversine)

```mermaid
sequenceDiagram
    autonumber
    actor U as User
    participant App as Mobile App
    participant GPS as expo-location
    participant API as NestJS Backend
    participant DB as PostgreSQL

    U->>App: Mở app
    App->>GPS: watchPositionAsync() mỗi 15 giây
    GPS-->>App: { lat: 10.7769, lng: 106.7009 }

    Note over App,API: === GPS-BASED NEARBY SEARCH ===
    App->>API: GET /stores/nearby?lat=10.7769&lng=106.7009&radius=5
    API->>DB: SELECT * FROM stores WHERE status = 'active'
    DB-->>API: Danh sách tất cả stores
    API->>API: Lọc bằng Haversine Distance (server-side)
    API->>API: Sắp xếp theo khoảng cách tăng dần
    API-->>App: 200 { data: [{ store, distance_km }] }
    App->>App: Hiển thị markers trên bản đồ

    Note over U,App: === GEOFENCE TRIGGER (<= 100m) ===

    GPS-->>App: { lat: 10.7770, lng: 106.7010 }
    App->>API: GET /nearby?lat=10.7770&lng=106.7010&lang=ko
    API->>DB: SELECT stores active → tìm store trong 100m (Haversine)
    DB-->>API: nearbyStore found

    alt Có store trong 100m
        API->>DB: Tìm narration (storeId, targetLangCode)
        alt Có narration tiếng Hàn (ko) trong DB
            DB-->>API: narration.textContent (ko)
        else Không có → Auto-translate từ bản 'vi'
            API->>DB: Lấy narration gốc (vi)
            DB-->>API: originalNarration.textContent (vi)
            API->>API: Gọi MyMemory API: dịch vi → ko
            API->>DB: Cache bản dịch mới vào narrations table
        end
        API-->>App: 200 { found: true, storeName, textContent, language, distance }
        App->>App: Kiểm tra: đã trigger quán này trong phiên chưa?
        alt Chưa trigger
            App-->>U: 📍 Popup "Bạn đang gần [Tên quán] — Nghe chi tiết?"
        else Đã trigger rồi
            App->>App: Bỏ qua (tránh spam)
        end
    else Không có store trong 100m
        API-->>App: 200 { found: false, message: "Không tìm thấy địa điểm..." }
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
    participant FS as Local Uploads (/uploads)

    U->>App: Nhấn "Nghe thuyết minh" (store_id)
    App->>API: GET /stores/{storeId}/narrations
    API->>DB: SELECT * FROM narrations WHERE store_id = ? AND is_active = true
    DB-->>API: [{ id, audioUrl, textContent, duration, language }]
    API-->>App: 200 [narrations array]

    App->>App: Lọc narration theo preferredLanguage user
    App->>App: Fallback: en → vi nếu không có ngôn ngữ ưa thích

    alt Có audioUrl
        App->>FS: Fetch audio stream từ domain/uploads/...mp3
        FS-->>App: File stream MP3
        App->>App: expo-av: Play MP3 audio
    else Chỉ có textContent
        App->>App: expo-speech: Text-To-Speech từ textContent
    end

    App-->>U: 🎵 Đang phát thuyết minh...
    U->>App: Điều khiển (Pause / Seek / Stop)

    Note over U,DB: === KIỂM TRA GIỚI HẠN & GHI LỊCH SỬ ===

    App->>API: POST /listen/{narrationId}?source=gps
    API->>DB: SELECT subscription WHERE user_id=? AND status='active'
    DB-->>API: subscription (plan: free/monthly/yearly) | null

    alt Gói free → giới hạn 10 lần/ngày
        API->>DB: COUNT listen_history WHERE user_id=? AND date=today
        DB-->>API: count
        alt count >= 10
            API-->>App: 403 "Đã đạt giới hạn 10 lần/ngày. Nâng cấp gói!"
        else count < 10
            API->>DB: INSERT INTO listen_history (user_id, store_id, narration_id, source='gps')
            DB-->>API: OK
            API-->>App: 201 Created
        end
    else Gói monthly → 30 lần/ngày
        API->>DB: INSERT INTO listen_history (nếu count < 30)
        API-->>App: 201 Created
    else Gói yearly → không giới hạn
        API->>DB: INSERT INTO listen_history
        DB-->>API: OK
        API-->>App: 201 Created
    end
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
    Cam-->>App: QR data: deeplink "smarttour://stall/{storeId}?autoplay=1"

    App->>App: Parse deeplink → extract storeId hoặc QR code string
    App->>API: POST /qr/scan/{code}
    Note right of App: Yêu cầu Authorization (JWT)
    API->>DB: SELECT * FROM qr_codes WHERE code=? AND is_active=true
    DB-->>API: qr_code record

    alt QR code hợp lệ
        API->>DB: JOIN stores, narrations, menus, merchant
        DB-->>API: Store info + menus + narrations (theo preferred_language)
        API->>DB: Lấy preferredLanguage của user
        DB-->>API: preferredLang | 'vi'

        API->>DB: Tìm narration (preferredLang) → fallback 'vi'
        DB-->>API: defaultNarration

        alt Có narration
            API->>DB: INSERT INTO listen_history (source='qr')
            DB-->>API: OK
        end

        API-->>App: 200 { storeId, store, narrationId, preferredLanguage, listened }
        App-->>U: Hiển thị thông tin quán
        App->>App: Tự động phát narration theo preferredLanguage
    else QR code không hợp lệ / đã hết hạn
        DB-->>API: Not found
        API-->>App: 404 { error: "QR code không hợp lệ hoặc đã hết hạn" }
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
    participant FS as Local File System (/uploads)

    Note over M,FS: === ĐĂNG KÝ MERCHANT (nếu chưa có) ===
    M->>Web: Đăng nhập với tài khoản user
    Web->>API: POST /merchant/register
    Note right of Web: { businessName, taxCode }
    API->>DB: INSERT INTO merchants (user_id, business_name, tax_code, status='pending')
    DB-->>API: Merchant created
    API-->>Web: 201 { merchant: { id, status: "pending" } }
    Web-->>M: ⏳ Đăng ký Merchant — đang chờ Admin duyệt

    Note over M,FS: === TẠO QUÁN MỚI (sau khi được duyệt) ===
    M->>Web: Nhấn "Create Store"
    M->>Web: Nhập tên, địa chỉ, lat, lng, upload ảnh bìa
    Web->>API: POST /stores (multipart: name, address, lat, lng, coverImage)
    Note right of Web: Bearer JWT (merchant role)
    API->>FS: Lưu file ảnh cục bộ (/uploads/images/...)
    FS-->>API: imageUrl (domain/uploads/...)
    API->>DB: INSERT INTO stores (merchant_id, name, address, lat, lng, cover_image, status='pending')
    DB-->>API: Store created (uuid)
    API-->>Web: 201 { id, status: "pending" }
    Web-->>M: ✅ Quán đã tạo — đang chờ Admin duyệt (status: active)

    Note over M,FS: === UPLOAD NARRATION ===
    M->>Web: Chọn quán → "Add Narration"
    M->>Web: Chọn languageId + Nhập textContent hoặc Upload audio.mp3
    Web->>API: POST /stores/{storeId}/narrations
    Note right of Web: { languageId, audioUrl?, textContent?, duration? }

    alt Upload file audio
        API->>FS: Lưu file audio MP3 (/uploads/audio/...)
        FS-->>API: audioUrl
    end

    API->>DB: INSERT INTO narrations (store_id, language_id, audio_url, text_content, duration)
    Note right of DB: UNIQUE(store_id, language_id)
    DB-->>API: Narration created
    API-->>Web: 201 { narration }
    Web-->>M: ✅ Thuyết minh đã được thêm!

    Note over M,FS: === THÊM MENU ===
    M->>Web: "Add Menu Item"
    M->>Web: Nhập tên món, giá, upload ảnh
    Web->>API: POST (multipart: name, price, description, image)
    API->>FS: Lưu ảnh menu cục bộ
    FS-->>API: imageUrl
    API->>DB: INSERT INTO menus (store_id, name, price, image_url, is_available=true)
    DB-->>API: Menu item created
    API-->>Web: 201 { menu }
    Web-->>M: ✅ Đã thêm món ăn thành công!
```

---

### SD6 — Admin duyệt Merchant

```mermaid
sequenceDiagram
    autonumber
    actor A as Admin
    participant Web as Admin Dashboard
    participant API as NestJS Backend
    participant DB as PostgreSQL

    Note over A,DB: === XEM DANH SÁCH MERCHANT ===
    A->>Web: Vào "Quản lý Merchant"
    Web->>API: GET /admin/merchants?page=1&limit=20
    Note right of Web: Bearer JWT (admin role)
    API->>DB: SELECT * FROM merchants INCLUDE user, _count(stores)
    DB-->>API: [{ id, business_name, tax_code, status, user, store_count }]
    API-->>Web: 200 { data: [...], total, page }
    Web-->>A: Hiển thị danh sách merchant (kèm trạng thái)

    Note over A,DB: === DUYỆT MERCHANT ===
    A->>Web: Xem chi tiết → nhấn "Approve"
    Web->>API: PATCH /admin/merchants/{id}/approve
    API->>DB: UPDATE users SET is_active = true WHERE id = merchant.userId
    API->>DB: UPDATE merchants SET status = 'approved' WHERE id = ?
    API->>DB: INSERT INTO merchant_subscriptions (plan='starter', auto-activated)
    DB-->>API: Updated
    API-->>Web: 200 { id, status: "approved" }
    Web-->>A: ✅ Merchant approved! Gói Starter đã được kích hoạt tự động.

    Note over A,DB: === TỪCHỐI MERCHANT ===
    A->>Web: Nhấn "Reject" + nhập lý do
    Web->>API: PATCH /admin/merchants/{id}/reject
    Note right of Web: { reason: "Thông tin không hợp lệ" }
    API->>DB: UPDATE merchants SET status='rejected', reject_reason='...'
    DB-->>API: Updated
    API-->>Web: 200 { id, status: "rejected", rejectReason }
    Web-->>A: ❌ Merchant rejected

    Note over A,DB: === QUẢN LÝ STORE (qua Stores module) ===
    A->>Web: Vào "Quản lý Store" → xem danh sách pending
    Web->>API: GET /stores?status=pending
    API->>DB: SELECT * FROM stores WHERE status = 'pending'
    DB-->>API: [{ id, name, address, merchant, menus, narrations }]
    API-->>Web: 200 { data: [...] }

    A->>Web: Kiểm tra ảnh, menu, narration → nhấn "Approve"
    Web->>API: PATCH /stores/{id}
    Note right of Web: { status: "active" } — Admin bypass
    API->>DB: UPDATE stores SET status = 'active' WHERE id = ?
    DB-->>API: Updated
    API-->>Web: 200 { message: "Store đã active" }
    Web-->>A: ✅ Quán đã xuất hiện trên app!
```

---

### SD7 — Thanh toán VNPAY

```mermaid
sequenceDiagram
    autonumber
    actor U as User
    participant App as Mobile App / Web
    participant API as NestJS Backend
    participant DB as PostgreSQL
    participant VN as VNPAY Gateway

    U->>App: Chọn gói Premium → VNPAY
    App->>API: POST /payments/create
    Note right of App: { type: "user_monthly", paymentMethod: "vnpay" }

    API->>DB: Tra cứu PlanMetadata (planKey) → lấy amount, name
    DB-->>API: { price: 49000, name: "Gói Monthly" }

    API->>DB: INSERT INTO transactions (user_id, amount, type='user_subscription',<br/>payment_method='vnpay', status='pending', description='...[KEY=user_monthly]')
    DB-->>API: transaction_id

    API->>API: Tạo VNPAY params (vnp_TxnRef, vnp_Amount×100, vnp_ExpireDate 15min)
    API->>API: Ký HMAC-SHA512 → vnp_SecureHash
    API->>DB: INSERT INTO payment_vnpay (transaction_id, vnp_txn_ref, vnp_amount)
    DB-->>API: OK

    API-->>App: 201 { paymentUrl: "https://sandbox.vnpay.vn/...", transactionId }
    App->>App: Mở WebView → redirect đến VNPAY

    U->>VN: Chọn ngân hàng + xác nhận thanh toán
    VN-->>App: Redirect về vnp_ReturnUrl?vnp_ResponseCode=00

    Note over App,VN: === RETURN URL CALLBACK (Client-side) ===
    App->>API: GET /payments/status?transactionId={id}
    API->>DB: SELECT status FROM transactions WHERE id=?
    DB-->>API: { status: "pending" | "success" | "failed" }

    Note over API,VN: === VNPAY RETURN URL XỬ LÝ (Server) ===
    VN->>API: GET /payments/vnpay/return (query: vnp_TxnRef, vnp_ResponseCode, vnp_SecureHash)
    API->>API: Verify vnp_SecureHash (HMAC-SHA512)

    alt Hash hợp lệ + ResponseCode = "00"
        API->>DB: UPDATE payment_vnpay SET vnp_response_code, vnp_bank_code, raw_response
        API->>DB: UPDATE transactions SET status = 'success', payment_ref_id
        API->>API: handlePostPayment → tạo subscription/merchant plan
        API->>DB: INSERT INTO subscriptions (user_id, plan, start_date, end_date, status='active')
        API-->>App: { success: true, responseCode: "00", transactionId }
    else Hash không hợp lệ hoặc ResponseCode != "00"
        API->>DB: UPDATE transactions SET status = 'failed'
        API-->>App: { success: false, responseCode }
    end

    App-->>U: 🎉 Thanh toán thành công! Premium đã kích hoạt
```

---

### SD8 — Thanh toán MoMo

```mermaid
sequenceDiagram
    autonumber
    actor U as User
    participant App as Mobile App / Web
    participant API as NestJS Backend
    participant DB as PostgreSQL
    participant MM as MoMo Gateway

    U->>App: Chọn gói Premium → MoMo
    App->>API: POST /payments/create
    Note right of App: { type: "user_yearly", paymentMethod: "momo" }

    API->>DB: Tra cứu PlanMetadata → lấy amount
    DB-->>API: { price: 399000 }

    API->>DB: INSERT INTO transactions (status='pending', payment_method='momo', description='...[KEY=user_yearly]')
    DB-->>API: transaction_id

    API->>API: Tạo orderId="VK-{txId}-{timestamp}", requestId, requestType="captureWallet"
    API->>API: rawSignature = "accessKey=...&amount=...&...&requestType=captureWallet"
    API->>API: signature = HMAC-SHA256(rawSignature, MOMO_SECRET_KEY)

    API->>MM: POST /v2/gateway/api/create (partnerCode, orderId, amount, signature...)
    MM-->>API: { resultCode: 0, payUrl, deeplink, qrCodeUrl }

    API->>DB: INSERT INTO payment_momo (transaction_id, order_id, request_id, amount, signature)
    DB-->>API: OK
    API-->>App: 201 { paymentUrl, deeplink, qrCodeUrl, transactionId, orderId }

    App->>App: Mở MoMo app qua deeplink / WebView qua payUrl
    U->>MM: Xác nhận thanh toán trong MoMo

    Note over App,API: === POLLING TRẠNG THÁI ===
    App->>API: GET /payments/status?transactionId={id}
    API->>DB: SELECT status FROM transactions
    DB-->>API: { status: "pending" }

    Note over API,MM: === IPN CALLBACK (Server-to-Server) ===
    MM->>API: POST /payments/momo/ipn (orderId, resultCode, transId, signature, ...)
    API->>API: Build rawSignature từ các fields, verify HMAC-SHA256

    alt resultCode = 0 (thành công)
        API->>DB: UPDATE payment_momo SET momo_trans_id, result_code, pay_type, raw_response
        API->>DB: UPDATE transactions SET status = 'success', payment_ref_id = transId
        API->>API: handlePostPayment → kích hoạt subscription/merchant plan
        API->>DB: INSERT INTO subscriptions (status='active', plan, start/end date)
        API-->>MM: 200 { message: "IPN processed" }
    else resultCode != 0 (thất bại)
        API->>DB: UPDATE transactions SET status = 'failed'
        API-->>MM: 200 { message: "IPN processed" }
    end

    App->>API: GET /payments/status?transactionId={id}
    API-->>App: { status: "success" }
    App-->>U: 🎉 Thanh toán MoMo thành công! Gói đã kích hoạt.
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
    G --> H["GET /stores/nearby?lat=...&lng=...&radius=5"]
    H --> I[API: Haversine filter server-side]
    I --> J[Hiển thị quán trên bản đồ]

    F -->|Không| K[Hiển thị gợi ý: Quét QR Code]
    K --> L[Mở Camera QR Scanner]
    L --> M[Scan mã QR tại quán]
    M --> N{QR hợp lệ?}
    N -->|Có| O["POST /qr/scan/{code} → trả về store + narration"]
    N -->|Không| P[❌ Thông báo lỗi]
    P --> L

    J --> Q{"Khoảng cách <= 100m?"}

    Q -->|Chưa| R[User tiếp tục di chuyển]
    R --> G

    Q -->|Có| S["GET /nearby?lat=...&lng=...&lang={preferredLang}"]
    S --> T{Có narration?}
    T -->|Có (cached)| U[Trả về textContent đã dịch]
    T -->|Không có → Auto-translate vi→lang| V[MyMemory API dịch → cache vào DB]
    V --> U
    T -->|Không có bản gốc vi| W[❌ Thông báo: Chưa có thuyết minh]

    U --> X[📍 Popup "Bạn đang gần [Tên quán]"]
    X --> Y{User chọn hành động?}

    Y -->|Nghe thuyết minh| Z["GET /stores/{storeId}/narrations"]
    Z --> AA{Có audioUrl?}
    AA -->|Có| AB[expo-av: Play MP3]
    AA -->|Chỉ text| AC[expo-speech: Text-To-Speech]
    AB --> AD["POST /listen/{narrationId}?source=gps"]
    AC --> AD
    AD --> AE[Kiểm tra subscription limit: free=10, monthly=30, yearly=∞]
    AE --> AF([✅ Ghi lịch sử | 403 Hết giới hạn])

    Y -->|Xem menu| AG["GET /stores/{storeId} → menus"]
    AG --> AH[Hiển thị danh sách món ăn + giá]
    Y -->|Bỏ qua| R

    O --> Z

    style A fill:#4CAF50,color:#fff
    style AF fill:#4CAF50,color:#fff
    style X fill:#FF9800,color:#fff
    style AB fill:#2196F3,color:#fff
    style P fill:#f44336,color:#fff
    style W fill:#f44336,color:#fff
```

---

### AD2 — Luồng Merchant đăng ký & tạo quán

```mermaid
flowchart TD
    A([🍜 Merchant truy cập web]) --> B{Có tài khoản user?}

    B -->|Chưa| C[Đăng ký tài khoản role=user]
    C --> REG[Đăng nhập vào dashboard]
    REG --> D

    B -->|Có| D["POST /merchant/register (businessName, taxCode)"]
    D --> E["merchants.status = 'pending', users.is_active = false"]
    E --> F[⏳ Chờ Admin duyệt]

    F -->|Admin Approve| G["merchants.status='approved'\nusers.is_active=true\nmarchant_subscriptions: plan='starter'"]
    G --> H[✅ Vào Merchant Dashboard]

    F -->|Admin Reject| I[❌ Xem lý do từ chối: rejectReason]
    I --> J{Muốn đăng ký lại?}
    J -->|Có| D
    J -->|Không| K([Kết thúc])

    H --> L{Chọn chức năng?}

    L -->|Tạo quán mới| M[Nhập thông tin quán: Tên, địa chỉ, GPS, ảnh bìa]
    M --> N["POST /stores (multipart)"]
    N --> O["stores.status = 'pending'"]
    O --> P[⏳ Chờ Admin duyệt quán]
    P -->|Admin PATCH /stores/{id} → active| Q["✅ stores.status = 'active'\nQuán live trên app!"]

    L -->|Upload Narration| R["POST /stores/{storeId}/narrations"]
    R --> S{Upload audio hay text?}
    S -->|Upload MP3| T[Lưu vào /uploads/audio/ (Local FS)]
    S -->|Nhập text| U[textContent lưu vào DB, TTS do client đọc]
    T --> V[Lưu narrations record (UNIQUE: store_id + language_id)]
    U --> V

    L -->|Quản lý Menu| W[Thêm / Sửa / Xóa món ăn]
    L -->|Xem Analytics| X[Xem listen_history của quán mình]
    L -->|QR Code| Y["POST /qr/store/{storeId} → Tạo QR mới (vô hiệu hóa QR cũ)"]

    Q --> Z([✅ Merchant setup hoàn tất])

    style A fill:#FF9800,color:#fff
    style H fill:#4CAF50,color:#fff
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

    C -->|Merchant| D["GET /admin/merchants (page, limit)"]
    D --> E[Xem danh sách: business_name, tax_code, status, số quán]
    E --> F{Quyết định?}

    F -->|Approve| G["PATCH /admin/merchants/{id}/approve"]
    G --> H["UPDATE users.is_active=true\nUPDATE merchants.status='approved'\nINSERT merchant_subscriptions (starter)"]
    H --> I[✅ Merchant được kích hoạt + auto gói Starter]

    F -->|Reject| J["PATCH /admin/merchants/{id}/reject { reason }"]
    J --> K["UPDATE merchants.status='rejected', reject_reason='...'"]
    K --> L[❌ Thông báo cho Merchant]

    C -->|Store| M["GET /stores?status=pending"]
    M --> N[Kiểm tra: Ảnh, Menu, Narration]
    N --> O{Nội dung đầy đủ?}

    O -->|Đủ & Hợp lệ| P["PATCH /stores/{id} { status: 'active' }"]
    P --> Q[✅ Quán xuất hiện trên app]

    O -->|Thiếu hoặc vi phạm| R["PATCH /stores/{id} { status: 'hidden' }"]
    R --> S[Liên hệ Merchant chỉnh sửa]

    C -->|Toggle User| T["PATCH /admin/users/{id}/toggle-active"]
    T --> U[Bật/tắt tài khoản user]

    C -->|Analytics| V["GET /admin/stats"]
    V --> W[📊 userCount, merchantCount, storeCount, totalRevenue, monthlyRevenue chart, topPOI, topMerchant, topClient]

    C -->|Giao dịch| X["GET /payments/history (admin view)"]
    X --> Y[Xem lịch sử transactions: MoMo / VNPAY detail, status]

    style A fill:#9C27B0,color:#fff
    style Q fill:#4CAF50,color:#fff
    style I fill:#4CAF50,color:#fff
    style L fill:#f44336,color:#fff
    style R fill:#f44336,color:#fff
```

---

### AD4 — Luồng thanh toán tổng quát

```mermaid
flowchart TD
    A([User / Merchant chọn gói]) --> B["POST /payments/create { type, paymentMethod }"]
    B --> C[Tra cứu PlanMetadata để lấy price]
    C --> D["INSERT INTO transactions (status='pending')"]

    D --> E{paymentMethod?}

    E -->|vnpay| F[Tạo VNPAY params + HMAC-SHA512 vnp_SecureHash]
    F --> G[INSERT payment_vnpay]
    G --> H[Trả về paymentUrl → WebView redirect]
    H --> I[User thanh toán tại VNPAY]
    I --> J["VNPAY redirect về /payments/vnpay/return"]
    J --> K{Verify vnp_SecureHash?}

    E -->|momo| L[Tạo MoMo request + HMAC-SHA256 signature]
    L --> M[INSERT payment_momo]
    M --> N[POST tới MoMo API /v2/gateway/api/create]
    N --> O[Trả về payUrl/deeplink → Mở MoMo app]
    O --> P[User xác nhận trong MoMo]
    P --> Q["MoMo gọi POST /payments/momo/ipn"]
    Q --> R{Verify HMAC-SHA256 Signature?}

    K -->|Hợp lệ| S{vnp_ResponseCode = "00"?}
    K -->|Không hợp lệ| T["❌ status = 'failed'"]

    R -->|Hợp lệ| U{resultCode = 0?}
    R -->|Không hợp lệ| T

    S -->|Thành công| V["✅ status = 'success'"]
    S -->|Thất bại| T

    U -->|Thành công| V
    U -->|Thất bại| T

    V --> W[handlePostPayment]
    W --> X{Transaction type?}
    X -->|user_subscription| Y["INSERT INTO subscriptions (plan, start_date, end_date, status='active')"]
    X -->|merchant_subscription| Z["merchantSubscriptionsService.activatePlan(merchant, plan)"]

    Y --> AA[🎉 Thông báo thành công cho user]
    Z --> AA

    T --> AB[Thông báo thất bại]
    AB --> AC{Thử lại?}
    AC -->|Có| A
    AC -->|Không| AD([Kết thúc])

    AA --> AD

    style A fill:#FF9800,color:#fff
    style V fill:#4CAF50,color:#fff
    style T fill:#f44336,color:#fff
    style AA fill:#2196F3,color:#fff
```

---

### AD5 — Luồng Narration Fallback đa ngôn ngữ

```mermaid
flowchart TD
    A(["User yêu cầu nghe<br/>narration gần vị trí GPS"]) --> B["GET /nearby?lat=...&lng=...&lang={preferredLang}"]

    B --> C["Tìm store active trong 100m (Haversine)"]

    C --> D{Có store trong 100m?}
    D -->|Không| E(["Không tìm thấy địa điểm<br/>trong phạm vi 100m"])

    D -->|Có| F["Tra cứu Language bằng code (vd: 'ko')"]
    F --> G{Language code hợp lệ?}
    G -->|Không| H(["Hệ thống chưa hỗ trợ<br/>ngôn ngữ này"])

    G -->|Có| I{"Đã có narration<br/>UNIQUE(storeId, languageId) trong DB?"}

    I -->|✅ Cache hit| J["Trả về textContent đã có sẵn (cached)"]

    I -->|❌ Cache miss| K["Lấy narration gốc (vi) từ DB"]
    K --> L{Có bản gốc vi?}

    L -->|✅ Có| M["Gọi MyMemory API: dịch vi → targetLang"]
    M --> N["INSERT INTO narrations (storeId, languageId, textContent)<br/>→ Cache vào DB để dùng lại"]
    N --> J

    L -->|❌ Không có| O(["Địa điểm chưa có nội dung<br/>thuyết minh gốc (Tiếng Việt)"])

    J --> P["Response: { found: true, storeName, textContent, language, distance }"]
    P --> Q[App nhận textContent → expo-speech TTS đọc]
    Q --> R["POST /listen/{narrationId}?source=gps → ghi listen_history"]
    R --> S([✅ Ghi lịch sử thành công])

    O --> T(["User được gợi ý<br/>quét QR hoặc xem menu"])
    E --> T

    style A fill:#2196F3,color:#fff
    style J fill:#4CAF50,color:#fff
    style N fill:#4CAF50,color:#fff
    style S fill:#4CAF50,color:#fff
    style O fill:#f44336,color:#fff
    style H fill:#f44336,color:#fff
    style Q fill:#9C27B0,color:#fff
```

---

## TỔNG HỢP DIAGRAMS

| Loại | Mã | Mô tả | Actor chính |
|------|-----|-------|-------------|
| Sequence | SD1 | Đăng ký & Đăng nhập (JWT + Cookie) | User/Merchant |
| Sequence | SD2 | GPS Geofencing + Haversine + Auto-translate | User + API |
| Sequence | SD3 | Nghe Audio Narration + Subscription Limit | User + Storage |
| Sequence | SD4 | Quét QR Code + Auto Listen History | User + Camera |
| Sequence | SD5 | Merchant tạo quán + Upload Narration/Menu | Merchant |
| Sequence | SD6 | Admin duyệt Merchant + Auto Starter Plan | Admin |
| Sequence | SD7 | Thanh toán VNPAY + Return URL Verification | User + VNPAY |
| Sequence | SD8 | Thanh toán MoMo + IPN Callback + Polling | User + MoMo |
| Activity | AD1 | Luồng khám phá quán (GPS + QR) | User |
| Activity | AD2 | Luồng Merchant setup (register → store → narration) | Merchant |
| Activity | AD3 | Luồng Admin duyệt + Stats dashboard | Admin |
| Activity | AD4 | Luồng thanh toán tổng quát (VNPAY + MoMo) | User/Merchant |
| Activity | AD5 | Narration fallback + Auto-translate + Cache | System |

---

*Tài liệu này được duy trì bởi nhóm phát triển dự án Seminar SGU.*  
*Cập nhật lần cuối: 18/04/2026*

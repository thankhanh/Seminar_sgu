# 📐 Diagrams — Vĩnh Khánh Audio Guide

> Tất cả sơ đồ sử dụng **Mermaid.js** — render được trực tiếp trên GitHub, GitLab, Notion, VSCode.

---

## 📊 ERD — Entity Relationship Diagram

```mermaid
erDiagram
    User {
        string id PK
        string name
        string email UK
        string passwordHash
        string phone
        UserRole role
        string preferredLanguage
        string avatarUrl
        boolean isActive
        boolean isOnline
        datetime createdAt
        datetime updatedAt
    }

    Merchant {
        string id PK
        string userId FK
        string businessName
        string taxCode
        MerchantStatus status
        string rejectReason
        datetime createdAt
    }

    Store {
        string id PK
        string merchantId FK
        string name
        string description
        string address
        float lat
        float lng
        string openTime
        string closeTime
        string coverImage
        StoreStatus status
        datetime createdAt
        datetime updatedAt
    }

    StoreImage {
        string id PK
        string storeId FK
        string imageUrl
        int sortOrder
        datetime createdAt
    }

    Menu {
        string id PK
        string storeId FK
        string name
        string description
        decimal price
        string imageUrl
        boolean isAvailable
        datetime createdAt
    }

    Language {
        string id PK
        string code UK
        string name
        string flagIcon
        boolean isActive
    }

    Narration {
        string id PK
        string storeId FK
        string languageId FK
        string audioUrl
        string textContent
        int duration
        boolean isActive
        datetime createdAt
    }

    ListenHistory {
        string id PK
        string userId FK
        string storeId FK
        string narrationId FK
        ListenSource source
        datetime listenedAt
    }

    QrCode {
        string id PK
        string storeId FK
        string code UK
        string qrImageUrl
        boolean isActive
        datetime createdAt
    }

    Subscription {
        string id PK
        string userId FK
        SubscriptionPlan plan
        date startDate
        date endDate
        SubscriptionStatus status
        datetime createdAt
    }

    MerchantSubscription {
        string id PK
        string merchantId FK
        MerchantPlan plan
        int maxStore
        int maxPOI
        date startDate
        date endDate
        SubscriptionStatus status
        datetime createdAt
    }

    PlanMetadata {
        string planKey PK
        string name
        string description
        decimal price
        int maxStore
        int maxPOI
        json features
        datetime createdAt
        datetime updatedAt
    }

    Transaction {
        string id PK
        string userId FK
        decimal amount
        string currency
        TransactionType type
        PaymentMethod paymentMethod
        string paymentRefId
        TransactionStatus status
        string description
        string planKey
        datetime createdAt
        datetime updatedAt
    }

    PaymentVnpay {
        string id PK
        string transactionId FK
        string vnpTxnRef UK
        bigint vnpAmount
        string vnpOrderInfo
        string vnpResponseCode
        string vnpTransactionNo
        string vnpBankCode
        string vnpPayDate
        string vnpSecureHash
        json rawResponse
        datetime createdAt
    }

    PaymentMomo {
        string id PK
        string transactionId FK
        string orderId UK
        string requestId
        bigint amount
        string orderInfo
        string momoTransId
        int resultCode
        string message
        string payType
        string signature
        json rawResponse
        datetime createdAt
    }

    RefreshToken {
        string id PK
        string userId FK
        string tokenHash UK
        datetime expiresAt
        datetime createdAt
    }

    User ||--o{ RefreshToken : "has"
    User ||--o| Merchant : "registers as"
    User ||--o{ Subscription : "subscribes"
    User ||--o{ Transaction : "makes"
    User ||--o{ ListenHistory : "listens"
    Merchant ||--o{ Store : "owns"
    Merchant ||--o{ MerchantSubscription : "subscribes"
    Store ||--o{ StoreImage : "has"
    Store ||--o{ Menu : "contains"
    Store ||--o{ Narration : "has"
    Store ||--o{ QrCode : "generates"
    Store ||--o{ ListenHistory : "recorded in"
    Language ||--o{ Narration : "used in"
    Narration ||--o{ ListenHistory : "referenced in"
    Transaction ||--o| PaymentVnpay : "detail"
    Transaction ||--o| PaymentMomo : "detail"
```

---

## 🔄 Sequence Diagrams

### SEQ-01: Đăng ký và Đăng nhập (User)

```mermaid
sequenceDiagram
    actor U as User (Mobile)
    participant API as Backend API (NestJS)
    participant DB as PostgreSQL

    U->>API: POST /api/v1/auth/register {name, email, password, role:"user"}
    API->>DB: findUnique(email) — kiểm tra trùng
    DB-->>API: null (không trùng)
    API->>API: bcrypt.hash(password, 12)
    API->>DB: user.create({...passwordHash, isActive:true})
    DB-->>API: User record
    API->>API: generateTokens(userId, email, "user")
    API->>DB: refreshToken.create({userId, tokenHash, expiresAt})
    API-->>U: {user, accessToken, refreshToken}

    Note over U,API: Sau 15 phút access token hết hạn

    U->>API: POST /api/v1/auth/refresh {refreshToken}
    API->>API: jwtService.verify(token, REFRESH_SECRET)
    API->>DB: refreshToken.findMany({userId, expiresAt > now})
    DB-->>API: [stored tokens]
    API->>API: bcrypt.compare(token, storedHash) — tìm match
    API->>DB: refreshToken.delete(matched.id) — token rotation
    API->>API: generateTokens() — cấp cặp mới
    API->>DB: refreshToken.create(newHash)
    API-->>U: {accessToken, refreshToken}
```

---

### SEQ-02: Đăng ký Merchant (Chờ duyệt)

```mermaid
sequenceDiagram
    actor M as Merchant (Web)
    participant API as Backend API
    participant DB as PostgreSQL
    actor A as Admin (Web)

    M->>API: POST /api/v1/auth/register {role:"merchant", businessName, taxCode}
    API->>DB: user.create({isActive:false, role:"merchant"})
    API->>DB: merchant.create({userId, businessName, status:"pending"})
    API-->>M: {user, message:"Tài khoản đang chờ duyệt..."}
    Note over M: Merchant KHÔNG nhận được token → chưa đăng nhập được

    A->>API: GET /api/v1/admin/merchants (xem danh sách pending)
    API->>DB: merchant.findMany()
    DB-->>API: [{merchant, user, _count:{stores}}]
    API-->>A: Danh sách merchants

    A->>API: PATCH /api/v1/admin/merchants/:id/approve
    API->>DB: user.update({isActive:true})
    API->>DB: merchant.update({status:"approved"})
    API->>DB: merchantSubscription.create(plan:"starter", maxPOI:1, ...)
    Note over API: Tự động kích hoạt gói Starter miễn phí
    API-->>A: merchant {status:"approved"}

    M->>API: POST /api/v1/auth/login {email, password}
    API->>DB: user.findUnique({email}) — isActive:true ✓
    API->>DB: user.update({isOnline:true})
    API->>API: generateTokens()
    API-->>M: {user, accessToken, refreshToken}
```

---

### SEQ-03: GPS Geofencing → Auto-Narration (Mobile App)

```mermaid
sequenceDiagram
    actor U as User (Mobile)
    participant GPS as expo-location
    participant App as Map Screen
    participant API as Backend API
    participant TTS as expo-speech
    participant DB as PostgreSQL

    U->>App: Mở màn hình Map
    App->>API: GET /api/v1/stores (lấy danh sách stores active)
    API->>DB: store.findMany({status:"active"})
    DB-->>API: [{store với lat/lng}]
    API-->>App: {data: [stores]}
    App->>App: Hiển thị markers trên bản đồ

    loop Mỗi 10m di chuyển
        GPS->>App: watchPositionAsync → {lat, lng}
        App->>App: checkProximity(lat, lng)
        App->>App: Haversine distance tất cả stores
        alt distance <= 50m
            App->>App: proximityQueue.push(store)
            App->>U: ProximityAlert popup (tên quán, ảnh)
            U->>App: Xác nhận → router.push("/stall/{id}")
            App->>API: GET /api/v1/narrations/store/:storeId
            API->>DB: narration.findMany({storeId, isActive:true})
            DB-->>API: [{narration, language}]
            API-->>App: Danh sách narrations
            App->>App: Tìm narration theo selectedLanguage
            alt Có bản dịch sẵn
                App->>API: POST /api/v1/narrations/:id/listen {source:"gps"}
                API->>DB: listenHistory.create()
                App->>TTS: Speech.speak(textContent, {language:"vi-VN"})
            else Chưa có bản dịch
                App->>API: POST /api/v1/languages/translate
                API->>API: MyMemory API translate(vi → targetLang)
                API->>DB: narration.upsert({storeId, languageId, textContent})
                Note over API,DB: Cache bản dịch để lần sau dùng lại
                API-->>App: {translatedText}
                App->>TTS: Speech.speak(translatedText)
            end
        end
    end
```

---

### SEQ-04: QR Scanner → Narration

```mermaid
sequenceDiagram
    actor U as User (Mobile)
    participant App as QR Scanner Screen
    participant API as Backend API
    participant DB as PostgreSQL
    participant TTS as expo-speech

    U->>App: Mở QR Scanner
    App->>U: Kích hoạt camera
    U->>App: Scan QR code tại quán
    App->>App: Decode QR → deeplink "smarttour://stall/{storeId}?autoplay=1"

    App->>API: POST /api/v1/qr/scan {code}
    API->>DB: qrCode.findUnique({code}) include store+narrations
    API->>DB: user.findUnique({id}) → preferredLanguage
    API->>DB: Tìm narration theo preferredLanguage
    alt Có narration matching
        API->>DB: listenHistory.create({source:"qr"})
    else Fallback về "vi"
        API->>DB: Lấy narration tiếng Việt
        API->>DB: listenHistory.create({source:"qr"})
    end
    API-->>App: {storeId, store, narrationId, preferredLanguage}

    App->>App: router.push("/stall/{storeId}")
    App->>TTS: Speech.speak(narration.textContent, {language})
    App->>U: Phát thuyết minh + hiện thông tin quán
```

---

### SEQ-05: Upload Narration + Auto-Translate (Merchant)

```mermaid
sequenceDiagram
    actor M as Merchant (Web Dashboard)
    participant API as Backend API
    participant DB as PostgreSQL
    participant Trans as MyMemory Translate API

    M->>API: POST /api/v1/upload (multipart: audio file)
    API->>API: multer diskStorage → /uploads/{timestamp}.mp3
    API-->>M: {url:"/uploads/filename.mp3"}

    M->>API: POST /api/v1/narrations/stores/:storeId {languageId, audioUrl, textContent}
    API->>DB: merchant.findUnique({userId}) — verify ownership
    API->>DB: narration.upsert({storeId, languageId, audioUrl, textContent})
    DB-->>API: narration record

    alt textContent là tiếng Việt (vi)
        API->>DB: language.findMany({isActive:true, code:{not:"vi"}})
        DB-->>API: [en, ko, ja, zh, fr, ...]
        loop Mỗi ngôn ngữ active
            API->>Trans: GET mymemory.translated.net?q=text&langpair=vi|en
            Trans-->>API: {translatedText}
            API->>DB: narration.upsert({storeId, languageId, textContent:translated})
            Note over API,DB: Cache tự động — user sau không cần dịch lại
        end
    end

    API-->>M: {narration (bao gồm language info)}
```

---

### SEQ-06: Thanh toán VNPAY (User mua gói Premium)

```mermaid
sequenceDiagram
    actor U as User (Mobile/Web)
    participant API as Backend API
    participant VNPAY as VNPAY Gateway
    participant DB as PostgreSQL

    U->>API: POST /api/v1/payments/vnpay/create {type:"user_monthly"}
    API->>DB: planMetadata.findUnique({planKey:"user_monthly"}) → amount
    API->>DB: transaction.create({userId, amount, type:"user_subscription", status:"pending"})
    API->>DB: paymentVnpay.create({transactionId, vnpTxnRef, vnpAmount})
    API->>API: Build VNPAY params, sort, HMAC-SHA512 sign
    API-->>U: {paymentUrl, transactionId}

    U->>VNPAY: Redirect đến paymentUrl (webview)
    U->>VNPAY: Nhập thông tin ngân hàng, xác nhận
    VNPAY->>API: GET /api/v1/payments/vnpay/return?vnp_ResponseCode=00&vnp_SecureHash=...
    API->>API: Verify HMAC-SHA512 chữ ký
    API->>DB: paymentVnpay.update({vnpResponseCode, vnpTransactionNo, rawResponse})
    API->>DB: transaction.update({status:"success"})
    API->>API: handlePostPayment(transactionId)
    API->>DB: Lấy planKey từ description [KEY=user_monthly]
    API->>DB: subscription.create({userId, plan:"monthly", startDate, endDate: +1 month})
    API-->>U: {success:true, transactionId}
```

---

### SEQ-07: Thanh toán MoMo (Merchant mua gói Business)

```mermaid
sequenceDiagram
    actor M as Merchant (Web)
    participant API as Backend API
    participant MOMO as MoMo Gateway
    participant DB as PostgreSQL

    M->>API: POST /api/v1/payments/momo/create {type:"merchant_business"}
    API->>DB: planMetadata.findUnique({planKey:"merchant_business"}) → amount
    API->>DB: transaction.create({status:"pending", type:"merchant_subscription"})
    API->>DB: paymentMomo.create({transactionId, orderId, requestId, signature})
    API->>MOMO: POST v2/gateway/api/create {captureWallet, HMAC-SHA256}
    MOMO-->>API: {payUrl, deeplink, qrCodeUrl}
    API-->>M: {paymentUrl, deeplink, qrCodeUrl, transactionId}

    M->>MOMO: Mở app MoMo (deeplink) hoặc webview
    M->>MOMO: Xác nhận thanh toán trong MoMo app
    MOMO->>API: POST /api/v1/payments/momo/ipn {orderId, resultCode:0, signature}
    API->>API: Verify HMAC-SHA256 chữ ký IPN
    API->>DB: paymentMomo.update({momoTransId, resultCode, rawResponse})
    API->>DB: transaction.update({status:"success"})
    API->>API: handlePostPayment(transactionId)
    API->>DB: merchant.findUnique({userId}) → merchantId
    API->>DB: merchantSubscription.create({merchantId, plan:"business", maxPOI:5})
    API-->>MOMO: {message:"IPN processed"}
```

---

### SEQ-08: Admin Dashboard — System Stats

```mermaid
sequenceDiagram
    actor A as Admin (Web)
    participant API as Backend API
    participant DB as PostgreSQL

    A->>API: GET /api/v1/admin/stats
    par Parallel queries
        API->>DB: user.count({role:"user"})
        API->>DB: user.count({isOnline:true, role:"user"})
        API->>DB: merchant.count()
        API->>DB: merchant.count({status:"pending"})
        API->>DB: store.count()
        API->>DB: store.count({status:"active"})
        API->>DB: transaction.count({status:"success"})
        API->>DB: transaction.aggregate({sum:amount, status:"success"})
    end

    loop 12 tháng gần nhất
        API->>DB: transaction.aggregate({sum, createdAt: month range})
    end

    API->>DB: listenHistory.groupBy(storeId) → Top POI tháng này
    API->>DB: merchant.findFirst(orderBy:stores.count desc) → Top Merchant
    API->>DB: listenHistory.groupBy(userId) → Top Client tháng này

    API->>API: Tính growth % (current vs before-this-month)
    API-->>A: {userCount, merchantCount, storeCount, totalRevenue, monthlyRevenue[12], topPOI, topMerchant, topClient, growth%}
```

---

### SEQ-09: Merchant — Tạo Store (với giới hạn POI theo gói)

```mermaid
sequenceDiagram
    actor M as Merchant (Web)
    participant API as Backend API
    participant DB as PostgreSQL

    M->>API: POST /api/v1/stores {name, address, lat, lng, ...}
    API->>DB: merchant.findUnique({userId}) → merchantId
    par Check limits
        API->>DB: store.count({merchantId})
        API->>DB: merchantSubscription.findFirst({merchantId, status:"active"})
    end
    API->>DB: planMetadata.findByKey("merchant_{plan}") → maxPOI
    alt currentCount >= maxPOI
        API-->>M: 403 ForbiddenException "Đã đạt giới hạn {maxPOI} POI. Nâng cấp gói!"
    else Còn quota
        API->>DB: store.create({merchantId, status:"pending", ...})
        Note over API,DB: Store mới luôn ở trạng thái pending → đợi Admin duyệt
        API-->>M: {store record, status:"pending"}
    end
```

---

### SEQ-10: Logout và Revoke Token

```mermaid
sequenceDiagram
    actor U as User
    participant API as Backend API
    participant DB as PostgreSQL

    U->>API: POST /api/v1/auth/logout {refreshToken} (header: Bearer accessToken)
    API->>API: jwtService.decode(accessToken) → userId
    API->>DB: refreshToken.findMany({expiresAt > now}, take:100)
    loop Tìm match
        API->>API: bcrypt.compare(refreshToken, storedHash)
    end
    API->>DB: refreshToken.delete({id:matched.id})
    API->>DB: user.update({isOnline:false})
    API-->>U: 200 OK

    Note over U,API: Nếu refresh token đã bị sử dụng (reuse attack)
    U->>API: POST /api/v1/auth/refresh {stolen_used_token}
    API->>DB: refreshToken.findMany({userId})
    API->>API: Không tìm thấy match → SECURITY ALERT
    API->>DB: refreshToken.deleteMany({userId}) — Revoke TẤT CẢ session
    API-->>U: 401 "Refresh token không hợp lệ — tất cả phiên đã bị thu hồi"
```

---

## 📊 Activity Diagrams

### ACT-01: Luồng nghe thuyết minh theo GPS

```mermaid
flowchart TD
    A([App mở Map Screen]) --> B[Fetch danh sách stores active]
    B --> C[Hiển thị markers trên bản đồ]
    C --> D{GPS Permission?}
    D -->|Từ chối| E[Hiện thông báo yêu cầu quyền]
    D -->|Cấp phép| F[watchPositionAsync mỗi 10m]
    F --> G[checkProximity với tất cả stores]
    G --> H{distance <= 50m?}
    H -->|Không| F
    H -->|Có| I{Store đã dismiss?}
    I -->|Có| F
    I -->|Chưa| J[Hiện ProximityAlert popup]
    J --> K{User chọn?}
    K -->|Bỏ qua| L[Thêm vào dismissedSet]
    L --> M{Còn store khác trong queue?}
    M -->|Có| J
    M -->|Không| F
    K -->|Xem chi tiết| N[Navigate /stall/id]
    N --> O[Fetch narrations của store]
    O --> P{Có narration theo ngôn ngữ đã chọn?}
    P -->|Có| Q[Speech.speak textContent]
    P -->|Không - có source VI| R[Gọi translate API]
    R --> S[Upsert narration mới vào DB]
    S --> Q
    P -->|Không có gì| T[Hiện thông báo chưa có nội dung]
    Q --> U[Ghi listenHistory source:gps]
    U --> V([Done])
```

---

### ACT-02: Luồng Merchant đăng ký và được duyệt

```mermaid
flowchart TD
    A([Merchant truy cập web]) --> B[Điền form đăng ký]
    B --> C{Validation}
    C -->|Lỗi| B
    C -->|OK| D[POST /auth/register role:merchant]
    D --> E[Tạo User isActive:false]
    E --> F[Tạo Merchant status:pending]
    F --> G[Trả về message chờ duyệt]
    G --> H([Merchant chờ...])

    I([Admin vào dashboard]) --> J[Xem danh sách merchant pending]
    J --> K{Xem xét hồ sơ}
    K -->|Từ chối| L[PATCH .../reject + lý do]
    L --> M[merchant.status = rejected]
    M --> N([Merchant nhận thông báo từ chối])

    K -->|Chấp nhận| O[PATCH .../approve]
    O --> P[user.isActive = true]
    P --> Q[merchant.status = approved]
    Q --> R[Auto kích hoạt gói Starter]
    R --> S([Merchant có thể đăng nhập])
    S --> T[Tạo quán POI]
    T --> U{Admin duyệt Store?}
    U -->|Approve| V[store.status = active]
    V --> W([Store hiện trên app mobile])
```

---

### ACT-03: Luồng thanh toán và kích hoạt gói

```mermaid
flowchart TD
    A([User/Merchant chọn gói]) --> B{Phương thức thanh toán?}
    B -->|VNPAY| C[POST /payments/vnpay/create]
    B -->|MoMo| D[POST /payments/momo/create]

    C --> E[Tạo Transaction pending]
    E --> F[Tạo PaymentVnpay record]
    F --> G[Build URL + HMAC-SHA512]
    G --> H[Trả về paymentUrl]
    H --> I[User redirect → VNPAY portal]
    I --> J{Thanh toán?}
    J -->|Thành công| K[VNPAY gọi /vnpay/return?code=00]
    J -->|Thất bại| L[transaction.status = failed]
    K --> M[Verify SecureHash]
    M --> N[transaction.status = success]

    D --> O[Tạo Transaction pending]
    O --> P[Gọi MoMo API captureWallet]
    P --> Q[Trả về payUrl/deeplink]
    Q --> R[User mở MoMo app]
    R --> S{Thanh toán?}
    S -->|Thành công| T[MoMo gọi IPN /momo/ipn]
    S -->|Thất bại| U[transaction.status = failed]
    T --> V[Verify HMAC-SHA256]
    V --> W[transaction.status = success]

    N --> X[handlePostPayment]
    W --> X
    X --> Y{Transaction type?}
    Y -->|user_subscription| Z[subscription.create monthly/yearly]
    Y -->|merchant_subscription| AA[merchantSubscription.create starter/business/premium]
    Z --> AB([Kích hoạt gói thành công])
    AA --> AB
```

---

*Cập nhật lần cuối: 2026-05-09 — Phản ánh đúng implementation thực tế*

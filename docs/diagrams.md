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

> **Lưu ý kiến trúc:** Backend sử dụng **NestJS + Prisma ORM + Dependency Injection**.
> Mọi thao tác DB đều qua `PrismaService` được inject, không có raw SQL trực tiếp.
> Ký hiệu `DB` trong diagram thể hiện lớp Prisma ORM → PostgreSQL.

---

### SD1 — Đăng ký & Đăng nhập

```mermaid
sequenceDiagram
    autonumber
    actor U as User / Merchant
    participant App as Mobile App / Web
    participant API as NestJS Backend (AuthService)
    participant DB as Prisma ORM → PostgreSQL

    Note over U,DB: === ĐĂNG KÝ (role = user) ===
    U->>App: Nhập email, password, name, role=user
    App->>API: POST /auth/register { name, email, password, role }
    API->>API: Kiểm tra email tồn tại (prisma.user.findUnique)
    API->>API: bcrypt.hash(password, 12)
    API->>DB: prisma.user.create({ name, email, passwordHash, role:'user', isActive:true })
    DB-->>API: user { id, name, email, role, createdAt }
    API->>API: generateTokens(userId, email, role)
    API->>API: jwt.sign → accessToken (15min) + refreshToken (7d)
    API->>DB: prisma.refreshToken.create({ userId, tokenHash, expiresAt })
    DB-->>API: RefreshToken saved
    API-->>App: Set HttpOnly Cookie (access_token, refresh_token)
    API-->>App: 201 { user, accessToken, refreshToken }
    App-->>U: Đăng ký thành công!

    Note over U,DB: === ĐĂNG KÝ (role = merchant) ===
    U->>App: Nhập email, password, name, role=merchant, businessName
    App->>API: POST /auth/register { role:'merchant', businessName, taxCode }
    API->>DB: prisma.user.create({ role:'merchant', isActive:false })
    DB-->>API: user { id }
    API->>DB: prisma.merchant.create({ userId, businessName, taxCode, status:'pending' })
    DB-->>API: Merchant created
    API-->>App: 201 { user, message:'Tài khoản đang chờ duyệt...' }
    Note right of API: Không phát token — Merchant phải chờ Admin approve
    App-->>U: ⏳ Tài khoản Merchant đang chờ Admin duyệt!

    Note over U,DB: === ĐĂNG NHẬP ===
    U->>App: Nhập email + password
    App->>API: POST /auth/login { email, password }
    API->>DB: prisma.user.findUnique({ where: { email } })
    DB-->>API: user record (kèm passwordHash, isActive)
    API->>API: bcrypt.compare(password, passwordHash)
    API->>API: Kiểm tra user.isActive === true

    alt Xác thực thành công
        API->>API: generateTokens → accessToken + refreshToken
        API->>DB: prisma.refreshToken.create (giới hạn tối đa 5 sessions/user)
        API-->>App: Set HttpOnly Cookie + 200 { user, accessToken, refreshToken }
        App-->>U: Đăng nhập thành công
    else Sai mật khẩu hoặc isActive=false
        API-->>App: 401 UnauthorizedException
        App-->>U: Sai mật khẩu hoặc tài khoản chưa được kích hoạt!
    end
```

---

### SD2 — Tìm quán gần đó (GPS + Haversine)

```mermaid
sequenceDiagram
    autonumber
    actor U as User
    participant App as Mobile App (React Native)
    participant GPS as expo-location
    participant API as NestJS Backend (StoresService / NarrationsService)
    participant DB as Prisma ORM → PostgreSQL
    participant TL as MyMemory Translate API

    U->>App: Mở app
    App->>GPS: watchPositionAsync() polling mỗi 15 giây
    GPS-->>App: { coords: { latitude, longitude } }

    Note over App,API: === LOAD BẢN ĐỒ ===
    App->>API: GET /stores/nearby?lat=10.7769&lng=106.7009&radius=5
    API->>DB: prisma.store.findMany({ where: { status:'active' } })
    DB-->>API: Danh sách tất cả stores active
    API->>API: Tính Haversine distance cho mỗi store (server-side)
    API->>API: Lọc stores trong radius 5km, sắp xếp theo khoảng cách
    API-->>App: 200 { data: [{ ...store, distance_km }] }
    App->>App: Hiển thị markers trên bản đồ

    Note over U,App: === GEOFENCE TRIGGER (<= 100m) ===
    GPS-->>App: Tọa độ mới
    App->>API: GET /nearby?lat=...&lng=...&lang=ko
    API->>DB: prisma.store.findMany({ where: { status:'active' } })
    DB-->>API: stores list
    API->>API: Haversine → tìm store trong 100m
    API->>DB: prisma.language.findUnique({ where: { code:'ko' } })
    DB-->>API: language record

    alt Có store trong 100m
        API->>DB: prisma.narration.findUnique({ where: { storeId_languageId } })
        alt Narration tiếng Hàn đã có (cache hit)
            DB-->>API: narration { textContent }
        else Chưa có (cache miss) → Auto-translate
            API->>DB: prisma.narration.findUnique({ where: { storeId_languageId:'vi' } })
            DB-->>API: bản gốc { textContent (vi) }
            API->>TL: fetch MyMemory API: dịch vi → ko
            TL-->>API: translatedText
            API->>DB: prisma.narration.create({ storeId, languageId:'ko', textContent:translated })
            DB-->>API: Cached narration created
        end
        API-->>App: 200 { found:true, storeName, textContent, language, distance }
        App->>App: Kiểm tra: đã trigger store này trong phiên chưa?
        alt Chưa trigger
            App-->>U: 📍 Popup "Bạn đang gần [Tên quán] — Nghe chi tiết?"
        else Đã trigger rồi
            App->>App: Bỏ qua (chống spam)
        end
    else Không có store trong 100m
        API-->>App: 200 { found:false, message:'Không tìm thấy địa điểm...' }
    end
```

---

### SD3 — Nghe Audio Narration

```mermaid
sequenceDiagram
    autonumber
    actor U as User
    participant App as Mobile App (React Native)
    participant API as NestJS Backend (NarrationsService)
    participant DB as Prisma ORM → PostgreSQL
    participant FS as Static Files Server (/uploads)

    U->>App: Nhấn "Nghe thuyết minh" (storeId)
    App->>API: GET /stores/{storeId}/narrations
    API->>DB: prisma.store.findUnique({ where: { id:storeId } })
    DB-->>API: store exists check
    API->>DB: prisma.narration.findMany({ where: { storeId, isActive:true }, include: { language } })
    DB-->>API: [{ id, audioUrl, textContent, duration, language }]
    API-->>App: 200 narrations[]

    App->>App: Tìm narration theo user.preferredLanguage
    App->>App: Fallback: en → vi nếu không có ngôn ngữ ưa thích

    alt Narration có audioUrl (file MP3 đã upload)
        App->>FS: HTTP GET domain/uploads/{filename}.mp3
        FS-->>App: Audio stream
        App->>App: expo-av: play audio stream
    else Narration chỉ có textContent
        App->>App: expo-speech: speak(textContent, { language })
    end

    App-->>U: 🎵 Đang phát thuyết minh...
    U->>App: Pause / Seek / Stop

    Note over U,DB: === KIỂM TRA GIỚI HẠN & GHI LỊCH SỬ ===
    App->>API: POST /listen/{narrationId}?source=gps
    API->>DB: prisma.subscription.findFirst({ where: { userId, status:'active', startDate:{lte:now}, endDate:{gte:now} } })
    DB-->>API: subscription | null

    API->>API: Xác định giới hạn: free=10/ngày, monthly=30/ngày, yearly=∞

    alt limit !== Infinity
        API->>DB: prisma.listenHistory.count({ where: { userId, listenedAt:{gte:todayStart} } })
        DB-->>API: count
        alt count >= limit
            API-->>App: 403 ForbiddenException "Đã đạt giới hạn {limit} lần/ngày"
            App-->>U: 🔒 Nâng cấp gói để nghe không giới hạn!
        else count < limit
            API->>DB: prisma.listenHistory.create({ userId, storeId, narrationId, source:'gps' })
            DB-->>API: ListenHistory created
            API-->>App: 201 Created
        end
    else Gói yearly - không giới hạn
        API->>DB: prisma.listenHistory.create({ userId, storeId, narrationId, source:'gps' })
        DB-->>API: ListenHistory created
        API-->>App: 201 Created
    end
```

---

### SD4 — Quét QR Code

```mermaid
sequenceDiagram
    autonumber
    actor U as User
    participant App as Mobile App (React Native)
    participant Cam as expo-barcode-scanner
    participant API as NestJS Backend (QrService)
    participant DB as Prisma ORM → PostgreSQL

    U->>App: Mở QR Scanner tab
    App->>Cam: Khởi động camera
    U->>Cam: Đưa camera vào mã QR tại quán
    Cam-->>App: Decoded data: "smarttour://stall/{storeId}?autoplay=1"

    App->>App: Parse deeplink URL → extract code / storeId
    App->>API: POST /qr/scan/{code}
    Note right of App: Requires: Authorization Bearer JWT

    API->>DB: prisma.qrCode.findUnique({ where:{ code }, include:{ store:{ include:{ narrations, menus, merchant } } } })
    DB-->>API: qrCode record

    alt QR code hợp lệ (isActive=true)
        API->>DB: prisma.user.findUnique({ where:{ id:userId }, select:{ preferredLanguage } })
        DB-->>API: preferredLang | 'vi'
        API->>API: Tìm narration theo preferredLang trong store.narrations
        API->>API: Fallback về 'vi' nếu không có ngôn ngữ ưa thích

        alt Tìm được defaultNarration
            API->>DB: prisma.listenHistory.create({ userId, storeId, narrationId, source:'qr' })
            DB-->>API: ListenHistory created
        end

        API-->>App: 200 { storeId, store, narrationId, preferredLanguage, listened }
        App-->>U: Hiển thị thông tin quán (tên, ảnh, menu)
        App->>App: Tự động phát narration theo preferredLanguage
    else QR code không hợp lệ hoặc isActive=false
        API-->>App: 404 NotFoundException "QR code không hợp lệ hoặc đã hết hạn"
        App-->>U: ❌ Mã QR không hợp lệ
    end
```

---

### SD5 — Merchant tạo quán & Upload Narration

```mermaid
sequenceDiagram
    autonumber
    actor M as Merchant
    participant Web as Web Dashboard (React/Next.js)
    participant API as NestJS Backend (MerchantService / StoresService / NarrationsService)
    participant DB as Prisma ORM → PostgreSQL
    participant FS as Multer → Local /uploads

    Note over M,FS: === ĐĂNG KÝ MERCHANT ===
    M->>Web: Đăng nhập bằng tài khoản user đã có
    M->>Web: Nhấn "Đăng ký làm Merchant"
    Web->>API: POST /merchant/register { businessName, taxCode }
    Note right of Web: Authorization: Bearer {accessToken}
    API->>DB: prisma.merchant.create({ userId, businessName, taxCode, status:'pending' })
    DB-->>API: Merchant { id, status:'pending' }
    API-->>Web: 201 { merchant: { id, status:'pending' } }
    Web-->>M: ⏳ Đăng ký thành công — đang chờ Admin duyệt

    Note over M,FS: === TẠO QUÁN MỚI (sau khi được Admin duyệt) ===
    M->>Web: Nhấn "Tạo quán mới"
    M->>Web: Điền: name, address, lat, lng + upload coverImage
    Web->>API: POST /stores (multipart/form-data)
    Note right of Web: Authorization: Bearer {accessToken} (role: merchant)
    API->>API: StoresService.create(user, dto)
    API->>DB: prisma.merchant.findUnique({ where:{ userId } }) → verify merchant
    API->>FS: Multer lưu coverImage → /uploads/images/{filename}
    FS-->>API: imageUrl = '/uploads/images/{filename}'
    API->>DB: prisma.store.create({ merchantId, name, address, lat, lng, coverImage:imageUrl, status:'pending' })
    DB-->>API: Store { id, status:'pending' }
    API-->>Web: 201 { id, name, status:'pending' }
    Web-->>M: ✅ Quán đã tạo — đang chờ Admin duyệt

    Note over M,FS: === UPLOAD NARRATION ===
    M->>Web: Vào quán → "Thêm thuyết minh"
    M->>Web: Chọn languageId, nhập textContent hoặc upload file MP3
    Web->>API: POST /stores/{storeId}/narrations { languageId, textContent?, audioUrl?, duration? }
    API->>API: NarrationsService.create(storeId, user, dto)
    API->>DB: prisma.store.findUnique → verifyStoreOwner (merchant.userId === user.id)

    alt Upload file audio MP3
        API->>FS: Multer lưu audio → /uploads/audio/{filename}.mp3
        FS-->>API: audioUrl = '/uploads/audio/{filename}.mp3'
    end

    API->>DB: prisma.narration.findUnique({ where:{ storeId_languageId } }) → check UNIQUE conflict
    API->>DB: prisma.narration.create({ storeId, languageId, audioUrl, textContent, duration, isActive:true })
    DB-->>API: Narration { id, language }
    API-->>Web: 201 { narration }
    Web-->>M: ✅ Thuyết minh đã được thêm!

    Note over M,FS: === THÊM MENU ===
    M->>Web: "Thêm món ăn" → nhập name, price, description + upload ảnh
    Web->>API: POST (multipart/form-data: name, price, description, imageFile)
    API->>FS: Multer lưu ảnh → /uploads/images/{filename}
    FS-->>API: imageUrl
    API->>DB: prisma.menu.create({ storeId, name, price, imageUrl, isAvailable:true })
    DB-->>API: Menu { id, name, price }
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
    participant API as NestJS Backend (AdminService)
    participant DB as Prisma ORM → PostgreSQL
    participant MS as MerchantSubscriptionsService

    Note over A,DB: === XEM DANH SÁCH MERCHANT ===
    A->>Web: Vào trang "Quản lý Merchant"
    Web->>API: GET /admin/merchants?page=1&limit=20
    Note right of Web: Authorization: Bearer {token} — @Roles('admin')
    API->>DB: prisma.merchant.findMany({ skip, take, include:{ user, _count:{ stores } } })
    DB-->>API: [{ id, businessName, taxCode, status, rejectReason, user, storeCount }]
    API-->>Web: 200 { data: [...], total, page, limit }
    Web-->>A: Bảng danh sách merchant

    Note over A,DB: === DUYỆT MERCHANT (Approve) ===
    A->>Web: Nhấn "Approve" trên merchant cần duyệt
    Web->>API: PATCH /admin/merchants/{id}/approve
    API->>DB: prisma.merchant.findUnique({ where:{ id } })
    DB-->>API: merchant { userId }
    API->>DB: prisma.user.update({ where:{ id:merchant.userId }, data:{ isActive:true } })
    API->>DB: prisma.merchant.update({ where:{ id }, data:{ status:'approved' } })
    API->>MS: merchantSubscriptionsService.activatePlan(merchantId, MerchantPlan.starter)
    MS->>DB: prisma.merchantSubscription.create({ merchantId, plan:'starter', maxStore, startDate, endDate })
    DB-->>MS: MerchantSubscription created
    API-->>Web: 200 { id, status:'approved' }
    Web-->>A: ✅ Merchant đã được duyệt! Gói Starter tự động kích hoạt.

    Note over A,DB: === TỪ CHỐI MERCHANT (Reject) ===
    A->>Web: Nhấn "Reject" + nhập lý do
    Web->>API: PATCH /admin/merchants/{id}/reject { reason }
    API->>DB: prisma.merchant.update({ where:{ id }, data:{ status:'rejected', rejectReason:reason } })
    DB-->>API: merchant updated
    API-->>Web: 200 { id, status:'rejected', rejectReason }
    Web-->>A: ❌ Merchant đã bị từ chối

    Note over A,DB: === DUYỆT STORE (qua StoresService) ===
    A->>Web: Vào "Quản lý Store" → lọc status=pending
    Web->>API: GET /stores?status=pending&page=1&limit=20
    API->>DB: prisma.store.findMany({ where:{ status:'pending' }, include:{ merchant, menus, narrations, images } })
    DB-->>API: [{ id, name, address, merchant, menus, narrations }]
    API-->>Web: 200 { data:[], total, page }

    A->>Web: Kiểm tra nội dung → nhấn "Active"
    Web->>API: PATCH /stores/{id} { status:'active' }
    Note right of Web: Admin role bypass quyền merchant ownership
    API->>DB: prisma.store.update({ where:{ id }, data:{ status:'active' } })
    DB-->>API: Store updated
    API-->>Web: 200 { id, status:'active' }
    Web-->>A: ✅ Quán đã xuất hiện trên app!
```

---

### SD7 — Thanh toán VNPAY

```mermaid
sequenceDiagram
    autonumber
    actor U as User
    participant App as Mobile App / Web
    participant API as NestJS Backend (PaymentsService)
    participant DB as Prisma ORM → PostgreSQL
    participant VN as VNPAY Gateway

    U->>App: Chọn gói "Monthly" → thanh toán VNPAY
    App->>API: POST /payments/create { type:'user_monthly', paymentMethod:'vnpay' }
    Note right of App: Authorization: Bearer {accessToken}

    API->>DB: prisma.planMetadata.findUnique({ where:{ planKey:'user_monthly' } })
    DB-->>API: { price:49000, name:'Gói Monthly' }

    API->>DB: prisma.transaction.create({ userId, amount:49000, currency:'VND', type:'user_subscription', paymentMethod:'vnpay', status:'pending', description:'Thanh toán gói Monthly [KEY=user_monthly]' })
    DB-->>API: transaction { id }

    API->>API: Tạo VNPAY params: vnp_TxnRef, vnp_Amount=49000×100, vnp_ExpireDate=+15min
    API->>API: crypto.createHmac('sha512', secretKey).update(sortedParams) → vnp_SecureHash
    API->>DB: prisma.paymentVnpay.create({ transactionId, vnpTxnRef, vnpAmount, vnpOrderInfo })
    DB-->>API: PaymentVnpay created

    API-->>App: 201 { paymentUrl:'https://sandbox.vnpay.vn/...', transactionId }
    App->>App: Mở WebView → redirect đến paymentUrl

    U->>VN: Chọn ngân hàng + xác nhận thanh toán
    VN-->>App: Redirect về VNPAY_RETURN_URL?vnp_ResponseCode=00&vnp_TxnRef=...

    Note over App,API: === APP POLLING TRẠNG THÁI ===
    App->>API: GET /payments/status?transactionId={id}
    API->>DB: prisma.transaction.findFirst({ where:{ id, userId }, select:{ status } })
    DB-->>API: { status:'pending'|'success'|'failed' }
    API-->>App: { status }

    Note over API,VN: === VNPAY RETURN URL XỬ LÝ (Server-side) ===
    VN->>API: GET /payments/vnpay/return?vnp_TxnRef=...&vnp_ResponseCode=...&vnp_SecureHash=...
    API->>API: Xác minh vnp_SecureHash (HMAC-SHA512)

    alt Hash hợp lệ + vnp_ResponseCode = '00'
        API->>DB: prisma.paymentVnpay.update({ where:{ vnpTxnRef }, data:{ vnpResponseCode, vnpBankCode, rawResponse } })
        API->>DB: prisma.transaction.update({ where:{ id }, data:{ status:'success', paymentRefId } })
        API->>API: handlePostPayment(transactionId)
        API->>DB: prisma.subscription.create({ userId, plan:'monthly', startDate, endDate, status:'active' })
        DB-->>API: Subscription created
        API-->>App: { success:true, responseCode:'00', transactionId }
    else Hash không hợp lệ hoặc ResponseCode != '00'
        API->>DB: prisma.transaction.update({ where:{ id }, data:{ status:'failed' } })
        API-->>App: { success:false, responseCode }
    end

    App-->>U: 🎉 Thanh toán thành công! Premium đã kích hoạt.
```

---

### SD8 — Thanh toán MoMo

```mermaid
sequenceDiagram
    autonumber
    actor U as User
    participant App as Mobile App / Web
    participant API as NestJS Backend (PaymentsService)
    participant DB as Prisma ORM → PostgreSQL
    participant MM as MoMo Gateway

    U->>App: Chọn gói "Yearly" → thanh toán MoMo
    App->>API: POST /payments/create { type:'user_yearly', paymentMethod:'momo' }
    Note right of App: Authorization: Bearer {accessToken}

    API->>DB: prisma.planMetadata.findUnique({ where:{ planKey:'user_yearly' } })
    DB-->>API: { price:399000, name:'Gói Yearly' }

    API->>DB: prisma.transaction.create({ userId, amount:399000, type:'user_subscription', paymentMethod:'momo', status:'pending', description:'...[KEY=user_yearly]' })
    DB-->>API: transaction { id }

    API->>API: orderId = 'VK-{txId.slice(0,8)}-{Date.now()}'
    API->>API: requestId = '{partnerCode}-{Date.now()}'
    API->>API: rawSignature = 'accessKey=...&amount=...&orderId=...&requestType=captureWallet...'
    API->>API: signature = HMAC-SHA256(rawSignature, MOMO_SECRET_KEY)

    API->>MM: HTTPS POST /v2/gateway/api/create { partnerCode, orderId, amount, signature, requestType:'captureWallet', lang:'vi' }
    MM-->>API: { resultCode:0, payUrl, deeplink, qrCodeUrl }

    API->>DB: prisma.paymentMomo.create({ transactionId, orderId, requestId, amount, orderInfo, signature })
    DB-->>API: PaymentMomo created

    API-->>App: 201 { paymentUrl, deeplink, qrCodeUrl, transactionId, orderId }
    App->>App: Mở MoMo app qua deeplink / WebView qua payUrl
    U->>MM: Xác nhận thanh toán trong app MoMo

    Note over App,API: === POLLING TRẠNG THÁI ===
    App->>API: GET /payments/status?transactionId={id}
    API->>DB: prisma.transaction.findFirst({ where:{ id, userId }, select:{ status } })
    DB-->>API: { status:'pending' }
    API-->>App: { status:'pending' }

    Note over API,MM: === IPN CALLBACK (MoMo Server → NestJS) ===
    MM->>API: POST /payments/momo/ipn { orderId, resultCode, transId, signature, amount, message, payType, ... }
    API->>API: Rebuild rawSignature từ các fields IPN
    API->>API: expectedSig = HMAC-SHA256(rawSignature, MOMO_SECRET_KEY)
    API->>API: So sánh expectedSig === body.signature

    alt Signature hợp lệ + resultCode = 0
        API->>DB: prisma.paymentMomo.update({ where:{ orderId }, data:{ momoTransId, resultCode, message, payType, rawResponse } })
        API->>DB: prisma.transaction.update({ where:{ id }, data:{ status:'success', paymentRefId:transId } })
        API->>API: handlePostPayment(transactionId)
        API->>DB: prisma.subscription.create({ userId, plan:'yearly', startDate, endDate, status:'active' })
        DB-->>API: Subscription created
        API-->>MM: 200 { message:'IPN processed' }
    else Signature không hợp lệ hoặc resultCode != 0
        API->>DB: prisma.transaction.update({ where:{ id }, data:{ status:'failed' } })
        API-->>MM: 200 { message:'IPN processed' }
    end

    App->>API: GET /payments/status?transactionId={id}
    API-->>App: { status:'success' }
    App-->>U: 🎉 Thanh toán MoMo thành công! Gói đã kích hoạt.
```

---

## ACTIVITY DIAGRAMS

---

### AD1 — Luồng User khám phá quán

```mermaid
flowchart TD
    A([User mo app]) --> B{Da dang nhap?}

    B -->|Chua| C[POST /auth/login hoac /auth/register]
    C --> D[Chon ngon ngu yeu thich]
    D --> E[Yeu cau quyen GPS]

    B -->|Roi| E

    E --> F{GPS kha dung?}

    F -->|Co| G[expo-location watchPositionAsync]
    G --> H[GET /stores/nearby - lat, lng, radius=5]
    H --> I[StoresService - Haversine filter server-side]
    I --> J[Hien thi markers tren MapView]

    F -->|Khong| K[Hien thi nut Quet QR Code]
    K --> L[Mo expo-barcode-scanner]
    L --> M[Scan QR tai quan]
    M --> N{QR hop le?}
    N -->|Co| O[POST /qr/scan/code - QrService.scanQr]
    N -->|Khong| P[404 NotFoundException]
    P --> L

    J --> Q{Khoang cach store nho hon 100m?}

    Q -->|Chua| R[User tiep tuc di chuyen]
    R --> G

    Q -->|Co| S[GET /nearby - lat, lng, lang=preferredLang]
    S --> T{Cache hit - narration ton tai?}
    T -->|Co - dung cache| U[Tra ve textContent da dich san]
    T -->|Cache miss - dich moi| V[MyMemory API dich vi sang targetLang]
    V --> V2[Luu ban dich vao narrations table]
    V2 --> U
    T -->|Khong co ban goc vi| W[Chua co noi dung thuyet minh]

    U --> X[Popup - Ban dang gan ten quan]
    X --> Y{User chon?}

    Y -->|Nghe thuyet minh| Z[GET /stores/storeId/narrations]
    Z --> AA{Narration co audioUrl?}
    AA -->|File MP3| AB[expo-av play audio]
    AA -->|Chi textContent| AC[expo-speech TTS]
    AB --> AD1L[POST /listen/narrationId?source=gps]
    AC --> AD1L
    AD1L --> AE{Subscription check}
    AE -->|Con quota| AF[Ghi vao listen_history]
    AE -->|Het gioi han| AG[403 Forbidden - Nang cap goi]
    AF --> AH([Ghi lich su thanh cong])

    Y -->|Xem menu| AI[GET /stores/storeId - include menus]
    AI --> AJ[Hien thi danh sach mon an va gia]
    Y -->|Bo qua| R

    O --> Z

    style A fill:#4CAF50,color:#fff
    style AH fill:#4CAF50,color:#fff
    style X fill:#FF9800,color:#fff
    style AB fill:#2196F3,color:#fff
    style P fill:#f44336,color:#fff
    style W fill:#f44336,color:#fff
    style AG fill:#f44336,color:#fff
```

---

### AD2 — Luồng Merchant đăng ký & tạo quán

```mermaid
flowchart TD
    A([Merchant truy cap Web Dashboard]) --> B{Co tai khoan?}

    B -->|Chua| C[POST /auth/register - role=user]
    C --> D[Dang nhap vao dashboard]
    D --> E2

    B -->|Co| E2[POST /merchant/register - businessName, taxCode]
    E2 --> F2[Tao merchant record - status pending, user isActive false]
    F2 --> G2[Cho Admin duyet]

    G2 -->|Admin Approve| H2[Merchant approved - user kich hoat - nhan goi Starter]
    H2 --> I2[Merchant Dashboard mo khoa]

    G2 -->|Admin Reject| J2[merchant.rejectReason hien thi]
    J2 --> K2{Dang ky lai?}
    K2 -->|Co| E2
    K2 -->|Khong| L2([Ket thuc])

    I2 --> M2{Chon chuc nang?}

    M2 -->|Tao quan moi| N2[Nhap name, address, lat, lng, upload coverImage]
    N2 --> O2[POST /stores - StoresService.create]
    O2 --> P2[Multer luu file + Tao store record - status pending]
    P2 --> Q2[Cho Admin duyet quan]
    Q2 -->|Admin kich hoat| R2[Quan live tren app - status active]

    M2 -->|Upload Narration| S2[POST /stores/storeId/narrations]
    S2 --> T2{Co file MP3?}
    T2 -->|Co| U2[Multer luu vao /uploads/audio/]
    T2 -->|Khong| V2[Chi nhap textContent - TTS phia client]
    U2 --> W2[Tao narration record - UNIQUE storeId + languageId]
    V2 --> W2

    M2 -->|Quan ly Menu| X2[POST PATCH DELETE menus]
    M2 -->|Tao QR Code| Y2[POST /qr/store/storeId - vo hieu hoa QR cu]
    M2 -->|Xem lich su| Z2[Xem listen_history cua quan minh]

    R2 --> AA2([Setup hoan tat])

    style A fill:#FF9800,color:#fff
    style I2 fill:#4CAF50,color:#fff
    style R2 fill:#4CAF50,color:#fff
    style J2 fill:#f44336,color:#fff
    style G2 fill:#FFC107,color:#333
```

---

### AD3 — Luồng Admin duyệt

```mermaid
flowchart TD
    A3([Admin dang nhap]) --> B3[Vao Admin Dashboard]
    B3 --> C3{Chon chuc nang?}

    C3 -->|Merchant| D3[GET /admin/merchants]
    D3 --> E3[Lay danh sach merchant - co thong tin user va so quan]
    E3 --> F3{Quyet dinh?}

    F3 -->|Approve| G3[PATCH /admin/merchants/id/approve]
    G3 --> G3a[Cap nhat user isActive = true]
    G3a --> G3b[Cap nhat merchant status = approved]
    G3b --> G3c[Kich hoat goi Starter tu dong]
    G3c --> H3[Merchant duoc kich hoat voi goi Starter]

    F3 -->|Reject| I3[PATCH /admin/merchants/id/reject - kem ly do]
    I3 --> I3a[Cap nhat merchant status = rejected, luu rejectReason]
    I3a --> J3[Merchant bi tu choi]

    C3 -->|Store| K3[GET /stores?status=pending]
    K3 --> L3[Kiem tra: anh, menu, narrations]
    L3 --> M3{Noi dung OK?}

    M3 -->|Du va hop le| N3[PATCH /stores/id - status active]
    N3 --> N3a[Cap nhat store status = active]
    N3a --> O3[Quan xuat hien tren app]

    M3 -->|Vi pham hoac thieu| P3[PATCH /stores/id - status hidden]
    P3 --> P3a[Cap nhat store status = hidden]
    P3a --> Q3[Lien he Merchant chinh sua]

    C3 -->|Nguoi dung| R3[GET /admin/users]
    R3 --> S3[PATCH /admin/users/id/toggle-active]
    S3 --> S3a[Cap nhat user isActive dao nguoc]
    S3a --> T3[Bat tat tai khoan]

    C3 -->|Thong ke| U3[GET /admin/stats]
    U3 --> V3[Dashboard: userCount, merchantCount, storeCount, totalRevenue, topPOI, topMerchant]

    C3 -->|Giao dich| W3[GET /payments/history]
    W3 --> X3[Xem transactions: status, amount, paymentMethod, MoMo va VNPAY detail]

    style A3 fill:#9C27B0,color:#fff
    style O3 fill:#4CAF50,color:#fff
    style H3 fill:#4CAF50,color:#fff
    style J3 fill:#f44336,color:#fff
    style P3 fill:#f44336,color:#fff
```

---

### AD4 — Luồng thanh toán tổng quát

```mermaid
flowchart TD
    A4([User hoac Merchant chon goi]) --> B4[POST /payments/create - type va paymentMethod]
    B4 --> C4[Tra cuu PlanMetadata de lay price theo planKey]
    C4 --> D4[Tao transaction record - status pending]

    D4 --> E4{paymentMethod?}

    E4 -->|vnpay| F4[Tao VNPAY params - vnp TxnRef, Amount nhan 100, ExpireDate]
    F4 --> G4[Ky HMAC-SHA512 tao vnp SecureHash]
    G4 --> G4a[Luu paymentVnpay record]
    G4a --> H4[Tra ve paymentUrl - App mo WebView]
    H4 --> I4[User thanh toan tai VNPAY]
    I4 --> J4[VNPAY redirect ve /payments/vnpay/return]
    J4 --> K4{Verify vnp SecureHash?}

    E4 -->|momo| L4[Tao MoMo request - orderId, requestType captureWallet]
    L4 --> M4[Ky HMAC-SHA256 tao signature]
    M4 --> M4a[Luu paymentMomo record]
    M4a --> N4[HTTPS POST toi MoMo API]
    N4 --> O4[Nhan ve payUrl va deeplink - App mo MoMo]
    O4 --> P4[User xac nhan trong MoMo]
    P4 --> Q4[MoMo goi POST /payments/momo/ipn]
    Q4 --> R4{Verify HMAC-SHA256?}

    K4 -->|Hop le| S4{vnp ResponseCode bang 00?}
    K4 -->|Khong hop le| T4[Cap nhat transaction status = failed]

    R4 -->|Hop le| U4{resultCode bang 0?}
    R4 -->|Khong hop le| T4

    S4 -->|Thanh cong| V4[Cap nhat transaction status = success]
    S4 -->|That bai| T4

    U4 -->|Thanh cong| V4
    U4 -->|That bai| T4

    V4 --> W4[handlePostPayment - private method]
    W4 --> X4{transaction.type?}
    X4 -->|user_subscription| Y4[Tao subscription record - plan, startDate, endDate, status active]
    X4 -->|merchant_subscription| Z4[merchantSubscriptionsService.activatePlan]

    Y4 --> AA4[Thong bao thanh cong cho user]
    Z4 --> AA4

    T4 --> AB4[Thong bao that bai]
    AB4 --> AC4{Thu lai?}
    AC4 -->|Co| A4
    AC4 -->|Khong| AD4([Ket thuc])

    AA4 --> AD4

    style A4 fill:#FF9800,color:#fff
    style V4 fill:#4CAF50,color:#fff
    style T4 fill:#f44336,color:#fff
    style AA4 fill:#2196F3,color:#fff
```

---

### AD5 — Luồng Narration Fallback đa ngôn ngữ

```mermaid
flowchart TD
    A5([User kich hoat GPS gan quan]) --> B5[GET /nearby - lat, lng, lang=preferredLang]
    B5 --> C5[NarrationsService.findNearby]

    C5 --> D5[Lay danh sach stores active]
    D5 --> E5[Haversine - tim store trong 100m]

    E5 --> F5{Tim duoc store?}
    F5 -->|Khong| G5([Khong tim thay dia diem trong 100m])

    F5 -->|Co| H5[Tim language theo code targetLang]
    H5 --> I5{Language hop le?}
    I5 -->|Khong| J5([Ngon ngu chua duoc ho tro])

    I5 -->|Co| K5[Tim narration theo storeId va languageId]
    K5 --> L5{Cache hit?}

    L5 -->|Co san| M5[Tra ve textContent da luu]

    L5 -->|Cache miss| N5[Tim narration goc - languageId vi]
    N5 --> O5{Ban goc vi ton tai?}

    O5 -->|Co| P5[Goi MyMemory API dich vi sang targetLang]
    P5 --> Q5[Luu ban dich moi vao narrations table]
    Q5 --> M5

    O5 -->|Khong co| R5([Dia diem chua co thuyet minh goc tieng Viet])

    M5 --> S5[Tra ve response - found=true, storeName, textContent, distance]
    S5 --> T5[App nhan textContent - expo-speech TTS doc]
    T5 --> U5[POST /listen/narrationId?source=gps]
    U5 --> V5[NarrationsService.recordListen]
    V5 --> W5{Subscription limit check}
    W5 -->|Con quota| X5[Ghi vao listen_history]
    X5 --> Y5([Ghi lich su thanh cong])
    W5 -->|Het quota| Z5([403 ForbiddenException])

    R5 --> AA5([Goi y: Quet QR hoac xem menu])
    G5 --> AA5

    style A5 fill:#2196F3,color:#fff
    style M5 fill:#4CAF50,color:#fff
    style Q5 fill:#4CAF50,color:#fff
    style Y5 fill:#4CAF50,color:#fff
    style R5 fill:#f44336,color:#fff
    style J5 fill:#f44336,color:#fff
    style Z5 fill:#f44336,color:#fff
    style T5 fill:#9C27B0,color:#fff
```

---

## TỔNG HỢP DIAGRAMS

| Loại | Mã | Mô tả | Actor chính |
|------|-----|-------|-------------|
| Sequence | SD1 | Đăng ký & Đăng nhập — JWT Cookie + bcrypt | User / Merchant |
| Sequence | SD2 | GPS Geofencing — Haversine + MyMemory Auto-translate | User + API |
| Sequence | SD3 | Nghe Audio — expo-av/expo-speech + Subscription Limit | User |
| Sequence | SD4 | Quét QR — QrService.scanQr + Auto Listen History | User + Camera |
| Sequence | SD5 | Merchant setup — Multer upload + Prisma store/narration | Merchant |
| Sequence | SD6 | Admin duyệt — approve/reject + Auto Starter Plan | Admin |
| Sequence | SD7 | Thanh toán VNPAY — HMAC-SHA512 + Return URL | User + VNPAY |
| Sequence | SD8 | Thanh toán MoMo — HMAC-SHA256 + IPN Callback | User + MoMo |
| Activity | AD1 | Khám phá quán — GPS → Map → Narration → Listen | User |
| Activity | AD2 | Merchant setup — register → store → narration → QR | Merchant |
| Activity | AD3 | Admin quản lý — merchant/store/user/stats/transactions | Admin |
| Activity | AD4 | Thanh toán tổng quát — VNPAY & MoMo unified flow | User / Merchant |
| Activity | AD5 | Narration multilingual — cache hit/miss + auto-translate | System |

---

*Tài liệu này được duy trì bởi nhóm phát triển dự án Seminar SGU.*  
*Cập nhật lần cuối: 18/04/2026*

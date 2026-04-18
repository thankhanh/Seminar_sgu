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
    A([🧳 User mở app]) --> B{Đã đăng nhập?}

    B -->|Chưa| C[POST /auth/login hoặc /auth/register]
    C --> D[Chọn ngôn ngữ yêu thích - preferredLanguage]
    D --> E[Yêu cầu quyền GPS]

    B -->|Rồi| E

    E --> F{GPS khả dụng?}

    F -->|Có| G[expo-location watchPositionAsync]
    G --> H[GET /stores/nearby?lat=...&lng=...&radius=5]
    H --> I[StoresService: Haversine filter server-side]
    I --> J[Hiển thị markers trên MapView]

    F -->|Không| K[Hiển thị nút Quét QR Code]
    K --> L[Mở expo-barcode-scanner]
    L --> M[Scan QR tại quán]
    M --> N{QR hợp lệ?}
    N -->|Có| O[POST /qr/scan/{code} — QrService.scanQr]
    N -->|Không| P[❌ 404 NotFoundException]
    P --> L

    J --> Q{Khoảng cách store <= 100m?}

    Q -->|Chưa| R[User tiếp tục di chuyển]
    R --> G

    Q -->|Có| S[GET /nearby?lat=...&lng=...&lang=preferredLang]
    S --> T{Cache hit: narration tồn tại?}
    T -->|Có - dùng cache| U[Trả về textContent đã dịch sẵn]
    T -->|Cache miss - dịch mới| V[MyMemory API vi → targetLang]
    V --> V2[prisma.narration.create - lưu cache]
    V2 --> U
    T -->|Không có bản gốc vi| W[❌ Chưa có nội dung thuyết minh]

    U --> X[📍 Popup Bạn đang gần tên quán]
    X --> Y{User chọn?}

    Y -->|Nghe thuyết minh| Z[GET /stores/{storeId}/narrations]
    Z --> AA{Narration có audioUrl?}
    AA -->|File MP3| AB[expo-av play audio]
    AA -->|Chỉ textContent| AC[expo-speech TTS]
    AB --> AD[POST /listen/{narrationId}?source=gps]
    AC --> AD
    AD --> AE{Subscription check}
    AE -->|free: < 10 hoặc monthly: < 30 hoặc yearly: ∞| AF[prisma.listenHistory.create]
    AE -->|Hết giới hạn| AG[403 Forbidden - Nâng cấp gói]
    AF --> AH([✅ Đã ghi lịch sử nghe])

    Y -->|Xem menu| AI[GET /stores/{storeId} - include menus]
    AI --> AJ[Hiển thị danh sách món ăn + giá]
    Y -->|Bỏ qua| R

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
    A([🍜 Merchant truy cập Web Dashboard]) --> B{Có tài khoản?}

    B -->|Chưa| C[POST /auth/register - role=user]
    C --> D[Đăng nhập]
    D --> E

    B -->|Có| E[POST /merchant/register - businessName, taxCode]
    E --> F[prisma.merchant.create - status=pending, user.isActive=false]
    F --> G[⏳ Chờ Admin duyệt]

    G -->|Admin PATCH /admin/merchants/{id}/approve| H[prisma.merchant.update - status=approved\nprisma.user.update - isActive=true\nmerchantSubscriptions.activatePlan - starter]
    H --> I[✅ Merchant Dashboard mở khóa]

    G -->|Admin PATCH /admin/merchants/{id}/reject| J[❌ merchant.rejectReason hiển thị]
    J --> K{Đăng ký lại?}
    K -->|Có| E
    K -->|Không| L([Kết thúc])

    I --> M{Chọn chức năng?}

    M -->|Tạo quán mới| N[Nhập name, address, lat, lng + upload coverImage]
    N --> O[POST /stores - StoresService.create]
    O --> P[Multer lưu /uploads + prisma.store.create - status=pending]
    P --> Q[⏳ Chờ Admin PATCH /stores/{id} - status=active]
    Q -->|Active| R[✅ Quán live trên app]

    M -->|Upload Narration| S[POST /stores/{storeId}/narrations]
    S --> T{Có file MP3?}
    T -->|Có| U[Multer lưu /uploads/audio/]
    T -->|Không| V[Chỉ nhập textContent - TTS phía client]
    U --> W[prisma.narration.create - UNIQUE storeId+languageId]
    V --> W

    M -->|Quản lý Menu| X[POST/PATCH/DELETE menus - prisma.menu.create]
    M -->|Tạo QR Code| Y[POST /qr/store/{storeId} - vô hiệu hóa QR cũ trước]
    M -->|Xem lịch sử| Z[Xem listen_history của quán mình]

    R --> AA([✅ Setup hoàn tất])

    style A fill:#FF9800,color:#fff
    style I fill:#4CAF50,color:#fff
    style R fill:#4CAF50,color:#fff
    style J fill:#f44336,color:#fff
    style G fill:#FFC107,color:#333
```

---

### AD3 — Luồng Admin duyệt

```mermaid
flowchart TD
    A([🛡️ Admin đăng nhập]) --> B[Vào Admin Dashboard]
    B --> C{Chọn chức năng?}

    C -->|Merchant| D[GET /admin/merchants - AdminService.getAllMerchants]
    D --> E[prisma.merchant.findMany include user + _count.stores]
    E --> F[Hiển thị: businessName, taxCode, status, storeCount]
    F --> G{Quyết định?}

    G -->|Approve| H[PATCH /admin/merchants/{id}/approve]
    H --> H1[prisma.user.update isActive=true]
    H1 --> H2[prisma.merchant.update status=approved]
    H2 --> H3[merchantSubscriptionsService.activatePlan - MerchantPlan.starter]
    H3 --> I[✅ Merchant kích hoạt + auto gói Starter]

    G -->|Reject| J[PATCH /admin/merchants/{id}/reject - body.reason]
    J --> J1[prisma.merchant.update status=rejected + rejectReason]
    J1 --> K[❌ Merchant bị từ chối]

    C -->|Store| L[GET /stores?status=pending - StoresService.findAll]
    L --> M[Kiểm tra: ảnh, menu, narrations]
    M --> N{Nội dung OK?}

    N -->|Đủ & hợp lệ| O[PATCH /stores/{id} data.status=active]
    O --> O1[prisma.store.update status=active]
    O1 --> P[✅ Quán xuất hiện trên app]

    N -->|Vi phạm hoặc thiếu| Q[PATCH /stores/{id} data.status=hidden]
    Q --> Q1[prisma.store.update status=hidden]
    Q1 --> R[Liên hệ Merchant chỉnh sửa]

    C -->|Người dùng| S[GET /admin/users - AdminService.getAllUsers]
    S --> T[PATCH /admin/users/{id}/toggle-active]
    T --> T1[prisma.user.update isActive=!isActive]
    T1 --> U[Bật/tắt tài khoản]

    C -->|Thống kê| V[GET /admin/stats - AdminService.getStats]
    V --> W[📊 userCount, merchantCount, storeCount, totalRevenue\nmonthlyRevenue chart, topPOI, topMerchant, topClient]

    C -->|Lịch sử giao dịch| X[GET /payments/history]
    X --> Y[Xem transactions: status, amount, paymentMethod, MoMo/VNPAY detail]

    style A fill:#9C27B0,color:#fff
    style P fill:#4CAF50,color:#fff
    style I fill:#4CAF50,color:#fff
    style K fill:#f44336,color:#fff
    style Q fill:#f44336,color:#fff
```

---

### AD4 — Luồng thanh toán tổng quát

```mermaid
flowchart TD
    A([User / Merchant chọn gói]) --> B[POST /payments/create - type + paymentMethod]
    B --> C[prisma.planMetadata.findUnique - lấy price theo planKey]
    C --> D[prisma.transaction.create - status=pending]

    D --> E{paymentMethod?}

    E -->|vnpay| F[Tạo VNPAY params - vnp_TxnRef, vnp_Amount×100, vnp_ExpireDate]
    F --> G[HMAC-SHA512 → vnp_SecureHash]
    G --> G1[prisma.paymentVnpay.create]
    G1 --> H[Trả về paymentUrl → App mở WebView]
    H --> I[User thanh toán tại VNPAY]
    I --> J[VNPAY redirect về /payments/vnpay/return]
    J --> K{Verify vnp_SecureHash?}

    E -->|momo| L[Tạo MoMo body - orderId, requestType=captureWallet]
    L --> M[HMAC-SHA256 → signature]
    M --> M1[prisma.paymentMomo.create]
    M1 --> N[HTTPS POST /v2/gateway/api/create tới MoMo]
    N --> O[Trả về payUrl / deeplink → App mở MoMo]
    O --> P[User xác nhận trong MoMo]
    P --> Q[MoMo POST /payments/momo/ipn]
    Q --> R{Verify HMAC-SHA256?}

    K -->|Hợp lệ| S{vnp_ResponseCode = 00?}
    K -->|Không hợp lệ| T[prisma.transaction.update status=failed]

    R -->|Hợp lệ| U{resultCode = 0?}
    R -->|Không hợp lệ| T

    S -->|Thành công| V[prisma.transaction.update status=success]
    S -->|Thất bại| T

    U -->|Thành công| V
    U -->|Thất bại| T

    V --> W[handlePostPayment - private method]
    W --> X{transaction.type?}
    X -->|user_subscription| Y[userSubscriptionService.create - prisma.subscription.create]
    X -->|merchant_subscription| Z[merchantSubscriptionsService.activatePlan - prisma.merchantSubscription.create]

    Y --> AA[🎉 Thông báo thành công]
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
    A([User kích hoạt GPS gần quán]) --> B[GET /nearby?lat=...&lng=...&lang=preferredLang]
    B --> C[NarrationsService.findNearby]

    C --> D[prisma.store.findMany - status=active]
    D --> E[Haversine: tìm store trong 100m]

    E --> F{Tìm được store?}
    F -->|Không| G([Không tìm thấy địa điểm trong 100m])

    F -->|Có| H[prisma.language.findUnique - where code=targetLang]
    H --> I{Language hợp lệ?}
    I -->|Không| J([Ngôn ngữ chưa được hỗ trợ])

    I -->|Có| K[prisma.narration.findUnique - where storeId_languageId]
    K --> L{Cache hit?}

    L -->|✅ Có sẵn| M[Trả về textContent đã lưu]

    L -->|❌ Cache miss| N[prisma.narration.findUnique - languageId=vi gốc]
    N --> O{Bản gốc vi tồn tại?}

    O -->|✅ Có| P[translateText via MyMemory API vi→targetLang]
    P --> Q[prisma.narration.create - lưu cache bản dịch mới]
    Q --> M

    O -->|❌ Không có| R([Địa điểm chưa có thuyết minh gốc tiếng Việt])

    M --> S[Response found=true storeName textContent distance]
    S --> T[App nhận textContent → expo-speech TTS đọc]
    T --> U[POST /listen/{narrationId}?source=gps]
    U --> V[NarrationsService.recordListen]
    V --> W{Subscription limit check}
    W -->|OK| X[prisma.listenHistory.create]
    X --> Y([✅ Ghi lịch sử thành công])
    W -->|Hết quota| Z([403 ForbiddenException])

    R --> AA([Gợi ý: Quét QR hoặc xem menu])
    G --> AA

    style A fill:#2196F3,color:#fff
    style M fill:#4CAF50,color:#fff
    style Q fill:#4CAF50,color:#fff
    style Y fill:#4CAF50,color:#fff
    style R fill:#f44336,color:#fff
    style J fill:#f44336,color:#fff
    style Z fill:#f44336,color:#fff
    style T fill:#9C27B0,color:#fff
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

-- ============================================================
-- MIGRATION SQL — Restaurant Audio Guide
-- Database: PostgreSQL 15+ with PostGIS extension
-- Created: 2026-03-16
-- Run: psql -U postgres -d your_db -f migration.sql
-- ============================================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE user_role AS ENUM ('user', 'merchant', 'admin');

CREATE TYPE merchant_status AS ENUM ('pending', 'approved', 'rejected', 'blocked');

CREATE TYPE store_status AS ENUM ('pending', 'active', 'hidden');

CREATE TYPE subscription_plan AS ENUM ('monthly', 'yearly');

CREATE TYPE merchant_plan AS ENUM ('starter', 'business', 'premium');

CREATE TYPE subscription_status AS ENUM ('active', 'expired', 'cancelled');

CREATE TYPE transaction_type AS ENUM ('user_subscription', 'merchant_subscription');

CREATE TYPE payment_method AS ENUM ('vnpay', 'momo', 'cash');

CREATE TYPE transaction_status AS ENUM ('pending', 'success', 'failed', 'refunded');

CREATE TYPE listen_source AS ENUM ('gps', 'qr');

-- ============================================================
-- TABLE: users
-- ============================================================
CREATE TABLE users (
    id                  UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
    name                VARCHAR(100)    NOT NULL,
    email               VARCHAR(255)    NOT NULL UNIQUE,
    password_hash       TEXT            NOT NULL,
    phone               VARCHAR(20),
    role                user_role       NOT NULL DEFAULT 'user',
    preferred_language  VARCHAR(10)     NOT NULL DEFAULT 'vi',
    avatar_url          TEXT,
    is_active           BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users (email);
CREATE INDEX idx_users_role  ON users (role);

COMMENT ON TABLE  users IS 'Tất cả tài khoản trong hệ thống (user / merchant / admin)';
COMMENT ON COLUMN users.preferred_language IS 'Mã ngôn ngữ ISO 639-1, ví dụ: vi, en, ko';

-- ============================================================
-- TABLE: languages
-- ============================================================
CREATE TABLE languages (
    id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    code        VARCHAR(10) NOT NULL UNIQUE,
    name        VARCHAR(50) NOT NULL,
    flag_icon   TEXT,
    is_active   BOOLEAN     NOT NULL DEFAULT TRUE
);

COMMENT ON TABLE languages IS 'Danh sách ngôn ngữ được hỗ trợ cho thuyết minh';

-- Seed data
INSERT INTO languages (code, name, flag_icon) VALUES
    ('vi', 'Vietnamese', '🇻🇳'),
    ('en', 'English',    '🇬🇧'),
    ('zh', 'Chinese',    '🇨🇳'),
    ('ko', 'Korean',     '🇰🇷'),
    ('ja', 'Japanese',   '🇯🇵'),
    ('fr', 'French',     '🇫🇷');

-- ============================================================
-- TABLE: merchants
-- ============================================================
CREATE TABLE merchants (
    id              UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID            NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    business_name   VARCHAR(200)    NOT NULL,
    tax_code        VARCHAR(50),
    status          merchant_status NOT NULL DEFAULT 'pending',
    reject_reason   TEXT,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_merchants_user_id ON merchants (user_id);
CREATE INDEX idx_merchants_status  ON merchants (status);

COMMENT ON TABLE merchants IS 'Thông tin doanh nghiệp của chủ quán (1 user → 1 merchant)';

-- ============================================================
-- TABLE: stores
-- ============================================================
CREATE TABLE stores (
    id              UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
    merchant_id     UUID            NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    name            VARCHAR(200)    NOT NULL,
    description     TEXT,
    address         TEXT            NOT NULL,
    location        GEOGRAPHY(POINT, 4326) NOT NULL,
    open_time       TIME,
    close_time      TIME,
    cover_image     TEXT,
    status          store_status    NOT NULL DEFAULT 'pending',
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

-- Spatial index cho query GPS (quan trọng nhất)
CREATE INDEX idx_stores_location   ON stores USING GIST (location);
CREATE INDEX idx_stores_merchant   ON stores (merchant_id);
CREATE INDEX idx_stores_status     ON stores (status);

COMMENT ON TABLE  stores IS 'Quán ăn — lưu tọa độ GPS với PostGIS cho tìm kiếm gần vị trí';
COMMENT ON COLUMN stores.location IS 'Tọa độ GPS: GEOGRAPHY(POINT, 4326) — ST_MakePoint(lng, lat)';

-- ============================================================
-- TABLE: store_images
-- ============================================================
CREATE TABLE store_images (
    id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id    UUID        NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    image_url   TEXT        NOT NULL,
    sort_order  INT         NOT NULL DEFAULT 0,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_store_images_store_id ON store_images (store_id);

COMMENT ON TABLE store_images IS 'Bộ ảnh của quán (nhiều ảnh / quán)';

-- ============================================================
-- TABLE: menus
-- ============================================================
CREATE TABLE menus (
    id              UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id        UUID            NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    name            VARCHAR(200)    NOT NULL,
    description     TEXT,
    price           NUMERIC(12, 0)  NOT NULL DEFAULT 0,
    image_url       TEXT,
    is_available    BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_menus_store_id ON menus (store_id);

COMMENT ON TABLE  menus IS 'Danh sách món ăn của quán';
COMMENT ON COLUMN menus.price IS 'Giá tiền VND, không có số thập phân';

-- ============================================================
-- TABLE: narrations
-- ============================================================
CREATE TABLE narrations (
    id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id        UUID        NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    language_id     UUID        NOT NULL REFERENCES languages(id) ON DELETE RESTRICT,
    audio_url       TEXT,
    text_content    TEXT,
    duration        INT,
    is_active       BOOLEAN     NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Mỗi quán chỉ có 1 bản narration / ngôn ngữ
    CONSTRAINT uq_narration_store_lang UNIQUE (store_id, language_id)
);

CREATE INDEX idx_narrations_store_id    ON narrations (store_id);
CREATE INDEX idx_narrations_language_id ON narrations (language_id);

COMMENT ON TABLE  narrations IS 'Nội dung audio thuyết minh theo từng ngôn ngữ';
COMMENT ON COLUMN narrations.duration IS 'Thời lượng audio tính bằng giây';

-- ============================================================
-- TABLE: listen_history
-- ============================================================
CREATE TABLE listen_history (
    id              UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID            NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    store_id        UUID            NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    narration_id    UUID            NOT NULL REFERENCES narrations(id) ON DELETE CASCADE,
    source          listen_source   NOT NULL DEFAULT 'gps',
    listened_at     TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_listen_history_user_id    ON listen_history (user_id);
CREATE INDEX idx_listen_history_store_id   ON listen_history (store_id);
CREATE INDEX idx_listen_history_listened_at ON listen_history (listened_at);

COMMENT ON TABLE  listen_history IS 'Ghi lại mỗi lần user nghe thuyết minh';
COMMENT ON COLUMN listen_history.source IS 'Cách user tìm quán: gps hoặc qr';

-- ============================================================
-- TABLE: subscriptions (User Premium)
-- ============================================================
CREATE TABLE subscriptions (
    id          UUID                PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID                NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan        subscription_plan   NOT NULL,
    start_date  DATE                NOT NULL,
    end_date    DATE                NOT NULL,
    status      subscription_status NOT NULL DEFAULT 'active',
    created_at  TIMESTAMPTZ         NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_user_id ON subscriptions (user_id);
CREATE INDEX idx_subscriptions_status  ON subscriptions (status);

COMMENT ON TABLE subscriptions IS 'Gói Premium dành cho User (khách du lịch)';

-- ============================================================
-- TABLE: merchant_subscriptions
-- ============================================================
CREATE TABLE merchant_subscriptions (
    id              UUID                PRIMARY KEY DEFAULT uuid_generate_v4(),
    merchant_id     UUID                NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    plan            merchant_plan       NOT NULL,
    max_store       INT                 NOT NULL DEFAULT 1,
    start_date      DATE                NOT NULL,
    end_date        DATE                NOT NULL,
    status          subscription_status NOT NULL DEFAULT 'active',
    created_at      TIMESTAMPTZ         NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_merchant_subs_merchant_id ON merchant_subscriptions (merchant_id);

COMMENT ON TABLE  merchant_subscriptions IS 'Gói đăng ký dành cho Merchant (chủ quán)';
COMMENT ON COLUMN merchant_subscriptions.max_store IS 'Số quán tối đa được tạo theo gói';

-- ============================================================
-- TABLE: transactions (Bảng trung tâm thanh toán)
-- ============================================================
CREATE TABLE transactions (
    id              UUID                PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID                NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    amount          NUMERIC(15, 0)      NOT NULL,
    currency        VARCHAR(10)         NOT NULL DEFAULT 'VND',
    type            transaction_type    NOT NULL,
    payment_method  payment_method      NOT NULL,
    payment_ref_id  UUID,
    status          transaction_status  NOT NULL DEFAULT 'pending',
    description     TEXT,
    created_at      TIMESTAMPTZ         NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ         NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_transactions_user_id ON transactions (user_id);
CREATE INDEX idx_transactions_status  ON transactions (status);
CREATE INDEX idx_transactions_method  ON transactions (payment_method);

COMMENT ON TABLE  transactions IS 'Bảng trung tâm ghi nhận mọi giao dịch thanh toán';
COMMENT ON COLUMN transactions.payment_ref_id IS 'FK tới payment_vnpay.id hoặc payment_momo.id';

-- ============================================================
-- TABLE: payment_vnpay
-- ============================================================
CREATE TABLE payment_vnpay (
    id                  UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id      UUID        NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
    vnp_txn_ref         VARCHAR(100) NOT NULL UNIQUE,
    vnp_amount          BIGINT      NOT NULL,
    vnp_order_info      TEXT,
    vnp_transaction_no  VARCHAR(100),
    vnp_bank_code       VARCHAR(50),
    vnp_pay_date        VARCHAR(20),
    vnp_response_code   VARCHAR(10),
    vnp_secure_hash     TEXT,
    raw_response        JSONB,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_payment_vnpay_transaction_id ON payment_vnpay (transaction_id);
CREATE INDEX idx_payment_vnpay_txn_ref        ON payment_vnpay (vnp_txn_ref);

COMMENT ON TABLE  payment_vnpay IS 'Chi tiết callback / response từ VNPAY';
COMMENT ON COLUMN payment_vnpay.vnp_amount IS 'Số tiền × 100 theo chuẩn VNPAY';
COMMENT ON COLUMN payment_vnpay.vnp_response_code IS '00 = thành công';
COMMENT ON COLUMN payment_vnpay.raw_response IS 'Toàn bộ payload JSON từ VNPAY để audit/debug';

-- ============================================================
-- TABLE: payment_momo
-- ============================================================
CREATE TABLE payment_momo (
    id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id  UUID        NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
    order_id        VARCHAR(100) NOT NULL UNIQUE,
    request_id      VARCHAR(100),
    amount          BIGINT      NOT NULL,
    order_info      TEXT,
    momo_trans_id   VARCHAR(100),
    result_code     INT,
    message         TEXT,
    pay_type        VARCHAR(50),
    signature       TEXT,
    raw_response    JSONB,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_payment_momo_transaction_id ON payment_momo (transaction_id);
CREATE INDEX idx_payment_momo_order_id       ON payment_momo (order_id);

COMMENT ON TABLE  payment_momo IS 'Chi tiết callback / response từ MoMo OpenAPI v2';
COMMENT ON COLUMN payment_momo.result_code IS '0 = thành công';
COMMENT ON COLUMN payment_momo.signature IS 'HMAC-SHA256 để xác thực IPN callback';
COMMENT ON COLUMN payment_momo.raw_response IS 'Toàn bộ payload JSON từ MoMo để audit/debug';

-- ============================================================
-- TABLE: qr_codes
-- ============================================================
CREATE TABLE qr_codes (
    id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id        UUID        NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    code            VARCHAR(100) NOT NULL UNIQUE,
    qr_image_url    TEXT,
    is_active       BOOLEAN     NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_qr_codes_store_id ON qr_codes (store_id);
CREATE INDEX idx_qr_codes_code     ON qr_codes (code);

COMMENT ON TABLE  qr_codes IS 'Mã QR gắn tại quán — dùng khi GPS không chính xác';
COMMENT ON COLUMN qr_codes.code IS 'Chuỗi mã duy nhất, encode store_id';

-- ============================================================
-- VIEW: active_stores_with_narration_count
-- Tiện ích để hiển thị quán với số ngôn ngữ có sẵn
-- ============================================================
CREATE OR REPLACE VIEW active_stores_with_narration_count AS
SELECT
    s.id,
    s.name,
    s.address,
    s.location,
    s.open_time,
    s.close_time,
    s.cover_image,
    s.status,
    s.merchant_id,
    COUNT(n.id) AS narration_count
FROM stores s
LEFT JOIN narrations n ON n.store_id = s.id AND n.is_active = TRUE
WHERE s.status = 'active'
GROUP BY s.id;

COMMENT ON VIEW active_stores_with_narration_count IS
    'Danh sách quán active kèm số lượng ngôn ngữ có narration';

-- ============================================================
-- FUNCTION: find_nearby_stores
-- Tìm quán trong bán kính radius_meters (mét)
-- Usage: SELECT * FROM find_nearby_stores(106.7009, 10.7769, 500);
-- ============================================================
CREATE OR REPLACE FUNCTION find_nearby_stores(
    p_lng          DOUBLE PRECISION,
    p_lat          DOUBLE PRECISION,
    p_radius_meters INT DEFAULT 500
)
RETURNS TABLE (
    id              UUID,
    name            VARCHAR,
    address         TEXT,
    distance_meters DOUBLE PRECISION,
    cover_image     TEXT,
    open_time       TIME,
    close_time      TIME,
    narration_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        asn.id,
        asn.name,
        asn.address,
        ST_Distance(asn.location, ST_MakePoint(p_lng, p_lat)::GEOGRAPHY) AS distance_meters,
        asn.cover_image,
        asn.open_time,
        asn.close_time,
        asn.narration_count
    FROM active_stores_with_narration_count asn
    WHERE ST_DWithin(
        asn.location,
        ST_MakePoint(p_lng, p_lat)::GEOGRAPHY,
        p_radius_meters
    )
    ORDER BY distance_meters ASC;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION find_nearby_stores IS
    'Tìm quán active gần tọa độ GPS (lng, lat) trong bán kính radius_meters mét';

-- ============================================================
-- TRIGGER: updated_at auto-update
-- ============================================================
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER trg_stores_updated_at
    BEFORE UPDATE ON stores
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER trg_transactions_updated_at
    BEFORE UPDATE ON transactions
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- ============================================================
-- DEFAULT ADMIN ACCOUNT (đổi password ngay sau khi deploy!)
-- password: Admin@123 (bcrypt hash)
-- ============================================================
INSERT INTO users (name, email, password_hash, role, is_active)
VALUES (
    'Super Admin',
    'admin@audiogue.vn',
    '$2b$12$placeholder_bcrypt_hash_change_immediately',
    'admin',
    TRUE
);

-- ============================================================
-- Done!
-- ============================================================
-- Kiểm tra các bảng đã tạo:
--   SELECT tablename FROM pg_tables WHERE schemaname = 'public';
-- Kiểm tra spatial index:
--   SELECT indexname FROM pg_indexes WHERE tablename = 'stores';
-- Test query GPS:
--   SELECT * FROM find_nearby_stores(106.7009, 10.7769, 500);
-- ============================================================

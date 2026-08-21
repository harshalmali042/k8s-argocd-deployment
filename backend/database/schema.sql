CREATE DATABASE IF NOT EXISTS shopapp;

USE shopapp;

-- ============================================
-- CATEGORIES
-- ============================================

CREATE TABLE IF NOT EXISTS categories (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    icon VARCHAR(100),
    count INT DEFAULT 0
);


-- ============================================
-- USERS
-- ============================================

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'customer',
    joined_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_users_email (email)
);


-- ============================================
-- PRODUCTS
-- ============================================

CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category_id VARCHAR(50) NOT NULL,
    brand VARCHAR(100),
    price DECIMAL(10,2) NOT NULL,
    old_price DECIMAL(10,2),
    discount INT DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0,
    reviews INT DEFAULT 0,
    is_featured BOOLEAN DEFAULT FALSE,
    is_new BOOLEAN DEFAULT FALSE,
    description TEXT,
    features JSON,
    image TEXT,

    CONSTRAINT fk_products_category
        FOREIGN KEY (category_id)
        REFERENCES categories(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    INDEX idx_products_category (category_id),
    INDEX idx_products_brand (brand)
);


-- ============================================
-- COUPONS
-- ============================================

CREATE TABLE IF NOT EXISTS coupons (
    code VARCHAR(50) PRIMARY KEY,
    discount_percent INT NOT NULL,
    max_discount DECIMAL(10,2) NOT NULL,
    description VARCHAR(255)
);


-- ============================================
-- ORDERS
-- ============================================

CREATE TABLE IF NOT EXISTS orders (
    id VARCHAR(50) PRIMARY KEY,
    user_id INT NULL,

    customer_name VARCHAR(150) NOT NULL,
    email VARCHAR(255) NOT NULL,

    subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
    discount DECIMAL(10,2) NOT NULL DEFAULT 0,
    shipping_fee DECIMAL(10,2) NOT NULL DEFAULT 0,
    total DECIMAL(10,2) NOT NULL DEFAULT 0,

    status VARCHAR(100) NOT NULL,
    eta VARCHAR(255),

    promo_code VARCHAR(50),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_orders_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON UPDATE CASCADE
        ON DELETE SET NULL,

    CONSTRAINT fk_orders_coupon
        FOREIGN KEY (promo_code)
        REFERENCES coupons(code)
        ON UPDATE CASCADE
        ON DELETE SET NULL,

    INDEX idx_orders_user (user_id),
    INDEX idx_orders_email (email),
    INDEX idx_orders_status (status)
);


-- ============================================
-- ORDER ITEMS
-- ============================================

CREATE TABLE IF NOT EXISTS order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,

    order_id VARCHAR(50) NOT NULL,
    product_id INT NULL,

    product_name VARCHAR(255) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    price DECIMAL(10,2) NOT NULL,

    CONSTRAINT fk_order_items_order
        FOREIGN KEY (order_id)
        REFERENCES orders(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT fk_order_items_product
        FOREIGN KEY (product_id)
        REFERENCES products(id)
        ON UPDATE CASCADE
        ON DELETE SET NULL,

    INDEX idx_order_items_order (order_id),
    INDEX idx_order_items_product (product_id)
);


-- ============================================
-- ORDER TRACKING STEPS
-- ============================================

CREATE TABLE IF NOT EXISTS order_tracking_steps (
    id INT AUTO_INCREMENT PRIMARY KEY,

    order_id VARCHAR(50) NOT NULL,

    title VARCHAR(255) NOT NULL,
    tracking_date VARCHAR(100),
    done BOOLEAN DEFAULT FALSE,
    current_step BOOLEAN DEFAULT FALSE,

    CONSTRAINT fk_tracking_order
        FOREIGN KEY (order_id)
        REFERENCES orders(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    INDEX idx_tracking_order (order_id)
);
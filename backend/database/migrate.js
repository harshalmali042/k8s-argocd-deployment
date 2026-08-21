import mysql from "mysql2/promise";
import dotenv from "dotenv";

import {
  products,
  categories,
  coupons,
  orders,
  users,
} from "../src/data/mockData.js";

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

async function migrate() {
  const connection = await pool.getConnection();

  try {
    console.log("🚀 Starting ShopApp database migration...");

    await connection.beginTransaction();

    /*
     * Delete existing data.
     * Order matters because of foreign keys.
     */
    console.log("🧹 Clearing existing data...");

    await connection.query("DELETE FROM order_tracking_steps");
    await connection.query("DELETE FROM order_items");
    await connection.query("DELETE FROM orders");
    await connection.query("DELETE FROM products");
    await connection.query("DELETE FROM coupons");
    await connection.query("DELETE FROM users");
    await connection.query("DELETE FROM categories");

    /*
     * Reset AUTO_INCREMENT values
     */
    await connection.query(
      "ALTER TABLE products AUTO_INCREMENT = 1"
    );

    await connection.query(
      "ALTER TABLE users AUTO_INCREMENT = 1"
    );

    await connection.query(
      "ALTER TABLE order_items AUTO_INCREMENT = 1"
    );

    await connection.query(
      "ALTER TABLE order_tracking_steps AUTO_INCREMENT = 1"
    );

    // ==========================================
    // CATEGORIES
    // ==========================================

    console.log(`📂 Migrating ${categories.length} categories...`);

    for (const category of categories) {
      await connection.query(
        `
        INSERT INTO categories
        (id, name, icon, count)
        VALUES (?, ?, ?, ?)
        `,
        [
          category.id,
          category.name,
          category.icon,
          category.count,
        ]
      );
    }

    // ==========================================
    // PRODUCTS
    // ==========================================

    console.log(`📦 Migrating ${products.length} products...`);

    const categoryMap = new Map(
      categories.map((category) => [
        category.name,
        category.id,
      ])
    );

    for (const product of products) {
      const categoryId = categoryMap.get(product.category);

      if (!categoryId) {
        throw new Error(
          `Category not found for product: ${product.name}`
        );
      }

      await connection.query(
        `
        INSERT INTO products
        (
          id,
          name,
          category_id,
          brand,
          price,
          old_price,
          discount,
          rating,
          reviews,
          is_featured,
          is_new,
          description,
          features,
          image
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          product.id,
          product.name,
          categoryId,
          product.brand,
          product.price,
          product.oldPrice,
          product.discount,
          product.rating,
          product.reviews,
          product.isFeatured,
          product.isNew,
          product.description,
          JSON.stringify(product.features),
          product.image,
        ]
      );
    }

    // ==========================================
    // COUPONS
    // ==========================================

    console.log(`🎟️ Migrating ${coupons.length} coupons...`);

    for (const coupon of coupons) {
      await connection.query(
        `
        INSERT INTO coupons
        (
          code,
          discount_percent,
          max_discount,
          description
        )
        VALUES (?, ?, ?, ?)
        `,
        [
          coupon.code,
          coupon.discountPercent,
          coupon.maxDiscount,
          coupon.description,
        ]
      );
    }

    // ==========================================
    // USERS
    // ==========================================

    console.log(`👤 Migrating ${users.length} users...`);

    for (const user of users) {
      await connection.query(
        `
        INSERT INTO users
        (
          id,
          name,
          email,
          password_hash,
          role,
          joined_at
        )
        VALUES (?, ?, ?, ?, ?, ?)
        `,
        [
          user.id,
          user.name,
          user.email,
          user.passwordHash,
          user.role,
          new Date(user.joinedAt),
        ]
      );
    }

    // ==========================================
    // ORDERS
    // ==========================================

    console.log(`🛒 Migrating ${orders.length} orders...`);

    for (const order of orders) {
      // Find the user using email
      const [userRows] = await connection.query(
        `
        SELECT id
        FROM users
        WHERE email = ?
        LIMIT 1
        `,
        [order.email]
      );

      const userId =
        userRows.length > 0 ? userRows[0].id : null;

      await connection.query(
        `
        INSERT INTO orders
        (
          id,
          user_id,
          customer_name,
          email,
          subtotal,
          discount,
          shipping_fee,
          total,
          status,
          eta,
          promo_code,
          created_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          order.id,
          userId,
          order.customerName,
          order.email,
          order.subtotal,
          order.discount,
          order.shippingFee,
          order.total,
          order.status,
          order.eta,
          null,
          new Date(order.createdAt),
        ]
      );

      // ========================================
      // ORDER ITEMS
      // ========================================

      for (const item of order.items) {
        await connection.query(
          `
          INSERT INTO order_items
          (
            order_id,
            product_id,
            product_name,
            quantity,
            price
          )
          VALUES (?, ?, ?, ?, ?)
          `,
          [
            order.id,
            item.productId,
            item.name,
            item.quantity,
            item.price,
          ]
        );
      }

      // ========================================
      // TRACKING STEPS
      // ========================================

      for (const step of order.steps) {
        await connection.query(
          `
          INSERT INTO order_tracking_steps
          (
            order_id,
            title,
            tracking_date,
            done,
            current_step
          )
          VALUES (?, ?, ?, ?, ?)
          `,
          [
            order.id,
            step.title,
            step.date,
            step.done,
            step.current,
          ]
        );
      }
    }

    await connection.commit();

    console.log("");
    console.log("====================================");
    console.log("✅ DATABASE MIGRATION SUCCESSFUL");
    console.log("====================================");
    console.log(`Categories: ${categories.length}`);
    console.log(`Products:   ${products.length}`);
    console.log(`Coupons:    ${coupons.length}`);
    console.log(`Users:      ${users.length}`);
    console.log(`Orders:     ${orders.length}`);

  } catch (error) {
    await connection.rollback();

    console.error("");
    console.error("❌ DATABASE MIGRATION FAILED");
    console.error(error);

    process.exitCode = 1;
  } finally {
    connection.release();
    await pool.end();
  }
}

migrate();
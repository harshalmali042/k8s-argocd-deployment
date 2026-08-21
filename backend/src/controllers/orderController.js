import pool from "../config/db.js";

// Helper: convert MySQL rows into the response format
async function getOrderById(orderId, connection = pool) {
  const [orderRows] = await connection.query(
    `
    SELECT
      o.id,
      o.user_id AS userId,
      o.customer_name AS customerName,
      o.email,
      o.subtotal,
      o.discount,
      o.shipping_fee AS shippingFee,
      o.total,
      o.status,
      o.eta,
      o.promo_code AS promoCode,
      o.created_at AS createdAt
    FROM orders o
    WHERE o.id = ?
    `,
    [orderId]
  );

  if (orderRows.length === 0) {
    return null;
  }

  const order = orderRows[0];

  const [itemRows] = await connection.query(
    `
    SELECT
      oi.product_id AS productId,
      oi.product_name AS name,
      oi.quantity,
      oi.price
    FROM order_items oi
    WHERE oi.order_id = ?
    ORDER BY oi.id ASC
    `,
    [orderId]
  );

  const [stepRows] = await connection.query(
    `
    SELECT
      title,
      tracking_date AS date,
      done,
      current_step AS current
    FROM order_tracking_steps
    WHERE order_id = ?
    ORDER BY id ASC
    `,
    [orderId]
  );

  return {
    id: order.id,
    customerName: order.customerName,
    email: order.email,
    items: itemRows.map((item) => ({
      productId: item.productId,
      name: item.name,
      quantity: Number(item.quantity),
      price: Number(item.price),
    })),
    subtotal: Number(order.subtotal),
    discount: Number(order.discount),
    shippingFee: Number(order.shippingFee),
    total: Number(order.total),
    promoCode: order.promoCode,
    status: order.status,
    eta: order.eta,
    createdAt: order.createdAt,
    steps: stepRows.map((step) => ({
      title: step.title,
      date: step.date,
      done: Boolean(step.done),
      current: Boolean(step.current),
    })),
  };
}


// @desc    Get all orders
// @route   GET /api/orders
// @access  Public
export const getAllOrders = async (req, res) => {
  try {
    const [orderRows] = await pool.query(`
      SELECT id
      FROM orders
      ORDER BY created_at DESC
    `);

    const orders = [];

    for (const row of orderRows) {
      const order = await getOrderById(row.id);

      if (order) {
        orders.push(order);
      }
    }

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });

  } catch (error) {
    console.error("Get orders error:", error);

    res.status(500).json({
      success: false,
      message: "Server Error fetching orders",
      error: error.message,
    });
  }
};


// @desc    Track an order by Order ID / Tracking Number
// @route   GET /api/orders/track/:trackingId
// @access  Public
export const trackOrder = async (req, res) => {
  try {
    const { trackingId } = req.params;
    const cleanId = trackingId.trim().toUpperCase();

    const order = await getOrderById(cleanId);

    if (!order) {
      // Preserve your existing demo behavior
      const dynamicOrder = {
        id: cleanId,
        customerName: "Valued Customer",
        email: "customer@example.com",
        status: "In Transit",
        eta: "Within 2 business days",
        subtotal: 2499,
        discount: 0,
        shippingFee: 0,
        total: 2499,
        steps: [
          {
            title: "Order Placed & Confirmed",
            date: "Aug 18, 09:00 AM",
            done: true,
            current: false,
          },
          {
            title: "Packed at Fulfillment Hub",
            date: "Aug 18, 02:30 PM",
            done: true,
            current: false,
          },
          {
            title: "Dispatched with Logistics Express",
            date: "Aug 19, 07:45 AM",
            done: true,
            current: true,
          },
          {
            title: "Out for Delivery to Destination",
            date: "Tomorrow",
            done: false,
            current: false,
          },
          {
            title: "Delivered to Customer",
            date: "Aug 21",
            done: false,
            current: false,
          },
        ],
      };

      return res.status(200).json({
        success: true,
        message: "Order located",
        data: dynamicOrder,
      });
    }

    res.status(200).json({
      success: true,
      data: order,
    });

  } catch (error) {
    console.error("Track order error:", error);

    res.status(500).json({
      success: false,
      message: "Server Error tracking order",
      error: error.message,
    });
  }
};


// @desc    Create a new order (Checkout)
// @route   POST /api/orders
// @access  Public
export const createOrder = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const {
      items,
      customerName,
      email,
      promoCode,
      discountAmount,
    } = req.body;

    if (!items || !items.length) {
      connection.release();

      return res.status(400).json({
        success: false,
        message: "Cart is empty. Please add items to place an order.",
      });
    }

    const subtotal = items.reduce(
      (sum, item) =>
        sum + Number(item.price) * Number(item.quantity),
      0
    );

    const discount = Number(discountAmount) || 0;

    const shippingFee = subtotal >= 999 ? 0 : 99;

    const total = Math.max(
      0,
      subtotal - discount + shippingFee
    );

    const randomNum = Math.floor(
      10000 + Math.random() * 90000
    );

    const newOrderId = `ORD-${randomNum}`;

    const orderCustomerName =
      customerName || "Guest Customer";

    const orderEmail =
      email || "customer@example.com";

    // Find user if email belongs to an existing account
    const [userRows] = await connection.query(
      `
      SELECT id
      FROM users
      WHERE LOWER(email) = LOWER(?)
      LIMIT 1
      `,
      [orderEmail]
    );

    const userId =
      userRows.length > 0
        ? userRows[0].id
        : null;

    // Validate promo code if provided
    let validPromoCode = null;

    if (promoCode) {
      const [couponRows] = await connection.query(
        `
        SELECT code
        FROM coupons
        WHERE code = ?
        LIMIT 1
        `,
        [promoCode.trim().toUpperCase()]
      );

      if (couponRows.length > 0) {
        validPromoCode = couponRows[0].code;
      }
    }

    await connection.beginTransaction();

    // ==========================================
    // CREATE ORDER
    // ==========================================

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
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
      `,
      [
        newOrderId,
        userId,
        orderCustomerName,
        orderEmail,
        subtotal,
        discount,
        shippingFee,
        total,
        "Order Confirmed",
        "Within 2-3 business days",
        validPromoCode,
      ]
    );

    // ==========================================
    // CREATE ORDER ITEMS
    // ==========================================

    for (const item of items) {
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
          newOrderId,
          item.productId || item.id || null,
          item.name,
          Number(item.quantity),
          Number(item.price),
        ]
      );
    }

    // ==========================================
    // CREATE TRACKING STEPS
    // ==========================================

    const steps = [
      {
        title: "Order Confirmed & Processed",
        date: "Just now",
        done: true,
        current: true,
      },
      {
        title: "Quality Check & Packed at Hub",
        date: "Pending",
        done: false,
        current: false,
      },
      {
        title: "Dispatched with Express Logistics",
        date: "Pending",
        done: false,
        current: false,
      },
      {
        title: "Out for Delivery by Courier Partner",
        date: "Pending",
        done: false,
        current: false,
      },
      {
        title: "Estimated Delivery to Doorstep",
        date: "In 2-3 Days",
        done: false,
        current: false,
      },
    ];

    for (const step of steps) {
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
          newOrderId,
          step.title,
          step.date,
          step.done,
          step.current,
        ]
      );
    }

    await connection.commit();

    // Get the complete order from MySQL
    const newOrder = await getOrderById(
      newOrderId,
      connection
    );

    res.status(201).json({
      success: true,
      message: "Order placed successfully!",
      data: newOrder,
    });

  } catch (error) {
    await connection.rollback();

    console.error("Create order error:", error);

    res.status(500).json({
      success: false,
      message: "Server Error placing order",
      error: error.message,
    });

  } finally {
    connection.release();
  }
};
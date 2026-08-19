import { orders } from "../data/mockData.js";

// @desc    Get all orders
// @route   GET /api/orders
// @access  Public
export const getAllOrders = (req, res) => {
  try {
    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
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
export const trackOrder = (req, res) => {
  try {
    const { trackingId } = req.params;
    const cleanId = trackingId.trim().toUpperCase();

    const order = orders.find(
      (o) => o.id.toUpperCase() === cleanId
    );

    if (!order) {
      // If not found, generate a dynamic mock timeline for any entered ID so the user can test seamlessly
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
          { title: "Order Placed & Confirmed", date: "Aug 18, 09:00 AM", done: true, current: false },
          { title: "Packed at Fulfillment Hub", date: "Aug 18, 02:30 PM", done: true, current: false },
          { title: "Dispatched with Logistics Express", date: "Aug 19, 07:45 AM", done: true, current: true },
          { title: "Out for Delivery to Destination", date: "Tomorrow", done: false, current: false },
          { title: "Delivered to Customer", date: "Aug 21", done: false, current: false },
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
export const createOrder = (req, res) => {
  try {
    const { items, customerName, email, promoCode, discountAmount } = req.body;

    if (!items || !items.length) {
      return res.status(400).json({
        success: false,
        message: "Cart is empty. Please add items to place an order.",
      });
    }

    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const discount = discountAmount || 0;
    const shippingFee = subtotal >= 999 ? 0 : 99;
    const total = Math.max(0, subtotal - discount + shippingFee);

    const randomNum = Math.floor(10000 + Math.random() * 90000);
    const newOrderId = `ORD-${randomNum}`;

    const newOrder = {
      id: newOrderId,
      customerName: customerName || "Guest Customer",
      email: email || "customer@example.com",
      items,
      subtotal,
      discount,
      shippingFee,
      total,
      promoCode: promoCode || null,
      status: "Order Confirmed",
      eta: "Within 2-3 business days",
      createdAt: new Date().toISOString(),
      steps: [
        { title: "Order Confirmed & Processed", date: "Just now", done: true, current: true },
        { title: "Quality Check & Packed at Hub", date: "Pending", done: false, current: false },
        { title: "Dispatched with Express Logistics", date: "Pending", done: false, current: false },
        { title: "Out for Delivery by Courier Partner", date: "Pending", done: false, current: false },
        { title: "Estimated Delivery to Doorstep", date: "In 2-3 Days", done: false, current: false },
      ],
    };

    orders.unshift(newOrder);

    res.status(201).json({
      success: true,
      message: "Order placed successfully!",
      data: newOrder,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error placing order",
      error: error.message,
    });
  }
};

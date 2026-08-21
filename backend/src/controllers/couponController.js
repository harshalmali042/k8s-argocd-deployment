import pool from "../config/db.js";

// @desc    Validate a promo coupon code
// @route   POST /api/coupons/validate
// @access  Public
export const validateCoupon = async (req, res) => {
  try {
    const { code, subtotal } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: "Please provide a coupon code",
      });
    }

    const cleanCode = code.trim().toUpperCase();

    // Find coupon from MySQL
    const [rows] = await pool.query(
      `
      SELECT
        code,
        discount_percent AS discountPercent,
        max_discount AS maxDiscount,
        description
      FROM coupons
      WHERE code = ?
      LIMIT 1
      `,
      [cleanCode]
    );

    if (rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: `Coupon "${cleanCode}" is invalid or expired. Try SAVE20 or SUMMER40.`,
      });
    }

    const coupon = rows[0];

    const cartSubtotal = subtotal
      ? parseFloat(subtotal)
      : 0;

    const discountAmount = Math.min(
      (cartSubtotal * Number(coupon.discountPercent)) / 100,
      Number(coupon.maxDiscount)
    );

    res.status(200).json({
      success: true,
      message: `Coupon applied: ${coupon.discountPercent}% OFF!`,
      data: {
        code: coupon.code,
        discountPercent: Number(coupon.discountPercent),
        discountAmount,
        description: coupon.description,
      },
    });

  } catch (error) {
    console.error("Validate coupon error:", error);

    res.status(500).json({
      success: false,
      message: "Server Error validating coupon",
      error: error.message,
    });
  }
};
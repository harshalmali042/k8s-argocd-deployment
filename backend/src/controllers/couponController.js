import { coupons } from "../data/mockData.js";

// @desc    Validate a promo coupon code
// @route   POST /api/coupons/validate
// @access  Public
export const validateCoupon = (req, res) => {
  try {
    const { code, subtotal } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: "Please provide a coupon code",
      });
    }

    const cleanCode = code.trim().toUpperCase();
    const coupon = coupons.find((c) => c.code === cleanCode);

    if (!coupon) {
      return res.status(400).json({
        success: false,
        message: `Coupon "${cleanCode}" is invalid or expired. Try SAVE20 or SUMMER40.`,
      });
    }

    const cartSubtotal = subtotal ? parseFloat(subtotal) : 0;
    const discountAmount = Math.min(
      (cartSubtotal * coupon.discountPercent) / 100,
      coupon.maxDiscount
    );

    res.status(200).json({
      success: true,
      message: `Coupon applied: ${coupon.discountPercent}% OFF!`,
      data: {
        code: coupon.code,
        discountPercent: coupon.discountPercent,
        discountAmount,
        description: coupon.description,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error validating coupon",
      error: error.message,
    });
  }
};

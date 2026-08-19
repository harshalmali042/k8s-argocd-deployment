import { categories, products } from "../data/mockData.js";

// @desc    Get all categories with live item count
// @route   GET /api/categories
// @access  Public
export const getCategories = (req, res) => {
  try {
    const categoriesWithCount = categories.map((cat) => {
      if (cat.name === "All Categories") {
        return { ...cat, count: products.length };
      }
      const count = products.filter(
        (p) => p.category.toLowerCase() === cat.name.toLowerCase()
      ).length;
      return { ...cat, count };
    });

    res.status(200).json({
      success: true,
      count: categoriesWithCount.length,
      data: categoriesWithCount,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error fetching categories",
      error: error.message,
    });
  }
};

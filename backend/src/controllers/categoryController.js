import pool from "../config/db.js";

// @desc    Get all categories with live item count
// @route   GET /api/categories
// @access  Public
export const getCategories = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        c.id,
        c.name,
        c.icon,
        CASE
          WHEN c.name = 'All Categories'
            THEN (SELECT COUNT(*) FROM products)
          ELSE COUNT(p.id)
        END AS count
      FROM categories c
      LEFT JOIN products p
        ON p.category_id = c.id
      GROUP BY c.id, c.name, c.icon
      ORDER BY
        CASE
          WHEN c.name = 'All Categories' THEN 0
          ELSE 1
        END,
        c.name ASC
    `);

    const categoriesWithCount = rows.map((category) => ({
      id: category.id,
      name: category.name,
      icon: category.icon,
      count: Number(category.count),
    }));

    res.status(200).json({
      success: true,
      count: categoriesWithCount.length,
      data: categoriesWithCount,
    });

  } catch (error) {
    console.error("Get categories error:", error);

    res.status(500).json({
      success: false,
      message: "Server Error fetching categories",
      error: error.message,
    });
  }
};
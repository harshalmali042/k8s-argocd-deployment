import pool from "../config/db.js";

// Convert MySQL product row to the same format
// your frontend currently receives from mockData.js
function formatProduct(row) {
  let features = [];

  try {
    features = row.features
      ? typeof row.features === "string"
        ? JSON.parse(row.features)
        : row.features
      : [];
  } catch {
    features = [];
  }

  return {
    id: row.id,
    name: row.name,
    category: row.category,
    brand: row.brand,
    price: Number(row.price),
    oldPrice: row.oldPrice !== null ? Number(row.oldPrice) : null,
    discount: Number(row.discount || 0),
    rating: Number(row.rating || 0),
    reviews: Number(row.reviews || 0),
    isFeatured: Boolean(row.isFeatured),
    isNew: Boolean(row.isNew),
    description: row.description || "",
    features,
    image: row.image || "",
  };
}


// @desc    Get all products with filtering, search, and sorting
// @route   GET /api/products
// @access  Public
export const getProducts = async (req, res) => {
  try {
    const {
      category,
      brand,
      search,
      minPrice,
      maxPrice,
      isFeatured,
      isNew,
      deals,
      bestsellers,
      sort,
    } = req.query;

    let sql = `
      SELECT
        p.id,
        p.name,
        c.name AS category,
        p.brand,
        p.price,
        p.old_price AS oldPrice,
        p.discount,
        p.rating,
        p.reviews,
        p.is_featured AS isFeatured,
        p.is_new AS isNew,
        p.description,
        p.features,
        p.image
      FROM products p
      INNER JOIN categories c
        ON p.category_id = c.id
      WHERE 1 = 1
    `;

    const params = [];

    // Category filter
    if (category && category !== "All Categories") {
      sql += ` AND LOWER(c.name) = LOWER(?)`;
      params.push(category);
    }

    // Brand filter
    if (brand) {
      sql += ` AND LOWER(p.brand) = LOWER(?)`;
      params.push(brand);
    }

    // Search
    if (search) {
      sql += `
        AND (
          LOWER(p.name) LIKE LOWER(?)
          OR LOWER(c.name) LIKE LOWER(?)
          OR LOWER(p.brand) LIKE LOWER(?)
          OR LOWER(p.description) LIKE LOWER(?)
        )
      `;

      const searchTerm = `%${search.trim()}%`;

      params.push(
        searchTerm,
        searchTerm,
        searchTerm,
        searchTerm
      );
    }

    // Minimum price
    if (minPrice) {
      sql += ` AND p.price >= ?`;
      params.push(parseFloat(minPrice));
    }

    // Maximum price
    if (maxPrice) {
      sql += ` AND p.price <= ?`;
      params.push(parseFloat(maxPrice));
    }

    // Deals
    if (deals === "true") {
      sql += ` AND p.discount >= 20`;
    }

    // Best sellers
    if (bestsellers === "true") {
      sql += ` AND p.rating >= 4.7`;
    }

    // New products
    if (isNew === "true") {
      sql += ` AND p.is_new = TRUE`;
    }

    // Featured products
    if (isFeatured === "true") {
      sql += ` AND p.is_featured = TRUE`;
    }

    // Sorting
    if (sort === "price-asc") {
      sql += ` ORDER BY p.price ASC`;
    } else if (sort === "price-desc") {
      sql += ` ORDER BY p.price DESC`;
    } else if (sort === "rating-desc") {
      sql += ` ORDER BY p.rating DESC`;
    } else if (sort === "popular") {
      sql += ` ORDER BY p.reviews DESC`;
    } else {
      sql += ` ORDER BY p.id ASC`;
    }

    const [rows] = await pool.query(sql, params);

    const result = rows.map(formatProduct);

    res.status(200).json({
      success: true,
      count: result.length,
      data: result,
    });

  } catch (error) {
    console.error("Get products error:", error);

    res.status(500).json({
      success: false,
      message: "Server Error fetching products",
      error: error.message,
    });
  }
};


// @desc    Get single product by ID
// @route   GET /api/products/:id
// @access  Public
export const getProductById = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);

    const [rows] = await pool.query(
      `
      SELECT
        p.id,
        p.name,
        c.name AS category,
        p.brand,
        p.price,
        p.old_price AS oldPrice,
        p.discount,
        p.rating,
        p.reviews,
        p.is_featured AS isFeatured,
        p.is_new AS isNew,
        p.description,
        p.features,
        p.image
      FROM products p
      INNER JOIN categories c
        ON p.category_id = c.id
      WHERE p.id = ?
      `,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Product with ID ${req.params.id} not found`,
      });
    }

    res.status(200).json({
      success: true,
      data: formatProduct(rows[0]),
    });

  } catch (error) {
    console.error("Get product error:", error);

    res.status(500).json({
      success: false,
      message: "Server Error fetching product",
      error: error.message,
    });
  }
};


// @desc    Create a new product
// @route   POST /api/products
// @access  Public (for dev simulation)
export const createProduct = async (req, res) => {
  try {
    const {
      name,
      category,
      brand,
      price,
      oldPrice,
      discount,
      description,
      features,
      image,
    } = req.body;

    if (!name || !category || !price) {
      return res.status(400).json({
        success: false,
        message: "Please provide name, category, and price",
      });
    }

    // Find category ID
    const [categoryRows] = await pool.query(
      `
      SELECT id
      FROM categories
      WHERE LOWER(name) = LOWER(?)
      LIMIT 1
      `,
      [category]
    );

    if (categoryRows.length === 0) {
      return res.status(400).json({
        success: false,
        message: `Category '${category}' not found`,
      });
    }

    const categoryId = categoryRows[0].id;

    const [result] = await pool.query(
      `
      INSERT INTO products
      (
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
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        name,
        categoryId,
        brand || "Generic",
        parseFloat(price),
        oldPrice ? parseFloat(oldPrice) : parseFloat(price),
        discount ? parseInt(discount, 10) : 0,
        5.0,
        1,
        false,
        true,
        description || "",
        JSON.stringify(features || []),
        image ||
          "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=800&q=85",
      ]
    );

    // Get newly created product
    const [rows] = await pool.query(
      `
      SELECT
        p.id,
        p.name,
        c.name AS category,
        p.brand,
        p.price,
        p.old_price AS oldPrice,
        p.discount,
        p.rating,
        p.reviews,
        p.is_featured AS isFeatured,
        p.is_new AS isNew,
        p.description,
        p.features,
        p.image
      FROM products p
      INNER JOIN categories c
        ON p.category_id = c.id
      WHERE p.id = ?
      `,
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: formatProduct(rows[0]),
    });

  } catch (error) {
    console.error("Create product error:", error);

    res.status(500).json({
      success: false,
      message: "Server Error creating product",
      error: error.message,
    });
  }
};


// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Public
export const updateProduct = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);

    const [existingRows] = await pool.query(
      `
      SELECT
        p.id,
        p.name,
        c.name AS category,
        p.brand,
        p.price,
        p.old_price AS oldPrice,
        p.discount,
        p.rating,
        p.reviews,
        p.is_featured AS isFeatured,
        p.is_new AS isNew,
        p.description,
        p.features,
        p.image
      FROM products p
      INNER JOIN categories c
        ON p.category_id = c.id
      WHERE p.id = ?
      `,
      [id]
    );

    if (existingRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Product with ID ${req.params.id} not found`,
      });
    }

    const current = formatProduct(existingRows[0]);

    const updated = {
      ...current,
      ...req.body,
      id,
    };

    let categoryId = existingRows[0].category;

    if (req.body.category) {
      const [categoryRows] = await pool.query(
        `
        SELECT id
        FROM categories
        WHERE LOWER(name) = LOWER(?)
        LIMIT 1
        `,
        [req.body.category]
      );

      if (categoryRows.length === 0) {
        return res.status(400).json({
          success: false,
          message: `Category '${req.body.category}' not found`,
        });
      }

      categoryId = categoryRows[0].id;
    } else {
      const [categoryRows] = await pool.query(
        `
        SELECT category_id
        FROM products
        WHERE id = ?
        `,
        [id]
      );

      categoryId = categoryRows[0].category_id;
    }

    await pool.query(
      `
      UPDATE products
      SET
        name = ?,
        category_id = ?,
        brand = ?,
        price = ?,
        old_price = ?,
        discount = ?,
        rating = ?,
        reviews = ?,
        is_featured = ?,
        is_new = ?,
        description = ?,
        features = ?,
        image = ?
      WHERE id = ?
      `,
      [
        updated.name,
        categoryId,
        updated.brand,
        updated.price,
        updated.oldPrice,
        updated.discount,
        updated.rating,
        updated.reviews,
        updated.isFeatured,
        updated.isNew,
        updated.description,
        JSON.stringify(updated.features || []),
        updated.image,
        id,
      ]
    );

    const [rows] = await pool.query(
      `
      SELECT
        p.id,
        p.name,
        c.name AS category,
        p.brand,
        p.price,
        p.old_price AS oldPrice,
        p.discount,
        p.rating,
        p.reviews,
        p.is_featured AS isFeatured,
        p.is_new AS isNew,
        p.description,
        p.features,
        p.image
      FROM products p
      INNER JOIN categories c
        ON p.category_id = c.id
      WHERE p.id = ?
      `,
      [id]
    );

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: formatProduct(rows[0]),
    });

  } catch (error) {
    console.error("Update product error:", error);

    res.status(500).json({
      success: false,
      message: "Server Error updating product",
      error: error.message,
    });
  }
};


// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Public
export const deleteProduct = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);

    const [rows] = await pool.query(
      `
      SELECT
        p.id,
        p.name,
        c.name AS category,
        p.brand,
        p.price,
        p.old_price AS oldPrice,
        p.discount,
        p.rating,
        p.reviews,
        p.is_featured AS isFeatured,
        p.is_new AS isNew,
        p.description,
        p.features,
        p.image
      FROM products p
      INNER JOIN categories c
        ON p.category_id = c.id
      WHERE p.id = ?
      `,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Product with ID ${req.params.id} not found`,
      });
    }

    const deletedProduct = formatProduct(rows[0]);

    await pool.query(
      `DELETE FROM products WHERE id = ?`,
      [id]
    );

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
      data: deletedProduct,
    });

  } catch (error) {
    console.error("Delete product error:", error);

    res.status(500).json({
      success: false,
      message: "Server Error deleting product",
      error: error.message,
    });
  }
};
import { products } from "../data/mockData.js";

// @desc    Get all products with filtering, search, and sorting
// @route   GET /api/products
// @access  Public
export const getProducts = (req, res) => {
  try {
    let result = [...products];
    const { category, brand, search, minPrice, maxPrice, isFeatured, isNew, deals, bestsellers, sort } = req.query;

    // Filter by Category
    if (category && category !== "All Categories") {
      result = result.filter(
        (p) => p.category.toLowerCase() === category.toLowerCase()
      );
    }

    // Filter by Brand
    if (brand) {
      result = result.filter(
        (p) => p.brand.toLowerCase() === brand.toLowerCase()
      );
    }

    // Search query
    if (search) {
      const q = search.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }

    // Price range filters
    if (minPrice) {
      result = result.filter((p) => p.price >= parseFloat(minPrice));
    }
    if (maxPrice) {
      result = result.filter((p) => p.price <= parseFloat(maxPrice));
    }

    // Deals filter (discount >= 20%)
    if (deals === "true") {
      result = result.filter((p) => p.discount >= 20);
    }

    // Best Sellers filter (rating >= 4.7)
    if (bestsellers === "true") {
      result = result.filter((p) => p.rating >= 4.7);
    }

    // New arrivals
    if (isNew === "true") {
      result = result.filter((p) => p.isNew === true);
    }

    // Featured
    if (isFeatured === "true") {
      result = result.filter((p) => p.isFeatured === true);
    }

    // Sorting
    if (sort === "price-asc") {
      result.sort((a, b) => a.price - b.price);
    } else if (sort === "price-desc") {
      result.sort((a, b) => b.price - a.price);
    } else if (sort === "rating-desc") {
      result.sort((a, b) => b.rating - a.rating);
    } else if (sort === "popular") {
      result.sort((a, b) => b.reviews - a.reviews);
    }

    res.status(200).json({
      success: true,
      count: result.length,
      data: result,
    });
  } catch (error) {
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
export const getProductById = (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const product = products.find((p) => p.id === id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: `Product with ID ${req.params.id} not found`,
      });
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
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
export const createProduct = (req, res) => {
  try {
    const { name, category, brand, price, oldPrice, discount, description, features, image } = req.body;

    if (!name || !category || !price) {
      return res.status(400).json({
        success: false,
        message: "Please provide name, category, and price",
      });
    }

    const newId = products.length > 0 ? Math.max(...products.map((p) => p.id)) + 1 : 1;
    const newProduct = {
      id: newId,
      name,
      category,
      brand: brand || "Generic",
      price: parseFloat(price),
      oldPrice: oldPrice ? parseFloat(oldPrice) : parseFloat(price),
      discount: discount ? parseInt(discount, 10) : 0,
      rating: 5.0,
      reviews: 1,
      isFeatured: false,
      isNew: true,
      description: description || "",
      features: features || [],
      image: image || "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=800&q=85",
    };

    products.push(newProduct);

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: newProduct,
    });
  } catch (error) {
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
export const updateProduct = (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const index = products.findIndex((p) => p.id === id);

    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: `Product with ID ${req.params.id} not found`,
      });
    }

    products[index] = {
      ...products[index],
      ...req.body,
      id, // ensure ID is not mutated
    };

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: products[index],
    });
  } catch (error) {
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
export const deleteProduct = (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const index = products.findIndex((p) => p.id === id);

    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: `Product with ID ${req.params.id} not found`,
      });
    }

    const deleted = products.splice(index, 1);

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
      data: deleted[0],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error deleting product",
      error: error.message,
    });
  }
};

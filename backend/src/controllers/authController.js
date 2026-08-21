import pool from "../config/db.js";

// @desc    Sign in user
// @route   POST /api/auth/signin
// @access  Public
export const signin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    const [rows] = await pool.query(
      `
      SELECT
        id,
        name,
        email,
        password_hash AS passwordHash,
        role
      FROM users
      WHERE LOWER(email) = LOWER(?)
      LIMIT 1
      `,
      [email.trim()]
    );

    const user = rows[0];

    if (!user || user.passwordHash !== password) {
      // Keep existing demo behavior for now
      const demoUser = {
        id: null,
        name: email.split("@")[0],
        email,
        role: "customer",
        token: "demo-jwt-token-" + Date.now(),
      };

      return res.status(200).json({
        success: true,
        message: "Signed in successfully!",
        data: demoUser,
      });
    }

    res.status(200).json({
      success: true,
      message: "Welcome back!",
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: "demo-jwt-token-" + user.id,
      },
    });

  } catch (error) {
    console.error("Signin error:", error);

    res.status(500).json({
      success: false,
      message: "Server Error during signin",
      error: error.message,
    });
  }
};


// @desc    Register a new user
// @route   POST /api/auth/signup
// @access  Public
export const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide name, email, and password",
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check if user already exists
    const [existingRows] = await pool.query(
      `
      SELECT id
      FROM users
      WHERE LOWER(email) = LOWER(?)
      LIMIT 1
      `,
      [cleanEmail]
    );

    if (existingRows.length > 0) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    // Create user in MySQL
    const [result] = await pool.query(
      `
      INSERT INTO users
      (
        name,
        email,
        password_hash,
        role,
        joined_at
      )
      VALUES (?, ?, ?, ?, NOW())
      `,
      [
        name.trim(),
        cleanEmail,
        password,
        "customer",
      ]
    );

    const newUser = {
      id: result.insertId,
      name: name.trim(),
      email: cleanEmail,
      role: "customer",
    };

    res.status(201).json({
      success: true,
      message: "Account created successfully! Welcome to ShopApp.",
      data: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        token: "demo-jwt-token-" + newUser.id,
      },
    });

  } catch (error) {
    console.error("Signup error:", error);

    // Handle MySQL duplicate email constraint
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    res.status(500).json({
      success: false,
      message: "Server Error during signup",
      error: error.message,
    });
  }
};
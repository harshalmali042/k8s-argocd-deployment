import { users } from "../data/mockData.js";

// @desc    Sign in user
// @route   POST /api/auth/signin
// @access  Public
export const signin = (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());

    if (!user || user.passwordHash !== password) {
      // In demo mode, permit any credentials for easy testing
      const demoUser = {
        id: users.length + 1,
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
export const signup = (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide name, email, and password",
      });
    }

    const existing = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    const newUser = {
      id: users.length + 1,
      name,
      email,
      passwordHash: password,
      role: "customer",
      joinedAt: new Date().toISOString(),
    };

    users.push(newUser);

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
    res.status(500).json({
      success: false,
      message: "Server Error during signup",
      error: error.message,
    });
  }
};

import { useState, useEffect } from "react";
import {
  Search,
  ShoppingCart,
  Heart,
  User,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Grid2X2,
  Headphones,
  Shirt,
  Footprints,
  Sofa,
  Sparkles,
  CircleDot,
  BriefcaseBusiness,
  Gamepad2,
  Car,
  Truck,
  RotateCcw,
  ShieldCheck,
  Headset,
  Tag,
  Star,
  Menu,
  X,
  Plus,
  Minus,
  Trash2,
  Eye,
  CheckCircle2,
  ArrowRight,
  MapPin,
  HelpCircle,
  Package,
  ShoppingBag,
  Send,
  MessageSquare,
  BookOpen,
  Building2,
} from "lucide-react";

import "./App.css";
import {
  fetchProducts,
  fetchCategories,
  validateCoupon,
  createOrder,
  trackOrder as trackOrderApi,
  signIn as signInApi,
  signUp as signUpApi,
} from "./api.js";

// 10 Categories matching the reference design
const categories = [
  { name: "All Categories", icon: Grid2X2 },
  { name: "Electronics", icon: Headphones },
  { name: "Fashion", icon: Shirt },
  { name: "Footwear", icon: Footprints },
  { name: "Home & Kitchen", icon: Sofa },
  { name: "Beauty", icon: Sparkles },
  { name: "Sports", icon: CircleDot },
  { name: "Accessories", icon: BriefcaseBusiness },
  { name: "Toys & Games", icon: Gamepad2 },
  { name: "Automotive", icon: Car },
];

// Rich Product Catalog with Featured Products matching screenshot + extended categories
const productsData = [
  // 1. Featured Products from Screenshot
  {
    id: 1,
    name: "Wireless Headphones",
    category: "Electronics",
    brand: "Sony",
    price: 2499,
    oldPrice: 3199,
    discount: 20,
    rating: 4.8,
    reviews: 128,
    isFeatured: true,
    isNew: false,
    description:
      "Premium noise-cancelling wireless over-ear headphones with 40h playtime, ultra-deep dynamic bass, and ergonomic memory-foam earcups.",
    features: ["Active Noise Cancellation", "40h Battery Life", "Bluetooth 5.3", "Built-in Mic"],
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=85",
  },
  {
    id: 2,
    name: "Smart Watch Series 5",
    category: "Electronics",
    brand: "Apple",
    price: 3999,
    oldPrice: 5299,
    discount: 25,
    rating: 4.7,
    reviews: 96,
    isFeatured: true,
    isNew: true,
    description:
      "Always-On Retina display smartwatch with comprehensive heart-rate tracking, sleep analyzer, 100+ workout modes, and 50m water resistance.",
    features: ["Always-On OLED Display", "SpO2 & Heart Rate", "Water Resistant 50m", "7-Day Battery"],
    image:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=85",
  },
  {
    id: 3,
    name: "Running Shoes",
    category: "Footwear",
    brand: "Nike",
    price: 2999,
    oldPrice: 4299,
    discount: 30,
    rating: 4.6,
    reviews: 76,
    isFeatured: true,
    isNew: true,
    description:
      "Lightweight responsive athletic sneakers engineered with breathable mesh, air-cushioned impact absorption, and all-weather rubber traction.",
    features: ["Breathable Flymesh", "Air-Cushioned Sole", "Orthopedic Insole", "Anti-Slip Grip"],
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=85",
  },
  {
    id: 4,
    name: "Travel Backpack",
    category: "Accessories",
    brand: "Puma",
    price: 1699,
    oldPrice: 1999,
    discount: 15,
    rating: 4.8,
    reviews: 54,
    isFeatured: true,
    isNew: false,
    description:
      "Heavy-duty waterproof 35L travel backpack equipped with an anti-theft hidden pocket, dedicated 16\" padded laptop compartment, and USB charging pass-through.",
    features: ["35L Large Capacity", "16-inch Laptop Slot", "Waterproof Oxford Fabric", "USB Charging Port"],
    image:
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=85",
  },
  {
    id: 5,
    name: "Stylish Sunglasses",
    category: "Accessories",
    brand: "Ray-Ban",
    price: 899,
    oldPrice: 999,
    discount: 10,
    rating: 4.5,
    reviews: 42,
    isFeatured: true,
    isNew: true,
    description:
      "Iconic polarized retro sunglasses providing complete UV400 radiation protection with scratch-resistant polycarbonate lenses and lightweight matte frame.",
    features: ["UV400 Polarized Lenses", "Ultra-Light Frame", "Glare Reduction", "Includes Hard Case"],
    image:
      "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=85",
  },

  // 2. Extended Catalog for All Categories
  {
    id: 6,
    name: "Cotton Casual Slim Shirt",
    category: "Fashion",
    brand: "Levi's",
    price: 1299,
    oldPrice: 1899,
    discount: 31,
    rating: 4.6,
    reviews: 84,
    isFeatured: false,
    isNew: true,
    description: "100% breathable organic cotton slim-fit shirt with wrinkle-resistant finish for all-day comfort.",
    features: ["Pure Organic Cotton", "Slim Fit", "Wrinkle Resistant"],
    image:
      "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=85",
  },
  {
    id: 7,
    name: "Vintage Denim Jacket",
    category: "Fashion",
    brand: "Levi's",
    price: 2499,
    oldPrice: 3499,
    discount: 28,
    rating: 4.8,
    reviews: 62,
    isFeatured: false,
    isNew: false,
    description: "Classic rugged vintage wash denim jacket with custom brass buttons and dual chest pockets.",
    features: ["100% Heavyweight Denim", "Reinforced Stitching", "Vintage Stone Wash"],
    image:
      "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=800&q=85",
  },
  {
    id: 8,
    name: "Classic Leather Loafers",
    category: "Footwear",
    brand: "Puma",
    price: 3499,
    oldPrice: 4999,
    discount: 30,
    rating: 4.7,
    reviews: 48,
    isFeatured: false,
    isNew: false,
    description: "Handcrafted full-grain leather loafers with cushioned footbed and durable slip-resistant sole.",
    features: ["Full-Grain Leather", "Memory Cushion Insole", "Breathable Lining"],
    image:
      "https://images.unsplash.com/photo-1614252369475-531eba835eb1?auto=format&fit=crop&w=800&q=85",
  },
  {
    id: 9,
    name: "Modern Lounge Armchair",
    category: "Home & Kitchen",
    brand: "Nordic Living",
    price: 8499,
    oldPrice: 11999,
    discount: 29,
    rating: 4.9,
    reviews: 38,
    isFeatured: false,
    isNew: true,
    description: "Nordic styled velvet cushioned accent armchair with solid wood legs and ergonomic backrest.",
    features: ["Premium Velvet Upholstery", "Solid Oak Legs", "High-Density Foam"],
    image:
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=85",
  },
  {
    id: 10,
    name: "Stainless Steel Cookware Set",
    category: "Home & Kitchen",
    brand: "MasterChef",
    price: 3299,
    oldPrice: 4499,
    discount: 26,
    rating: 4.7,
    reviews: 53,
    isFeatured: false,
    isNew: false,
    description: "5-piece tri-ply stainless steel pots and pans set with induction bottom and tempered glass lids.",
    features: ["Tri-Ply Stainless Steel", "Induction Compatible", "Oven Safe up to 250°C"],
    image:
      "https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?auto=format&fit=crop&w=800&q=85",
  },
  {
    id: 11,
    name: "Glow Skin Care Essence",
    category: "Beauty",
    brand: "GlowLab",
    price: 1499,
    oldPrice: 1999,
    discount: 25,
    rating: 4.7,
    reviews: 112,
    isFeatured: false,
    isNew: true,
    description: "Hydrating hyaluronic acid & vitamin C facial serum for radiant, smooth, and youthful skin texture.",
    features: ["Hyaluronic Acid + Vit C", "Cruelty-Free", "Dermatologist Tested"],
    image:
      "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=85",
  },
  {
    id: 12,
    name: "Rosewater Hydrating Mist",
    category: "Beauty",
    brand: "GlowLab",
    price: 699,
    oldPrice: 899,
    discount: 22,
    rating: 4.6,
    reviews: 64,
    isFeatured: false,
    isNew: false,
    description: "Pure distilled organic rosewater facial spray that calms, hydrates, and refreshes tired skin.",
    features: ["100% Pure Distillate", "Alcohol-Free", "Instant Glow Effect"],
    image:
      "https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?auto=format&fit=crop&w=800&q=85",
  },
  {
    id: 13,
    name: "Pro Grip Basketball",
    category: "Sports",
    brand: "Nike",
    price: 1199,
    oldPrice: 1599,
    discount: 25,
    rating: 4.8,
    reviews: 67,
    isFeatured: false,
    isNew: false,
    description: "Official size 7 composite leather basketball engineered for indoor and outdoor tournament play.",
    features: ["Composite Microfiber", "Deep Channel Grip", "Official Size 7"],
    image:
      "https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=800&q=85",
  },
  {
    id: 14,
    name: "Non-Slip Yoga & Fitness Mat",
    category: "Sports",
    brand: "FitPro",
    price: 899,
    oldPrice: 1299,
    discount: 30,
    rating: 4.6,
    reviews: 82,
    isFeatured: false,
    isNew: true,
    description: "6mm high-density eco-friendly TPE workout mat with alignment lines and carrying strap.",
    features: ["Dual-Sided Non-Slip", "Eco-Friendly TPE", "Alignment Grid Lines"],
    image:
      "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?auto=format&fit=crop&w=800&q=85",
  },
  {
    id: 15,
    name: "Wireless Pro Controller",
    category: "Toys & Games",
    brand: "Logitech",
    price: 2499,
    oldPrice: 3299,
    discount: 24,
    rating: 4.7,
    reviews: 95,
    isFeatured: false,
    isNew: true,
    description: "Precision low-latency wireless gamepad with hall-effect triggers, dual vibration, and 20h battery.",
    features: ["Hall Effect Joysticks", "Dual Haptic Rumble", "Multi-Platform"],
    image:
      "https://images.unsplash.com/photo-1600080972464-8e5f35f63d08?auto=format&fit=crop&w=800&q=85",
  },
  {
    id: 16,
    name: "Classic Wooden Chess Set",
    category: "Toys & Games",
    brand: "Grandmaster",
    price: 1299,
    oldPrice: 1799,
    discount: 27,
    rating: 4.9,
    reviews: 43,
    isFeatured: false,
    isNew: false,
    description: "Hand-carved magnetic wooden chessboard with velvet-lined interior storage for tournament play.",
    features: ["Handcrafted Walnut Wood", "Magnetic Weighted Pieces", "Folding Board Design"],
    image:
      "https://images.unsplash.com/photo-1529699211952-734e80c4d42b?auto=format&fit=crop&w=800&q=85",
  },
  {
    id: 17,
    name: "Compact Car Air Purifier",
    category: "Automotive",
    brand: "AutoCare",
    price: 1899,
    oldPrice: 2499,
    discount: 24,
    rating: 4.5,
    reviews: 51,
    isFeatured: false,
    isNew: false,
    description: "High-efficiency HEPA car ionizer that rapidly removes smoke, dust, allergens, and odors.",
    features: ["True HEPA Filter", "USB Powered", "Silent Operation"],
    image:
      "https://images.unsplash.com/photo-1585771724684-38269d6639fd?auto=format&fit=crop&w=800&q=85",
  },
  {
    id: 18,
    name: "Magnetic Car Phone Mount",
    category: "Automotive",
    brand: "AutoCare",
    price: 699,
    oldPrice: 999,
    discount: 30,
    rating: 4.7,
    reviews: 79,
    isFeatured: false,
    isNew: true,
    description: "360-degree rotation ultra-strong neodymium magnetic dashboard mount for all smartphones.",
    features: ["Strong N52 Magnets", "360° Ball Joint", "One-Hand Operation"],
    image:
      "https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=800&q=85",
  },
  {
    id: 19,
    name: "Studio Soundbar 2.1",
    category: "Electronics",
    brand: "Sony",
    price: 4999,
    oldPrice: 6999,
    discount: 28,
    rating: 4.8,
    reviews: 64,
    isFeatured: false,
    isNew: true,
    description: "120W cinema surround soundbar with built-in subwoofer, HDMI ARC, and Bluetooth connectivity.",
    features: ["120W Peak Output", "Built-in Bass Subwoofer", "HDMI ARC & Optical"],
    image:
      "https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=800&q=85",
  },
  {
    id: 20,
    name: "Ceramic Aroma Diffuser",
    category: "Home & Kitchen",
    brand: "Nordic Living",
    price: 1599,
    oldPrice: 2299,
    discount: 30,
    rating: 4.8,
    reviews: 73,
    isFeatured: false,
    isNew: true,
    description: "Whisper-quiet ceramic ultrasonic aromatherapy diffuser with soothing warm LED glow and auto shut-off.",
    features: ["Handcrafted Ceramic", "Ultrasonic Cool Mist", "7 Ambient LED Colors", "Auto Shut-Off"],
    image:
      "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=800&q=85",
  },
];

// 4 Distinct Hero banner slides for the movable blue bar
const heroSlides = [
  {
    id: 1,
    kicker: "BEST QUALITY PRODUCTS",
    title: "Upgrade Your Lifestyle",
    highlight: "ShopApp",
    desc: "Discover amazing products at unbeatable prices.\nFast delivery and secure checkout.",
    cta: "Shop Now",
    targetCat: "All Categories",
    badge: "Summer Sale 40% OFF",
    theme: "theme-blue",
    img1: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=600&q=90",
    img2: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=500&q=90",
    img3: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=500&q=90",
    label1: "Headphones",
    label2: "Smartwatch",
    label3: "Smartphone",
  },
  {
    id: 2,
    kicker: "SUMMER ESSENTIALS 2026",
    title: "Step Up Your Style &",
    highlight: "Footwear",
    desc: "Explore lightweight athletic running sneakers, organic cotton shirts,\nand designer polarized sunglasses built for adventures.",
    cta: "Explore Fashion",
    targetCat: "Footwear",
    badge: "Up to 30% OFF Footwear",
    theme: "theme-cyan",
    img1: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=90",
    img2: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=500&q=90",
    img3: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=500&q=90",
    label1: "Running Shoes",
    label2: "Sunglasses",
    label3: "Cotton Shirts",
  },
  {
    id: 3,
    kicker: "EXCLUSIVE TECH DEALS",
    title: "Next-Gen Audio &",
    highlight: "Smart Devices",
    desc: "Immerse in crystal-clear acoustics, pro wireless gaming controllers,\nand high-accuracy fitness trackers with instant dispatch.",
    cta: "Claim Tech Deals",
    targetCat: "Electronics",
    badge: "Top Rated Electronics",
    theme: "theme-purple",
    img1: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=90",
    img2: "https://images.unsplash.com/photo-1600080972464-8e5f35f63d08?auto=format&fit=crop&w=500&q=90",
    img3: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=500&q=90",
    label1: "Studio Audio",
    label2: "Game Controller",
    label3: "Smart Watch",
  },
  {
    id: 4,
    kicker: "HOME & LIVING UPGRADE",
    title: "Elevate Your Space With",
    highlight: "Modern Comfort",
    desc: "Redefine your living space with Nordic velvet armchairs, chef cookware,\nand premium automotive smart accessories.",
    cta: "Shop Home Living",
    targetCat: "Home & Kitchen",
    badge: "Home Makeover Fest",
    theme: "theme-gold",
    img1: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=600&q=90",
    img2: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=500&q=90",
    img3: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=500&q=90",
    label1: "Velvet Armchair",
    label2: "Air Purifier",
    label3: "Beauty Serum",
  },
];

// Featured Brands
const featuredBrands = [
  { name: "Apple", logo: "🍎", count: "12 Products", desc: "Premium smartwatches & audio" },
  { name: "Sony", logo: "🎧", count: "18 Products", desc: "World-class noise cancellation" },
  { name: "Nike", logo: "👟", count: "24 Products", desc: "Performance footwear & sports" },
  { name: "Ray-Ban", logo: "🕶️", count: "8 Products", desc: "Iconic polarized sunglasses" },
  { name: "Levi's", logo: "👖", count: "15 Products", desc: "Authentic denim & apparel" },
  { name: "Logitech", logo: "🎮", count: "10 Products", desc: "Gaming controllers & tech" },
];

// Blog articles
const blogArticles = [
  {
    id: 1,
    title: "Top 7 Wireless Earphones & Audio Gear for 2026",
    category: "Tech Guide",
    date: "August 15, 2026",
    readTime: "4 min read",
    snippet: "From active noise cancellation to 40-hour battery life, here is our definitive guide on choosing the best wireless sound...",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: 2,
    title: "How to Choose the Perfect Running Shoes for Any Terrain",
    category: "Fitness & Footwear",
    date: "August 12, 2026",
    readTime: "5 min read",
    snippet: "Understanding cushioning, arch support, and breathable flymesh technology to supercharge your daily training runs...",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: 3,
    title: "5 Summer Style Essentials Every Wardrobe Needs",
    category: "Fashion Trends",
    date: "August 08, 2026",
    readTime: "3 min read",
    snippet: "Elevate your casual look effortlessly with lightweight organic cotton shirts, polarized frames, and versatile sneakers...",
    image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=600&q=80",
  },
];

// Help Center FAQs
const helpFaqs = [
  { q: "How do I track my order shipment?", a: "Click on 'Track Order' in the top bar or footer and enter your Order ID (e.g. ORD-84920) to view real-time location and delivery ETA." },
  { q: "What is the return and refund policy?", a: "We offer a 30-day no-questions-asked return policy. You can request a return from your account, and our courier will pick it up for free." },
  { q: "How do I get Free Shipping?", a: "All orders above ₹999 qualify for 100% Free Standard Delivery across India." },
  { q: "What payment methods are supported?", a: "We support UPI, Debit/Credit Cards (Visa, Mastercard, RuPay), NetBanking, and Cash on Delivery (COD)." },
];

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=800&q=85";

const handleImageError = (e) => {
  if (e.currentTarget.src !== FALLBACK_IMAGE) {
    e.currentTarget.src = FALLBACK_IMAGE;
  }
};

function App() {
  // ── API data state ──────────────────────────────────────────
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [apiCategories, setApiCategories] = useState([]);

  // ── Auth / session state ────────────────────────────────────
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const stored = localStorage.getItem("shopapp_user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [authForm, setAuthForm] = useState({ name: "", email: "", password: "" });
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");

  // ── Cart ────────────────────────────────────────────────────
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([1, 4]);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All Categories");
  const [searchCategory, setSearchCategory] = useState("All Categories");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [activeNav, setActiveNav] = useState("Home");
  const [navFilterMode, setNavFilterMode] = useState(null); // 'deals', 'new', 'bestsellers'

  // Modals & Drawers
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const [isTrackOrderOpen, setIsTrackOrderOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isBrandsOpen, setIsBrandsOpen] = useState(false);
  const [isBlogOpen, setIsBlogOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState("signin");
  const [orderTrackingId, setOrderTrackingId] = useState("ORD-84920");
  const [trackedResult, setTrackedResult] = useState(null);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [promoCode, setPromoCode] = useState("");
  // discountApplied is now the actual rupee amount (not a fraction)
  const [discountApplied, setDiscountApplied] = useState(0);
  const [appliedCouponPercent, setAppliedCouponPercent] = useState(0);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [isAutoPlay, setIsAutoPlay] = useState(true);

  // Contact form state
  const [contactForm, setContactForm] = useState({ name: "", email: "", message: "" });
  const [contactSubmitted, setContactSubmitted] = useState(false);

  // ── Fetch categories once on mount ──────────────────────────
  useEffect(() => {
    fetchCategories()
      .then((cats) => setApiCategories(cats))
      .catch(() => {
        // Silently fall back — static categories in dropdown still work
      });
  }, []);

  // ── Fetch products whenever filters change ──────────────────
  useEffect(() => {
    setProductsLoading(true);
    const params = {};
    if (activeCategory && activeCategory !== "All Categories") {
      params.category = activeCategory;
    }
    if (searchCategory && searchCategory !== "All Categories") {
      params.category = searchCategory;
    }
    if (selectedBrand) params.brand = selectedBrand;
    if (searchQuery.trim()) params.search = searchQuery.trim();
    if (navFilterMode === "deals") params.deals = "true";
    if (navFilterMode === "new") params.isNew = "true";
    if (navFilterMode === "bestsellers") params.bestsellers = "true";

    fetchProducts(params)
      .then((data) => setProducts(data))
      .catch(() => {
        // If API is unreachable, fall back to static data
        setProducts(productsData);
        showToast("Offline mode — showing cached catalog");
      })
      .finally(() => setProductsLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCategory, searchCategory, selectedBrand, searchQuery, navFilterMode]);

  // ── Auto slide timer for hero banner ────────────────────────
  useEffect(() => {
    if (!isAutoPlay) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5500);
    return () => clearInterval(timer);
  }, [isAutoPlay]);

  // Toast Helper
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage("");
    }, 2600);
  };

  // Next / Prev slide handlers
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? heroSlides.length - 1 : prev - 1));
  };

  // Cart operations
  const addToCart = (product, qty = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + qty } : item
        );
      }
      return [...prev, { ...product, quantity: qty }];
    });
    showToast(`Added "${product.name}" to cart! 🛍️`);
  };

  const updateCartQty = (id, delta) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
    showToast("Item removed from cart");
  };

  // Wishlist toggle
  const toggleWishlist = (id) => {
    const product = productsData.find((p) => p.id === id);
    if (wishlist.includes(id)) {
      setWishlist((prev) => prev.filter((itemId) => itemId !== id));
      showToast(`Removed from wishlist`);
    } else {
      setWishlist((prev) => [...prev, id]);
      showToast(`Added "${product?.name}" to wishlist ❤️`);
    }
  };

  const moveWishlistToCart = (product) => {
    addToCart(product);
    setWishlist((prev) => prev.filter((id) => id !== product.id));
  };

  // filteredProducts is now driven by the API — filters are sent as query params
  // and the backend returns the correctly filtered list in the `products` state.
  const filteredProducts = products;

  // Cart Calculations
  const cartSubtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  // discountApplied is now the actual rupee amount returned by the coupon API
  const discountAmount = discountApplied || 0;
  const freeShippingThreshold = 999;
  const shippingFee = cartSubtotal >= freeShippingThreshold || cartSubtotal === 0 ? 0 : 99;
  const cartTotal = cartSubtotal - discountAmount + shippingFee;
  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Validate coupon via backend API
  const applyPromo = async (e) => {
    e.preventDefault();
    if (!promoCode.trim()) return;
    try {
      const coupon = await validateCoupon(promoCode.trim(), cartSubtotal);
      setDiscountApplied(coupon.discountAmount);
      setAppliedCouponPercent(coupon.discountPercent);
      showToast(`Coupon applied: ${coupon.discountPercent}% OFF! 🎉`);
    } catch (err) {
      setDiscountApplied(0);
      setAppliedCouponPercent(0);
      showToast(err.message || "Invalid coupon code. Try SAVE20 or SUMMER40");
    }
  };

  // Place order via backend API
  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setCheckoutSuccess(true);
    try {
      const payload = {
        items: cart.map((item) => ({
          productId: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
        })),
        customerName: currentUser?.name || "Guest Customer",
        email: currentUser?.email || "guest@shopapp.com",
        promoCode: promoCode || null,
        discountAmount,
      };
      await createOrder(payload);
      setCart([]);
      setDiscountApplied(0);
      setAppliedCouponPercent(0);
      setPromoCode("");
      setIsCartOpen(false);
      showToast("Order placed successfully! Thank you for shopping with ShopApp 🚀");
    } catch {
      showToast("Failed to place order. Please try again.");
    } finally {
      setCheckoutSuccess(false);
    }
  };

  // Track order via backend API
  const handleTrackOrder = async (e) => {
    e.preventDefault();
    if (!orderTrackingId.trim()) return;
    setTrackingLoading(true);
    setTrackedResult(null);
    try {
      const result = await trackOrderApi(orderTrackingId.trim());
      setTrackedResult(result);
    } catch (err) {
      showToast(err.message || "Could not find that order. Please check the ID.");
    } finally {
      setTrackingLoading(false);
    }
  };

  const scrollToProducts = () => {
    document.getElementById("featured-section")?.scrollIntoView({ behavior: "smooth" });
  };

  // Nav click handlers
  const handleNavClick = (navName) => {
    setActiveNav(navName);
    if (mobileMenu) setMobileMenu(false);

    if (navName === "Home") {
      setActiveCategory("All Categories");
      setNavFilterMode(null);
      setSelectedBrand(null);
      setSearchQuery("");
      window.scrollTo({ top: 0, behavior: "smooth" });
      showToast("Home view");
    } else if (navName === "Shop") {
      setActiveCategory("All Categories");
      setNavFilterMode(null);
      setSelectedBrand(null);
      scrollToProducts();
      showToast("Browsing full shop catalog");
    } else if (navName === "Deals") {
      setNavFilterMode("deals");
      setActiveCategory("All Categories");
      setSelectedBrand(null);
      scrollToProducts();
      showToast("Showing exclusive discounts & deals 🔥");
    } else if (navName === "New Arrivals") {
      setNavFilterMode("new");
      setActiveCategory("All Categories");
      setSelectedBrand(null);
      scrollToProducts();
      showToast("Showing latest new arrivals ✨");
    } else if (navName === "Best Sellers") {
      setNavFilterMode("bestsellers");
      setActiveCategory("All Categories");
      setSelectedBrand(null);
      scrollToProducts();
      showToast("Showing highest rated best sellers ⭐");
    } else if (navName === "Brands") {
      setIsBrandsOpen(true);
    } else if (navName === "Blog") {
      setIsBlogOpen(true);
    } else if (navName === "Contact Us") {
      setIsContactOpen(true);
    }
  };

  // Category select handler
  const handleCategorySelect = (catName) => {
    setActiveCategory(catName);
    setNavFilterMode(null);
    setSelectedBrand(null);
    setIsCategoryMenuOpen(false);
    scrollToProducts();
    showToast(`Filtered by ${catName}`);
  };

  return (
    <div className="shop-app">
      {/* FLOATING TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="toast-notification">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. TOP SALE BAR */}
      <div className="sale-bar">
        <div className="sale-content">
          <span className="fire-icon">🔥</span>
          <span>
            Summer Sale is Live! Get up to <strong>40% OFF</strong> on selected items.
          </span>
        </div>

        <div className="sale-links">
          <button className="sale-link-btn" onClick={() => setIsTrackOrderOpen(true)}>
            <MapPin size={13} />
            <span>Track Order</span>
          </button>
          <span className="link-divider">|</span>
          <button className="sale-link-btn" onClick={() => setIsHelpOpen(true)}>
            <HelpCircle size={13} />
            <span>Help Center</span>
          </button>
          <span className="link-divider">|</span>
          <button className="sale-link-btn" onClick={() => setIsWishlistOpen(true)}>
            <Heart size={13} />
            <span>Wishlist</span>
            {wishlist.length > 0 && <span className="top-badge">{wishlist.length}</span>}
          </button>
          <span className="link-divider">|</span>
          <button className="sale-link-btn" onClick={() => setIsAuthOpen(true)}>
            <User size={13} />
            <span>{currentUser ? currentUser.name.split(" ")[0] : "Sign In / Register"}</span>
          </button>
        </div>
      </div>

      {/* 2. MAIN HEADER */}
      <header className="main-header">
        <div className="header-inner">
          {/* Logo */}
          <div
            className="logo"
            onClick={() => handleNavClick("Home")}
            title="Go to Home"
          >
            <div className="logo-icon">
              <ShoppingBag size={22} strokeWidth={2.4} />
            </div>
            <span>
              Shop<span>App</span>
            </span>
          </div>

          {/* Mobile Menu Toggle Button */}
          <button
            className="mobile-menu-button"
            onClick={() => setMobileMenu(!mobileMenu)}
            aria-label="Toggle menu"
          >
            {mobileMenu ? <X size={22} /> : <Menu size={22} />}
          </button>

          {/* Categories Selector Button */}
          <div className="category-selector-wrapper">
            <button
              className={`category-selector ${isCategoryMenuOpen ? "active" : ""}`}
              onClick={() => setIsCategoryMenuOpen(!isCategoryMenuOpen)}
              aria-label="Toggle categories dropdown"
            >
              <Grid2X2 size={17} strokeWidth={2.2} />
              <span>Categories</span>
              <ChevronDown size={14} className={isCategoryMenuOpen ? "rotated" : ""} />
            </button>

            {/* Categories Dropdown Popover */}
            {isCategoryMenuOpen && (
              <div className="categories-dropdown">
                {categories.map((cat) => {
                  const Icon = cat.icon;
                  const isSelected = activeCategory === cat.name;
                  return (
                    <button
                      key={cat.name}
                      className={`dropdown-cat-item ${isSelected ? "selected" : ""}`}
                      onClick={() => handleCategorySelect(cat.name)}
                    >
                      <Icon size={16} />
                      <span>{cat.name}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Search Box */}
          <div className="search-box">
            <div className="search-category-select">
              <select
                value={searchCategory}
                onChange={(e) => setSearchCategory(e.target.value)}
                className="category-dropdown-select"
                aria-label="Select Search Category"
              >
                {categories.map((cat) => (
                  <option key={cat.name} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
              <ChevronDown size={13} className="select-arrow" />
            </div>

            <input
              type="text"
              placeholder="Search for products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  scrollToProducts();
                  showToast(`Searching for "${searchQuery}"`);
                }
              }}
            />

            <button
              className="search-submit-btn"
              onClick={() => {
                scrollToProducts();
                showToast(`Searching for "${searchQuery}"`);
              }}
              aria-label="Search"
            >
              <Search size={18} strokeWidth={2.4} />
            </button>
          </div>

          {/* Header Action Buttons */}
          <div className="header-actions">
            {/* Wishlist Button */}
            <button
              className="header-action"
              onClick={() => setIsWishlistOpen(true)}
              title="Open Wishlist"
            >
              <div className="action-icon-wrap">
                <Heart size={20} />
                {wishlist.length > 0 && (
                  <span className="notification">{wishlist.length}</span>
                )}
              </div>
              <span className="action-label">Wishlist</span>
            </button>

            {/* Cart Button */}
            <button
              className="header-action cart-button"
              onClick={() => setIsCartOpen(true)}
              title="Open Shopping Cart"
            >
              <div className="action-icon-wrap">
                <ShoppingCart size={20} />
                {totalCartCount > 0 && (
                  <span className="notification">{totalCartCount}</span>
                )}
              </div>
              <span className="action-label">Cart</span>
            </button>
          </div>
        </div>
      </header>

      {/* 3. NAVIGATION BAR (All Actionable Tabs) */}
      <nav className={`navigation ${mobileMenu ? "mobile-open" : ""}`}>
        <div className="nav-inner">
          {[
            { name: "Home", action: "Home" },
            { name: "Shop", action: "Shop" },
            { name: "Deals", action: "Deals" },
            { name: "New Arrivals", action: "New Arrivals" },
            { name: "Best Sellers", action: "Best Sellers" },
            { name: "Brands", action: "Brands" },
            { name: "Blog", action: "Blog" },
            { name: "Contact Us", action: "Contact Us" },
          ].map((item) => (
            <button
              key={item.name}
              className={`nav-item ${activeNav === item.name ? "active" : ""}`}
              onClick={() => handleNavClick(item.action)}
            >
              {item.name}
            </button>
          ))}
        </div>
      </nav>

      {/* 4. MOVABLE HERO CAROUSEL BANNER (Full horizontal slide for whole blue bar) */}
      <section
        className="hero"
        id="home"
        onMouseEnter={() => setIsAutoPlay(false)}
        onMouseLeave={() => setIsAutoPlay(true)}
      >
        {/* Left Arrow Slide Button */}
        <button
          className="hero-arrow left"
          onClick={prevSlide}
          aria-label="Previous slide"
          title="Previous Slide"
        >
          <ChevronLeft size={24} />
        </button>

        {/* Right Arrow Slide Button */}
        <button
          className="hero-arrow right"
          onClick={nextSlide}
          aria-label="Next slide"
          title="Next Slide"
        >
          <ChevronRight size={24} />
        </button>

        {/* Movable Horizontal Track */}
        <div
          className="hero-slider-track"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {heroSlides.map((slide) => (
            <div className={`hero-slide ${slide.theme}`} key={slide.id}>
              <div className="hero-slide-bg"></div>
              <div className="hero-glow-ambient"></div>

              <div className="hero-content">
                {/* Left Text Column */}
                <div className="hero-text">
                  <span className="hero-label">{slide.kicker}</span>

                  <h1>
                    {slide.title}
                    <br />
                    With <span>{slide.highlight}</span>
                  </h1>

                  <p style={{ whiteSpace: "pre-line" }}>{slide.desc}</p>

                  <div className="hero-cta-group">
                    <button
                      className="shop-now"
                      onClick={() => {
                        handleCategorySelect(slide.targetCat);
                      }}
                    >
                      <span>{slide.cta}</span>
                      <span className="arrow-icon">→</span>
                    </button>

                    <div className="hero-feature-badge">
                      <ShieldCheck size={16} />
                      <span>{slide.badge}</span>
                    </div>
                  </div>
                </div>

                {/* Right 3D Showcase Stage for this slide */}
                <div className="hero-product-image">
                  <div className="product-glow"></div>

                  <div className="hero-showcase-stage">
                    {/* Item 1 */}
                    <div className="showcase-item item-1">
                      <img src={slide.img1} alt={slide.label1} onError={handleImageError} />
                      <span className="item-tooltip">{slide.label1}</span>
                    </div>

                    {/* Item 2 */}
                    <div className="showcase-item item-2">
                      <img src={slide.img2} alt={slide.label2} onError={handleImageError} />
                      <span className="item-tooltip">{slide.label2}</span>
                    </div>

                    {/* Item 3 */}
                    <div className="showcase-item item-3">
                      <img src={slide.img3} alt={slide.label3} onError={handleImageError} />
                      <span className="item-tooltip">{slide.label3}</span>
                    </div>

                    {/* Stage Podium Light */}
                    <div className="stage-podium"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Hero Dot Bars */}
        <div className="hero-dots">
          {heroSlides.map((slide, idx) => (
            <button
              key={slide.id}
              className={`hero-dot ${currentSlide === idx ? "active" : ""}`}
              onClick={() => setCurrentSlide(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              title={`Slide ${idx + 1}`}
            />
          ))}
        </div>
      </section>

      {/* 5. FLOATING 10 CATEGORIES BAR (Every Button Actionable) */}
      <section className="categories-wrapper">
        <div className="categories">
          {categories.map((category) => {
            const Icon = category.icon;
            const isActive = activeCategory === category.name;

            return (
              <button
                key={category.name}
                className={`category ${isActive ? "active" : ""}`}
                onClick={() => handleCategorySelect(category.name)}
                title={`Filter by ${category.name}`}
              >
                <div className="category-icon-wrapper">
                  <Icon size={25} strokeWidth={isActive ? 2.3 : 1.7} />
                </div>
                <span>{category.name}</span>
                {isActive && <div className="category-active-bar"></div>}
              </button>
            );
          })}
        </div>
      </section>

      {/* 6. PRODUCTS MAIN CONTENT */}
      <main className="content" id="featured-section">
        <div className="section-heading">
          <div>
            <span className="section-label">
              {navFilterMode === "deals"
                ? "FLASH DEALS & DISCOUNTS"
                : navFilterMode === "new"
                ? "NEW SEASON RELEASES"
                : navFilterMode === "bestsellers"
                ? "CUSTOMER FAVORITES"
                : "SHOP OUR COLLECTION"}
            </span>
            <h2>
              {selectedBrand
                ? `${selectedBrand} Collection`
                : navFilterMode === "deals"
                ? "Deals & Discounted Products"
                : navFilterMode === "new"
                ? "New Arrivals"
                : navFilterMode === "bestsellers"
                ? "Best Selling Products"
                : activeCategory === "All Categories"
                ? "Featured Products"
                : `${activeCategory} Products`}
            </h2>
          </div>

          <div className="heading-right">
            {(activeCategory !== "All Categories" ||
              navFilterMode ||
              selectedBrand ||
              searchQuery) && (
              <button
                className="clear-filter-btn"
                onClick={() => {
                  setActiveCategory("All Categories");
                  setNavFilterMode(null);
                  setSelectedBrand(null);
                  setSearchQuery("");
                  showToast("Reset all filters");
                }}
              >
                Reset All Filters
              </button>
            )}

            <button
              className="view-all"
              onClick={() => {
                setActiveCategory("All Categories");
                setNavFilterMode(null);
                setSelectedBrand(null);
                setSearchQuery("");
                showToast("Viewing all products");
              }}
            >
              <span>View All</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </div>

        {/* Active Filter Chips */}
        {(activeCategory !== "All Categories" ||
          navFilterMode ||
          selectedBrand ||
          searchQuery) && (
          <div className="filter-chips-row">
            {activeCategory !== "All Categories" && (
              <span className="filter-chip">
                Category: {activeCategory}
                <X size={13} onClick={() => setActiveCategory("All Categories")} />
              </span>
            )}
            {selectedBrand && (
              <span className="filter-chip">
                Brand: {selectedBrand}
                <X size={13} onClick={() => setSelectedBrand(null)} />
              </span>
            )}
            {navFilterMode && (
              <span className="filter-chip">
                Filter: {navFilterMode.toUpperCase()}
                <X size={13} onClick={() => setNavFilterMode(null)} />
              </span>
            )}
            {searchQuery && (
              <span className="filter-chip">
                Search: "{searchQuery}"
                <X size={13} onClick={() => setSearchQuery("")} />
              </span>
            )}
          </div>
        )}

        {/* Product Grid */}
        {productsLoading ? (
          <div className="product-grid">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="product-card skeleton-card" style={{ minHeight: 340 }}>
                <div style={{ background: "#e2e8f0", height: 220, borderRadius: 12, marginBottom: 12 }} />
                <div style={{ background: "#e2e8f0", height: 14, borderRadius: 6, width: "60%", marginBottom: 8 }} />
                <div style={{ background: "#e2e8f0", height: 20, borderRadius: 6, width: "40%" }} />
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="no-products-box">
            <Package size={48} />
            <h3>No products found</h3>
            <p>Try searching for a different term or resetting the category filter.</p>
            <button
              className="reset-search-btn"
              onClick={() => {
                setActiveCategory("All Categories");
                setSearchCategory("All Categories");
                setNavFilterMode(null);
                setSelectedBrand(null);
                setSearchQuery("");
              }}
            >
              Show All Products
            </button>
          </div>
        ) : (
          <div className="product-grid">
            {filteredProducts.map((product) => (
              <article className="product-card" key={product.id}>
                <div
                  className="product-image"
                  onClick={() => setQuickViewProduct(product)}
                >
                  {/* Discount Badge */}
                  <span className="discount">-{product.discount}%</span>

                  {/* Wishlist Heart Button */}
                  <button
                    className={`wishlist ${wishlist.includes(product.id) ? "active" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleWishlist(product.id);
                    }}
                    aria-label="Add to Wishlist"
                  >
                    <Heart
                      size={18}
                      fill={wishlist.includes(product.id) ? "#ef4444" : "none"}
                      color={wishlist.includes(product.id) ? "#ef4444" : "#8b95a5"}
                    />
                  </button>

                  {/* Quick View Button on Hover */}
                  <button
                    className="quick-view-overlay-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      setQuickViewProduct(product);
                    }}
                  >
                    <Eye size={15} />
                    <span>Quick View</span>
                  </button>

                  <img
                    src={product.image}
                    alt={product.name}
                    loading="lazy"
                    onError={handleImageError}
                  />
                </div>

                <div className="product-details">
                  <span className="product-category">{product.category}</span>

                  <h3
                    onClick={() => setQuickViewProduct(product)}
                    title={product.name}
                  >
                    {product.name}
                  </h3>

                  <div className="rating">
                    <div className="stars">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={13} fill="#f4b400" color="#f4b400" />
                      ))}
                    </div>
                    <span>
                      ({product.reviews})
                    </span>
                  </div>

                  <div className="price">
                    <strong>₹{product.price.toLocaleString("en-IN")}</strong>
                    <del>₹{product.oldPrice.toLocaleString("en-IN")}</del>
                  </div>

                  <button
                    className="add-cart"
                    onClick={() => addToCart(product)}
                  >
                    <ShoppingCart size={16} />
                    <span>Add to Cart</span>
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* 7. SERVICES VALUE BAR */}
        <section className="services">
          <div
            className="service"
            onClick={() => showToast("Free delivery on all orders over ₹999")}
          >
            <div className="service-icon-wrap">
              <Truck size={24} />
            </div>
            <div>
              <strong>Free Shipping</strong>
              <span>On orders above ₹999</span>
            </div>
          </div>

          <div
            className="service"
            onClick={() => showToast("Hassle-free 30 days return and refund")}
          >
            <div className="service-icon-wrap">
              <RotateCcw size={24} />
            </div>
            <div>
              <strong>Easy Returns</strong>
              <span>30 days return policy</span>
            </div>
          </div>

          <div
            className="service"
            onClick={() => showToast("256-Bit SSL Encrypted 100% Secure Payment")}
          >
            <div className="service-icon-wrap">
              <ShieldCheck size={24} />
            </div>
            <div>
              <strong>Secure Payment</strong>
              <span>100% secure payment</span>
            </div>
          </div>

          <div
            className="service"
            onClick={() => setIsContactOpen(true)}
          >
            <div className="service-icon-wrap">
              <Headset size={24} />
            </div>
            <div>
              <strong>24/7 Support</strong>
              <span>Dedicated support</span>
            </div>
          </div>

          <div
            className="service"
            onClick={() => handleNavClick("Deals")}
          >
            <div className="service-icon-wrap">
              <Tag size={24} />
            </div>
            <div>
              <strong>Best Deals</strong>
              <span>Best prices guaranteed</span>
            </div>
          </div>
        </section>
      </main>

      {/* 8. FOOTER */}
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-brand-col">
            <div
              className="footer-logo"
              onClick={() => handleNavClick("Home")}
              style={{ cursor: "pointer" }}
            >
              Shop<span>App</span>
            </div>
            <p>
              Your trusted destination for quality electronics, fashion, lifestyle products,
              great discounts, and lightning fast delivery worldwide.
            </p>
            <div className="footer-payment-badges">
              <span>💳 Visa</span>
              <span>MasterCard</span>
              <span>UPI</span>
              <span>NetBanking</span>
            </div>
          </div>

          <div>
            <h4>Shop Categories</h4>
            <a href="#electronics" onClick={(e) => { e.preventDefault(); handleCategorySelect("Electronics"); }}>Electronics</a>
            <a href="#fashion" onClick={(e) => { e.preventDefault(); handleCategorySelect("Fashion"); }}>Fashion & Apparel</a>
            <a href="#footwear" onClick={(e) => { e.preventDefault(); handleCategorySelect("Footwear"); }}>Footwear</a>
            <a href="#accessories" onClick={(e) => { e.preventDefault(); handleCategorySelect("Accessories"); }}>Accessories</a>
            <a href="#home" onClick={(e) => { e.preventDefault(); handleCategorySelect("Home & Kitchen"); }}>Home & Kitchen</a>
          </div>

          <div>
            <h4>Customer Service</h4>
            <a href="#track" onClick={(e) => { e.preventDefault(); setIsTrackOrderOpen(true); }}>Track Your Order</a>
            <a href="#returns" onClick={(e) => { e.preventDefault(); setIsHelpOpen(true); }}>Easy Returns</a>
            <a href="#shipping" onClick={(e) => { e.preventDefault(); setIsHelpOpen(true); }}>Shipping Rates</a>
            <a href="#faq" onClick={(e) => { e.preventDefault(); setIsHelpOpen(true); }}>Help & FAQ</a>
            <a href="#contact" onClick={(e) => { e.preventDefault(); setIsContactOpen(true); }}>Contact Support</a>
          </div>

          <div>
            <h4>My Account</h4>
            <a href="#login" onClick={(e) => { e.preventDefault(); setIsAuthOpen(true); }}>My Profile</a>
            <a href="#orders" onClick={(e) => { e.preventDefault(); setIsTrackOrderOpen(true); }}>Order History</a>
            <a href="#wishlist" onClick={(e) => { e.preventDefault(); setIsWishlistOpen(true); }}>My Wishlist</a>
            <a href="#cart" onClick={(e) => { e.preventDefault(); setIsCartOpen(true); }}>Shopping Cart</a>
            <a href="#brands" onClick={(e) => { e.preventDefault(); setIsBrandsOpen(true); }}>Our Brands</a>
          </div>
        </div>

        <div className="copyright">
          <p>© 2026 ShopApp Inc. All rights reserved. Designed with modern web standards.</p>
        </div>
      </footer>

      {/* =========================================================================
          INTERACTIVE DRAWERS & MODALS
         ========================================================================= */}

      {/* A. CART DRAWER */}
      {isCartOpen && (
        <div className="drawer-overlay" onClick={() => setIsCartOpen(false)}>
          <div className="drawer cart-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header">
              <div className="drawer-title">
                <ShoppingCart size={20} />
                <h3>Your Cart ({totalCartCount})</h3>
              </div>
              <button className="drawer-close" onClick={() => setIsCartOpen(false)}>
                <X size={20} />
              </button>
            </div>

            {/* Free Shipping Progress */}
            <div className="shipping-progress-box">
              {cartSubtotal >= freeShippingThreshold ? (
                <div className="free-shipping-achieved">
                  <CheckCircle2 size={16} color="#16a34a" />
                  <span>Congratulations! You get <strong>FREE Standard Delivery</strong>!</span>
                </div>
              ) : (
                <>
                  <div className="shipping-text">
                    Add <strong>₹{freeShippingThreshold - cartSubtotal}</strong> more for <strong>FREE Shipping</strong>
                  </div>
                  <div className="progress-bar-track">
                    <div
                      className="progress-bar-fill"
                      style={{ width: `${Math.min(100, (cartSubtotal / freeShippingThreshold) * 100)}%` }}
                    ></div>
                  </div>
                </>
              )}
            </div>

            {/* Cart Items List */}
            <div className="drawer-body">
              {cart.length === 0 ? (
                <div className="empty-state">
                  <ShoppingBag size={54} />
                  <h4>Your Cart is Empty</h4>
                  <p>Explore our trending catalog and add your favorite items!</p>
                  <button
                    className="empty-state-btn"
                    onClick={() => {
                      setIsCartOpen(false);
                      scrollToProducts();
                    }}
                  >
                    Start Shopping
                  </button>
                </div>
              ) : (
                <div className="cart-items-list">
                  {cart.map((item) => (
                    <div className="cart-item" key={item.id}>
                      <img src={item.image} alt={item.name} className="cart-item-img" onError={handleImageError} />
                      <div className="cart-item-info">
                        <h4>{item.name}</h4>
                        <span className="cart-item-cat">{item.category}</span>
                        <div className="cart-item-price">
                          ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                        </div>

                        <div className="cart-item-actions">
                          <div className="qty-counter">
                            <button onClick={() => updateCartQty(item.id, -1)}>
                              <Minus size={13} />
                            </button>
                            <span>{item.quantity}</span>
                            <button onClick={() => updateCartQty(item.id, 1)}>
                              <Plus size={13} />
                            </button>
                          </div>

                          <button
                            className="remove-btn"
                            onClick={() => removeFromCart(item.id)}
                            title="Remove item"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Cart Footer */}
            {cart.length > 0 && (
              <div className="drawer-footer">
                {/* Promo Code Input */}
                <form className="promo-box" onSubmit={applyPromo}>
                  <input
                    type="text"
                    placeholder="Coupon (e.g. SAVE20 or SUMMER40)"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                  />
                  <button type="submit">Apply</button>
                </form>

                <div className="summary-row">
                  <span>Subtotal</span>
                  <span>₹{cartSubtotal.toLocaleString("en-IN")}</span>
                </div>

                {discountApplied > 0 && (
                  <div className="summary-row discount-row">
                    <span>Discount ({appliedCouponPercent}% OFF)</span>
                    <span>-₹{discountAmount.toLocaleString("en-IN")}</span>
                  </div>
                )}

                <div className="summary-row">
                  <span>Delivery</span>
                  <span>{shippingFee === 0 ? <span className="free-tag">FREE</span> : `₹${shippingFee}`}</span>
                </div>

                <div className="summary-row total-row">
                  <strong>Total Amount</strong>
                  <strong>₹{cartTotal.toLocaleString("en-IN")}</strong>
                </div>

                <button
                  className={`checkout-btn ${checkoutSuccess ? "success" : ""}`}
                  onClick={handleCheckout}
                  disabled={checkoutSuccess}
                >
                  {checkoutSuccess ? (
                    <>
                      <CheckCircle2 size={18} />
                      <span>Processing Order...</span>
                    </>
                  ) : (
                    <>
                      <span>Proceed to Checkout</span>
                      <span>₹{cartTotal.toLocaleString("en-IN")} →</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* B. WISHLIST DRAWER */}
      {isWishlistOpen && (
        <div className="drawer-overlay" onClick={() => setIsWishlistOpen(false)}>
          <div className="drawer wishlist-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header">
              <div className="drawer-title">
                <Heart size={20} color="#ef4444" fill="#ef4444" />
                <h3>Your Wishlist ({wishlist.length})</h3>
              </div>
              <button className="drawer-close" onClick={() => setIsWishlistOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="drawer-body">
              {wishlist.length === 0 ? (
                <div className="empty-state">
                  <Heart size={54} color="#94a3b8" />
                  <h4>Your Wishlist is Empty</h4>
                  <p>Save items you like by clicking the heart icon on any card.</p>
                </div>
              ) : (
                <div className="cart-items-list">
                  {wishlist.map((id) => {
                    const item = productsData.find((p) => p.id === id);
                    if (!item) return null;
                    return (
                      <div className="cart-item" key={item.id}>
                        <img src={item.image} alt={item.name} className="cart-item-img" onError={handleImageError} />
                        <div className="cart-item-info">
                          <h4>{item.name}</h4>
                          <span className="cart-item-cat">{item.category}</span>
                          <div className="cart-item-price">
                            ₹{item.price.toLocaleString("en-IN")}
                          </div>

                          <div className="cart-item-actions">
                            <button
                              className="move-to-cart-btn"
                              onClick={() => moveWishlistToCart(item)}
                            >
                              <ShoppingCart size={14} />
                              <span>Move to Cart</span>
                            </button>

                            <button
                              className="remove-btn"
                              onClick={() => toggleWishlist(item.id)}
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* C. QUICK VIEW PRODUCT MODAL */}
      {quickViewProduct && (
        <div className="modal-overlay" onClick={() => setQuickViewProduct(null)}>
          <div className="modal quick-view-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setQuickViewProduct(null)}>
              <X size={20} />
            </button>

            <div className="quick-view-grid">
              <div className="quick-view-img-col">
                <span className="discount-tag">-{quickViewProduct.discount}% OFF</span>
                <img src={quickViewProduct.image} alt={quickViewProduct.name} onError={handleImageError} />
              </div>

              <div className="quick-view-details-col">
                <span className="qv-category">{quickViewProduct.category}</span>
                <h2>{quickViewProduct.name}</h2>

                <div className="qv-rating-row">
                  <div className="stars">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={15} fill="#f4b400" color="#f4b400" />
                    ))}
                  </div>
                  <span>{quickViewProduct.rating} ({quickViewProduct.reviews} verified reviews)</span>
                </div>

                <div className="qv-price-row">
                  <span className="qv-price">₹{quickViewProduct.price.toLocaleString("en-IN")}</span>
                  <del className="qv-old-price">₹{quickViewProduct.oldPrice.toLocaleString("en-IN")}</del>
                  <span className="qv-savings">
                    You Save ₹{(quickViewProduct.oldPrice - quickViewProduct.price).toLocaleString("en-IN")}
                  </span>
                </div>

                <p className="qv-desc">{quickViewProduct.description}</p>

                {quickViewProduct.features && (
                  <div className="qv-features">
                    <strong>Key Features:</strong>
                    <ul>
                      {quickViewProduct.features.map((feat, i) => (
                        <li key={i}>
                          <CheckCircle2 size={14} color="#16a34a" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="qv-action-buttons">
                  <button
                    className="qv-add-cart-btn"
                    onClick={() => {
                      addToCart(quickViewProduct);
                      setQuickViewProduct(null);
                    }}
                  >
                    <ShoppingCart size={18} />
                    <span>Add to Cart</span>
                  </button>

                  <button
                    className={`qv-wishlist-btn ${wishlist.includes(quickViewProduct.id) ? "active" : ""}`}
                    onClick={() => toggleWishlist(quickViewProduct.id)}
                  >
                    <Heart
                      size={18}
                      fill={wishlist.includes(quickViewProduct.id) ? "#ef4444" : "none"}
                      color={wishlist.includes(quickViewProduct.id) ? "#ef4444" : "#475569"}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* D. TRACK ORDER MODAL */}
      {isTrackOrderOpen && (
        <div className="modal-overlay" onClick={() => setIsTrackOrderOpen(false)}>
          <div className="modal track-order-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setIsTrackOrderOpen(false)}>
              <X size={20} />
            </button>

            <div className="modal-header-simple">
              <MapPin size={28} color="#1769ff" />
              <h3>Track Your Shipment</h3>
              <p>Enter your tracking number or Order ID to see real-time status.</p>
            </div>

            <form onSubmit={handleTrackOrder} className="track-form">
              <input
                type="text"
                placeholder="e.g. ORD-84920 or SHOP-2026"
                value={orderTrackingId}
                onChange={(e) => setOrderTrackingId(e.target.value)}
                required
              />
              <button type="submit" disabled={trackingLoading}>
                {trackingLoading ? "Searching…" : "Track Order"}
              </button>
            </form>

            {trackedResult && (
              <div className="tracking-status-card">
                <div className="tracking-info-header">
                  <div>
                    <span className="label">Order ID</span>
                    <strong>{trackedResult.id}</strong>
                  </div>
                  <div>
                    <span className="label">Estimated Delivery</span>
                    <strong className="eta">{trackedResult.eta}</strong>
                  </div>
                </div>

                <div className="tracking-timeline">
                  {trackedResult.steps.map((step, idx) => (
                    <div
                      key={idx}
                      className={`timeline-step ${step.done ? "done" : ""} ${step.current ? "current" : ""}`}
                    >
                      <div className="step-dot"></div>
                      <div className="step-content">
                        <strong>{step.title}</strong>
                        <span>{step.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* E. HELP CENTER MODAL */}
      {isHelpOpen && (
        <div className="modal-overlay" onClick={() => setIsHelpOpen(false)}>
          <div className="modal help-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setIsHelpOpen(false)}>
              <X size={20} />
            </button>

            <div className="modal-header-simple">
              <HelpCircle size={28} color="#1769ff" />
              <h3>Help Center & FAQs</h3>
              <p>Find quick answers to common questions or reach out to our team.</p>
            </div>

            <div className="faq-list">
              {helpFaqs.map((faq, i) => (
                <div className="faq-item" key={i}>
                  <h4>{faq.q}</h4>
                  <p>{faq.a}</p>
                </div>
              ))}
            </div>

            <div className="help-footer-actions">
              <button
                className="help-contact-btn"
                onClick={() => {
                  setIsHelpOpen(false);
                  setIsContactOpen(true);
                }}
              >
                <MessageSquare size={16} />
                <span>Contact 24/7 Live Support</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* F. BRANDS MODAL */}
      {isBrandsOpen && (
        <div className="modal-overlay" onClick={() => setIsBrandsOpen(false)}>
          <div className="modal brands-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setIsBrandsOpen(false)}>
              <X size={20} />
            </button>

            <div className="modal-header-simple">
              <Building2 size={28} color="#1769ff" />
              <h3>Featured Official Brands</h3>
              <p>Shop directly from world-class verified partner brands.</p>
            </div>

            <div className="brands-grid">
              {featuredBrands.map((brand) => (
                <div
                  className="brand-card"
                  key={brand.name}
                  onClick={() => {
                    setSelectedBrand(brand.name);
                    setIsBrandsOpen(false);
                    scrollToProducts();
                    showToast(`Filtered by ${brand.name}`);
                  }}
                >
                  <div className="brand-emoji">{brand.logo}</div>
                  <h4>{brand.name}</h4>
                  <span className="brand-desc">{brand.desc}</span>
                  <span className="brand-count">{brand.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* G. BLOG MODAL */}
      {isBlogOpen && (
        <div className="modal-overlay" onClick={() => setIsBlogOpen(false)}>
          <div className="modal blog-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setIsBlogOpen(false)}>
              <X size={20} />
            </button>

            <div className="modal-header-simple">
              <BookOpen size={28} color="#1769ff" />
              <h3>ShopApp Lifestyle & Guides</h3>
              <p>Latest trends, product reviews, and shopping advice.</p>
            </div>

            <div className="blog-list">
              {blogArticles.map((art) => (
                <article className="blog-card" key={art.id}>
                  <img src={art.image} alt={art.title} className="blog-img" onError={handleImageError} />
                  <div className="blog-info">
                    <span className="blog-cat">{art.category} • {art.readTime}</span>
                    <h4>{art.title}</h4>
                    <p>{art.snippet}</p>
                    <button
                      className="read-more-btn"
                      onClick={() => showToast(`Opening article: "${art.title}"`)}
                    >
                      Read Article →
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* H. CONTACT US MODAL */}
      {isContactOpen && (
        <div className="modal-overlay" onClick={() => setIsContactOpen(false)}>
          <div className="modal contact-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setIsContactOpen(false)}>
              <X size={20} />
            </button>

            <div className="modal-header-simple">
              <Headset size={28} color="#1769ff" />
              <h3>Contact Customer Support</h3>
              <p>We're here 24/7. Send us a message and we'll reply in minutes.</p>
            </div>

            {contactSubmitted ? (
              <div className="contact-success-box">
                <CheckCircle2 size={48} color="#16a34a" />
                <h4>Message Received!</h4>
                <p>Thank you, {contactForm.name}. A customer specialist will email you shortly.</p>
                <button
                  className="empty-state-btn"
                  onClick={() => {
                    setContactSubmitted(false);
                    setIsContactOpen(false);
                  }}
                >
                  Close
                </button>
              </div>
            ) : (
              <form
                className="contact-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  setContactSubmitted(true);
                  showToast("Message sent to customer support team!");
                }}
              >
                <div className="form-group">
                  <label>Your Name</label>
                  <input
                    type="text"
                    placeholder="Jane Smith"
                    value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    placeholder="jane@example.com"
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Your Message</label>
                  <textarea
                    rows={4}
                    placeholder="How can we help you today?"
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    required
                  />
                </div>

                <button type="submit" className="auth-submit-btn">
                  <Send size={16} />
                  <span>Send Message</span>
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* I. AUTH MODAL (SIGN IN / REGISTER) */}
      {isAuthOpen && (
        <div className="modal-overlay" onClick={() => { setIsAuthOpen(false); setAuthError(""); }}>
          <div className="modal auth-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => { setIsAuthOpen(false); setAuthError(""); }}>
              <X size={20} />
            </button>

            {/* If already signed in, show profile info */}
            {currentUser ? (
              <div className="contact-success-box">
                <User size={48} color="#1769ff" />
                <h4>Welcome back, {currentUser.name}!</h4>
                <p>{currentUser.email}</p>
                <button
                  className="auth-submit-btn"
                  onClick={() => {
                    setCurrentUser(null);
                    localStorage.removeItem("shopapp_user");
                    setIsAuthOpen(false);
                    showToast("Signed out successfully.");
                  }}
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <>
                <div className="auth-tabs">
                  <button
                    className={`auth-tab ${authMode === "signin" ? "active" : ""}`}
                    onClick={() => { setAuthMode("signin"); setAuthError(""); }}
                  >
                    Sign In
                  </button>
                  <button
                    className={`auth-tab ${authMode === "signup" ? "active" : ""}`}
                    onClick={() => { setAuthMode("signup"); setAuthError(""); }}
                  >
                    Register
                  </button>
                </div>

                <form
                  className="auth-form"
                  onSubmit={async (e) => {
                    e.preventDefault();
                    setAuthError("");
                    setAuthLoading(true);
                    try {
                      let user;
                      if (authMode === "signin") {
                        user = await signInApi(authForm.email, authForm.password);
                      } else {
                        user = await signUpApi(authForm.name, authForm.email, authForm.password);
                      }
                      setCurrentUser(user);
                      localStorage.setItem("shopapp_user", JSON.stringify(user));
                      setAuthForm({ name: "", email: "", password: "" });
                      setIsAuthOpen(false);
                      showToast(
                        authMode === "signin"
                          ? `Welcome back, ${user.name}! 👋`
                          : `Account created! Welcome to ShopApp, ${user.name} 🎉`
                      );
                    } catch (err) {
                      setAuthError(err.message || "Something went wrong. Please try again.");
                    } finally {
                      setAuthLoading(false);
                    }
                  }}
                >
                  {authMode === "signup" && (
                    <div className="form-group">
                      <label>Full Name</label>
                      <input
                        type="text"
                        placeholder="John Doe"
                        value={authForm.name}
                        onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
                        required
                      />
                    </div>
                  )}

                  <div className="form-group">
                    <label>Email Address</label>
                    <input
                      type="email"
                      placeholder="you@example.com"
                      value={authForm.email}
                      onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Password</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={authForm.password}
                      onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                      required
                    />
                  </div>

                  {authError && (
                    <p style={{ color: "#ef4444", fontSize: "0.85rem", margin: "0 0 8px" }}>
                      {authError}
                    </p>
                  )}

                  <button type="submit" className="auth-submit-btn" disabled={authLoading}>
                    {authLoading
                      ? "Please wait…"
                      : authMode === "signin"
                      ? "Sign In to ShopApp"
                      : "Create My Account"}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
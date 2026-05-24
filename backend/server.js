const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 3001;
const JWT_SECRET = 'your_super_secret_key_change_in_production';
const ADMIN_PASSWORD = 'admin123'; // Change in production

// Middleware
app.use(cors());
app.use(express.json());

// Sample products data with metadata
let products = [
  {
    id: 1,
    title: "Sample Product",
    description: "Premium product description for ArunVerse.",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30",
    link: "https://example.com",
    category: "Electronics",
    clicks: 42,
    createdAt: new Date("2026-05-20"),
  },
  {
    id: 2,
    title: "Smart Gadget",
    description: "Modern responsive showcase card.",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e",
    link: "https://example.com",
    category: "Tech",
    clicks: 28,
    createdAt: new Date("2026-05-22"),
  },
  {
    id: 3,
    title: "Wireless Earbuds",
    description: "Premium audio experience with noise cancellation.",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e",
    link: "https://example.com",
    category: "Audio",
    clicks: 15,
    createdAt: new Date("2026-05-23"),
  },
  {
    id: 4,
    title: "Smart Watch",
    description: "Stay connected with advanced health tracking.",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30",
    link: "https://example.com",
    category: "Wearables",
    clicks: 8,
    createdAt: new Date("2026-05-24"),
  },
];

let nextId = 5;
let analytics = {
  totalClicks: 93,
  totalProducts: 4,
};

// Middleware to verify admin token
const verifyAdmin = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }
  try {
    jwt.verify(token, JWT_SECRET);
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// PUBLIC ROUTES

// Get all products with pagination
app.get('/api/products', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 12;
  const category = req.query.category;
  const search = req.query.search?.toLowerCase();

  let filtered = products;

  if (category && category !== 'all') {
    filtered = filtered.filter(p => p.category.toLowerCase() === category.toLowerCase());
  }

  if (search) {
    filtered = filtered.filter(p =>
      p.title.toLowerCase().includes(search) ||
      p.description.toLowerCase().includes(search)
    );
  }

  const total = filtered.length;
  const start = (page - 1) * limit;
  const paginatedProducts = filtered.slice(start, start + limit);

  res.json({
    products: paginatedProducts,
    total,
    pages: Math.ceil(total / limit),
    currentPage: page,
  });
});

// Get single product
app.get('/api/products/:id', (req, res) => {
  const product = products.find(p => p.id === parseInt(req.params.id));
  if (product) {
    res.json(product);
  } else {
    res.status(404).json({ message: 'Product not found' });
  }
});

// Track product click
app.post('/api/products/:id/click', (req, res) => {
  const product = products.find(p => p.id === parseInt(req.params.id));
  if (product) {
    product.clicks = (product.clicks || 0) + 1;
    analytics.totalClicks++;
    res.json({ success: true, clicks: product.clicks });
  } else {
    res.status(404).json({ message: 'Product not found' });
  }
});

// Get all categories
app.get('/api/categories', (req, res) => {
  const categories = [...new Set(products.map(p => p.category))];
  res.json(categories);
});

// ADMIN ROUTES

// Admin login
app.post('/api/admin/login', (req, res) => {
  const { password } = req.body;
  if (password === ADMIN_PASSWORD) {
    const token = jwt.sign({ admin: true }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, message: 'Login successful' });
  } else {
    res.status(401).json({ message: 'Invalid password' });
  }
});

// Get dashboard analytics
app.get('/api/admin/analytics', verifyAdmin, (req, res) => {
  res.json({
    totalProducts: products.length,
    totalClicks: analytics.totalClicks,
    recentProducts: products
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5),
    topProducts: products
      .sort((a, b) => (b.clicks || 0) - (a.clicks || 0))
      .slice(0, 5),
  });
});

// Add product
app.post('/api/admin/products', verifyAdmin, (req, res) => {
  const { title, description, image, link, category } = req.body;

  if (!title || !description || !image || !link || !category) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  const newProduct = {
    id: nextId++,
    title,
    description,
    image,
    link,
    category,
    clicks: 0,
    createdAt: new Date(),
  };

  products.push(newProduct);
  analytics.totalProducts++;
  res.status(201).json(newProduct);
});

// Edit product
app.put('/api/admin/products/:id', verifyAdmin, (req, res) => {
  const product = products.find(p => p.id === parseInt(req.params.id));
  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }

  const { title, description, image, link, category } = req.body;
  if (title) product.title = title;
  if (description) product.description = description;
  if (image) product.image = image;
  if (link) product.link = link;
  if (category) product.category = category;

  res.json(product);
});

// Delete product
app.delete('/api/admin/products/:id', verifyAdmin, (req, res) => {
  const index = products.findIndex(p => p.id === parseInt(req.params.id));
  if (index === -1) {
    return res.status(404).json({ message: 'Product not found' });
  }

  const deleted = products.splice(index, 1);
  analytics.totalProducts--;
  res.json({ message: 'Product deleted', product: deleted[0] });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
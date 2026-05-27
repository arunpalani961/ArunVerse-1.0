const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3001;
const isProduction = process.env.NODE_ENV === 'production' || process.env.RENDER || process.env.RAILWAY_ENVIRONMENT || process.env.RAILWAY_PROJECT_ID;
const JWT_SECRET = process.env.JWT_SECRET || (isProduction ? undefined : 'your_super_secret_key_change_in_production');
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || (isProduction ? undefined : 'admin123');
const DEFAULT_PRODUCTION_ORIGINS = [
  'https://arunverse.com',
  'https://www.arunverse.com',
  'https://*.vercel.app',
];
const DEFAULT_DEVELOPMENT_ORIGINS = ['http://localhost:5173', 'http://127.0.0.1:5173'];
const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_SSL === 'false' ? false : { rejectUnauthorized: false },
    })
  : null;
const allowedOrigins = (process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',')
  : isProduction
    ? DEFAULT_PRODUCTION_ORIGINS
    : DEFAULT_DEVELOPMENT_ORIGINS
).map(origin => origin.trim()).filter(Boolean);

if (!JWT_SECRET || !ADMIN_PASSWORD) {
  throw new Error('JWT_SECRET and ADMIN_PASSWORD must be set in production');
}

const isAllowedOrigin = (origin) => allowedOrigins.some((allowedOrigin) => {
  if (allowedOrigin.includes('*')) {
    const escapedOrigin = allowedOrigin.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pattern = new RegExp(`^${escapedOrigin.replace(/\\\*/g, '.*')}$`);
    return pattern.test(origin);
  }
  return allowedOrigin === origin;
});

// Middleware
app.use(cors({
  origin(origin, callback) {
    if (!origin || isAllowedOrigin(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
}));
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
let categories = [...new Set(products.map(product => product.category))].sort((a, b) => a.localeCompare(b));
let clickLog = []; // In-memory click tracking for non-database mode

const normalizeCategory = (name) => name.trim();
const categoryExists = async (name) => {
  const normalizedName = normalizeCategory(name);

  if (!pool) {
    return categories.some(category => category.toLowerCase() === normalizedName.toLowerCase());
  }

  const { rows } = await pool.query(
    'SELECT id FROM categories WHERE LOWER(name) = LOWER($1) LIMIT 1',
    [normalizedName]
  );
  return rows.length > 0;
};

const mapProduct = (product) => ({
  id: product.id,
  title: product.title,
  description: product.description,
  image: product.image,
  link: product.link,
  category: product.category,
  clicks: product.clicks || 0,
  displayOrder: product.display_order || product.displayOrder || 0,
  createdAt: product.createdAt || product.created_at,
});

const runAsync = (handler) => async (req, res, next) => {
  try {
    await handler(req, res, next);
  } catch (error) {
    next(error);
  }
};

const initDatabase = async () => {
  if (!pool) {
    console.warn('DATABASE_URL is not set. Using in-memory products; production changes will not persist.');
    return;
  }

  await pool.query(`
    CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      image TEXT NOT NULL,
      link TEXT NOT NULL,
      category TEXT NOT NULL,
      clicks INTEGER NOT NULL DEFAULT 0 CHECK (clicks >= 0),
      display_order INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  // Add display_order column if it doesn't exist (migration for existing databases)
  try {
    await pool.query(`
      ALTER TABLE products
      ADD COLUMN display_order INTEGER NOT NULL DEFAULT 0
    `);
    console.log('Added display_order column to products table');
  } catch (err) {
    if (err.code === '42701') {
      // Column already exists, ignore
      console.log('display_order column already exists');
    } else {
      console.error('Error adding display_order column:', err.message);
    }
  }

  await pool.query(`
    CREATE TABLE IF NOT EXISTS categories (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS click_log (
      id SERIAL PRIMARY KEY,
      product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      clicked_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await pool.query('CREATE INDEX IF NOT EXISTS products_category_idx ON products (LOWER(category))');
  await pool.query('CREATE INDEX IF NOT EXISTS products_created_at_idx ON products (created_at DESC)');
  await pool.query('CREATE INDEX IF NOT EXISTS products_clicks_idx ON products (clicks DESC)');
  await pool.query('CREATE UNIQUE INDEX IF NOT EXISTS categories_name_unique_idx ON categories (LOWER(name))');

  const { rows } = await pool.query('SELECT COUNT(*)::int AS count FROM products');
  if (rows[0].count === 0) {
    for (const product of products) {
      await pool.query(
        `INSERT INTO products (id, title, description, image, link, category, clicks, display_order, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          product.id,
          product.title,
          product.description,
          product.image,
          product.link,
          product.category,
          product.clicks,
          product.displayOrder || product.id,
          product.createdAt,
        ]
      );
    }
    await pool.query(`
      SELECT setval(
        pg_get_serial_sequence('products', 'id'),
        COALESCE((SELECT MAX(id) FROM products), 1),
        true
      )
    `);
  }

  await pool.query(`
    INSERT INTO categories (name)
    SELECT DISTINCT category
    FROM products
    WHERE category IS NOT NULL AND BTRIM(category) <> ''
    ON CONFLICT DO NOTHING
  `);
};

const PRODUCT_SORTS = {
  display_order: { memory: (a, b) => (a.displayOrder || 0) - (b.displayOrder || 0) || a.id - b.id, sql: 'display_order ASC, id ASC' },
  custom: { memory: (a, b) => (a.displayOrder || 0) - (b.displayOrder || 0) || a.id - b.id, sql: 'display_order ASC, id ASC' },
  newest: { memory: (a, b) => new Date(b.createdAt) - new Date(a.createdAt) || b.id - a.id, sql: 'created_at DESC, id DESC' },
  oldest: { memory: (a, b) => new Date(a.createdAt) - new Date(b.createdAt) || a.id - b.id, sql: 'created_at ASC, id ASC' },
  title_asc: { memory: (a, b) => a.title.localeCompare(b.title) || a.id - b.id, sql: 'LOWER(title) ASC, id ASC' },
  title_desc: { memory: (a, b) => b.title.localeCompare(a.title) || b.id - a.id, sql: 'LOWER(title) DESC, id DESC' },
  category_asc: { memory: (a, b) => a.category.localeCompare(b.category) || a.title.localeCompare(b.title), sql: 'LOWER(category) ASC, LOWER(title) ASC, id ASC' },
  category_desc: { memory: (a, b) => b.category.localeCompare(a.category) || a.title.localeCompare(b.title), sql: 'LOWER(category) DESC, LOWER(title) ASC, id ASC' },
  clicks_desc: { memory: (a, b) => (b.clicks || 0) - (a.clicks || 0) || b.id - a.id, sql: 'clicks DESC, id DESC' },
  clicks_asc: { memory: (a, b) => (a.clicks || 0) - (b.clicks || 0) || a.id - b.id, sql: 'clicks ASC, id ASC' },
};

const getProducts = async ({ page, limit, category, search, sort = 'custom' }) => {
  const safeSort = PRODUCT_SORTS[sort] ? sort : 'custom';

  if (!pool) {
    let filtered = products;

    if (category && category !== 'all') {
      filtered = filtered.filter(p => p.category.toLowerCase() === category.toLowerCase());
    }

    if (search) {
      const searchText = search.toLowerCase();
      filtered = filtered.filter(p =>
        p.title.toLowerCase().includes(searchText) ||
        p.description.toLowerCase().includes(searchText)
      );
    }

    filtered = [...filtered].sort(PRODUCT_SORTS[safeSort].memory);

    const total = filtered.length;
    const start = (page - 1) * limit;

    return {
      products: filtered.slice(start, start + limit).map(mapProduct),
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
    };
  }

  const values = [];
  const where = [];

  if (category && category !== 'all') {
    values.push(category);
    where.push(`LOWER(category) = LOWER($${values.length})`);
  }

  if (search) {
    values.push(`%${search}%`);
    where.push(`(title ILIKE $${values.length} OR description ILIKE $${values.length})`);
  }

  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const countResult = await pool.query(`SELECT COUNT(*)::int AS total FROM products ${whereSql}`, values);
  const total = countResult.rows[0].total;

  values.push(limit, (page - 1) * limit);
  
  let listResult;
  try {
    listResult = await pool.query(
      `SELECT id, title, description, image, link, category, clicks, COALESCE(display_order, 0) as display_order, created_at
       FROM products
       ${whereSql}
       ORDER BY ${PRODUCT_SORTS[safeSort].sql}
       LIMIT $${values.length - 1}
       OFFSET $${values.length}`,
      values
    );
  } catch (err) {
    if (err.code === '42703') {
      // Column doesn't exist, fetch without display_order
      console.warn('display_order column not found, using fallback query');
      listResult = await pool.query(
        `SELECT id, title, description, image, link, category, clicks, created_at
         FROM products
         ${whereSql}
         ORDER BY ${PRODUCT_SORTS[safeSort].sql}
         LIMIT $${values.length - 1}
         OFFSET $${values.length}`,
        values
      );
    } else {
      throw err;
    }
  }

  return {
    products: listResult.rows.map(mapProduct),
    total,
    pages: Math.ceil(total / limit),
    currentPage: page,
  };
};

const getProductById = async (id) => {
  if (!pool) {
    return products.find(p => p.id === id);
  }

  let result;
  try {
    result = await pool.query(
      'SELECT id, title, description, image, link, category, clicks, COALESCE(display_order, 0) as display_order, created_at FROM products WHERE id = $1',
      [id]
    );
  } catch (err) {
    if (err.code === '42703') {
      // Column doesn't exist, fetch without display_order
      result = await pool.query(
        'SELECT id, title, description, image, link, category, clicks, created_at FROM products WHERE id = $1',
        [id]
      );
    } else {
      throw err;
    }
  }
  return result.rows[0] ? mapProduct(result.rows[0]) : null;
};

const incrementProductClick = async (id) => {
  if (!pool) {
    const product = products.find(p => p.id === id);
    if (!product) return null;
    product.clicks = (product.clicks || 0) + 1;
    // Log click to in-memory storage
    clickLog.push({ product_id: id, clicked_at: new Date() });
    return product.clicks;
  }

  // Log the click with timestamp and increment click counter
  await pool.query(
    'INSERT INTO click_log (product_id) VALUES ($1)',
    [id]
  );

  const { rows } = await pool.query(
    'UPDATE products SET clicks = clicks + 1 WHERE id = $1 RETURNING clicks',
    [id]
  );
  return rows[0]?.clicks ?? null;
};

const getCategories = async () => {
  if (!pool) {
    return categories;
  }

  const { rows } = await pool.query('SELECT id, name FROM categories ORDER BY LOWER(name) ASC');
  return rows;
};

const createCategory = async (name) => {
  const normalizedName = normalizeCategory(name);

  if (!normalizedName) {
    const error = new Error('Category name is required');
    error.status = 400;
    throw error;
  }

  if (await categoryExists(normalizedName)) {
    const error = new Error('Category already exists');
    error.status = 409;
    throw error;
  }

  if (!pool) {
    categories.push(normalizedName);
    categories = categories.sort((a, b) => a.localeCompare(b));
    return { name: normalizedName };
  }

  const { rows } = await pool.query(
    'INSERT INTO categories (name) VALUES ($1) RETURNING id, name',
    [normalizedName]
  );
  return rows[0];
};

const deleteCategory = async (name) => {
  const normalizedName = normalizeCategory(name);

  if (!pool) {
    const isUsed = products.some(product => product.category.toLowerCase() === normalizedName.toLowerCase());
    if (isUsed) {
      const error = new Error('Category is used by products');
      error.status = 409;
      throw error;
    }

    const index = categories.findIndex(category => category.toLowerCase() === normalizedName.toLowerCase());
    if (index === -1) return null;
    return { name: categories.splice(index, 1)[0] };
  }

  const usedResult = await pool.query(
    'SELECT id FROM products WHERE LOWER(category) = LOWER($1) LIMIT 1',
    [normalizedName]
  );
  if (usedResult.rows.length) {
    const error = new Error('Category is used by products');
    error.status = 409;
    throw error;
  }

  const { rows } = await pool.query(
    'DELETE FROM categories WHERE LOWER(name) = LOWER($1) RETURNING id, name',
    [normalizedName]
  );
  return rows[0] || null;
};

const getAnalytics = async () => {
  if (!pool) {
    const sortedRecent = [...products]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)
      .map(mapProduct);
    const sortedTop = [...products]
      .sort((a, b) => (b.clicks || 0) - (a.clicks || 0))
      .slice(0, 5)
      .map(mapProduct);

    return {
      totalProducts: products.length,
      totalClicks: products.reduce((sum, product) => sum + (product.clicks || 0), 0),
      recentProducts: sortedRecent,
      topProducts: sortedTop,
    };
  }

  const [totalsResult, recentResult, topResult] = await Promise.all([
    pool.query('SELECT COUNT(*)::int AS total_products, COALESCE(SUM(clicks), 0)::int AS total_clicks FROM products'),
    pool.query(
      `SELECT id, title, description, image, link, category, clicks, created_at
       FROM products
       ORDER BY created_at DESC, id DESC
       LIMIT 5`
    ),
    pool.query(
      `SELECT id, title, description, image, link, category, clicks, created_at
       FROM products
       ORDER BY clicks DESC, id DESC
       LIMIT 5`
    ),
  ]);

  return {
    totalProducts: totalsResult.rows[0].total_products,
    totalClicks: totalsResult.rows[0].total_clicks,
    recentProducts: recentResult.rows.map(mapProduct),
    topProducts: topResult.rows.map(mapProduct),
  };
};

const getStorageStatus = () => ({
  persistence: pool ? 'postgres' : 'memory',
  persistent: Boolean(pool),
});

const createProduct = async ({ title, description, image, link, category }) => {
  const normalizedCategory = normalizeCategory(category);
  if (!(await categoryExists(normalizedCategory))) {
    const error = new Error('Please select a valid category');
    error.status = 400;
    throw error;
  }

  if (!pool) {
    const newProduct = {
      id: nextId++,
      title,
      description,
      image,
      link,
      category: normalizedCategory,
      clicks: 0,
      createdAt: new Date(),
    };
    products.push(newProduct);
    return mapProduct(newProduct);
  }

  const { rows } = await pool.query(
    `INSERT INTO products (title, description, image, link, category)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, title, description, image, link, category, clicks, created_at`,
    [title, description, image, link, normalizedCategory]
  );
  return mapProduct(rows[0]);
};

const updateProduct = async (id, updates) => {
  if (updates.category && !(await categoryExists(updates.category))) {
    const error = new Error('Please select a valid category');
    error.status = 400;
    throw error;
  }

  const normalizedUpdates = {
    ...updates,
    ...(updates.category && { category: normalizeCategory(updates.category) }),
  };

  if (!pool) {
    const product = products.find(p => p.id === id);
    if (!product) return null;
    Object.entries(normalizedUpdates).forEach(([key, value]) => {
      if (value) product[key] = value;
    });
    return mapProduct(product);
  }

  const fields = [];
  const values = [];
  ['title', 'description', 'image', 'link', 'category'].forEach((field) => {
    if (normalizedUpdates[field]) {
      values.push(normalizedUpdates[field]);
      fields.push(`${field} = $${values.length}`);
    }
  });

  if (fields.length === 0) {
    return getProductById(id);
  }

  values.push(id);
  const { rows } = await pool.query(
    `UPDATE products
     SET ${fields.join(', ')}
     WHERE id = $${values.length}
     RETURNING id, title, description, image, link, category, clicks, display_order, created_at`,
    values
  );
  return rows[0] ? mapProduct(rows[0]) : null;
};

const updateDisplayOrder = async (orders) => {
  if (!pool) {
    for (const { id, displayOrder } of orders) {
      const product = products.find(p => p.id === id);
      if (product) {
        product.displayOrder = displayOrder;
      }
    }
    return { success: true };
  }

  for (const { id, displayOrder } of orders) {
    await pool.query(
      'UPDATE products SET display_order = $1 WHERE id = $2',
      [displayOrder, id]
    );
  }
  return { success: true };
};

const deleteProduct = async (id) => {
  if (!pool) {
    const index = products.findIndex(p => p.id === id);
    if (index === -1) return null;
    return mapProduct(products.splice(index, 1)[0]);
  }

  const { rows } = await pool.query(
    `DELETE FROM products
     WHERE id = $1
     RETURNING id, title, description, image, link, category, clicks, created_at`,
    [id]
  );
  return rows[0] ? mapProduct(rows[0]) : null;
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
app.get('/api/products', runAsync(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 12;
  const category = req.query.category;
  const search = req.query.search;
  const sort = req.query.sort;

  const result = await getProducts({ page, limit, category, search, sort });
  res.json(result);
}));

// Get single product
app.get('/api/products/:id', runAsync(async (req, res) => {
  const product = await getProductById(parseInt(req.params.id));
  if (product) {
    res.json(product);
  } else {
    res.status(404).json({ message: 'Product not found' });
  }
}));

// Track product click
app.post('/api/products/:id/click', runAsync(async (req, res) => {
  const clicks = await incrementProductClick(parseInt(req.params.id));
  if (clicks !== null) {
    res.json({ success: true, clicks });
  } else {
    res.status(404).json({ message: 'Product not found' });
  }
}));

// Get all categories
app.get('/api/categories', runAsync(async (req, res) => {
  const categories = await getCategories();
  res.json(categories.map(category => category.name || category));
}));

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
app.get('/api/admin/analytics', verifyAdmin, runAsync(async (req, res) => {
  const analytics = await getAnalytics();
  res.json(analytics);
}));

// Get backend storage status for admin dashboard
app.get('/api/admin/status', verifyAdmin, (req, res) => {
  res.json(getStorageStatus());
});

// Get daily click analytics for admin dashboard
app.get('/api/admin/click-analytics', verifyAdmin, runAsync(async (req, res) => {
  if (!pool) {
    // In-memory mode: process clickLog array
    const dailyStats = {};
    
    for (const { clicked_at } of clickLog) {
      const dateStr = new Date(clicked_at).toISOString().split('T')[0]; // YYYY-MM-DD format
      dailyStats[dateStr] = (dailyStats[dateStr] || 0) + 1;
    }

    // Convert to sorted array with cumulative count
    const dates = Object.keys(dailyStats).sort();
    let cumulativeCount = 0;
    const dailyClicks = dates.map(date => {
      cumulativeCount += dailyStats[date];
      return {
        date,
        clicks: dailyStats[date],
        cumulativeClicks: cumulativeCount,
      };
    });

    res.json({ dailyClicks });
    return;
  }

  try {
    const { rows } = await pool.query(`
      SELECT 
        DATE(clicked_at) as click_date,
        COUNT(*) as click_count
      FROM click_log
      GROUP BY DATE(clicked_at)
      ORDER BY click_date ASC
    `);

    // Add cumulative count
    let cumulativeCount = 0;
    const dailyClicks = rows.map(row => {
      cumulativeCount += row.click_count;
      return {
        date: row.click_date,
        clicks: parseInt(row.click_count),
        cumulativeClicks: cumulativeCount,
      };
    });

    res.json({ dailyClicks });
  } catch (error) {
    console.error('Error fetching click analytics:', error);
    res.json({ dailyClicks: [] });
  }
}));

// Get products for admin dashboard
app.get('/api/admin/products', verifyAdmin, runAsync(async (req, res) => {
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 100);
  const category = req.query.category;
  const search = req.query.search;
  const sort = req.query.sort || 'newest';

  const result = await getProducts({ page, limit, category, search, sort });
  res.json(result);
}));

// Get category list for admin dashboard
app.get('/api/admin/categories', verifyAdmin, runAsync(async (req, res) => {
  const categories = await getCategories();
  res.json(categories);
}));

// Add category
app.post('/api/admin/categories', verifyAdmin, runAsync(async (req, res) => {
  const category = await createCategory(req.body.name || '');
  res.status(201).json(category);
}));

// Delete category
app.delete('/api/admin/categories/:name', verifyAdmin, runAsync(async (req, res) => {
  const deleted = await deleteCategory(req.params.name);
  if (!deleted) {
    return res.status(404).json({ message: 'Category not found' });
  }

  res.json({ message: 'Category deleted', category: deleted });
}));

// Add product
app.post('/api/admin/products', verifyAdmin, runAsync(async (req, res) => {
  const { title, description, image, link, category } = req.body;

  if (!title || !description || !image || !link || !category) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  const newProduct = await createProduct({ title, description, image, link, category });
  res.status(201).json(newProduct);
}));

// Edit product
app.put('/api/admin/products/:id', verifyAdmin, runAsync(async (req, res) => {
  const { title, description, image, link, category } = req.body;
  const product = await updateProduct(parseInt(req.params.id), { title, description, image, link, category });

  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }

  res.json(product);
}));

// Delete product
app.delete('/api/admin/products/:id', verifyAdmin, runAsync(async (req, res) => {
  const deleted = await deleteProduct(parseInt(req.params.id));
  if (!deleted) {
    return res.status(404).json({ message: 'Product not found' });
  }

  res.json({ message: 'Product deleted', product: deleted });
}));

// Update product display order
app.post('/api/admin/products/reorder', verifyAdmin, runAsync(async (req, res) => {
  const { orders } = req.body;
  if (!Array.isArray(orders)) {
    const error = new Error('Orders must be an array');
    error.status = 400;
    throw error;
  }

  await updateDisplayOrder(orders);
  res.json({ success: true, message: 'Display order updated' });
}));

app.use((error, req, res, next) => {
  if (!error.status) {
    console.error(error);
  }
  res.status(error.status || 500).json({ message: error.status ? error.message : 'Server error' });
});

// Start server
initDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  });

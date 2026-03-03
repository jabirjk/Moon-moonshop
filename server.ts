import express from 'express';
import { createServer as createViteServer } from 'vite';
import Database from 'better-sqlite3';
import crypto from 'crypto';
import { WebSocketServer, WebSocket } from 'ws';
import { createServer } from 'http';

// Use a new database file for the v3 schema with RBAC
const db = new Database('moonshop_v3.sqlite');

const hashPassword = (password: string) => crypto.createHash('sha256').update(password).digest('hex');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    email TEXT UNIQUE,
    password TEXT,
    role TEXT, -- 'admin', 'vendor', 'buyer'
    avatar TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    vendor_id INTEGER,
    name TEXT,
    price REAL,
    category TEXT,
    image TEXT,
    image2 TEXT,
    image3 TEXT,
    video_url TEXT,
    description TEXT,
    stock INTEGER DEFAULT 10,
    shipping_cost REAL DEFAULT 0,
    shipping_time TEXT DEFAULT '3-5 business days',
    is_sale BOOLEAN DEFAULT 0,
    sale_price REAL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(vendor_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    buyer_id INTEGER,
    total REAL,
    status TEXT, -- 'Processing', 'Shipped', 'Delivered'
    shipping_address TEXT,
    shipping_method TEXT DEFAULT 'Standard',
    shipping_cost REAL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(buyer_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER,
    product_id INTEGER,
    quantity INTEGER,
    price REAL,
    FOREIGN KEY(order_id) REFERENCES orders(id),
    FOREIGN KEY(product_id) REFERENCES products(id)
  );

  CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER,
    user_id INTEGER,
    rating INTEGER,
    comment TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(product_id) REFERENCES products(id),
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS vendor_reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    vendor_id INTEGER,
    user_id INTEGER,
    rating INTEGER,
    comment TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(vendor_id) REFERENCES users(id),
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS wishlists (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    product_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, product_id),
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(product_id) REFERENCES products(id)
  );

  CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    message TEXT,
    type TEXT,
    is_read BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE
  );

  CREATE TABLE IF NOT EXISTS product_tags (
    product_id INTEGER,
    tag_id INTEGER,
    PRIMARY KEY (product_id, tag_id),
    FOREIGN KEY(product_id) REFERENCES products(id),
    FOREIGN KEY(tag_id) REFERENCES tags(id)
  );

  CREATE TABLE IF NOT EXISTS stock_alerts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    product_id INTEGER,
    email TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(product_id) REFERENCES products(id)
  );

  CREATE TABLE IF NOT EXISTS promotions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER,
    title TEXT,
    subtitle TEXT,
    description TEXT,
    image TEXT,
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(product_id) REFERENCES products(id)
  );

  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sender_id INTEGER,
    receiver_id INTEGER,
    message TEXT,
    is_read BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(sender_id) REFERENCES users(id),
    FOREIGN KEY(receiver_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS product_views (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    product_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(product_id) REFERENCES products(id)
  );
`);

// Seed data if the database is empty
try {
  db.exec('ALTER TABLE products ADD COLUMN stock INTEGER DEFAULT 10');
} catch (e) {
  // Column already exists, ignore
}

try {
  db.exec('ALTER TABLE products ADD COLUMN views INTEGER DEFAULT 0');
} catch (e) {}

try {
  db.exec('ALTER TABLE products ADD COLUMN sales INTEGER DEFAULT 0');
} catch (e) {}

try { db.exec('ALTER TABLE products ADD COLUMN shipping_cost REAL DEFAULT 0'); } catch (e) {}
try { db.exec('ALTER TABLE products ADD COLUMN shipping_time TEXT DEFAULT "3-5 business days"'); } catch (e) {}
try { db.exec('ALTER TABLE products ADD COLUMN is_sale BOOLEAN DEFAULT 0'); } catch (e) {}
try { db.exec('ALTER TABLE products ADD COLUMN sale_price REAL DEFAULT 0'); } catch (e) {}

try { db.exec('ALTER TABLE orders ADD COLUMN shipping_method TEXT DEFAULT "Standard"'); } catch (e) {}
try { db.exec('ALTER TABLE orders ADD COLUMN shipping_cost REAL DEFAULT 0'); } catch (e) {}

try {
  db.exec('ALTER TABLE users ADD COLUMN password TEXT');
  // Set default password for existing users if any
  const defaultPass = hashPassword('password123');
  db.prepare('UPDATE users SET password = ? WHERE password IS NULL').run(defaultPass);
} catch (e) {
  // Column already exists, ignore
}

const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
if (userCount.count === 0) {
  const insertUser = db.prepare('INSERT INTO users (name, email, password, role, avatar) VALUES (?, ?, ?, ?, ?)');
  const defaultPass = hashPassword('password123');
  
  // Seed Users
  const adminId = insertUser.run('Commander Admin', 'admin@moonshop.com', defaultPass, 'admin', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin').lastInsertRowid;
  const vendorId = insertUser.run('Lunar Tech Corp', 'vendor@moonshop.com', defaultPass, 'vendor', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Vendor').lastInsertRowid;
  const buyerId = insertUser.run('Neil Explorer', 'buyer@moonshop.com', defaultPass, 'buyer', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Buyer').lastInsertRowid;

  // Seed Products for the Vendor
  const insertProduct = db.prepare('INSERT INTO products (vendor_id, name, price, category, image, description, stock) VALUES (?, ?, ?, ?, ?, ?, ?)');
  const products = [
    [vendorId, "Lunar Basalt Rock", 299.99, "Geology", "https://picsum.photos/seed/moonrock1/800/800", "Authentic simulated lunar basalt, perfect for collectors and educational purposes. Mined from simulated lunar regolith.", 15],
    [vendorId, "Apollo Replica Suit", 12500.00, "Apparel", "https://picsum.photos/seed/spacesuit/800/800", "High-fidelity replica of the Apollo A7L spacesuit. Features pressurized joints, authentic mission patches, and life-support backpack replica.", 2],
    [vendorId, "Crater Telescope Pro", 899.50, "Equipment", "https://picsum.photos/seed/telescope/800/800", "High-powered telescope optimized for lunar observation. Features a 150mm aperture and specialized lunar filters for enhanced contrast.", 0],
    [vendorId, "Zero-G Coffee Cup", 45.00, "Lifestyle", "https://picsum.photos/seed/zerogcup/800/800", "Enjoy your morning brew just like the astronauts do. Capillary action keeps your liquid in the cup, even in microgravity.", 50],
    [vendorId, "Meteorite Fragment", 150.00, "Geology", "https://picsum.photos/seed/meteorite/800/800", "A genuine piece of space history. Iron-nickel meteorite fragment recovered from the Campo del Cielo crater field.", 0],
    [vendorId, "Lunar Rover Model", 120.00, "Collectibles", "https://picsum.photos/seed/rover/800/800", "1:24 scale die-cast model of the Lunar Roving Vehicle. Features folding chassis, mesh wheels, and detailed control console.", 12]
  ];
  products.forEach(p => insertProduct.run(...p));

  // Seed an initial order
  const insertOrder = db.prepare('INSERT INTO orders (buyer_id, total, status, shipping_address) VALUES (?, ?, ?, ?)');
  const insertOrderItem = db.prepare('INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)');
  
  const orderId = insertOrder.run(buyerId, 344.99, 'Shipped', '100 Space Center Blvd, Houston, TX').lastInsertRowid;
  insertOrderItem.run(orderId, 1, 1, 299.99); // Rock
  insertOrderItem.run(orderId, 4, 1, 45.00);  // Cup
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // --- AUTH ---
  app.get('/api/auth/google/url', (req, res) => {
    const redirectUri = `${req.protocol}://${req.get('host')}/api/auth/google/callback`;
    const clientId = process.env.GOOGLE_CLIENT_ID;
    
    if (!clientId) {
      // Fallback for demo purposes if no keys are configured
      return res.json({ url: `${req.protocol}://${req.get('host')}/api/auth/google/callback?code=demo_code` });
    }

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'profile email',
      access_type: 'offline',
      prompt: 'consent',
    });
    
    res.json({ url: `https://accounts.google.com/o/oauth2/v2/auth?${params}` });
  });

  app.get('/api/auth/apple/url', (req, res) => {
    const redirectUri = `${req.protocol}://${req.get('host')}/api/auth/apple/callback`;
    const clientId = process.env.APPLE_CLIENT_ID;

    if (!clientId) {
       // Fallback for demo purposes
       return res.json({ url: `${req.protocol}://${req.get('host')}/api/auth/apple/callback?code=demo_code` });
    }

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'name email',
      response_mode: 'form_post',
    });

    res.json({ url: `https://appleid.apple.com/auth/authorize?${params}` });
  });

  app.get('/api/auth/:provider/callback', async (req, res) => {
    const { code } = req.query;
    const { provider } = req.params;

    // In a real app, exchange code for tokens here using client secret
    // const tokens = await exchangeCodeForTokens(code, provider);
    // const profile = await fetchUserProfile(tokens.access_token);
    
    // For demo/prototype: Simulate a successful login with a mock user
    // In production, you would look up or create the user in your DB based on the profile
    
    const email = `demo.${provider}@example.com`;
    const name = `Demo ${provider.charAt(0).toUpperCase() + provider.slice(1)} User`;
    const avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${provider}`;
    
    let user = db.prepare('SELECT id, name, email, role, avatar, phone, address, social_links, preferences FROM users WHERE email = ?').get(email) as any;
    
    if (!user) {
      const info = db.prepare('INSERT INTO users (name, email, role, avatar) VALUES (?, ?, ?, ?)').run(name, email, 'buyer', avatar);
      user = db.prepare('SELECT id, name, email, role, avatar, phone, address, social_links, preferences FROM users WHERE id = ?').get(info.lastInsertRowid);
    }

    // Send the user data back to the opener
    res.send(`
      <html>
        <body>
          <script>
            if (window.opener) {
              window.opener.postMessage({ type: 'OAUTH_SUCCESS', user: ${JSON.stringify(user)} }, '*');
              window.close();
            } else {
              window.location.href = '/';
            }
          </script>
          <p>Authentication successful. You can close this window.</p>
        </body>
      </html>
    `);
  });

  app.post('/api/auth/signup', (req, res) => {
    const { name, email, password, role } = req.body;
    try {
      const hashedPassword = hashPassword(password);
      const avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${name.replace(/\s/g, '')}`;
      const info = db.prepare('INSERT INTO users (name, email, password, role, avatar) VALUES (?, ?, ?, ?, ?)').run(name, email, hashedPassword, role || 'buyer', avatar);
      const user = db.prepare('SELECT id, name, email, role, avatar FROM users WHERE id = ?').get(info.lastInsertRowid);
      res.json({ success: true, user });
    } catch (err: any) {
      if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        res.status(400).json({ success: false, error: 'Email already exists' });
      } else {
        res.status(500).json({ success: false, error: 'Failed to create user' });
      }
    }
  });

  app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;
    
    if (user) {
      // Check password if it exists (for backward compatibility with old seeds, though we updated them)
      if (user.password) {
        const hashedPassword = hashPassword(password);
        if (hashedPassword !== user.password) {
          return res.status(401).json({ success: false, error: 'Invalid password' });
        }
      }
      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;
      res.json({ success: true, user: userWithoutPassword });
    } else {
      res.status(401).json({ success: false, error: 'User not found' });
    }
  });

  app.post('/api/auth/oauth', (req, res) => {
    const { provider, email, name, avatar, role } = req.body;
    let user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;
    
    if (user) {
      const { password: _, ...userWithoutPassword } = user;
      res.json({ success: true, user: userWithoutPassword });
    } else {
      try {
        const defaultAvatar = avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${name.replace(/\s/g, '')}`;
        const info = db.prepare('INSERT INTO users (name, email, role, avatar) VALUES (?, ?, ?, ?)').run(name, email, role || 'buyer', defaultAvatar);
        const newUser = db.prepare('SELECT id, name, email, role, avatar FROM users WHERE id = ?').get(info.lastInsertRowid);
        res.json({ success: true, user: newUser });
      } catch (err: any) {
        res.status(500).json({ success: false, error: 'Failed to create user via OAuth' });
      }
    }
  });

  app.put('/api/users/:id', (req, res) => {
    const { name, email, avatar, password, phone, address, social_links, preferences } = req.body;
    const userId = req.params.id;
    
    try {
      if (password) {
        const hashedPassword = hashPassword(password);
        db.prepare('UPDATE users SET name = ?, email = ?, avatar = ?, password = ?, phone = ?, address = ?, social_links = ?, preferences = ? WHERE id = ?').run(
          name, email, avatar, hashedPassword, phone || null, address || null, social_links ? JSON.stringify(social_links) : null, preferences ? JSON.stringify(preferences) : null, userId
        );
      } else {
        db.prepare('UPDATE users SET name = ?, email = ?, avatar = ?, phone = ?, address = ?, social_links = ?, preferences = ? WHERE id = ?').run(
          name, email, avatar, phone || null, address || null, social_links ? JSON.stringify(social_links) : null, preferences ? JSON.stringify(preferences) : null, userId
        );
      }
      const updatedUser = db.prepare('SELECT id, name, email, role, avatar, phone, address, social_links, preferences FROM users WHERE id = ?').get(userId);
      res.json({ success: true, user: updatedUser });
    } catch (err) {
      res.status(500).json({ success: false, error: 'Failed to update profile' });
    }
  });

  app.post('/api/users/:id/upgrade-to-vendor', (req, res) => {
    const userId = req.params.id;
    try {
      db.prepare('UPDATE users SET role = "vendor", kyc_status = "unverified" WHERE id = ?').run(userId);
      const updatedUser = db.prepare('SELECT id, name, email, role, avatar, kyc_status FROM users WHERE id = ?').get(userId);
      res.json({ success: true, user: updatedUser });
    } catch (err) {
      res.status(500).json({ success: false, error: 'Failed to upgrade account' });
    }
  });

  // --- PUBLIC SHOP ---
  app.get('/api/products', (req, res) => {
    const stmt = db.prepare(`
      SELECT p.*, u.name as vendor_name, u.kyc_status as vendor_kyc_status,
             IFNULL((SELECT AVG(rating) FROM reviews WHERE product_id = p.id), 0) as average_rating, 
             (SELECT COUNT(id) FROM reviews WHERE product_id = p.id) as review_count,
             IFNULL((SELECT AVG(rating) FROM vendor_reviews WHERE vendor_id = p.vendor_id), 0) as vendor_rating
      FROM products p
      JOIN users u ON p.vendor_id = u.id
      ORDER BY p.created_at DESC
    `);
    res.json(stmt.all());
  });

  app.get('/api/products/:id', (req, res) => {
    try {
      db.prepare('UPDATE products SET views = views + 1 WHERE id = ?').run(req.params.id);
      const product = db.prepare(`
        SELECT p.*, u.name as vendor_name, u.kyc_status as vendor_kyc_status,
               IFNULL((SELECT AVG(rating) FROM reviews WHERE product_id = p.id), 0) as average_rating, 
               (SELECT COUNT(id) FROM reviews WHERE product_id = p.id) as review_count,
               IFNULL((SELECT AVG(rating) FROM vendor_reviews WHERE vendor_id = p.vendor_id), 0) as vendor_rating
        FROM products p
        JOIN users u ON p.vendor_id = u.id
        WHERE p.id = ?
      `).get(req.params.id);
      
      if (!product) return res.status(404).json({ error: 'Product not found' });
      res.json(product);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch product' });
    }
  });

  // --- REVIEWS ROUTES ---
  app.get('/api/products/:id/reviews', (req, res) => {
    const stmt = db.prepare(`
      SELECT r.*, u.name as user_name, u.avatar 
      FROM reviews r 
      JOIN users u ON r.user_id = u.id 
      WHERE r.product_id = ? 
      ORDER BY r.created_at DESC
    `);
    res.json(stmt.all(req.params.id));
  });

  app.post('/api/products/:id/reviews', (req, res) => {
    const { user_id, rating, comment } = req.body;
    try {
      const info = db.prepare('INSERT INTO reviews (product_id, user_id, rating, comment) VALUES (?, ?, ?, ?)').run(req.params.id, user_id, rating, comment);
      
      // Notify vendor
      const product = db.prepare('SELECT vendor_id, name FROM products WHERE id = ?').get(req.params.id) as any;
      if (product) {
        db.prepare('INSERT INTO notifications (user_id, message, type) VALUES (?, ?, ?)').run(
          product.vendor_id, 
          `New ${rating}-star review on your product: ${product.name}`, 
          'review'
        );
      }

      res.json({ success: true, id: info.lastInsertRowid });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to add review' });
    }
  });

  // --- BUYER ROUTES ---
  app.get('/api/buyer/:id/wishlist', (req, res) => {
    const wishlist = db.prepare('SELECT product_id FROM wishlists WHERE user_id = ?').all(req.params.id);
    res.json(wishlist.map((w: any) => w.product_id));
  });

  app.get('/api/buyer/:id/wishlist/products', (req, res) => {
    const products = db.prepare(`
      SELECT p.*, u.name as vendor_name, u.kyc_status as vendor_kyc_status,
             IFNULL(AVG(r.rating), 0) as average_rating, 
             COUNT(r.id) as review_count
      FROM wishlists w
      JOIN products p ON w.product_id = p.id
      JOIN users u ON p.vendor_id = u.id
      LEFT JOIN reviews r ON p.id = r.product_id
      WHERE w.user_id = ?
      GROUP BY p.id
      ORDER BY w.created_at DESC
    `).all(req.params.id);
    res.json(products);
  });

  app.post('/api/buyer/:id/wishlist/toggle', (req, res) => {
    const { product_id } = req.body;
    const user_id = req.params.id;
    const existing = db.prepare('SELECT id FROM wishlists WHERE user_id = ? AND product_id = ?').get(user_id, product_id);
    
    try {
      if (existing) {
        db.prepare('DELETE FROM wishlists WHERE user_id = ? AND product_id = ?').run(user_id, product_id);
        res.json({ success: true, action: 'removed' });
      } else {
        db.prepare('INSERT INTO wishlists (user_id, product_id) VALUES (?, ?)').run(user_id, product_id);
        res.json({ success: true, action: 'added' });
      }
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to toggle wishlist' });
    }
  });

  app.post('/api/checkout', (req, res) => {
    const { buyer_id, address, items, total, shipping_method, shipping_cost } = req.body;
    
    const insertOrder = db.prepare('INSERT INTO orders (buyer_id, shipping_address, total, status, shipping_method, shipping_cost) VALUES (?, ?, ?, ?, ?, ?)');
    const insertOrderItem = db.prepare('INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)');
    const insertNotification = db.prepare('INSERT INTO notifications (user_id, message, type) VALUES (?, ?, ?)');
    const getProduct = db.prepare('SELECT vendor_id, name, stock FROM products WHERE id = ?');
    const updateStock = db.prepare('UPDATE products SET stock = stock - ?, sales = sales + ? WHERE id = ?');
    
    const transaction = db.transaction(() => {
      // 1. Check stock first
      for (const item of items) {
        const product = getProduct.get(item.id) as any;
        if (!product) throw new Error(`Product ${item.id} not found`);
        if (product.stock < item.quantity) throw new Error(`Insufficient stock for ${product.name}`);
      }

      // 2. Create Order
      const info = insertOrder.run(buyer_id, address, total, 'Processing', shipping_method || 'Standard', shipping_cost || 0);
      const orderId = info.lastInsertRowid;
      
      const vendorIds = new Set<number>();
      for (const item of items) {
        // 3. Insert Items & Deduct Stock
        insertOrderItem.run(orderId, item.id, item.quantity, item.price);
        updateStock.run(item.quantity, item.quantity, item.id);
        
        const product = getProduct.get(item.id) as any;
        if (product) {
          vendorIds.add(product.vendor_id);
        }
      }

      // 4. Notify vendors
      for (const vendorId of vendorIds) {
        insertNotification.run(vendorId, `You have a new order (#${orderId}) to fulfill.`, 'order');
      }
      
      // 5. Notify buyer
      insertNotification.run(buyer_id, `Order #${orderId} placed successfully!`, 'order');

      return orderId;
    });

    try {
      const orderId = transaction();
      res.json({ success: true, orderId });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message || 'Checkout failed' });
    }
  });

  app.post('/api/auth/forgot-password', (req, res) => {
    const { email } = req.body;
    const user = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (user) {
      // In a real app, send email with reset token
      // For demo, just return success
      res.json({ success: true, message: 'Password reset link sent to your email.' });
    } else {
      // For security, don't reveal if user exists, but for demo we can be vague
      res.json({ success: true, message: 'If an account exists, a reset link has been sent.' });
    }
  });

  app.get('/api/buyer/:id/dashboard', (req, res) => {
    const buyerId = req.params.id;
    
    // Total spent
    const totalSpent = db.prepare('SELECT SUM(total) as total FROM orders WHERE buyer_id = ?').get(buyerId) as { total: number };
    
    // Total orders
    const totalOrders = db.prepare('SELECT COUNT(*) as count FROM orders WHERE buyer_id = ?').get(buyerId) as { count: number };
    
    // Wishlist count
    const wishlistCount = db.prepare('SELECT COUNT(*) as count FROM wishlists WHERE user_id = ?').get(buyerId) as { count: number };
    
    // Recent orders
    const recentOrders = db.prepare('SELECT * FROM orders WHERE buyer_id = ? ORDER BY created_at DESC LIMIT 5').all(buyerId);
    
    // Spending trend (Last 6 months)
    // Note: SQLite strftime might vary, assuming standard YYYY-MM-DD format
    // For demo purposes with limited data, we might not get much, but let's try.
    // If no data, we can send some mock data or empty.
    const spendingTrend = db.prepare(`
      SELECT strftime('%Y-%m', created_at) as name, SUM(total) as value
      FROM orders
      WHERE buyer_id = ?
      GROUP BY name
      ORDER BY name ASC
      LIMIT 6
    `).all(buyerId);

    res.json({
      totalSpent: totalSpent.total || 0,
      totalOrders: totalOrders.count || 0,
      wishlistCount: wishlistCount.count || 0,
      recentOrders,
      spendingTrend
    });
  });

  app.get('/api/buyer/:id/orders', (req, res) => {
    const orders = db.prepare('SELECT * FROM orders WHERE buyer_id = ? ORDER BY created_at DESC').all(req.params.id);
    const getItems = db.prepare(`
      SELECT oi.*, p.name, p.image 
      FROM order_items oi 
      JOIN products p ON oi.product_id = p.id 
      WHERE oi.order_id = ?
    `);
    
    const ordersWithItems = orders.map((o: any) => ({
      ...o,
      items: getItems.all(o.id)
    }));
    res.json(ordersWithItems);
  });

  // --- VENDOR ROUTES ---
  app.get('/api/public/vendor/:id', (req, res) => {
    const vendor = db.prepare(`
      SELECT u.id, u.name, u.avatar, u.created_at, u.role, u.kyc_status,
             IFNULL(AVG(vr.rating), 0) as average_rating,
             COUNT(vr.id) as review_count
      FROM users u
      LEFT JOIN vendor_reviews vr ON u.id = vr.vendor_id
      WHERE u.id = ? AND u.role = ?
      GROUP BY u.id
    `).get(req.params.id, 'vendor');
    if (!vendor) return res.status(404).json({ error: 'Vendor not found' });
    res.json(vendor);
  });

  app.get('/api/vendor/:id/reviews', (req, res) => {
    const stmt = db.prepare(`
      SELECT vr.*, u.name as user_name, u.avatar 
      FROM vendor_reviews vr 
      JOIN users u ON vr.user_id = u.id 
      WHERE vr.vendor_id = ? 
      ORDER BY vr.created_at DESC
    `);
    res.json(stmt.all(req.params.id));
  });

  app.post('/api/vendor/:id/reviews', (req, res) => {
    const { user_id, rating, comment } = req.body;
    const vendorId = req.params.id;
    try {
      const info = db.prepare('INSERT INTO vendor_reviews (vendor_id, user_id, rating, comment) VALUES (?, ?, ?, ?)').run(vendorId, user_id, rating, comment);
      
      // Notify vendor
      db.prepare('INSERT INTO notifications (user_id, message, type) VALUES (?, ?, ?)').run(
        vendorId, 
        `New ${rating}-star review on your storefront!`, 
        'review'
      );

      res.json({ success: true, id: info.lastInsertRowid });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to add vendor review' });
    }
  });

  app.get('/api/vendor/:id/chart', (req, res) => {
    // Generate mock chart data for the last 7 days for a better visual demo
    const data = [];
    for(let i=6; i>=0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      data.push({
        name: d.toLocaleDateString('en-US', { weekday: 'short' }),
        revenue: Math.floor(Math.random() * 1500) + 200
      });
    }
    res.json(data);
  });

  app.get('/api/vendor/:id/dashboard', (req, res) => {
    const vendorId = req.params.id;
    
    // Total Revenue for this vendor
    const revenueRow = db.prepare(`
      SELECT SUM(oi.quantity * oi.price) as total_revenue
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE p.vendor_id = ?
    `).get(vendorId) as any;

    // Total Products
    const productsRow = db.prepare('SELECT COUNT(*) as count FROM products WHERE vendor_id = ?').get(vendorId) as any;

    // Recent Sales
    const recentSales = db.prepare(`
      SELECT oi.quantity, oi.price, p.name as product_name, o.created_at, u.name as buyer_name, o.status
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      JOIN orders o ON oi.order_id = o.id
      JOIN users u ON o.buyer_id = u.id
      WHERE p.vendor_id = ?
      ORDER BY o.created_at DESC
      LIMIT 10
    `).all(vendorId);

    res.json({
      totalRevenue: revenueRow.total_revenue || 0,
      totalProducts: productsRow.count || 0,
      recentSales
    });
  });

  app.get('/api/vendor/:id/products', (req, res) => {
    const products = db.prepare('SELECT * FROM products WHERE vendor_id = ? ORDER BY created_at DESC').all(req.params.id);
    res.json(products);
  });

  app.post('/api/vendor/:id/products', (req, res) => {
    const vendorId = req.params.id;
    const { name, price, category, image, image2, image3, video_url, description, stock, shipping_cost, shipping_time, is_sale, sale_price } = req.body;
    const stmt = db.prepare('INSERT INTO products (vendor_id, name, price, category, image, image2, image3, video_url, description, stock, shipping_cost, shipping_time, is_sale, sale_price) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
    try {
      const info = stmt.run(vendorId, name, price, category, image, image2 || null, image3 || null, video_url || null, description, stock || 10, shipping_cost || 0, shipping_time || '3-5 business days', is_sale ? 1 : 0, sale_price || 0);
      res.json({ success: true, id: info.lastInsertRowid });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to add product' });
    }
  });

  app.put('/api/vendor/:id/products/:productId', (req, res) => {
    const vendorId = req.params.id;
    const productId = req.params.productId;
    const { name, price, category, image, image2, image3, video_url, description, stock, shipping_cost, shipping_time, is_sale, sale_price } = req.body;
    try {
      db.prepare('UPDATE products SET name=?, price=?, category=?, image=?, image2=?, image3=?, video_url=?, description=?, stock=?, shipping_cost=?, shipping_time=?, is_sale=?, sale_price=? WHERE id=? AND vendor_id=?')
        .run(name, price, category, image, image2 || null, image3 || null, video_url || null, description, stock, shipping_cost || 0, shipping_time || '3-5 business days', is_sale ? 1 : 0, sale_price || 0, productId, vendorId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to update product' });
    }
  });

  app.delete('/api/vendor/:id/products/:productId', (req, res) => {
    try {
      db.prepare('DELETE FROM products WHERE id=? AND vendor_id=?').run(req.params.productId, req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to delete product' });
    }
  });

  // Add is_featured column if it doesn't exist
try {
  db.exec('ALTER TABLE products ADD COLUMN is_featured BOOLEAN DEFAULT 0');
} catch (e) {
  // Column already exists, ignore
}

// Add kyc_status and kyc_document columns to users table
try {
  db.exec("ALTER TABLE users ADD COLUMN kyc_status TEXT DEFAULT 'unverified'");
  db.exec("ALTER TABLE users ADD COLUMN kyc_document TEXT");
} catch (e) {
  // Columns already exist
}

try {
  db.exec("ALTER TABLE users ADD COLUMN social_links TEXT DEFAULT '{}'");
  db.exec("ALTER TABLE users ADD COLUMN preferences TEXT DEFAULT '{}'");
  db.exec("ALTER TABLE users ADD COLUMN phone TEXT");
  db.exec("ALTER TABLE users ADD COLUMN address TEXT");
} catch (e) {}

// --- KYC ROUTES ---
app.post('/api/vendor/:id/kyc', (req, res) => {
  const { documentUrl } = req.body;
  try {
    db.prepare("UPDATE users SET kyc_status = 'pending', kyc_document = ? WHERE id = ?").run(documentUrl, req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to submit KYC' });
  }
});

app.get('/api/admin/kyc', (req, res) => {
  const users = db.prepare("SELECT id, name, email, avatar, kyc_status, kyc_document, created_at FROM users WHERE kyc_status IS NOT NULL").all();
  res.json(users);
});

app.put('/api/admin/kyc/:id', (req, res) => {
  const { status } = req.body; // 'verified' or 'rejected'
  try {
    db.prepare('UPDATE users SET kyc_status = ? WHERE id = ?').run(status, req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update KYC status' });
  }
});

// --- ADMIN ROUTES ---
app.put('/api/admin/products/bulk-feature', (req, res) => {
  const { productIds, isFeatured } = req.body;
  try {
    const stmt = db.prepare('UPDATE products SET is_featured = ? WHERE id = ?');
    const transaction = db.transaction((ids) => {
      for (const id of ids) stmt.run(isFeatured ? 1 : 0, id);
    });
    transaction(productIds);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update products' });
  }
});

app.delete('/api/admin/products/bulk-delete', (req, res) => {
  const { productIds } = req.body;
  try {
    const stmt = db.prepare('DELETE FROM products WHERE id = ?');
    const transaction = db.transaction((ids) => {
      for (const id of ids) stmt.run(id);
    });
    transaction(productIds);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to delete products' });
  }
});

app.get('/api/admin/chart', (req, res) => {
    // Generate mock chart data for the last 7 days for a better visual demo
    const data = [];
    for(let i=6; i>=0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      data.push({
        name: d.toLocaleDateString('en-US', { weekday: 'short' }),
        revenue: Math.floor(Math.random() * 5000) + 1000
      });
    }
    res.json(data);
  });

  app.get('/api/admin/orders', (req, res) => {
    const orders = db.prepare(`
      SELECT o.*, u.name as buyer_name, u.email as buyer_email
      FROM orders o
      JOIN users u ON o.buyer_id = u.id
      ORDER BY o.created_at DESC
    `).all();
    res.json(orders);
  });

  app.get('/api/vendor/:id/orders', (req, res) => {
    const orders = db.prepare(`
      SELECT DISTINCT o.*, u.name as buyer_name, u.email as buyer_email
      FROM orders o
      JOIN users u ON o.buyer_id = u.id
      JOIN order_items oi ON o.id = oi.order_id
      JOIN products p ON oi.product_id = p.id
      WHERE p.vendor_id = ?
      ORDER BY o.created_at DESC
    `).all(req.params.id);
    
    const ordersWithItems = orders.map((o: any) => {
      const items = db.prepare(`
        SELECT oi.*, p.name, p.image 
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = ? AND p.vendor_id = ?
      `).all(o.id, req.params.id);
      return { ...o, items };
    });

    res.json(ordersWithItems);
  });

  app.get('/api/admin/dashboard', (req, res) => {
    const totalRevenue = (db.prepare('SELECT SUM(total) as total FROM orders').get() as any).total || 0;
    const totalUsers = (db.prepare('SELECT COUNT(*) as count FROM users').get() as any).count || 0;
    const totalOrders = (db.prepare('SELECT COUNT(*) as count FROM orders').get() as any).count || 0;
    
    const recentOrders = db.prepare(`
      SELECT o.*, u.name as buyer_name, u.email as buyer_email
      FROM orders o
      JOIN users u ON o.buyer_id = u.id
      ORDER BY o.created_at DESC
      LIMIT 10
    `).all();

    res.json({ totalRevenue, totalUsers, totalOrders, recentOrders });
  });

  app.get('/api/admin/users', (req, res) => {
    const users = db.prepare('SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC').all();
    res.json(users);
  });

  app.delete('/api/admin/users/:id', (req, res) => {
    try {
      db.prepare('DELETE FROM users WHERE id=?').run(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to delete user' });
    }
  });

  app.put('/api/admin/orders/:id/status', (req, res) => {
    const { status } = req.body;
    try {
      db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(status, req.params.id);
      
      // Notify buyer
      const order = db.prepare('SELECT buyer_id FROM orders WHERE id = ?').get(req.params.id) as any;
      if (order) {
        db.prepare('INSERT INTO notifications (user_id, message, type) VALUES (?, ?, ?)').run(
          order.buyer_id,
          `Your order #${req.params.id} is now ${status}.`,
          'status'
        );
      }

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to update status' });
    }
  });

  app.get('/api/admin/products', (req, res) => {
    const products = db.prepare(`
      SELECT p.*, u.name as vendor_name 
      FROM products p 
      JOIN users u ON p.vendor_id = u.id 
      ORDER BY p.created_at DESC
    `).all();
    res.json(products);
  });

  // --- WISHLIST ROUTES ---
  app.get('/api/wishlist/:userId', (req, res) => {
    const wishlist = db.prepare(`
      SELECT p.*, u.name as vendor_name 
      FROM wishlists w 
      JOIN products p ON w.product_id = p.id 
      JOIN users u ON p.vendor_id = u.id 
      WHERE w.user_id = ?
    `).all(req.params.userId);
    res.json(wishlist);
  });

  app.post('/api/wishlist/toggle', (req, res) => {
    const { userId, productId } = req.body;
    try {
      const exists = db.prepare('SELECT id FROM wishlists WHERE user_id = ? AND product_id = ?').get(userId, productId);
      if (exists) {
        db.prepare('DELETE FROM wishlists WHERE user_id = ? AND product_id = ?').run(userId, productId);
        res.json({ success: true, action: 'removed' });
      } else {
        db.prepare('INSERT INTO wishlists (user_id, product_id) VALUES (?, ?)').run(userId, productId);
        res.json({ success: true, action: 'added' });
      }
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to toggle wishlist' });
    }
  });

  // --- USER ORDERS & STATS ---
  app.get('/api/users/:id/orders', (req, res) => {
    const orders = db.prepare(`
      SELECT o.*, 
             (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as item_count
      FROM orders o 
      WHERE o.buyer_id = ? 
      ORDER BY o.created_at DESC
    `).all(req.params.id);
    
    // Fetch items for each order
    const ordersWithItems = orders.map((order: any) => {
      const items = db.prepare(`
        SELECT oi.*, p.name, p.image 
        FROM order_items oi 
        JOIN products p ON oi.product_id = p.id 
        WHERE oi.order_id = ?
      `).all(order.id);
      return { ...order, items };
    });
    
    res.json(ordersWithItems);
  });

  app.get('/api/vendor/:id/stats', (req, res) => {
    const vendorId = req.params.id;
    
    // Total Sales
    const totalSales = db.prepare(`
      SELECT SUM(oi.quantity * oi.price) as total 
      FROM order_items oi 
      JOIN products p ON oi.product_id = p.id 
      WHERE p.vendor_id = ?
    `).get(vendorId) as any;

    // Sales by Product
    const salesByProduct = db.prepare(`
      SELECT p.name, SUM(oi.quantity) as quantity, SUM(oi.quantity * oi.price) as revenue
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE p.vendor_id = ?
      GROUP BY p.id
      ORDER BY revenue DESC
      LIMIT 5
    `).all(vendorId);

    // Recent Orders
    const recentOrders = db.prepare(`
      SELECT DISTINCT o.id, o.created_at, o.status, u.name as buyer_name
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      JOIN products p ON oi.product_id = p.id
      JOIN users u ON o.buyer_id = u.id
      WHERE p.vendor_id = ?
      ORDER BY o.created_at DESC
      LIMIT 10
    `).all(vendorId);

    res.json({
      totalSales: totalSales?.total || 0,
      salesByProduct,
      recentOrders
    });
  });

  app.get('/api/vendor/:id/analytics', (req, res) => {
    const vendorId = req.params.id;
    
    const totalViews = db.prepare('SELECT SUM(views) as total_views FROM products WHERE vendor_id = ?').get(vendorId) as any;
    const totalSales = db.prepare('SELECT SUM(sales) as total_sales FROM products WHERE vendor_id = ?').get(vendorId) as any;
    const topProducts = db.prepare('SELECT name, views, sales FROM products WHERE vendor_id = ? ORDER BY sales DESC, views DESC LIMIT 5').all(vendorId);
    
    res.json({
      totalViews: totalViews?.total_views || 0,
      totalSales: totalSales?.total_sales || 0,
      topProducts
    });
  });

  // --- COMMON ROUTES ---
  app.get('/api/users/:id/notifications', (req, res) => {
    const notifications = db.prepare('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 20').all(req.params.id);
    res.json(notifications);
  });

  app.put('/api/notifications/:id/read', (req, res) => {
    try {
      db.prepare('UPDATE notifications SET is_read = 1 WHERE id = ?').run(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to update notification' });
    }
  });

  app.put('/api/users/:id/notifications/read-all', (req, res) => {
    try {
      db.prepare('UPDATE notifications SET is_read = 1 WHERE user_id = ?').run(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to update notifications' });
    }
  });

  // --- CHAT ROUTES ---
  app.get('/api/chat/conversations/:userId', (req, res) => {
    const userId = req.params.userId;
    const conversations = db.prepare(`
      SELECT DISTINCT 
        CASE WHEN sender_id = ? THEN receiver_id ELSE sender_id END as other_user_id,
        u.name as other_user_name,
        u.avatar as other_user_avatar,
        (SELECT message FROM messages 
         WHERE (sender_id = ? AND receiver_id = u.id) OR (sender_id = u.id AND receiver_id = ?)
         ORDER BY created_at DESC LIMIT 1) as last_message,
        (SELECT created_at FROM messages 
         WHERE (sender_id = ? AND receiver_id = u.id) OR (sender_id = u.id AND receiver_id = ?)
         ORDER BY created_at DESC LIMIT 1) as last_message_at,
        (SELECT COUNT(*) FROM messages 
         WHERE sender_id = u.id AND receiver_id = ? AND is_read = 0) as unread_count
      FROM messages m
      JOIN users u ON (m.sender_id = u.id OR m.receiver_id = u.id)
      WHERE (m.sender_id = ? OR m.receiver_id = ?) AND u.id != ?
      ORDER BY last_message_at DESC
    `).all(userId, userId, userId, userId, userId, userId, userId, userId, userId);
    res.json(conversations);
  });

  app.get('/api/chat/messages/:userId/:otherUserId', (req, res) => {
    const { userId, otherUserId } = req.params;
    
    // Mark messages as read
    db.prepare('UPDATE messages SET is_read = 1 WHERE sender_id = ? AND receiver_id = ?').run(otherUserId, userId);
    
    const messages = db.prepare(`
      SELECT * FROM messages 
      WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)
      ORDER BY created_at ASC
    `).all(userId, otherUserId, otherUserId, userId);
    res.json(messages);
  });

  // --- PROMOTIONS ROUTES ---
  app.get('/api/promotions', (req, res) => {
    const promotions = db.prepare(`
      SELECT pr.*, p.name as product_name, p.price as product_price, p.image as product_image
      FROM promotions pr
      LEFT JOIN products p ON pr.product_id = p.id
      WHERE pr.is_active = 1
      ORDER BY pr.created_at DESC
    `).all();
    res.json(promotions);
  });

  app.get('/api/admin/promotions', (req, res) => {
    const promotions = db.prepare(`
      SELECT pr.*, p.name as product_name
      FROM promotions pr
      LEFT JOIN products p ON pr.product_id = p.id
      ORDER BY pr.created_at DESC
    `).all();
    res.json(promotions);
  });

  app.post('/api/admin/promotions', (req, res) => {
    const { productId, title, subtitle, description, image } = req.body;
    try {
      db.prepare('INSERT INTO promotions (product_id, title, subtitle, description, image) VALUES (?, ?, ?, ?, ?)').run(productId, title, subtitle, description, image);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to add promotion' });
    }
  });

  app.delete('/api/admin/promotions/:id', (req, res) => {
    try {
      db.prepare('DELETE FROM promotions WHERE id = ?').run(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to delete promotion' });
    }
  });

  app.put('/api/admin/promotions/:id/toggle', (req, res) => {
    try {
      db.prepare('UPDATE promotions SET is_active = CASE WHEN is_active = 1 THEN 0 ELSE 1 END WHERE id = ?').run(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to toggle promotion' });
    }
  });

  // --- PRODUCT VIEWS & RECOMMENDATIONS ---
  app.post('/api/products/:id/view', (req, res) => {
    const { userId } = req.body;
    const productId = req.params.id;
    try {
      if (userId) {
        db.prepare('INSERT INTO product_views (user_id, product_id) VALUES (?, ?)').run(userId, productId);
      }
      res.json({ success: true });
    } catch (error) {
      // Ignore errors (e.g., if user spams views, we might just want to log it or ignore)
      res.json({ success: false }); 
    }
  });

  // --- TAGS & ALERTS ---
  app.get('/api/tags', (req, res) => {
    const tags = db.prepare('SELECT * FROM tags ORDER BY name').all();
    res.json(tags);
  });

  app.get('/api/products/:id/tags', (req, res) => {
    const tags = db.prepare(`
      SELECT t.* 
      FROM tags t
      JOIN product_tags pt ON t.id = pt.tag_id
      WHERE pt.product_id = ?
    `).all(req.params.id);
    res.json(tags);
  });

  app.post('/api/products/:id/tags', (req, res) => {
    const { name } = req.body;
    const productId = req.params.id;
    
    try {
      // 1. Ensure tag exists
      db.prepare('INSERT OR IGNORE INTO tags (name) VALUES (?)').run(name.toLowerCase());
      const tag = db.prepare('SELECT id FROM tags WHERE name = ?').get(name.toLowerCase()) as any;
      
      // 2. Link tag to product
      db.prepare('INSERT OR IGNORE INTO product_tags (product_id, tag_id) VALUES (?, ?)').run(productId, tag.id);
      
      res.json({ success: true, tag });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to add tag' });
    }
  });

  app.post('/api/products/:id/stock-alert', (req, res) => {
    const { email, user_id } = req.body;
    const productId = req.params.id;
    
    try {
      db.prepare('INSERT INTO stock_alerts (user_id, product_id, email) VALUES (?, ?, ?)').run(user_id || null, productId, email);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to set stock alert' });
    }
  });

  app.get('/api/recommendations', (req, res) => {
    const { userId, type, productId } = req.query; // type: 'history', 'popular', 'related'
    
    let products = [];

    try {
      // Infer type if not provided
      let queryType = type;
      if (!queryType) {
        if (productId) queryType = 'related';
        else if (userId) queryType = 'history';
        else queryType = 'popular';
      }

      if (queryType === 'history' && userId) {
        // Recently viewed products
        products = db.prepare(`
          SELECT p.*, u.name as vendor_name, u.kyc_status as vendor_kyc_status,
                 IFNULL(AVG(r.rating), 0) as average_rating, 
                 COUNT(r.id) as review_count,
                 MAX(pv.created_at) as last_viewed
          FROM product_views pv
          JOIN products p ON pv.product_id = p.id
          JOIN users u ON p.vendor_id = u.id
          LEFT JOIN reviews r ON p.id = r.product_id
          WHERE pv.user_id = ?
          GROUP BY p.id
          ORDER BY last_viewed DESC
          LIMIT 5
        `).all(userId);
      } else if (queryType === 'related' && productId) {
        // Products in the same category OR sharing tags, excluding the current one
        const currentProduct = db.prepare('SELECT category FROM products WHERE id = ?').get(productId) as any;
        
        if (currentProduct) {
          // Get product tags
          const tags = db.prepare('SELECT tag_id FROM product_tags WHERE product_id = ?').all(productId).map((t: any) => t.tag_id);
          
          let productsByTags: any[] = [];
          if (tags.length > 0) {
             const placeholders = tags.map(() => '?').join(',');
             productsByTags = db.prepare(`
               SELECT p.*, u.name as vendor_name, u.kyc_status as vendor_kyc_status,
                      IFNULL(AVG(r.rating), 0) as average_rating, 
                      COUNT(r.id) as review_count
               FROM products p
               JOIN users u ON p.vendor_id = u.id
               LEFT JOIN reviews r ON p.id = r.product_id
               JOIN product_tags pt ON p.id = pt.product_id
               WHERE pt.tag_id IN (${placeholders}) AND p.id != ?
               GROUP BY p.id
             `).all(...tags, productId);
          }

          const productsByCategory = db.prepare(`
            SELECT p.*, u.name as vendor_name, u.kyc_status as vendor_kyc_status,
                   IFNULL(AVG(r.rating), 0) as average_rating, 
                   COUNT(r.id) as review_count
            FROM products p
            JOIN users u ON p.vendor_id = u.id
            LEFT JOIN reviews r ON p.id = r.product_id
            WHERE p.category = ? AND p.id != ?
            GROUP BY p.id
            ORDER BY RANDOM()
            LIMIT 4
          `).all(currentProduct.category, productId);
          
          // Merge and deduplicate
          const allRelated = [...productsByTags, ...productsByCategory];
          const uniqueMap = new Map();
          allRelated.forEach((p: any) => uniqueMap.set(p.id, p));
          products = Array.from(uniqueMap.values()).slice(0, 8);
        }
      } else {
        // Default: Popular products (most viewed)
        // If no views, just random
        products = db.prepare(`
          SELECT p.*, u.name as vendor_name, u.kyc_status as vendor_kyc_status,
                 IFNULL(AVG(r.rating), 0) as average_rating, 
                 COUNT(r.id) as review_count,
                 COUNT(pv.id) as view_count
          FROM products p
          JOIN users u ON p.vendor_id = u.id
          LEFT JOIN reviews r ON p.id = r.product_id
          LEFT JOIN product_views pv ON p.id = pv.product_id
          GROUP BY p.id
          ORDER BY view_count DESC, average_rating DESC
          LIMIT 8
        `).all();
      }
      
      res.json(products);
    } catch (error) {
      console.error("Recommendation error:", error);
      res.status(500).json({ error: 'Failed to fetch recommendations' });
    }
  });

  // --- Vite Middleware ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  const server = createServer(app);
  const wss = new WebSocketServer({ server });

  const clients = new Map<number, WebSocket>();

  wss.on('connection', (ws) => {
    let currentUserId: number | null = null;

    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString());
        
        if (message.type === 'auth') {
          currentUserId = message.userId;
          if (currentUserId) {
            clients.set(currentUserId, ws);
            console.log(`User ${currentUserId} connected to chat`);
          }
        } else if (message.type === 'chat') {
          const { senderId, receiverId, text } = message;
          
          // Store in DB
          const info = db.prepare('INSERT INTO messages (sender_id, receiver_id, message) VALUES (?, ?, ?)').run(senderId, receiverId, text);
          const newMessage = {
            id: info.lastInsertRowid,
            sender_id: senderId,
            receiver_id: receiverId,
            message: text,
            created_at: new Date().toISOString(),
            is_read: 0
          };

          // Send to receiver if online
          const receiverWs = clients.get(receiverId);
          if (receiverWs && receiverWs.readyState === WebSocket.OPEN) {
            receiverWs.send(JSON.stringify({ type: 'chat', message: newMessage }));
          }

          // Send back to sender for confirmation
          ws.send(JSON.stringify({ type: 'chat_sent', message: newMessage }));
          
          // Notify receiver
          db.prepare('INSERT INTO notifications (user_id, message, type) VALUES (?, ?, ?)').run(
            receiverId,
            `New message from ${db.prepare('SELECT name FROM users WHERE id = ?').get(senderId).name}`,
            'message'
          );
        }
      } catch (err) {
        console.error('WebSocket message error:', err);
      }
    });

    ws.on('close', () => {
      if (currentUserId) {
        clients.delete(currentUserId);
        console.log(`User ${currentUserId} disconnected from chat`);
      }
    });
  });

  server.listen(3000, '0.0.0.0', () => {
    console.log('Server running on port 3000');
  });
}

startServer();

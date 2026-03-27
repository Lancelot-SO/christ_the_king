-- Categories Table
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products Table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  sku TEXT UNIQUE,
  price DECIMAL(10,2) NOT NULL,
  sale_price DECIMAL(10,2),
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  stock_quantity INTEGER DEFAULT 0,
  low_stock_threshold INTEGER DEFAULT 5,
  images JSONB DEFAULT '[]'::jsonb,
  sizes JSONB DEFAULT '[]'::jsonb,
  colors JSONB DEFAULT '[]'::jsonb,
  weight DECIMAL(10,2),
  is_active BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders Table
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number TEXT UNIQUE NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  delivery_address TEXT NOT NULL,
  delivery_notes TEXT,
  items JSONB NOT NULL, -- Array of objects: {product_id, name, price, quantity, size, color}
  subtotal DECIMAL(10,2) NOT NULL,
  delivery_fee DECIMAL(10,2) NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  payment_method TEXT NOT NULL,
  payment_status TEXT DEFAULT 'pending', -- pending, paid, failed, refunded
  payment_reference TEXT,
  order_status TEXT DEFAULT 'pending', -- pending, processing, shipped, delivered, cancelled
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Stock History Table (Audit Trail)
CREATE TABLE stock_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  change_amount INTEGER NOT NULL,
  reason TEXT,
  admin_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Profiles Table (Public User Data)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  email TEXT,
  role TEXT DEFAULT 'Customer', -- Admin, Alumni, Student, Customer
  class_year TEXT,
  orders_count INTEGER DEFAULT 0,
  total_spent DECIMAL(10,2) DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Admin Users Table
-- Note: Using Supabase Auth for users, this table stores extra profile info if needed
CREATE TABLE admin_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'staff', -- superadmin, manager, staff
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Public Policies
CREATE POLICY "Allow public read access to categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Allow public read access to products" ON products FOR SELECT USING (is_active = true);
CREATE POLICY "Allow users to read own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Allow users to insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Allow users to update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Admin Policies (Profiles)
CREATE POLICY "Allow admins to read all profiles" ON profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND is_active = true)
);

-- Admin Policies
-- Note: You would typically check for auth.uid() in the admin_users table
CREATE POLICY "Allow admins full access to everything" ON categories FOR ALL USING (
  EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND is_active = true)
);

-- Site Settings Table
CREATE TABLE site_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default admin notification email
INSERT INTO site_settings (key, value) VALUES ('admin_notification_email', 'fsowah001@gmail.com');

-- Enable RLS
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Admin Policies for Site Settings
CREATE POLICY "Allow admins full access to site_settings" ON site_settings FOR ALL USING (
  EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND is_active = true)
);

-- Allow anyone to read settings (needed for server-side notifications using anon client)
CREATE POLICY "Allow public read access to site_settings" ON site_settings FOR SELECT USING (true);

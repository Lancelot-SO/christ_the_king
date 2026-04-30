-- Ticket Types (e.g. Early Bird, Regular, VIP)
CREATE TABLE IF NOT EXISTS ticket_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  description TEXT,
  total_quantity INTEGER DEFAULT 100,
  sold_quantity INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tickets (Purchased by users)
CREATE TABLE IF NOT EXISTS tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_type_id UUID REFERENCES ticket_types(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  payment_reference TEXT NOT NULL UNIQUE,
  payment_status TEXT DEFAULT 'pending', -- pending, completed, failed
  ticket_code TEXT UNIQUE, -- e.g. CTK-70-XXXX
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE ticket_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;

-- Policies for ticket_types
CREATE POLICY "Allow public read access to ticket_types" ON ticket_types FOR SELECT USING (true);
CREATE POLICY "Allow admins full access to ticket_types" ON ticket_types FOR ALL USING (is_admin());

-- Policies for tickets
CREATE POLICY "Allow admins full access to tickets" ON tickets FOR ALL USING (is_admin());
-- Allow public insert for ticket purchases
CREATE POLICY "Allow public insert to tickets" ON tickets FOR INSERT WITH CHECK (true);
-- Allow users to read their own tickets if logged in
CREATE POLICY "Allow users to read own tickets by email" ON tickets FOR SELECT USING (customer_email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- Insert initial ticket type for the 70th Anniversary Dinner
INSERT INTO ticket_types (name, price, description, total_quantity)
VALUES ('70th Anniversary Fundraising Dinner', 1200.00, 'Admits One', 500)
ON CONFLICT DO NOTHING;

-- Function to increment sold count
CREATE OR REPLACE FUNCTION increment_ticket_sold(type_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE ticket_types
  SET sold_quantity = sold_quantity + 1
  WHERE id = type_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

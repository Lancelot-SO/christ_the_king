-- Year Groups Table
CREATE TABLE year_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  year TEXT UNIQUE NOT NULL, -- e.g. "1998", "2024"
  name TEXT, -- e.g. "Class of '98"
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Dues Schedules Table (Admin defines how much each year group owes)
CREATE TABLE dues_schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  year_group_id UUID REFERENCES year_groups(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  description TEXT, -- e.g. "Annual Alumni Dues 2024"
  due_date DATE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Member Dues (Tracking individual member status)
CREATE TABLE member_dues (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  schedule_id UUID REFERENCES dues_schedules(id) ON DELETE CASCADE,
  total_paid DECIMAL(10,2) DEFAULT 0.00,
  status TEXT DEFAULT 'outstanding', -- outstanding, partial, paid
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(profile_id, schedule_id)
);

-- Dues Payments (Individual transactions)
CREATE TABLE dues_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_dues_id UUID REFERENCES member_dues(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  payment_reference TEXT NOT NULL,
  payment_method TEXT,
  status TEXT DEFAULT 'pending', -- pending, completed, failed
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Update profiles table to include year_group association
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS year_group_id UUID REFERENCES year_groups(id) ON DELETE SET NULL;

-- Enable RLS
ALTER TABLE year_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE dues_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_dues ENABLE ROW LEVEL SECURITY;
ALTER TABLE dues_payments ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Allow public read access to year_groups" ON year_groups FOR SELECT USING (true);
CREATE POLICY "Allow public read access to dues_schedules" ON dues_schedules FOR SELECT USING (is_active = true);
CREATE POLICY "Allow users to read own member_dues" ON member_dues FOR SELECT USING (auth.uid() = profile_id);
CREATE POLICY "Allow users to read own dues_payments" ON dues_payments FOR SELECT USING (
  EXISTS (SELECT 1 FROM member_dues WHERE id = dues_payments.member_dues_id AND profile_id = auth.uid())
);

-- Admin Policies
CREATE POLICY "Allow admins full access to year_groups" ON year_groups FOR ALL USING (
  EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND is_active = true)
);
CREATE POLICY "Allow admins full access to dues_schedules" ON dues_schedules FOR ALL USING (
  EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND is_active = true)
);
CREATE POLICY "Allow admins full access to member_dues" ON member_dues FOR ALL USING (
  EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND is_active = true)
);
CREATE POLICY "Allow admins full access to dues_payments" ON dues_payments FOR ALL USING (
  EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND is_active = true)
);

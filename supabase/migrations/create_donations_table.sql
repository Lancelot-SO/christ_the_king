CREATE TABLE IF NOT EXISTS donations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    reference TEXT UNIQUE NOT NULL,
    donor_name TEXT NOT NULL,
    maiden_name TEXT,
    year_group TEXT,
    email TEXT NOT NULL,
    phone TEXT,
    amount NUMERIC NOT NULL,
    donation_type TEXT NOT NULL,
    honour_of TEXT DEFAULT 'Self',
    honour_of_name TEXT,
    recognition TEXT DEFAULT 'Use my name',
    connection TEXT DEFAULT 'Alumni',
    status TEXT DEFAULT 'completed',
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE donations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access" ON donations
    FOR ALL
    USING (true)
    WITH CHECK (true);

CREATE INDEX idx_donations_type ON donations(donation_type);
CREATE INDEX idx_donations_created_at ON donations(created_at DESC);

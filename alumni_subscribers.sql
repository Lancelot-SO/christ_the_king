-- SQL Migration to create CTKIS Alumni Family subscribers table
CREATE TABLE IF NOT EXISTS public.alumni_subscribers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.alumni_subscribers ENABLE ROW LEVEL SECURITY;

-- Policies
-- Allow anyone to insert (public subscription)
CREATE POLICY "Enable insert for everyone" ON public.alumni_subscribers
    FOR INSERT WITH CHECK (true);

-- Allow admins to read all
CREATE POLICY "Enable read for admins" ON public.alumni_subscribers
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'Admin'
        )
    );

-- Allow admins to delete
CREATE POLICY "Enable delete for admins" ON public.alumni_subscribers
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'Admin'
        )
    );

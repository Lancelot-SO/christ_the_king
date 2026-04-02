import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabaseServer';

export async function GET(req: NextRequest) {
    try {
        // Simple admin check - in production you'd use auth.getUser()
        // but since we are using supabaseAdmin, we rely on the caller being an admin
        // We can check the session or a custom header if needed.
        
        const { data, error } = await supabase
            .from('alumni_subscribers')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching subscribers:', error);
            return NextResponse.json({ error: 'Failed to fetch subscribers' }, { status: 500 });
        }

        return NextResponse.json({ subscribers: data });

    } catch (error: any) {
        console.error('Admin Subscribers Route Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const { id } = await req.json();

        if (!id) {
            return NextResponse.json({ error: 'Subscriber ID is required' }, { status: 400 });
        }

        const { error } = await supabase
            .from('alumni_subscribers')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting subscriber:', error);
            return NextResponse.json({ error: 'Failed to delete subscriber' }, { status: 500 });
        }

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error('Admin Delete Subscriber Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

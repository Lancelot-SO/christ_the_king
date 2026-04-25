import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseServer';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        // 1. Fetch Donations
        const { data: donationsData, error: donationsError } = await supabaseAdmin
            .from('donations')
            .select('id, donor_name, year_group, amount, donation_type, recognition, created_at');

        if (donationsError) {
            console.error('Error fetching donations:', donationsError);
        }

        // 2. Fetch Dues Payments with profile names (bypassing RLS)
        const { data: duesData, error: duesError } = await supabaseAdmin
            .from('dues_payments')
            .select(`
                id,
                amount_paid,
                year_group,
                payment_date,
                profiles:profile_id (
                    name
                )
            `)
            .eq('payment_status', 'paid');

        if (duesError) {
            console.error('Error fetching dues_payments:', duesError);
        }

        let combined: any[] = [];

        if (donationsData) {
            combined = [...donationsData];
        }

        if (duesData) {
            const mappedDues = duesData.map((due: any) => ({
                id: due.id,
                donor_name: due.profiles?.name || 'Alumni Member',
                year_group: due.year_group,
                amount: Number(due.amount_paid || 0),
                donation_type: 'Dues',
                recognition: 'Use my name',
                created_at: due.payment_date || new Date().toISOString()
            }));
            combined = [...combined, ...mappedDues];
        }

        // Sort by date descending
        combined.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

        return NextResponse.json({ success: true, data: combined });
    } catch (error) {
        console.error('Leaderboard API Error:', error);
        return NextResponse.json({ success: false, error: 'Failed to fetch leaderboard data' }, { status: 500 });
    }
}

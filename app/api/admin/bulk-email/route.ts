import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabaseServer';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
    try {
        const { subject, message, isHtml } = await req.json();

        if (!subject || !message) {
            return NextResponse.json({ error: 'Subject and message are required' }, { status: 400 });
        }

        // 1. Fetch all subscribers
        const { data: subscribers, error: dbError } = await supabase
            .from('alumni_subscribers')
            .select('email');

        if (dbError) {
            console.error('Error fetching subscribers for bulk email:', dbError);
            return NextResponse.json({ error: 'Failed to fetch subscribers' }, { status: 500 });
        }

        if (!subscribers || subscribers.length === 0) {
            return NextResponse.json({ error: 'No subscribers to email' }, { status: 400 });
        }

        const emails = subscribers.map(s => s.email);

        // 2. Send emails in batches or bulk
        // Resend supports bulk sending to up to 50 recipients at once
        // For larger lists, we should batch them or use a background job.
        // For now, we'll try to use the bulk send feature.
        
        if (process.env.RESEND_API_KEY) {
            try {
                // Batch size for Resend (conservative)
                const batchSize = 100;
                let sentCount = 0;

                for (let i = 0; i < emails.length; i += batchSize) {
                    const batch = emails.slice(i, i + batchSize);
                    
                    await resend.emails.send({
                        from: 'CTK Alumni <notifications@resend.dev>', // Verified domain in production
                        to: batch,
                        subject: subject,
                        html: isHtml ? message : `<div style="font-family: sans-serif;">${message.replace(/\n/g, '<br/>')}</div>`
                    });
                    
                    sentCount += batch.length;
                }

                return NextResponse.json({ success: true, message: `Successfully sent broadcast to ${sentCount} members.` });

            } catch (emailError: any) {
                console.error('Resend bulk email error:', emailError);
                return NextResponse.json({ error: emailError.message || 'Failed to send emails via Resend' }, { status: 500 });
            }
        } else {
            return NextResponse.json({ error: 'Resend API key is not configured' }, { status: 500 });
        }

    } catch (error: any) {
        console.error('Bulk Email Route Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

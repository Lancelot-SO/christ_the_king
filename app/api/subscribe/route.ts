import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabaseServer';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
    try {
        const { email } = await req.json();

        if (!email || !email.includes('@')) {
            return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
        }

        // 1. Save to database
        const { error: dbError } = await supabase
            .from('alumni_subscribers')
            .insert([{ email }]);

        if (dbError) {
            // Check for unique constraint violation (already subscribed)
            if (dbError.code === '23505') {
                return NextResponse.json({ 
                    success: true, 
                    message: 'You are already part of the family!' 
                });
            }
            console.error('Subscription error:', dbError);
            return NextResponse.json({ error: 'Failed to join. Please try again later.' }, { status: 500 });
        }

        // 2. Send Welcome Email
        if (process.env.RESEND_API_KEY) {
            try {
                await resend.emails.send({
                    from: 'CTK Alumni Family <notifications@resend.dev>', // Use verified domain in production
                    to: email,
                    subject: 'Welcome to the CTKIS Alumni Family! 🎓',
                    html: `
                        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                            <h2 style="color: #7c1936; text-align: center;">Welcome Home!</h2>
                            <p>Hello,</p>
                            <p>Thank you for joining the <strong>CTKIS Alumni Family</strong>. We are thrilled to have you back in our community.</p>
                            <p>By being part of this family, you'll be the first to know about:</p>
                            <ul>
                                <li>Exclusive merchandise drops from the Christ the King collection.</li>
                                <li>Upcoming alumni events and reunions.</li>
                                <li>Impact stories and school updates.</li>
                            </ul>
                            <p>We look forward to reconnecting with you and sharing the "Christ the King Spirit" together.</p>
                            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                                <p style="font-size: 12px; color: #666;">&copy; ${new Date().getFullYear()} Christ the King School. All rights reserved.</p>
                            </div>
                        </div>
                    `
                });
            } catch (emailError) {
                console.error('Failed to send welcome email:', emailError);
                // We don't return error here because the DB insert was successful
            }
        }

        return NextResponse.json({ 
            success: true, 
            message: 'Welcome to the CTKIS Alumni Family!' 
        });

    } catch (error: any) {
        console.error('Subscribe Route Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

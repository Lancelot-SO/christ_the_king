import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabaseServer';
import { transporter } from '@/lib/email';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const {
            customer_name,
            customer_email,
            customer_phone,
            payment_reference,
            event_title,
            price,
            ticket_code
        } = body;

        // 1. Get ticket type ID
        const { data: typeData } = await supabase
            .from('ticket_types')
            .select('id')
            .eq('name', event_title)
            .single();

        // 2. Save ticket to database
        const { error: dbError } = await supabase
            .from('tickets')
            .insert([{
                ticket_type_id: typeData?.id,
                customer_name,
                customer_email,
                customer_phone,
                payment_reference,
                payment_status: 'success',
                ticket_code
            }]);

        if (dbError) {
            console.error('Ticket record failed:', dbError);
            return NextResponse.json({ error: 'Failed to save ticket record.' }, { status: 500 });
        }

        // 3. Update sold quantity
        if (typeData?.id) {
            await supabase.rpc('increment_ticket_sold', { type_id: typeData.id });
        }

        // 4. Send confirmation email to the customer
        if (process.env.EMAIL_USER && process.env.EMAIL_APP_PASSWORD && customer_email) {
            try {
                await transporter.sendMail({
                    from: `"Christ The King" <${process.env.EMAIL_USER}>`,
                    to: customer_email,
                    subject: `Your Ticket for ${event_title} — Christ The King`,
                    html: `
                        <div style="font-family: 'Georgia', serif; max-width: 600px; margin: 0 auto; background: #fefefe; border: 1px solid #eee; border-radius: 12px; overflow: hidden;">
                            <div style="background: #7C1936; padding: 40px 30px; text-align: center;">
                                <h1 style="color: #D4AF37; margin: 0; font-size: 24px; letter-spacing: 0.05em;">CHRIST THE KING</h1>
                                <p style="color: rgba(255,255,255,0.7); font-size: 12px; margin-top: 8px; letter-spacing: 0.2em;">INTERNATIONAL SCHOOL</p>
                            </div>
                            
                            <div style="padding: 40px 30px;">
                                <h2 style="color: #7C1936; margin-top: 0;">Thank You, ${customer_name}!</h2>
                                <p style="color: #555; line-height: 1.8; font-size: 15px;">
                                    Your payment has been received and your ticket is confirmed.
                                </p>
                                
                                <div style="background: #f9f9f9; padding: 30px; border-radius: 16px; margin: 25px 0; border: 2px dashed #D4AF37; text-align: center;">
                                    <span style="color: #999; font-size: 12px; font-weight: bold; letter-spacing: 0.1em; display: block; margin-bottom: 8px;">TICKET CODE</span>
                                    <h3 style="color: #D4AF37; font-size: 32px; margin: 0; letter-spacing: 0.1em; font-family: sans-serif;">${ticket_code}</h3>
                                </div>

                                <table style="width: 100%; border-collapse: collapse; margin: 25px 0;">
                                    <tr style="border-bottom: 1px solid #eee;">
                                        <td style="padding: 12px 0; color: #999; font-size: 12px; font-weight: bold; letter-spacing: 0.1em;">EVENT</td>
                                        <td style="padding: 12px 0; text-align: right; font-weight: 600; color: #333;">${event_title}</td>
                                    </tr>
                                    <tr style="border-bottom: 1px solid #eee;">
                                        <td style="padding: 12px 0; color: #999; font-size: 12px; font-weight: bold; letter-spacing: 0.1em;">AMOUNT PAID</td>
                                        <td style="padding: 12px 0; text-align: right; font-weight: 700; color: #7C1936; font-size: 18px;">GH₵ ${Number(price).toLocaleString()}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 12px 0; color: #999; font-size: 12px; font-weight: bold; letter-spacing: 0.1em;">PAYMENT REF</td>
                                        <td style="padding: 12px 0; text-align: right; font-weight: 600; color: #333; font-size: 11px;">${payment_reference}</td>
                                    </tr>
                                </table>

                                <p style="color: #555; line-height: 1.8; font-size: 15px;">
                                    Please keep this ticket code ready at the entrance. We look forward to seeing you there!
                                </p>
                            </div>
                            
                            <div style="background: #f9f9f9; padding: 25px 30px; text-align: center; border-top: 1px solid #eee;">
                                <p style="color: #999; font-size: 12px; margin: 0;">
                                    Christ The King International School &bull; 70th Anniversary Celebration
                                </p>
                            </div>
                        </div>
                    `
                });
            } catch (emailError) {
                console.error('Failed to send ticket confirmation email:', emailError);
            }
        }

        // 5. Notify admin about the new ticket purchase
        if (process.env.EMAIL_USER && process.env.EMAIL_APP_PASSWORD) {
            try {
                const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
                await transporter.sendMail({
                    from: `"Christ The King" <${process.env.EMAIL_USER}>`,
                    to: adminEmail,
                    subject: `New Ticket Purchase: ${event_title} — ${customer_name}`,
                    html: `
                        <h2>New Ticket Purchase Received</h2>
                        <p><strong>Attendee:</strong> ${customer_name} (${customer_email})</p>
                        <p><strong>Event:</strong> ${event_title}</p>
                        <p><strong>Amount:</strong> GH₵ ${Number(price).toLocaleString()}</p>
                        <p><strong>Ticket Code:</strong> ${ticket_code}</p>
                        <p><strong>Payment Reference:</strong> ${payment_reference}</p>
                        <br/>
                        <p><a href="${process.env.NEXT_PUBLIC_SITE_URL || ''}/admin/dashboard/tickets"><strong>View in Admin Panel</strong></a></p>
                    `
                });
            } catch (adminEmailError) {
                console.error('Failed to send admin notification:', adminEmailError);
            }
        }

        return NextResponse.json({ success: true, message: 'Ticket recorded and emails sent successfully' });

    } catch (error: any) {
        console.error('Ticket Processing Error:', error);
        return NextResponse.json({ error: error.message || 'Processing failed' }, { status: 500 });
    }
}

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabaseServer';
import { transporter } from '@/lib/email';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const {
            reference,
            name,
            maidenName,
            yearGroup,
            email,
            phone,
            amount,
            tier,
            honourOf,
            honourOfName,
            recognition,
            connection,
        } = body;

        // 1. Record donation in the database
        const { data: insertData, error: dbError } = await supabase
            .from('donations')
            .insert([{
                reference,
                donor_name: name,
                maiden_name: maidenName || null,
                year_group: yearGroup || null,
                email,
                phone: phone || null,
                amount,
                donation_type: tier,
                honour_of: honourOf || 'Self',
                honour_of_name: honourOfName || null,
                recognition: recognition || 'Use my name',
                connection: connection || 'Alumni',
                status: 'completed',
            }])
            .select('id')
            .single();

        if (dbError) {
            console.error('Donation record failed:', dbError);
            return NextResponse.json({ error: 'Failed to save donation record.' }, { status: 500 });
        }

        const donationId = insertData?.id;
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
        const receiptUrl = `${siteUrl}/receipt/${donationId}`;

        // 2. Send confirmation email to the donor
        if (process.env.EMAIL_USER && process.env.EMAIL_APP_PASSWORD && email) {
            try {
                await transporter.sendMail({
                    from: `"Christ The King" <${process.env.EMAIL_USER}>`,
                    to: email,
                    subject: `Thank You for Your ${tier} Donation — Christ The King`,
                    html: `
                        <div style="font-family: 'Georgia', serif; max-width: 600px; margin: 0 auto; background: #fefefe; border: 1px solid #eee; border-radius: 12px; overflow: hidden;">
                            <div style="background: #7C1936; padding: 40px 30px; text-align: center;">
                                <h1 style="color: #D4AF37; margin: 0; font-size: 24px; letter-spacing: 0.05em;">CHRIST THE KING</h1>
                                <p style="color: rgba(255,255,255,0.7); font-size: 12px; margin-top: 8px; letter-spacing: 0.2em;">INTERNATIONAL SCHOOL</p>
                            </div>
                            
                            <div style="padding: 40px 30px;">
                                <h2 style="color: #7C1936; margin-top: 0;">Thank You, ${name}!</h2>
                                <p style="color: #555; line-height: 1.8; font-size: 15px;">
                                    Your generous contribution has been received. Here are the details of your donation:
                                </p>
                                
                                <table style="width: 100%; border-collapse: collapse; margin: 25px 0;">
                                    <tr style="border-bottom: 1px solid #eee;">
                                        <td style="padding: 12px 0; color: #999; font-size: 12px; font-weight: bold; letter-spacing: 0.1em;">DONATION TYPE</td>
                                        <td style="padding: 12px 0; text-align: right; font-weight: 600; color: #333;">${tier}</td>
                                    </tr>
                                    <tr style="border-bottom: 1px solid #eee;">
                                        <td style="padding: 12px 0; color: #999; font-size: 12px; font-weight: bold; letter-spacing: 0.1em;">AMOUNT</td>
                                        <td style="padding: 12px 0; text-align: right; font-weight: 700; color: #7C1936; font-size: 18px;">GH₵ ${Number(amount).toLocaleString()}</td>
                                    </tr>
                                    <tr style="border-bottom: 1px solid #eee;">
                                        <td style="padding: 12px 0; color: #999; font-size: 12px; font-weight: bold; letter-spacing: 0.1em;">IN HONOUR OF</td>
                                        <td style="padding: 12px 0; text-align: right; font-weight: 600; color: #333;">${honourOf}${honourOfName ? ` — ${honourOfName}` : ''}</td>
                                    </tr>
                                    <tr style="border-bottom: 1px solid #eee;">
                                        <td style="padding: 12px 0; color: #999; font-size: 12px; font-weight: bold; letter-spacing: 0.1em;">CONNECTION</td>
                                        <td style="padding: 12px 0; text-align: right; font-weight: 600; color: #333;">${connection}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 12px 0; color: #999; font-size: 12px; font-weight: bold; letter-spacing: 0.1em;">REFERENCE</td>
                                        <td style="padding: 12px 0; text-align: right; font-weight: 600; color: #333; font-size: 11px;">${reference}</td>
                                    </tr>
                                </table>

                                <div style="text-align: center; margin: 35px 0;">
                                    <a href="${receiptUrl}" style="background-color: #D4AF37; color: #fff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: bold; font-family: sans-serif; letter-spacing: 0.05em; display: inline-block; font-size: 14px;">VIEW DONATION RECEIPT</a>
                                </div>

                                <p style="color: #555; line-height: 1.8; font-size: 15px;">
                                    Your support is making a direct impact on the future of CTKIS students. We are deeply grateful.
                                </p>
                            </div>
                            
                            <div style="background: #f9f9f9; padding: 25px 30px; text-align: center; border-top: 1px solid #eee;">
                                <p style="color: #999; font-size: 12px; margin: 0;">
                                    Christ The King International School &bull; Building the Future Together
                                </p>
                            </div>
                        </div>
                    `
                });
            } catch (emailError) {
                console.error('Failed to send donation confirmation email:', emailError);
                // Don't fail the request if email fails — donation is already recorded
            }
        }

        // 3. Notify admin about the new donation
        if (process.env.EMAIL_USER && process.env.EMAIL_APP_PASSWORD) {
            try {
                const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
                await transporter.sendMail({
                    from: `"Christ The King" <${process.env.EMAIL_USER}>`,
                    to: adminEmail,
                    subject: `New ${tier} Donation: GH₵${Number(amount).toLocaleString()} from ${name}`,
                    html: `
                        <h2>New Donation Received</h2>
                        <p><strong>Donor:</strong> ${name} (${email})</p>
                        <p><strong>Type:</strong> ${tier}</p>
                        <p><strong>Amount:</strong> GH₵ ${Number(amount).toLocaleString()}</p>
                        <p><strong>Connection:</strong> ${connection}</p>
                        <p><strong>Reference:</strong> ${reference}</p>
                        <br/>
                        <p><a href="${receiptUrl}"><strong>View Guest Receipt Portal Link</strong></a></p>
                    `
                });
            } catch (adminEmailError) {
                console.error('Failed to send admin notification:', adminEmailError);
            }
        }

        return NextResponse.json({ success: true, message: 'Donation recorded successfully', receiptUrl });

    } catch (error: any) {
        console.error('Donation Processing Error:', error);
        return NextResponse.json({ error: error.message || 'Processing failed' }, { status: 500 });
    }
}

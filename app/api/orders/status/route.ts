import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabaseServer';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function PATCH(req: NextRequest) {
    try {
        const { orderId, status } = await req.json();

        if (!orderId || !status) {
            return NextResponse.json({ error: 'Missing orderId or status' }, { status: 400 });
        }

        // 1. Update the order in the database
        const { data: updatedOrder, error: updateError } = await supabase
            .from('orders')
            .update({ 
                order_status: status,
                updated_at: new Date().toISOString()
            })
            .eq('id', orderId)
            .select()
            .single();

        if (updateError) {
            console.error('Update Error:', updateError);
            return NextResponse.json({ error: 'Failed to update order status' }, { status: 500 });
        }

        // 2. Prepare and send email notification
        try {
            const { customer_name, customer_email, order_number } = updatedOrder;
            
            let subject = '';
            let message = '';

            switch (status) {
                case 'shipped':
                    subject = `Your Order #${order_number} has been shipped!`;
                    message = `Hi ${customer_name}, your order is on its way. Use your order number ${order_number} for any tracking inquiries.`;
                    break;
                case 'delivered':
                    subject = `Your Order #${order_number} has been delivered`;
                    message = `Hi ${customer_name}, your order #${order_number} has been marked as delivered. We hope you enjoy your purchase!`;
                    break;
                case 'cancelled':
                    subject = `Update on Order #${order_number}`;
                    message = `Hi ${customer_name}, your order #${order_number} has been cancelled. If you have any questions, please contact support.`;
                    break;
                default:
                    // For "processing" or other statuses, we might not send an email here 
                    // since the creation email usually covers the initial state.
                    break;
            }

            if (subject && message) {
                await resend.emails.send({
                    from: 'Christ The King <onboarding@resend.dev>', // Replace with verified domain in prod
                    to: customer_email,
                    subject: subject,
                    html: `
                        <div style="font-family: sans-serif; padding: 20px; color: #333;">
                            <h2 style="color: #000;">Christ The King School Store</h2>
                            <p>${message}</p>
                            <p style="margin-top: 30px;">Best regards,<br/>The Christ The King Team</p>
                        </div>
                    `
                });
            }
        } catch (emailError) {
            console.error('Email Notification Error:', emailError);
            // We don't fail the request if the email fails, as the DB update was successful.
        }

        return NextResponse.json({ success: true, order: updatedOrder });

    } catch (error: any) {
        console.error('Status Update Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}

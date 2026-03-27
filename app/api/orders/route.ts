import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { Resend } from 'resend';

// Initialise Resend with API key from environment
const resend = new Resend(process.env.RESEND_API_KEY);
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@example.com'; // Fallback admin email
const LOW_STOCK_THRESHOLD = 10;

export async function POST(req: NextRequest) {
    try {
        const orderData = await req.json();
        const { items } = orderData;

        if (!items || !Array.isArray(items)) {
            return NextResponse.json({ error: 'Invalid items in order' }, { status: 400 });
        }

        // 1. Process Stock Reduction for each item
        // We do this first to ensure stock is available before creating the order record
        const lowStockNotifications = [];

        for (const item of items) {
            // Call the RPC function to decrement stock atomically
            // This function should be created in Supabase (SQL provided in instructions)
            const { data: newStock, error: stockError } = await supabase
                .rpc('decrement_stock_and_get_balance', {
                    p_product_id: item.product_id,
                    p_quantity: item.quantity
                });

            if (stockError) {
                console.error(`Stock reduction failed for product ${item.product_id}:`, stockError);
                // Return a more descriptive error if it's likely a missing RPC function or DB error
                const errorMessage = stockError.code === 'PGRST202' 
                    ? `Database function not found. Please ensure you have run the SQL script provided in the walkthrough.`
                    : `Stock reduction failed for ${item.name}: ${stockError.message || 'Check stock levels.'}`;
                
                return NextResponse.json({ 
                    error: errorMessage
                }, { status: 400 });
            }

            // Check if we need to notify admin about low stock
            // We notify if it just crossed the threshold or is exactly at the threshold
            if (newStock <= LOW_STOCK_THRESHOLD) {
                lowStockNotifications.push({
                    name: item.name,
                    stock: newStock
                });
            }
        }

        // 2. Create the Order in the database
        const { error: orderError } = await supabase
            .from('orders')
            .insert([orderData]);

        if (orderError) {
            console.error('Order creation failed:', orderError);
            // NOTE: In a production environment, you might want to reverse the stock reduction here
            // or use a database transaction if Supabase supports it across RPC and Insert.
            return NextResponse.json({ error: 'Failed to save order record.' }, { status: 500 });
        }

        // 3. Send Notifications (Low Stock or Out of Stock)
        if (lowStockNotifications.length > 0 && process.env.RESEND_API_KEY) {
            try {
                // Fetch admin email from settings table, fallback to env or default
                const { data: settingsData } = await supabase
                    .from('site_settings')
                    .select('value')
                    .eq('key', 'admin_notification_email')
                    .single();
                
                const recipientEmail = settingsData?.value || process.env.ADMIN_EMAIL || 'admin@example.com';

                const outOfStockItems = lowStockNotifications.filter(item => item.stock === 0);
                const itemsLowStock = lowStockNotifications.filter(item => item.stock > 0);
                
                let subject = '⚠️ Stock Alert - AOO Ecommerce';
                if (outOfStockItems.length > 0 && itemsLowStock.length === 0) {
                    subject = '🚫 Out of Stock Alert - AOO Ecommerce';
                } else if (outOfStockItems.length > 0) {
                    subject = '⚠️ Stock Alert: Some items Sold Out - AOO Ecommerce';
                } else {
                    subject = '⚠️ Low Stock Alert - AOO Ecommerce';
                }

                await resend.emails.send({
                    from: 'aoo-ecommerce <notifications@resend.dev>',
                    to: recipientEmail,
                    subject: subject,
                    html: `
                        <h2>Inventory Notification</h2>
                        <p>The following items need attention after a recent order:</p>
                        
                        ${outOfStockItems.length > 0 ? `
                            <h3 style="color: #dc2626;">🚫 Out of Stock (0 remaining)</h3>
                            <ul>
                                ${outOfStockItems.map(item => `<li><strong>${item.name}</strong> is now sold out.</li>`).join('')}
                            </ul>
                        ` : ''}

                        ${itemsLowStock.length > 0 ? `
                            <h3 style="color: #d97706;">⚠️ Low on Stock (10 or less)</h3>
                            <p>The following items are running low and you should <strong>stock up</strong> soon:</p>
                            <ul>
                                ${itemsLowStock.map(item => `<li><strong>${item.name}</strong>: Only ${item.stock} left.</li>`).join('')}
                            </ul>
                        ` : ''}

                        <p>Please restock as soon as possible to avoid lost sales.</p>
                        <a href="${process.env.NEXT_PUBLIC_SITE_URL || ''}/admin/products" style="display:inline-block;padding:12px 24px;background:#000;color:#fff;text-decoration:none;border-radius:5px;font-weight:bold;margin-top:10px;">Manage Inventory</a>
                    `
                });
            } catch (emailError) {
                console.error('Failed to send stock notification email:', emailError);
            }
        }

        return NextResponse.json({ success: true, message: 'Order processed successfully' });

    } catch (error: any) {
        console.error('Order Processing Error:', error);
        return NextResponse.json({ error: error.message || 'Processing failed' }, { status: 500 });
    }
}

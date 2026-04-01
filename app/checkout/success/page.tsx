"use client";

import { useEffect, useState, Suspense } from "react";
import Header from "@/components/Header";
import { CheckCircle, Download, ArrowRight, Loader2, Mail, Phone, MapPin } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import styles from "./success.module.css";

function SuccessContent() {
    const searchParams = useSearchParams();
    const orderNumber = searchParams.get('order');
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (orderNumber) {
            fetchOrder();
        }
    }, [orderNumber]);

    const fetchOrder = async () => {
        try {
            const { data, error } = await supabase
                .from('orders')
                .select('*')
                .eq('order_number', orderNumber)
                .single();

            if (error) throw error;
            setOrder(data);
        } catch (error) {
            console.error('Error fetching order:', error);
        } finally {
            setLoading(false);
        }
    };

    const downloadInvoice = () => {
        if (!order) return;

        const doc = new jsPDF();
        
        // Add Header / Logo Workspace
        doc.setFontSize(22);
        doc.setTextColor(17, 24, 39); // Gray-900
        doc.text("CHRIST THE KING", 14, 20);
        
        doc.setFontSize(10);
        doc.setTextColor(107, 114, 128); // Gray-500
        doc.text("Official Christ The King School Store", 14, 26);
        doc.text("Accra, Ghana", 14, 31);
        doc.text("support@aosa.store", 14, 36);

        // Invoice Header Details
        doc.setFontSize(12);
        doc.setTextColor(17, 24, 39);
        doc.text("INVOICE", 140, 20);
        
        doc.setFontSize(10);
        doc.text(`Order #: ${order.order_number}`, 140, 26);
        doc.text(`Date: ${new Date(order.created_at).toLocaleDateString()}`, 140, 31);
        doc.text(`Status: ${order.payment_status.toUpperCase()}`, 140, 36);

        // Customer Details
        doc.setFontSize(11);
        doc.text("BILL TO:", 14, 55);
        doc.setFontSize(10);
        doc.text(order.customer_name, 14, 61);
        doc.text(order.customer_email, 14, 66);
        doc.text(order.customer_phone, 14, 71);
        doc.text(order.delivery_address, 14, 76, { maxWidth: 80 });

        // Items Table
        const tableData = order.items.map((item: any) => [
            item.name + (item.size ? ` (${item.size})` : ""),
            `GHS ${item.price.toLocaleString()}`,
            item.quantity,
            `GHS ${(item.price * item.quantity).toLocaleString()}`
        ]);

        autoTable(doc, {
            startY: 90,
            head: [['Description', 'Price', 'Qty', 'Total']],
            body: tableData,
            theme: 'striped',
            headStyles: { fillColor: [17, 24, 39] },
        });

        // Totals
        const finalY = (doc as any).lastAutoTable.finalY + 10;
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text("Subtotal:", 130, finalY);
        doc.text(`GHS ${order.subtotal.toLocaleString()}`, 195, finalY, { align: 'right' });
        
        doc.text("Delivery Fee:", 130, finalY + 6);
        doc.text(`GHS ${order.delivery_fee.toLocaleString()}`, 195, finalY + 6, { align: 'right' });
        
        // Add a small line before total
        doc.setDrawColor(229, 231, 235);
        doc.line(130, finalY + 9, 195, finalY + 9);

        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("Total Amount:", 130, finalY + 17);
        doc.text(`GHS ${order.total.toLocaleString()}`, 195, finalY + 17, { align: 'right' });

        // Footer
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(107, 114, 128);
        doc.text(`Payment Reference: ${order.payment_reference || 'N/A'}`, 14, finalY + 35);
        doc.text("Thank you for choosing Christ The King!", 14, finalY + 45);

        doc.save(`Invoice-${order.order_number}.pdf`);
    };

    if (loading && !order) {
        return (
            <div className={styles.loadingWrapper}>
                <Loader2 className={styles.spin} size={40} />
                <p>Confirming your order details...</p>
            </div>
        );
    }

    if (!order && !loading) {
        return (
            <div className={styles.successCard}>
                <h1>Order Not Found</h1>
                <p>We couldn't retrieve your order details. If you just paid, please wait a moment and refresh.</p>
                <Link href="/catalog" className={styles.continueBtn}>
                    Back to Shop
                </Link>
            </div>
        );
    }

    return (
        <div className={styles.successCard}>
            <div className={styles.iconWrapper}>
                <CheckCircle size={64} color="#10b981" />
            </div>
            <h1>Order Confirmed!</h1>
            <p className={styles.orderNumber}>Order #{orderNumber || "CK-ORDER"}</p>
            <p className={styles.message}>
                Thank you for your purchase, {order?.customer_name || 'Customer'}. We've sent a confirmation email with your order details.
            </p>

            <div className={styles.details}>
                <div className={styles.detailRow}>
                    <span>Order Date</span>
                    <strong>{order?.created_at ? new Date(order.created_at).toLocaleDateString() : 'Today'}</strong>
                </div>
                <div className={styles.detailRow}>
                    <span>Total Amount</span>
                    <strong>GH₵ {Number(order?.total || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong>
                </div>
            </div>

            <div className={styles.actions}>
                <button className={styles.downloadBtn} onClick={downloadInvoice} disabled={!order}>
                    <Download size={20} /> Download Invoice
                </button>
                <Link href="/catalog" className={styles.continueBtn}>
                    Continue Shopping <ArrowRight size={20} />
                </Link>
            </div>
        </div>
    );
}

export default function SuccessPage() {
    return (
        <main>
            <Header />
            <div className="container" style={{ paddingTop: '150px', textAlign: 'center' }}>
                <Suspense fallback={<div>Loading confirmation...</div>}>
                    <SuccessContent />
                </Suspense>
            </div>
        </main>
    );
}


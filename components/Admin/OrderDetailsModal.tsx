import { X, Package, User, Mail, Phone, MapPin, Calendar, CreditCard, ShoppingBag, Truck, Check, AlertCircle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./OrderDetailsModal.module.css";
import { useState } from "react";

interface OrderItem {
    product_id: string;
    name: string;
    price: number;
    quantity: number;
    size?: string;
    color?: string;
}

interface Order {
    id: string;
    order_number: string;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    delivery_address: string;
    delivery_notes?: string;
    items: OrderItem[];
    subtotal: number;
    delivery_fee: number;
    total: number;
    payment_method: string;
    payment_status: string;
    order_status: string;
    created_at: string;
}

interface OrderDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    order: Order | null;
    onUpdateStatus?: (orderId: string, status: string) => Promise<void>;
}

export default function OrderDetailsModal({ isOpen, onClose, order, onUpdateStatus }: OrderDetailsModalProps) {
    const [updating, setUpdating] = useState<string | null>(null);

    if (!order) return null;

    const handleStatusUpdate = async (newStatus: string) => {
        if (!onUpdateStatus || !order) return;
        setUpdating(newStatus);
        try {
            await onUpdateStatus(order.id, newStatus);
        } catch (error) {
            console.error("Failed to update status:", error);
        } finally {
            setUpdating(null);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusClass = (status: string) => {
        switch (status.toLowerCase()) {
            case 'paid': return styles.statusPaid;
            case 'shipped': return styles.statusShipped;
            case 'processing': return styles.statusProcessing;
            case 'delivered': return styles.statusDelivered;
            case 'cancelled': return styles.statusCancelled;
            default: return styles.statusPending;
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className={styles.overlay} onClick={onClose}>
                    <motion.div
                        className={styles.drawer}
                        initial={{ opacity: 0, x: 100 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 100 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <header className={styles.header}>
                            <div className={styles.headerInfo}>
                                <h2>Order Details</h2>
                                <span className={styles.orderNumber}>#{order.order_number}</span>
                            </div>
                            <button onClick={onClose} className={styles.closeBtn}>
                                <X size={20} />
                            </button>
                        </header>

                        <div className={styles.content}>
                            {/* Order Status & Date */}
                            <div className={styles.statusSection}>
                                <div className={styles.statusGroup}>
                                    <span className={styles.label}>Order Status</span>
                                    <span className={`${styles.statusBadge} ${getStatusClass(order.order_status)}`}>
                                        {order.order_status.toUpperCase()}
                                    </span>
                                </div>
                                <div className={styles.statusGroup}>
                                    <span className={styles.label}>Payment Status</span>
                                    <span className={`${styles.statusBadge} ${getStatusClass(order.payment_status)}`}>
                                        {order.payment_status.toUpperCase()}
                                    </span>
                                </div>
                                <div className={styles.dateGroup}>
                                    <Calendar size={14} />
                                    <span>{formatDate(order.created_at)}</span>
                                </div>
                            </div>

                            {/* Status Update Actions */}
                            {onUpdateStatus && order.order_status !== 'delivered' && order.order_status !== 'cancelled' && (
                                <div className={styles.statusUpdateArea}>
                                    <h3 className={styles.sectionTitle} style={{ marginBottom: '0.5rem' }}>Update Order Status</h3>
                                    <p className={styles.infoValue} style={{ fontSize: '0.8125rem', color: '#6b7280', fontWeight: 400 }}>
                                        Move this order to the next stage of fulfillment.
                                    </p>
                                    <div className={styles.statusButtons}>
                                        {order.order_status === 'processing' && (
                                            <button 
                                                className={`${styles.statusBtn} ${styles.shipBtn}`}
                                                onClick={() => handleStatusUpdate('shipped')}
                                                disabled={!!updating}
                                            >
                                                {updating === 'shipped' ? <Loader2 size={16} className={styles.spinner} /> : <Truck size={16} />}
                                                Mark as Shipped
                                            </button>
                                        )}
                                        {(order.order_status === 'processing' || order.order_status === 'shipped') && (
                                            <button 
                                                className={`${styles.statusBtn} ${styles.deliverBtn}`}
                                                onClick={() => handleStatusUpdate('delivered')}
                                                disabled={!!updating}
                                            >
                                                {updating === 'delivered' ? <Loader2 size={16} className={styles.spinner} /> : <Check size={16} />}
                                                Mark as Delivered
                                            </button>
                                        )}
                                        <button 
                                            className={`${styles.statusBtn} ${styles.cancelBtn}`}
                                            onClick={() => {
                                                if (confirm('Are you sure you want to cancel this order?')) {
                                                    handleStatusUpdate('cancelled');
                                                }
                                            }}
                                            disabled={!!updating}
                                        >
                                            {updating === 'cancelled' ? <Loader2 size={16} className={styles.spinner} /> : <AlertCircle size={16} />}
                                            Cancel Order
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Customer Information */}
                            <div className={styles.section}>
                                <h3 className={styles.sectionTitle}><User size={18} /> Customer Information</h3>
                                <div className={styles.customerCard}>
                                    <div className={styles.infoRow}>
                                        <span className={styles.infoLabel}>Name</span>
                                        <span className={styles.infoValue}>{order.customer_name}</span>
                                    </div>
                                    <div className={styles.infoRow}>
                                        <Mail size={14} />
                                        <span className={styles.infoValue}>{order.customer_email}</span>
                                    </div>
                                    <div className={styles.infoRow}>
                                        <Phone size={14} />
                                        <span className={styles.infoValue}>{order.customer_phone}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Shipping Information */}
                            <div className={styles.section}>
                                <h3 className={styles.sectionTitle}><Truck size={18} /> Shipping Details</h3>
                                <div className={styles.shippingCard}>
                                    <div className={styles.infoRow}>
                                        <MapPin size={18} />
                                        <span className={styles.infoValue}>{order.delivery_address}</span>
                                    </div>
                                    {order.delivery_notes && (
                                        <div className={styles.notesBox}>
                                            <span className={styles.notesLabel}>Notes:</span>
                                            <p>{order.delivery_notes}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Order Items */}
                            <div className={styles.section}>
                                <h3 className={styles.sectionTitle}><ShoppingBag size={18} /> Ordered Items</h3>
                                <div className={styles.itemsList}>
                                    {order.items.map((item, idx) => (
                                        <div key={idx} className={styles.itemCard}>
                                            <div className={styles.itemIcon}>
                                                <Package size={20} />
                                            </div>
                                            <div className={styles.itemInfo}>
                                                <h4>{item.name}</h4>
                                                <p>
                                                    {item.size && <span>Size: {item.size}</span>}
                                                    {item.color && <span> | Color: {item.color}</span>}
                                                </p>
                                            </div>
                                            <div className={styles.itemPricing}>
                                                <span className={styles.itemQty}>x{item.quantity}</span>
                                                <span className={styles.itemPrice}>GHS {(item.price * item.quantity).toLocaleString()}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Payment Summary */}
                            <div className={styles.section}>
                                <h3 className={styles.sectionTitle}><CreditCard size={18} /> Payment Summary</h3>
                                <div className={styles.summaryCard}>
                                    <div className={styles.summaryRow}>
                                        <span>Subtotal</span>
                                        <span>GHS {order.subtotal.toLocaleString()}</span>
                                    </div>
                                    <div className={styles.summaryRow}>
                                        <span>Delivery Fee</span>
                                        <span>GHS {order.delivery_fee.toLocaleString()}</span>
                                    </div>
                                    <div className={`${styles.summaryRow} ${styles.totalRow}`}>
                                        <span>Total</span>
                                        <span>GHS {order.total.toLocaleString()}</span>
                                    </div>
                                    <div className={styles.paymentMethod}>
                                        <span>Paid via:</span>
                                        <span className={styles.methodBadge}>{order.payment_method.toUpperCase()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <footer className={styles.footer}>
                            <button onClick={onClose} className={styles.closeActionBtn}>
                                Close
                            </button>
                        </footer>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

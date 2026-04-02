"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
    ShoppingBag,
    Search,
    Filter,
    Download,
    ChevronRight,
    Eye,
    Calendar,
    ArrowUpRight,
    Loader2,
    AlertCircle,
    RefreshCw,
    Clock
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { exportToExcel, exportToPDF } from "@/lib/exportUtils";
import OrderDetailsModal from "@/components/Admin/OrderDetailsModal";
import styles from "./orders.module.css";

interface OrderItem {
    product_id: string;
    name: string;
    price: number;
    quantity: number;
    size?: string;
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


export default function OrdersPage() {
    const [activeTab, setActiveTab] = useState("All Orders");
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [recentUpdate, setRecentUpdate] = useState<string | null>(null);
    const [page, setPage] = useState(0);
    const pageRef = useRef(0);
    const [hasMore, setHasMore] = useState(true);
    const PAGE_SIZE = 20;

    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);


    // Fetch orders
    const fetchOrders = useCallback(async (isLoadMore = false) => {
        try {
            if (!isLoadMore) {
                setLoading(true);
                setPage(0);
                pageRef.current = 0;
            }
            setError(null);

            const currentPage = isLoadMore ? pageRef.current + 1 : 0;
            const start = currentPage * PAGE_SIZE;
            const end = start + PAGE_SIZE - 1;

            const { data, error: fetchError } = await supabase
                .from('orders')
                .select('*')
                .order('created_at', { ascending: false })
                .range(start, end);

            if (fetchError) throw fetchError;

            if (data) {
                if (isLoadMore) {
                    setOrders(prev => [...prev, ...data]);
                    setPage(currentPage);
                    pageRef.current = currentPage;
                } else {
                    setOrders(data);
                }
                setHasMore(data.length === PAGE_SIZE);
            }
        } catch (err: any) {
            console.error('Error fetching orders:', err);
            setError(err.message || 'Failed to fetch orders');
        } finally {
            setLoading(false);
        }
    }, []);

    // Setup real-time subscription
    useEffect(() => {
        // Only fetch on mount
        const initialFetch = async () => {
            const { data, error: fetchError } = await supabase
                .from('orders')
                .select('*')
                .order('created_at', { ascending: false })
                .range(0, PAGE_SIZE - 1);

            if (!fetchError && data) {
                setOrders(data);
                setHasMore(data.length === PAGE_SIZE);
            }
            setLoading(false);
        };
        initialFetch();

        // Subscribe to real-time changes
        const channel = supabase
            .channel('orders-realtime')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'orders' },
                (payload) => {
                    console.log('Real-time update:', payload);

                    if (payload.eventType === 'INSERT') {
                        setOrders(prev => [payload.new as Order, ...prev]);
                        setRecentUpdate(payload.new.id as string);
                    } else if (payload.eventType === 'UPDATE') {
                        setOrders(prev => prev.map(order =>
                            order.id === payload.new.id ? payload.new as Order : order
                        ));
                        setRecentUpdate(payload.new.id as string);
                    } else if (payload.eventType === 'DELETE') {
                        setOrders(prev => prev.filter(order => order.id !== payload.old.id));
                    }

                    // Clear highlight after 2 seconds
                    setTimeout(() => setRecentUpdate(null), 2000);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [fetchOrders]);

    // Update order status via server API
    const updateOrderStatus = async (orderId: string, status: string) => {
        const response = await fetch('/api/orders/status', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderId, status })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to update order status');
        }

        return await response.json();
    };


    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const getItemCount = (items: OrderItem[]) => {
        if (!items || !Array.isArray(items)) return 0;
        return items.reduce((sum, item) => sum + (item.quantity || 1), 0);
    };

    const getDisplayStatus = (order: Order) => {
        if (order.order_status === 'cancelled') return 'Cancelled';
        if (order.order_status === 'delivered') return 'Delivered';
        if (order.order_status === 'shipped') return 'Shipped';
        if (order.order_status === 'processing') return 'Processing';
        if (order.payment_status === 'paid') return 'Paid';
        return 'Pending';
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

    const filteredOrders = orders.filter(order => {
        const status = getDisplayStatus(order).toLowerCase();
        const matchesTab = activeTab === "All Orders" || status === activeTab.toLowerCase();
        const matchesSearch = searchQuery === "" ||
            order.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.customer_email.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesTab && matchesSearch;
    });

    const handleExport = (type: 'excel' | 'pdf') => {
        if (orders.length === 0) {
            alert("No data to export");
            return;
        }

        if (type === 'excel') {
            const exportData = orders.map(order => ({
                Order_Number: order.order_number,
                Customer_Name: order.customer_name,
                Customer_Email: order.customer_email,
                Customer_Phone: order.customer_phone,
                Date: new Date(order.created_at).toLocaleDateString(),
                Items: order.items?.length || 0,
                Total: order.total,
                Status: getDisplayStatus(order)
            }));
            exportToExcel(exportData, `orders_report_${new Date().getTime()}`);
        } else {
            const headers = ['Order #', 'Customer', 'Date', 'Total', 'Status'];
            const data = orders.map(order => [
                order.order_number,
                order.customer_name,
                new Date(order.created_at).toLocaleDateString(),
                `GHS ${order.total.toLocaleString()}`,
                getDisplayStatus(order)
            ]);
            exportToPDF(headers, data, `orders_report_${new Date().getTime()}`, 'Orders Status Report');
        }
    };

    const tabs = ["All Orders", "Processing", "Shipped", "Delivered", "Cancelled"];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };


    return (
        <motion.div
            className={styles.container}
            initial="hidden"
            animate="visible"
            variants={containerVariants}
        >

            <header className={styles.header}>
                <div className={styles.headerTitle}>
                    <h1>Order Management</h1>
                    <p>Manage and track alumni orders and school shop sales.</p>
                </div>
                <div className={styles.headerTools}>
                    <div className={styles.searchWrapper}>
                        <Search size={18} />
                        <input
                            type="text"
                            placeholder="Search order ID, customer..."
                            className={styles.searchInput}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <button className={styles.filterBtn} onClick={() => fetchOrders(false)}>
                        <RefreshCw size={18} />
                        Refresh
                    </button>
                    <button 
                        className={styles.exportBtn}
                        onClick={() => {
                            const choice = window.confirm("Export as Excel? (Cancel for PDF)");
                            handleExport(choice ? 'excel' : 'pdf');
                        }}
                    >
                        <Download size={18} />
                        Export
                    </button>
                </div>
            </header>

            <div className={styles.tabs}>
                {tabs.map(tab => (
                    <span
                        key={tab}
                        className={`${styles.tab} ${activeTab === tab ? styles.activeTab : ""}`}
                        onClick={() => setActiveTab(tab)}
                    >
                        {tab}
                    </span>
                ))}
            </div>

            <motion.div className={styles.tableCard} variants={itemVariants}>
                {loading ? (
                    <div className={styles.loadingState}>
                        <Loader2 className={styles.spinner} size={32} />
                        <p>Loading orders...</p>
                    </div>
                ) : error ? (
                    <div className={styles.errorState}>
                        <AlertCircle size={32} />
                        <p>{error}</p>
                        <button onClick={() => fetchOrders(false)} className={styles.retryBtn}>Try Again</button>
                    </div>
                ) : filteredOrders.length === 0 ? (
                    <div className={styles.emptyState}>
                        <ShoppingBag size={48} />
                        <h3>No orders found</h3>
                        <p>{activeTab === "All Orders" ? "No orders have been placed yet." : `No ${activeTab.toLowerCase()} orders.`}</p>
                    </div>
                ) : (
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Customer</th>
                                <th>Date</th>
                                <th>Items</th>
                                <th>Total Amount</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            <AnimatePresence>
                                {filteredOrders.map((order) => {
                                    const status = getDisplayStatus(order);
                                    const isRecentlyUpdated = recentUpdate === order.id;

                                    return (
                                        <motion.tr
                                            key={order.id}
                                            initial={{ opacity: 0, backgroundColor: '#fff' }}
                                            animate={{
                                                opacity: 1,
                                                backgroundColor: isRecentlyUpdated ? '#fef3c7' : '#fff'
                                            }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <td data-label="Order ID">
                                                <h3>#{order.order_number}</h3>
                                            </td>
                                            <td data-label="Customer">
                                                <div className={styles.customerCell}>
                                                    <h4>{order.customer_name}</h4>
                                                    <p>{order.customer_email}</p>
                                                </div>
                                            </td>
                                            <td data-label="Date">{formatDate(order.created_at)}</td>
                                            <td data-label="Items">{getItemCount(order.items)} Items</td>
                                            <td data-label="Total Amount" style={{ fontWeight: 600 }}>GHS {order.total.toLocaleString()}</td>
                                            <td data-label="Status">
                                                <motion.span
                                                    className={`${styles.statusBadge} ${getStatusClass(status)}`}
                                                    key={status}
                                                    initial={{ scale: 1.2 }}
                                                    animate={{ scale: 1 }}
                                                >
                                                    {status}
                                                </motion.span>
                                            </td>
                                             <td data-label="Action">
                                                 <button 
                                                    className={styles.viewBtn}
                                                    onClick={() => {
                                                        setSelectedOrder(order);
                                                        setIsDetailsModalOpen(true);
                                                    }}
                                                 >
                                                     Details <ArrowUpRight size={14} />
                                                 </button>
                                             </td>
                                        </motion.tr>
                                    );
                                })}
                            </AnimatePresence>
                        </tbody>
                    </table>
                )}

                {hasMore && !loading && filteredOrders.length >= PAGE_SIZE && (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '1.5rem', borderTop: '1px solid #f3f4f6' }}>
                        <button 
                            onClick={() => fetchOrders(true)} 
                            className={styles.viewBtn}
                            style={{ padding: '0.6rem 2rem' }}
                        >
                            Load More Orders
                        </button>
                    </div>
                )}
            </motion.div>

            <OrderDetailsModal 
                isOpen={isDetailsModalOpen}
                onClose={() => {
                    setIsDetailsModalOpen(false);
                    setSelectedOrder(null);
                }}
                order={selectedOrder}
                onUpdateStatus={async (orderId, newStatus) => {
                    if (!selectedOrder) return;
                    await updateOrderStatus(orderId, newStatus);
                    // Update local state for immediate feedback
                    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, order_status: newStatus } : o));
                    setSelectedOrder(prev => prev ? { ...prev, order_status: newStatus } : null);
                }}
            />
        </motion.div>
    );
}


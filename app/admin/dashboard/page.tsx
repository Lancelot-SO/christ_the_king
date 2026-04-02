"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    ShoppingBag,
    Users,
    DollarSign,
    Package,
    TrendingUp,
    AlertCircle,
    RefreshCw,
    ArrowUpRight,
    Plus,
    FileText,
    UserPlus,
    ChevronRight,
    Search,
    X,
    Calendar
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./dashboard.module.css";
import { supabase } from "@/lib/supabase";
import { exportToExcel, exportToPDF } from "@/lib/exportUtils";

export default function AdminDashboard() {
    const router = useRouter();
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [showDateDropdown, setShowDateDropdown] = useState(false);
    const [selectedDateRange, setSelectedDateRange] = useState("Last 30 Days");
    const [stats, setStats] = useState([
        { label: "Total Revenue", value: "GHS 0", icon: <DollarSign size={22} />, trend: "0%", color: "#d4af37" },
        { label: "Total Orders", value: "0", icon: <ShoppingBag size={22} />, trend: "0%", color: "#000000" },
        { label: "Total Products", value: "0", icon: <Package size={22} />, trend: "0%", color: "#000000" },
        { label: "Total Customers", value: "0", icon: <Users size={22} />, trend: "0%", color: "#000000" },
    ]);
    const [recentOrders, setRecentOrders] = useState<any[]>([]);
    const [allOrders, setAllOrders] = useState<any[]>([]);
    const [topProductsData, setTopProductsData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const dateFilterRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchAllData();
    }, []);

    async function fetchAllData() {
        try {
            setLoading(true);

            // Fetch Products Count
            const { count: productCount } = await supabase
                .from('products')
                .select('*', { count: 'exact', head: true });

            // Fetch Order Stats & Revenue efficiently
            const { data: revenueData, error: revenueError } = await supabase
                .from('orders')
                .select('total');

            if (revenueError) throw revenueError;

            // Calculate Revenue
            const totalRevenue = revenueData?.reduce((acc, order) => acc + parseFloat(order.total), 0) || 0;
            const orderCount = revenueData?.length || 0;

            // Fetch Customers Count
            const { count: customerCount } = await supabase
                .from('profiles')
                .select('*', { count: 'exact', head: true });

            setStats([
                { label: "Total Revenue", value: `GHS ${totalRevenue.toLocaleString()}`, icon: <DollarSign size={22} />, trend: "0%", color: "#d4af37" },
                { label: "Total Orders", value: orderCount.toString(), icon: <ShoppingBag size={22} />, trend: "0%", color: "#000000" },
                { label: "Total Products", value: productCount?.toString() || "0", icon: <Package size={22} />, trend: "0%", color: "#000000" },
                { label: "Total Customers", value: (customerCount || 0).toString(), icon: <Users size={22} />, trend: "0%", color: "#000000" },
            ]);

            // Fetch only recent orders for the UI
            const { data: recentOrdersData } = await supabase
                .from('orders')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(5);

            setRecentOrders(recentOrdersData || []);
            setAllOrders(revenueData || []);

            // Basic Top Products logic (placeholder for now)
            const { data: popularProducts } = await supabase
                .from('products')
                .select('*')
                .limit(3);

            setTopProductsData(popularProducts?.map(p => ({
                id: p.id,
                name: p.name,
                sales: Math.floor(Math.random() * 100), // Placeholder sales
                price: `GHS ${p.price}`
            })) || []);

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    }

    const dateRangeOptions = [
        "Today",
        "Last 7 Days",
        "Last 30 Days",
        "Last 90 Days",
        "This Year",
        "Custom Range"
    ];

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dateFilterRef.current && !dateFilterRef.current.contains(event.target as Node)) {
                setShowDateDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleDateRangeSelect = (range: string) => {
        setSelectedDateRange(range);
        setShowDateDropdown(false);
        handleRefresh();
    };

    const handleQuickAction = (action: string) => {
        switch (action) {
            case "add-product":
                router.push("/admin/dashboard/inventory");
                break;
            case "export-report":
                if (allOrders.length === 0) {
                    alert("No data to export");
                    return;
                }
                const exportType = window.confirm("Export as Excel? (Cancel for PDF)") ? 'excel' : 'pdf';
                if (exportType === 'excel') {
                    const data = allOrders.map(o => ({
                        Order_ID: o.order_number,
                        Customer: o.customer_name,
                        Total: o.total,
                        Status: o.order_status,
                        Date: new Date(o.created_at).toLocaleDateString()
                    }));
                    exportToExcel(data, `sales_report_${new Date().getTime()}`);
                } else {
                    const headers = ['Order ID', 'Customer', 'Total', 'Status', 'Date'];
                    const data = allOrders.map(o => [
                        o.order_number,
                        o.customer_name,
                        `GHS ${o.total}`,
                        o.order_status,
                        new Date(o.created_at).toLocaleDateString()
                    ]);
                    exportToPDF(headers, data, `sales_report_${new Date().getTime()}`, 'Sales Report Overview');
                }
                break;
            case "manage-users":
                router.push("/admin/dashboard/customers");
                break;
        }
    };

    const chartData = [40, 65, 45, 80, 55, 90, 75];

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await fetchAllData();
        setIsRefreshing(false);
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <>
            <motion.div
                className={styles.container}
                initial="hidden"
                animate="visible"
                variants={containerVariants}
            >
                <header className={styles.header}>
                    <div className={styles.headerTitle}>
                        <h1>Dashboard Overview</h1>
                        <p>Welcome back, Administrator. Here's what's happening today.</p>
                    </div>
                    <div className={styles.headerTools}>
                        <div className={styles.searchWrapper}>
                            <Search size={18} />
                            <input type="text" placeholder="Search orders, products..." className={styles.searchInput} />
                        </div>
                        <div className={styles.dateFilterWrapper} ref={dateFilterRef}>
                            <button
                                className={styles.dateFilter}
                                onClick={() => setShowDateDropdown(!showDateDropdown)}
                            >
                                <Calendar size={16} />
                                <span>{selectedDateRange}</span>
                                <ChevronRight size={14} style={{ transform: showDateDropdown ? 'rotate(-90deg)' : 'rotate(90deg)', transition: 'transform 0.2s ease' }} />
                            </button>
                            <AnimatePresence>
                                {showDateDropdown && (
                                    <motion.div
                                        className={styles.dateDropdown}
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        {dateRangeOptions.map((option) => (
                                            <button
                                                key={option}
                                                className={`${styles.dateOption} ${selectedDateRange === option ? styles.dateOptionActive : ''}`}
                                                onClick={() => handleDateRangeSelect(option)}
                                            >
                                                {option}
                                            </button>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                        <div className={styles.headerActions}>
                            <button
                                className={styles.refreshBtn}
                                onClick={handleRefresh}
                                disabled={isRefreshing}
                            >
                                <motion.div
                                    animate={{ rotate: isRefreshing ? 360 : 0 }}
                                    transition={{ duration: 1, repeat: isRefreshing ? Infinity : 0, ease: "linear" }}
                                >
                                    <RefreshCw size={16} />
                                </motion.div>
                                {isRefreshing ? "Updating..." : "Refresh Data"}
                            </button>
                            <button
                                className={styles.secondaryBtn}
                                onClick={() => alert("New Order feature coming soon!")}
                            >
                                <Plus size={16} />
                                <span>New Order</span>
                            </button>
                        </div>
                    </div>
                </header>

                <div className={styles.statsGrid}>
                    {stats.map((stat, i) => (
                        <motion.div
                            key={i}
                            className={styles.statCard}
                            variants={itemVariants}
                            whileHover={{ y: -5 }}
                        >
                            <div className={styles.statIcon} style={{ background: stat.color + "1A", color: stat.color }}>
                                {stat.icon}
                            </div>
                            <div className={styles.statContent}>
                                <span className={styles.statLabel}>{stat.label}</span>
                                <h3>{stat.value}</h3>
                                <span className={styles.statTrend} style={{ color: stat.trend.startsWith('+') ? '#10b981' : '#6b7280' }}>
                                    <motion.span
                                        initial={{ opacity: 0, x: -5 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.5 + i * 0.1 }}
                                    >
                                        <TrendingUp size={14} /> {stat.trend} this month
                                    </motion.span>
                                </span>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div className={styles.topGrid}>
                    <motion.div className={styles.chartCard} variants={itemVariants}>
                        <div className={styles.chartHeader}>
                            <div className={styles.chartTitle}>
                                <h2>Revenue Trend</h2>
                                <p>Daily sales performance for the last 7 days</p>
                            </div>
                            <div className={styles.statTrend} style={{ color: "#10b981" }}>
                                <ArrowUpRight size={16} /> +24% from last week
                            </div>
                        </div>
                        <div className={styles.chartPlaceholder}>
                            {chartData.map((val, i) => (
                                <motion.div
                                    key={i}
                                    className={`${styles.bar} ${i === 5 ? styles.barActive : ""}`}
                                    initial={{ height: 0 }}
                                    animate={{ height: `${val}%` }}
                                    transition={{ delay: 0.5 + i * 0.1, duration: 0.8, ease: "easeOut" }}
                                >
                                    <motion.div
                                        className={styles.tooltip}
                                        initial={{ opacity: 0 }}
                                        whileHover={{ opacity: 1 }}
                                    />
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    <motion.div className={styles.sideColumn} variants={itemVariants}>
                        <div className={styles.quickActions}>
                            <h3>Quick Actions</h3>
                            <button
                                className={styles.actionBtn}
                                onClick={() => handleQuickAction('add-product')}
                            >
                                <Plus size={18} />
                                <span>Add New Product</span>
                            </button>
                            <button
                                className={styles.actionBtn}
                                onClick={() => handleQuickAction('export-report')}
                            >
                                <FileText size={18} />
                                <span>Export Sales Report</span>
                            </button>
                            <button
                                className={styles.actionBtn}
                                onClick={() => handleQuickAction('manage-users')}
                            >
                                <UserPlus size={18} />
                                <span>Manage Users</span>
                            </button>
                        </div>

                        <div className={styles.topProducts}>
                            <div className={styles.sectionHeader}>
                                <h2>Top Products</h2>
                            </div>
                            {topProductsData.length > 0 ? topProductsData.map((product) => (
                                <div key={product.id} className={styles.productItem}>
                                    <div className={styles.productImg} />
                                    <div className={styles.productInfo}>
                                        <h4>{product.name}</h4>
                                        <p>{product.sales} sales • {product.price}</p>
                                    </div>
                                    <ChevronRight size={16} color="#9ca3af" style={{ marginLeft: 'auto' }} />
                                </div>
                            )) : (
                                <p style={{ padding: '20px', textAlign: 'center', color: '#6b7280' }}>No products yet</p>
                            )}
                        </div>
                    </motion.div>
                </div>

                <div className={styles.mainGrid}>
                    <motion.div className={styles.recentOrders} variants={itemVariants}>
                        <div className={styles.sectionHeader}>
                            <h2>Recent Orders</h2>
                            <div className={styles.viewMore}>
                                View All Orders <ChevronRight size={14} />
                            </div>
                        </div>
                        <div className={styles.tableContainer}>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>Order ID</th>
                                        <th>Customer</th>
                                        <th>Date</th>
                                        <th>Amount</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentOrders.length > 0 ? recentOrders.map((order) => (
                                        <tr key={order.id}>
                                            <td data-label="Order ID">#{order.order_number}</td>
                                            <td data-label="Customer">{order.customer_name}</td>
                                            <td data-label="Date">{new Date(order.created_at).toLocaleDateString()}</td>
                                            <td data-label="Amount" style={{ fontWeight: 600 }}>GHS {order.total}</td>
                                            <td data-label="Status">
                                                <span className={`${styles.statusBadge} ${order.payment_status === 'paid' ? styles.statusPaid :
                                                    order.payment_status === 'shipped' ? styles.statusShipped :
                                                        styles.statusPending
                                                    }`}>
                                                    {order.payment_status}
                                                </span>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={5} style={{ textAlign: 'center', padding: '20px' }}>No recent orders</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>

                    <motion.div className={styles.sideColumn} variants={itemVariants}>
                        <div className={styles.card}>
                            <div className={styles.sectionHeader}>
                                <h2>Critical Alerts</h2>
                            </div>
                            <div className={styles.alertCard}>
                                <AlertCircle size={18} color="#ef4444" />
                                <div>
                                    <strong>Low Stock Alert</strong>
                                    <p>School Blazers (Size L) is below threshold (2 left).</p>
                                </div>
                            </div>
                            <div className={styles.alertCard}>
                                <Package size={18} color="#3b82f6" />
                                <div>
                                    <strong>Pending Deliveries</strong>
                                    <p>5 orders are ready for dispatch today.</p>
                                </div>
                            </div>
                            <div className={styles.alertCard}>
                                <Users size={18} color="#d4af37" />
                                <div>
                                    <strong>Unverified Users</strong>
                                    <p>12 new alumni registrations pending approval.</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </motion.div>
        </>
    );
}

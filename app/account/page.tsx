"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import {
    ShoppingBag,
    Package,
    DollarSign,
    Heart,
    Store,
    Settings,
    LogOut,
    ChevronRight,
} from "lucide-react";
import styles from "./account.module.css";

interface Order {
    id: string;
    order_number: string;
    items: any[];
    total: number;
    payment_status: string;
    order_status: string;
    created_at: string;
}

interface Profile {
    name: string;
    email: string;
    role: string;
    created_at: string;
}

export default function AccountPage() {
    const { user, isLoading, signOut } = useAuth();
    const router = useRouter();
    const [orders, setOrders] = useState<Order[]>([]);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loadingData, setLoadingData] = useState(true);

    useEffect(() => {
        if (!isLoading && !user) {
            router.push("/login");
        }
    }, [user, isLoading, router]);

    useEffect(() => {
        if (user) {
            fetchUserData();
        }
    }, [user]);

    async function fetchUserData() {
        try {
            setLoadingData(true);

            // Fetch profile
            const { data: profileData } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", user!.id)
                .single();

            if (profileData) {
                setProfile(profileData);
            }

            // Fetch orders by user email
            const userEmail = profileData?.email || user!.email;
            if (userEmail) {
                const { data: orderData } = await supabase
                    .from("orders")
                    .select("*")
                    .eq("customer_email", userEmail)
                    .order("created_at", { ascending: false });

                setOrders(orderData || []);
            }
        } catch (error) {
            console.error("Error fetching user data:", error);
        } finally {
            setLoadingData(false);
        }
    }

    const getDisplayStatus = (order: Order) => {
        if (order.order_status === "cancelled") return "Cancelled";
        if (order.order_status === "delivered") return "Delivered";
        if (order.order_status === "shipped") return "Shipped";
        if (order.order_status === "processing") return "Processing";
        if (order.payment_status === "paid") return "Paid";
        return "Pending";
    };

    const getBadgeClass = (status: string) => {
        switch (status.toLowerCase()) {
            case "paid":
                return styles.badgePaid;
            case "processing":
                return styles.badgeProcessing;
            case "shipped":
                return styles.badgeShipped;
            case "delivered":
                return styles.badgeDelivered;
            case "cancelled":
                return styles.badgeCancelled;
            default:
                return styles.badgePending;
        }
    };

    const totalSpent = orders.reduce((sum, o) => sum + (parseFloat(String(o.total)) || 0), 0);

    if (isLoading || (!user && !isLoading)) {
        return (
            <main className={styles.page}>
                <Header />
                <div className={styles.loading}>Loading...</div>
            </main>
        );
    }

    return (
        <main className={styles.page}>
            <Header />
            <div className="container">
                {/* Welcome */}
                <div className={styles.welcome}>
                    <div className={styles.welcomeHeader}>
                        <div>
                            <h1>
                                Welcome back, {profile?.name || user?.email?.split("@")[0] || "User"}
                            </h1>
                            <p>Here&apos;s an overview of your account and recent orders.</p>
                        </div>
                        <Link href="/catalog" className={styles.shopBtn}>
                            <Store size={18} />
                            View Shop
                        </Link>
                    </div>
                </div>

                {/* Stats */}
                <div className={styles.statsRow}>
                    <div className={styles.statCard}>
                        <div
                            className={styles.statIcon}
                            style={{ background: "#fef3c7", color: "#d4af37" }}
                        >
                            <ShoppingBag size={22} />
                        </div>
                        <div className={styles.statContent}>
                            <span>Total Orders</span>
                            <h3>{orders.length}</h3>
                        </div>
                    </div>
                    <div className={styles.statCard}>
                        <div
                            className={styles.statIcon}
                            style={{ background: "#dcfce7", color: "#166534" }}
                        >
                            <DollarSign size={22} />
                        </div>
                        <div className={styles.statContent}>
                            <span>Total Spent</span>
                            <h3>GH₵ {totalSpent.toLocaleString()}</h3>
                        </div>
                    </div>
                    <div className={styles.statCard}>
                        <div
                            className={styles.statIcon}
                            style={{ background: "#dbeafe", color: "#1e40af" }}
                        >
                            <Package size={22} />
                        </div>
                        <div className={styles.statContent}>
                            <span>Active Orders</span>
                            <h3>
                                {
                                    orders.filter(
                                        (o) =>
                                            o.order_status !== "delivered" &&
                                            o.order_status !== "cancelled"
                                    ).length
                                }
                            </h3>
                        </div>
                    </div>
                </div>

                {/* Main Grid */}
                <div className={styles.grid}>
                    {/* Orders Table */}
                    <div className={styles.card}>
                        <div className={styles.cardHeader}>
                            <h2>Order History</h2>
                        </div>

                        {loadingData ? (
                            <div className={styles.empty}>
                                <p>Loading orders...</p>
                            </div>
                        ) : orders.length > 0 ? (
                            <div className={styles.tableWrap}>
                                <table className={styles.table}>
                                    <thead>
                                        <tr>
                                            <th>Order #</th>
                                            <th>Date</th>
                                            <th>Items</th>
                                            <th>Total</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {orders.map((order) => {
                                            const status = getDisplayStatus(order);
                                            const itemCount = Array.isArray(order.items)
                                                ? order.items.reduce(
                                                    (sum: number, i: any) =>
                                                        sum + (i.quantity || 1),
                                                    0
                                                )
                                                : 0;

                                            return (
                                                <tr key={order.id}>
                                                    <td data-label="Order #">
                                                        <span className={styles.orderNumber}>
                                                            #{order.order_number}
                                                        </span>
                                                    </td>
                                                    <td data-label="Date">
                                                        {new Date(
                                                            order.created_at
                                                        ).toLocaleDateString("en-US", {
                                                            month: "short",
                                                            day: "numeric",
                                                            year: "numeric",
                                                        })}
                                                    </td>
                                                    <td data-label="Items">
                                                        {itemCount} item
                                                        {itemCount !== 1 ? "s" : ""}
                                                    </td>
                                                    <td
                                                        data-label="Total"
                                                        style={{ fontWeight: 600 }}
                                                    >
                                                        GH₵ {order.total.toLocaleString()}
                                                    </td>
                                                    <td data-label="Status">
                                                        <span
                                                            className={`${styles.badge} ${getBadgeClass(status)}`}
                                                        >
                                                            {status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className={styles.empty}>
                                <ShoppingBag size={48} />
                                <h3>No orders yet</h3>
                                <p>
                                    When you place an order, it will appear here so you
                                    can track its progress.
                                </p>
                                <Link href="/catalog" className={styles.shopBtn}>
                                    Browse Shop
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div>
                        {/* Account Info */}
                        <div className={styles.card} style={{ marginBottom: "1.5rem" }}>
                            <div className={styles.cardHeader}>
                                <h2>Account Info</h2>
                            </div>
                            <div className={styles.infoList}>
                                <div className={styles.infoItem}>
                                    <span className={styles.infoLabel}>Name</span>
                                    <span className={styles.infoValue}>
                                        {profile?.name || "—"}
                                    </span>
                                </div>
                                <div className={styles.infoItem}>
                                    <span className={styles.infoLabel}>Email</span>
                                    <span className={styles.infoValue}>
                                        {profile?.email || user?.email || "—"}
                                    </span>
                                </div>
                                <div className={styles.infoItem}>
                                    <span className={styles.infoLabel}>Role</span>
                                    <span className={styles.infoValue}>
                                        {profile?.role || "Customer"}
                                    </span>
                                </div>
                                <div className={styles.infoItem}>
                                    <span className={styles.infoLabel}>Member Since</span>
                                    <span className={styles.infoValue}>
                                        {profile?.created_at
                                            ? new Date(
                                                profile.created_at
                                            ).toLocaleDateString("en-US", {
                                                month: "short",
                                                year: "numeric",
                                            })
                                            : "—"}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Quick Links */}
                        <div className={styles.card}>
                            <div className={styles.cardHeader}>
                                <h2>Quick Links</h2>
                            </div>
                            <div className={styles.quickLinks}>
                                <Link href="/catalog" className={styles.quickLink}>
                                    <Store size={18} />
                                    View Shop
                                </Link>
                                <Link href="/wishlist" className={styles.quickLink}>
                                    <Heart size={18} />
                                    My Wishlist
                                </Link>
                                <Link href="/contact" className={styles.quickLink}>
                                    <Settings size={18} />
                                    Contact Support
                                </Link>
                                <button
                                    className={styles.signOutBtn}
                                    onClick={signOut}
                                >
                                    <LogOut size={16} />
                                    Sign Out
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </main>
    );
}

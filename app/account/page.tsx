"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import dynamic from "next/dynamic";
import {
    ShoppingBag,
    Package,
    DollarSign,
    Heart,
    Store,
    Settings,
    LogOut,
    ChevronRight,
    CreditCard,
    CheckCircle,
    Clock,
} from "lucide-react";
import styles from "./account.module.css";

const PaymentButton = dynamic(() => import("@/components/PaymentButton"), { 
    ssr: false,
    loading: () => (
        <button className={styles.payDuesBtn} disabled>
            Loading...
        </button>
    )
});

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
    class_year: string | null;
    created_at: string;
}

export default function AccountPage() {
    const { user, isLoading, signOut } = useAuth();
    const router = useRouter();
    const [orders, setOrders] = useState<Order[]>([]);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loadingData, setLoadingData] = useState(true);
    const [mounted, setMounted] = useState(false);
    const [payingDues, setPayingDues] = useState(false);
    const [duesFee, setDuesFee] = useState<{ amount: number; description: string | null } | null>(null);
    const [duesPayment, setDuesPayment] = useState<{ payment_status: string; payment_date: string | null } | null>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

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
                .maybeSingle();

            if (profileData) {
                setProfile(profileData);

                // Fetch dues fee for this user's year group
                if (profileData.class_year) {
                    const { data: feeData } = await supabase
                        .from("dues_fees")
                        .select("amount, description")
                        .eq("year_group", profileData.class_year)
                        .maybeSingle();
        
                    setDuesFee(feeData || null);
        
                    // Fetch this user's payment record
                    const { data: paymentData } = await supabase
                        .from("dues_payments")
                        .select("payment_status, payment_date")
                        .eq("profile_id", user!.id)
                        .maybeSingle();
        
                    setDuesPayment(paymentData || null);
                }
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

    const handlePaymentSuccess = async (reference: string) => {
        if (!user || !duesFee || !profile?.class_year) return;

        try {
            setPayingDues(true);
            
            // 1. Check if a record already exists for this year group
            const { data: existingRecord } = await supabase
                .from("dues_payments")
                .select("id")
                .eq("profile_id", user.id)
                .eq("year_group", profile.class_year)
                .maybeSingle();

            const paymentData = {
                profile_id: user.id,
                year_group: profile.class_year,
                amount_paid: duesFee.amount,
                payment_status: "paid",
                payment_date: new Date().toISOString(),
                payment_reference: reference
            };

            let saveError;
            if (existingRecord) {
                // 2a. Update existing record
                const { error } = await supabase
                    .from("dues_payments")
                    .update(paymentData)
                    .eq("id", existingRecord.id);
                saveError = error;
            } else {
                // 2b. Insert new record
                const { error } = await supabase
                    .from("dues_payments")
                    .insert([paymentData]);
                saveError = error;
            }

            if (saveError) throw saveError;
            
            alert("Payment successful! Your dues have been updated.");
            fetchUserData(); // Refresh UI
        } catch (error: any) {
            console.error("Error updating dues payment:", error);
            alert("Payment successful but failed to update platform. Please contact support with reference: " + reference);
        } finally {
            setPayingDues(false);
        }
    };

    const paystackConfig = {
        reference: `DUES-${profile?.class_year}-${user?.id?.substring(0, 8)}-${new Date().getTime()}`,
        email: profile?.email || user?.email || "",
        amount: Math.round((duesFee?.amount || 0) * 100),
        publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "",
        currency: "GHS",
    };

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

                {/* ── Dues Section ── */}
                <div className={styles.duesSection}>
                    <div className={styles.duesSectionHeader}>
                        <div className={styles.duesSectionTitle}>
                            <CreditCard size={20} />
                            <h2>My Annual Dues</h2>
                        </div>
                        {duesFee && duesPayment?.payment_status !== "paid" && duesPayment?.payment_status !== "waived" && (
                            mounted ? (
                                <PaymentButton 
                                    config={paystackConfig}
                                    onSuccess={(response: any) => handlePaymentSuccess(response.reference)}
                                    onClose={() => setPayingDues(false)}
                                    loading={payingDues}
                                    setLoading={setPayingDues}
                                    styles={styles}
                                    label={`Pay Dues — GH₵ ${Number(duesFee.amount).toLocaleString()}`}
                                    skipCartCheck={true}
                                />
                            ) : (
                                <button className={styles.payDuesBtn} disabled>
                                    Pay Dues — GH₵ {Number(duesFee.amount).toLocaleString()}
                                </button>
                            )
                        )}
                        {duesPayment?.payment_status === "paid" && (
                            <span className={styles.duesPaidBadge}><CheckCircle size={14} /> Dues Paid</span>
                        )}
                        {duesPayment?.payment_status === "waived" && (
                            <span className={styles.duesWaivedBadge}>Waived</span>
                        )}
                    </div>

                    <div className={styles.tableWrap}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Year Group</th>
                                    <th>Annual Fee</th>
                                    <th>Description</th>
                                    <th>Payment Status</th>
                                    <th>Date Confirmed</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loadingData ? (
                                    <tr>
                                        <td colSpan={5} style={{ textAlign: "center", color: "#9ca3af" }}>Loading dues...</td>
                                    </tr>
                                ) : !profile?.class_year ? (
                                    <tr>
                                        <td colSpan={5} style={{ textAlign: "center", color: "#9ca3af" }}>
                                            No year group linked to your profile. Contact support to update.
                                        </td>
                                    </tr>
                                ) : !duesFee ? (
                                    <tr>
                                        <td data-label="Year Group"><strong>{profile.class_year}</strong></td>
                                        <td colSpan={4} style={{ color: "#9ca3af" }}>No dues set for your year group yet — check back later.</td>
                                    </tr>
                                ) : (
                                    <tr>
                                        <td data-label="Year Group">
                                            <span className={styles.yearBadge}>{profile.class_year}</span>
                                        </td>
                                        <td data-label="Annual Fee">
                                            <strong>GH₵ {Number(duesFee.amount).toLocaleString()}</strong>
                                        </td>
                                        <td data-label="Description">
                                            {duesFee.description || "—"}
                                        </td>
                                        <td data-label="Status">
                                            <span className={`${styles.badge} ${
                                                duesPayment?.payment_status === "paid" ? styles.badgePaid :
                                                duesPayment?.payment_status === "waived" ? styles.badgeWaived :
                                                styles.badgePending
                                            }`}>
                                                {duesPayment?.payment_status === "paid" ? (
                                                    <><CheckCircle size={11} /> Paid</>
                                                ) : duesPayment?.payment_status === "waived" ? "Waived" : (
                                                    <><Clock size={11} /> Pending</>
                                                )}
                                            </span>
                                        </td>
                                        <td data-label="Date Confirmed">
                                            {duesPayment?.payment_date
                                                ? new Date(duesPayment.payment_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                                                : "—"}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
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
                                    <span className={styles.infoLabel}>Year Group</span>
                                    <span className={styles.infoValue}>
                                        {profile?.class_year || "—"}
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

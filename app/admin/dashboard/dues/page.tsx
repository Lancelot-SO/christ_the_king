"use client";

import { useState, useEffect, useCallback } from "react";
import {
    CreditCard,
    Plus,
    Edit2,
    Trash2,
    Search,
    Users,
    DollarSign,
    CheckCircle,
    Clock,
    Save,
    X,
    Layers,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import dynamic from "next/dynamic";
import styles from "./dues.module.css";

const PaymentButton = dynamic(() => import("@/components/PaymentButton"), { 
    ssr: false,
    loading: () => (
        <button className={styles.payDuesBtn} disabled>
            Loading...
        </button>
    )
});

interface DuesFee {
    id: string;
    year_group: string;
    amount: number;
    description: string | null;
    updated_at: string;
}

interface DuesPayment {
    id: string;
    profile_id: string;
    year_group: string;
    amount_paid: number | null;
    payment_reference: string | null;
    payment_status: "pending" | "paid" | "waived";
    payment_date: string | null;
    profiles: {
        name: string;
        email: string;
    };
    dues_fees?: {
        amount: number;
    } | null;
}

interface Profile {
    id: string;
    name: string;
    email: string;
    class_year: string | null;
}

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0 },
};

export default function DuesPage() {
    const [activeTab, setActiveTab] = useState<"fees" | "payments">("fees");

    // ── Fees state ──
    const [fees, setFees] = useState<DuesFee[]>([]);
    const [feesLoading, setFeesLoading] = useState(true);
    const [feeModal, setFeeModal] = useState(false);
    const [editingFee, setEditingFee] = useState<DuesFee | null>(null);
    const [feeForm, setFeeForm] = useState({ year_group: "", amount: "", description: "" });
    const [savingFee, setSavingFee] = useState(false);
    const [deletingFeeId, setDeletingFeeId] = useState<string | null>(null);
    const [bulkModal, setBulkModal] = useState(false);
    const [bulkForm, setBulkForm] = useState({ year_from: "", year_to: "", amount: "", description: "" });
    const [bulkSaving, setBulkSaving] = useState(false);

    // ── Payments state ──
    const [payments, setPayments] = useState<DuesPayment[]>([]);
    const [paymentsLoading, setPaymentsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [yearFilter, setYearFilter] = useState<string>("all");
    const [adminProfile, setAdminProfile] = useState<any>(null);
    const [isAdminPaid, setIsAdminPaid] = useState(false);
    const [isPaying, setIsPaying] = useState(false);

    // ── Fetch Fees ──
    const fetchFees = useCallback(async () => {
        setFeesLoading(true);
        const { data, error } = await supabase
            .from("dues_fees")
            .select("*")
            .order("year_group", { ascending: false });
        if (!error) setFees(data || []);
        setFeesLoading(false);
    }, []);

    // ── Fetch Payments ──
    const fetchPayments = useCallback(async () => {
        setPaymentsLoading(true);
        const { data, error } = await supabase
            .from("dues_payments")
            .select(`
                *,
                profiles (name, email),
                dues_fees (amount)
            `)
            .order("created_at", { ascending: false });
        if (!error) setPayments((data as DuesPayment[]) || []);
        setPaymentsLoading(false);
    }, []);

    // ── Seed payments for alumni with class_year whenever fees tab is visited ──
    const seedPaymentsForAlumni = useCallback(async () => {
        const { data: alumniProfiles } = await supabase
            .from("profiles")
            .select("id, name, email, class_year")
            .not("class_year", "is", null);

        if (!alumniProfiles || alumniProfiles.length === 0) return;

        const { data: feesData } = await supabase.from("dues_fees").select("id, year_group");
        const { data: existingPayments } = await supabase.from("dues_payments").select("profile_id");

        const paidIds = new Set((existingPayments || []).map((p: any) => p.profile_id));
        const feeMap = new Map((feesData || []).map((f: any) => [f.year_group, f.id]));

        const toInsert = alumniProfiles
            .filter((p: Profile) => !paidIds.has(p.id) && p.class_year)
            .map((p: Profile) => ({
                profile_id: p.id,
                dues_fee_id: feeMap.get(p.class_year!) || null,
                year_group: p.class_year!,
                payment_status: "pending",
            }));

        if (toInsert.length > 0) {
            await supabase.from("dues_payments").insert(toInsert);
        }
    }, []);

    useEffect(() => {
        fetchFees();
    }, [fetchFees]);

    const fetchAdminStatus = useCallback(async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();
        
        setAdminProfile(profile);

        if (profile?.class_year) {
            const { data: payment } = await supabase
                .from("dues_payments")
                .select("payment_status")
                .eq("profile_id", user.id)
                .eq("year_group", profile.class_year)
                .eq("payment_status", "paid")
                .maybeSingle();
            
            setIsAdminPaid(!!payment);
        }
    }, []);

    useEffect(() => {
        const initData = async () => {
            await Promise.all([fetchFees(), fetchPayments(), fetchAdminStatus()]);
            // Seed payments for anyone missing them in the background
            seedPaymentsForAlumni().then(() => {
                fetchPayments(); // Refresh list if new seeds were added
            });
        };
        initData();
    }, [fetchFees, fetchPayments, fetchAdminStatus, seedPaymentsForAlumni]);

    const handleAdminPaymentSuccess = async (reference: string) => {
        if (!adminProfile?.class_year) return;

        try {
            setIsPaying(true);
            const fee = fees.find(f => f.year_group === adminProfile.class_year);
            
            const { error } = await supabase
                .from("dues_payments")
                .upsert({
                    profile_id: adminProfile.id,
                    year_group: adminProfile.class_year,
                    amount_paid: fee?.amount || 0,
                    payment_status: "paid",
                    payment_date: new Date().toISOString(),
                    payment_reference: reference,
                    dues_fee_id: fee?.id || null
                }, { onConflict: 'profile_id,year_group' });

            if (error) throw error;
            
            setIsAdminPaid(true);
            fetchPayments();
            alert("Your dues have been paid successfully!");
        } catch (error) {
            console.error("Error paying admin dues:", error);
            alert("Payment successful but failed to update record.");
        } finally {
            setIsPaying(false);
        }
    };

    // ── Fee CRUD ──
    const openAddFee = () => {
        setEditingFee(null);
        setFeeForm({ year_group: "", amount: "", description: "" });
        setFeeModal(true);
    };

    const openEditFee = (fee: DuesFee) => {
        setEditingFee(fee);
        setFeeForm({ year_group: fee.year_group, amount: String(fee.amount), description: fee.description || "" });
        setFeeModal(true);
    };

    const handleSaveFee = async (e: React.FormEvent) => {
        e.preventDefault();
        setSavingFee(true);
        console.log("Saving fee...", feeForm);

        try {
            const payload = {
                year_group: feeForm.year_group.trim(),
                amount: parseFloat(feeForm.amount),
                description: feeForm.description.trim() || null,
                updated_at: new Date().toISOString(),
            };

            if (isNaN(payload.amount)) {
                throw new Error("Invalid amount entered. Please provide a numeric value.");
            }
            const query = (editingFee && editingFee.id)
                ? supabase.from("dues_fees").update(payload).eq("id", editingFee.id)
                : supabase.from("dues_fees").upsert([payload], { onConflict: 'year_group' });

            const { error } = await query;

            if (error) {
                console.error("Supabase Error Object:", error);
                throw error;
            }

            console.log("Save successful");
            await fetchFees();
            setFeeModal(false);
        } catch (err: any) {
            console.error("Caught error full details:", {
                message: err.message,
                name: err.name,
                stack: err.stack,
            });
            alert(err.message || "Failed to save fee");
        } finally {
            setSavingFee(false);
        }
    };

    const handleBulkSaveFee = async (e: React.FormEvent) => {
        e.preventDefault();
        const from = parseInt(bulkForm.year_from);
        const to = parseInt(bulkForm.year_to);
        const amount = parseFloat(bulkForm.amount);

        if (isNaN(from) || isNaN(to) || from > to) {
            alert("Please enter a valid year range.");
            return;
        }

        const payloads = [];
        for (let year = from; year <= to; year++) {
            payloads.push({
                year_group: String(year),
                amount: amount,
                description: bulkForm.description.trim() || null,
                updated_at: new Date().toISOString(),
            });
        }

        setBulkSaving(true);
        console.log("Saving bulk fees...", payloads.length, "items");

        try {
            const { error } = await supabase.from("dues_fees").upsert(payloads, { onConflict: 'year_group' });

            if (error) {
                console.error("Bulk Supabase Error Object:", error);
                throw error;
            }

            console.log("Bulk save successful");
            await fetchFees();
            setBulkModal(false);
            setBulkForm({ year_from: "", year_to: "", amount: "", description: "" });
        } catch (err: any) {
            console.error("Caught bulk error full details:", {
                message: err.message,
                name: err.name,
                stack: err.stack,
            });
            alert(err.message || "Failed to bulk save fees");
        } finally {
            setBulkSaving(false);
        }
    };

    const handleDeleteFee = async (id: string) => {
        if (!confirm("Delete this fee entry? Existing payment records linked to it won't be deleted.")) return;
        const { error } = await supabase.from("dues_fees").delete().eq("id", id);
        if (!error) setFees(fees.filter((f) => f.id !== id));
    };

    // ── Update payment status ──
    const updatePaymentStatus = async (id: string, status: "pending" | "paid" | "waived") => {
        const { error } = await supabase
            .from("dues_payments")
            .update({
                payment_status: status,
                payment_date: status === "paid" ? new Date().toISOString() : null,
            })
            .eq("id", id);

        if (!error) {
            setPayments((prev) =>
                prev.map((p) =>
                    p.id === id ? { ...p, payment_status: status, payment_date: status === "paid" ? new Date().toISOString() : null } : p
                )
            );
        }
    };

    // ── Stats ──
    const totalFees = fees.length;
    const totalPaid = payments.filter((p) => p.payment_status === "paid").length;
    const totalPending = payments.filter((p) => p.payment_status === "pending").length;
    const totalRevenue = payments
        .filter((p) => p.payment_status === "paid")
        .reduce((sum, p) => sum + (p.dues_fees?.amount || p.amount_paid || 0), 0);

    // ── Filtered payments ──
    const filteredPayments = payments.filter((p) => {
        const matchesSearch =
            p.profiles?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.profiles?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.year_group?.includes(searchQuery);

        const matchesStatus = statusFilter === "all" || p.payment_status === statusFilter;
        const matchesYear = yearFilter === "all" || p.year_group === yearFilter;

        return matchesSearch && matchesStatus && matchesYear;
    });

    const statusLabel = (s: string) => {
        if (s === "paid") return styles.statusPaid;
        if (s === "waived") return styles.statusWaived;
        return styles.statusPending;
    };

    return (
        <motion.div className={styles.container} initial="hidden" animate="visible" variants={containerVariants}>
            {/* ── Header ── */}
            <header className={styles.header}>
                <div className={styles.headerTitle}>
                    <h1>Dues Management</h1>
                    <p>Set annual fees per year group and track member payments.</p>
                </div>
                <div className={styles.headerActions}>
                    {adminProfile?.class_year && (
                        <div className={styles.adminPersonalDues}>
                            {isAdminPaid ? (
                                <span className={styles.personalPaidBadge}>
                                    <CheckCircle size={16} /> My Dues Paid
                                </span>
                            ) : (
                                <PaymentButton 
                                    config={{
                                        publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
                                        email: adminProfile.email,
                                        amount: Math.round((fees.find(f => f.year_group === adminProfile.class_year)?.amount || 0) * 100),
                                        currency: 'GHS',
                                        reference: `ADMIN-DUES-${adminProfile.class_year}-${adminProfile.id.substring(0, 8)}-${Date.now()}`
                                    }}
                                    onSuccess={(response: any) => handleAdminPaymentSuccess(response.reference)}
                                    onClose={() => setIsPaying(false)}
                                    loading={isPaying}
                                    setLoading={setIsPaying}
                                    styles={{ payBtn: styles.payDuesBtn, spin: styles.spin }}
                                    label={
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <CreditCard size={18} />
                                            Pay My Dues ({adminProfile.class_year})
                                        </span>
                                    }
                                    skipCartCheck={true}
                                />
                            )}
                        </div>
                    )}
                    {activeTab === "fees" && (
                        <>
                            <button className={styles.bulkBtn} onClick={() => setBulkModal(true)}>
                                <Layers size={18} />
                                Bulk Add
                            </button>
                            <button className={styles.addBtn} onClick={openAddFee}>
                                <Plus size={18} />
                                Add Fee
                            </button>
                        </>
                    )}
                </div>
            </header>

            {/* ── Stats ── */}
            <motion.div className={styles.statsRow} variants={itemVariants}>
                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: "#f0f4ff", color: "#3b53d1" }}>
                        <CreditCard size={22} />
                    </div>
                    <div className={styles.statContent}>
                        <span>Year Groups with Fees</span>
                        <h3>{totalFees}</h3>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: "#dcfce7", color: "#166534" }}>
                        <CheckCircle size={22} />
                    </div>
                    <div className={styles.statContent}>
                        <span>Payments Confirmed</span>
                        <h3>{totalPaid}</h3>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: "#fef9c3", color: "#854d0e" }}>
                        <Clock size={22} />
                    </div>
                    <div className={styles.statContent}>
                        <span>Pending Members</span>
                        <h3>{totalPending}</h3>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: "#fef3c7", color: "#d4af37" }}>
                        <DollarSign size={22} />
                    </div>
                    <div className={styles.statContent}>
                        <span>Total Collected</span>
                        <h3>GH₵ {Number(totalRevenue || 0).toLocaleString()}</h3>
                    </div>
                </div>
            </motion.div>

            {/* ── Tabs ── */}
            <motion.div variants={itemVariants}>
                <div className={styles.tabs}>
                    <button
                        className={`${styles.tab} ${activeTab === "fees" ? styles.tabActive : ""}`}
                        onClick={() => setActiveTab("fees")}
                    >
                        <CreditCard size={16} />
                        Fee Settings
                    </button>
                    <button
                        className={`${styles.tab} ${activeTab === "payments" ? styles.tabActive : ""}`}
                        onClick={() => setActiveTab("payments")}
                    >
                        <Users size={16} />
                        Member Payments
                    </button>
                </div>
            </motion.div>

            {/* ── Tab Content Container ── */}
            <AnimatePresence mode="wait">
                {activeTab === "fees" ? (
                    <motion.div 
                        key="fees-tab" 
                        className={styles.tableCard} 
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        variants={itemVariants}
                        transition={{ duration: 0.15 }}
                    >
                        <div className={styles.sectionDivider}>
                            <h2>Annual Dues by Year Group</h2>
                        </div>
                        {feesLoading ? (
                            <div className={styles.emptyState}><p>Loading fees...</p></div>
                        ) : fees.length === 0 ? (
                            <div className={styles.emptyState}>
                                <CreditCard size={48} />
                                <h3>No fees set yet</h3>
                                <p>Click "Add Fee" to set dues for a year group.</p>
                            </div>
                        ) : (
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>Year Group</th>
                                        <th>Annual Fee (GH₵)</th>
                                        <th>Description</th>
                                        <th>Last Updated</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {fees.map((fee) => (
                                        <tr key={fee.id}>
                                            <td data-label="Year Group">
                                                <span className={styles.yearBadge}>
                                                    <CreditCard size={13} />
                                                    {fee.year_group}
                                                </span>
                                            </td>
                                            <td data-label="Amount">
                                                <span className={styles.amount}>GH₵ {Number(fee.amount).toLocaleString()}</span>
                                            </td>
                                            <td data-label="Description">
                                                <span className={styles.amountMuted}>{fee.description || "—"}</span>
                                            </td>
                                            <td data-label="Updated">
                                                {fee.updated_at ? new Date(fee.updated_at).toLocaleDateString("en-US", {
                                                    month: "short", day: "numeric", year: "numeric"
                                                }) : "Never"}
                                            </td>
                                            <td data-label="Actions">
                                                <div className={styles.actionCell}>
                                                    <button
                                                        className={styles.actionBtn}
                                                        title="Edit fee"
                                                        onClick={() => openEditFee(fee)}
                                                    >
                                                        <Edit2 size={17} />
                                                    </button>
                                                    <button
                                                        className={`${styles.actionBtn} ${styles.actionBtnDanger}`}
                                                        title="Delete fee"
                                                        onClick={() => handleDeleteFee(fee.id)}
                                                    >
                                                        <Trash2 size={17} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </motion.div>
                ) : (
                    <motion.div 
                        key="payments-tab" 
                        className={styles.tableCard} 
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        variants={itemVariants}
                        transition={{ duration: 0.15 }}
                    >
                        <div className={styles.sectionDivider}>
                            <h2>Member Payment Status</h2>
                            <div className={styles.filtersGroup}>
                                <select
                                    className={styles.filterSelect}
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                >
                                    <option value="all">All Statuses</option>
                                    <option value="paid">Paid</option>
                                    <option value="pending">Pending</option>
                                    <option value="waived">Waived</option>
                                </select>

                                <select
                                    className={styles.filterSelect}
                                    value={yearFilter}
                                    onChange={(e) => setYearFilter(e.target.value)}
                                >
                                    <option value="all">All Year Groups</option>
                                    {Array.from(new Set(fees.map((f) => f.year_group)))
                                        .sort((a, b) => b.localeCompare(a))
                                        .map((year) => (
                                            <option key={year} value={year}>
                                                {year}
                                            </option>
                                        ))}
                                </select>

                                <div className={styles.searchWrapper}>
                                    <Search size={16} />
                                    <input
                                        type="text"
                                        placeholder="Search by name, email..."
                                        className={styles.searchInput}
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        {paymentsLoading ? (
                            <div className={styles.emptyState}><p>Loading payments...</p></div>
                        ) : filteredPayments.length === 0 ? (
                            <div className={styles.emptyState}>
                                <Users size={48} />
                                <h3>No payment records found</h3>
                                <p>Payment records are created automatically for members with a year group once fees are set.</p>
                            </div>
                        ) : (
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>Member</th>
                                        <th>Year Group</th>
                                        <th>Fee Due (GH₵)</th>
                                        <th>Status</th>
                                        <th>Payment Date</th>
                                        <th>Update Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredPayments.map((payment) => (
                                        <tr key={payment.id}>
                                            <td>
                                                <div className={styles.userCell}>
                                                    <div className={styles.avatar}>
                                                        {payment.profiles?.name?.charAt(0)?.toUpperCase() || "?"}
                                                    </div>
                                                    <div className={styles.userInfo}>
                                                        <h4>{payment.profiles?.name || "Unknown"}</h4>
                                                        <p>{payment.profiles?.email || "—"}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td data-label="Year Group">
                                                <span className={styles.yearBadge}>
                                                    {payment.year_group}
                                                </span>
                                            </td>
                                            <td data-label="Fee Due">
                                                <span className={styles.amount}>
                                                    {payment.dues_fees?.amount || payment.amount_paid
                                                        ? `GH₵ ${Number(payment.dues_fees?.amount || payment.amount_paid).toLocaleString()}`
                                                        : <span className={styles.amountMuted} style={{ fontSize: '0.8rem' }}>No Fee Set</span>}
                                                </span>
                                            </td>
                                            <td data-label="Status">
                                                <span className={`${styles.statusBadge} ${statusLabel(payment.payment_status)}`}>
                                                    {payment.payment_status}
                                                </span>
                                            </td>
                                            <td data-label="Payment Date">
                                                {payment.payment_date
                                                    ? new Date(payment.payment_date).toLocaleDateString("en-US", {
                                                        month: "short", day: "numeric", year: "numeric"
                                                    })
                                                    : "—"}
                                            </td>
                                            <td data-label="Update">
                                                <select
                                                    className={styles.statusSelect}
                                                    value={payment.payment_status}
                                                    onChange={(e) =>
                                                        updatePaymentStatus(payment.id, e.target.value as "pending" | "paid" | "waived")
                                                    }
                                                >
                                                    <option value="pending">Pending</option>
                                                    <option value="paid">Paid</option>
                                                    <option value="waived">Waived</option>
                                                </select>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Add / Edit Fee Modal ── */}
            {feeModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <div className={styles.modalHeader}>
                            <h2>{editingFee ? "Edit Fee" : "Add Fee for Year Group"}</h2>
                            <button className={styles.modalClose} onClick={() => setFeeModal(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSaveFee}>
                            <div className={styles.modalBody}>
                                <div className={styles.formGroup}>
                                    <label>Year Group (Graduation Year)</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. 1998"
                                        value={feeForm.year_group}
                                        onChange={(e) => setFeeForm({ ...feeForm, year_group: e.target.value })}
                                        disabled={!!editingFee}
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Annual Dues Amount (GH₵)</label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        step="0.01"
                                        placeholder="e.g. 200.00"
                                        value={feeForm.amount}
                                        onChange={(e) => setFeeForm({ ...feeForm, amount: e.target.value })}
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Description (optional)</label>
                                    <textarea
                                        rows={3}
                                        placeholder="e.g. Annual centenary dues for the 1998 year group"
                                        value={feeForm.description}
                                        onChange={(e) => setFeeForm({ ...feeForm, description: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className={styles.modalFooter}>
                                <button type="button" className={styles.cancelBtn} onClick={() => setFeeModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className={styles.submitBtn} disabled={savingFee}>
                                    <Save size={16} />
                                    {savingFee ? "Saving..." : editingFee ? "Save Changes" : "Add Fee"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* ── Bulk Add Fee Modal ── */}
            {bulkModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <div className={styles.modalHeader}>
                            <h2>Bulk Add Fees</h2>
                            <button className={styles.modalClose} onClick={() => setBulkModal(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleBulkSaveFee}>
                            <div className={styles.modalBody}>
                                <div className={styles.formRow}>
                                    <div className={styles.formGroup}>
                                        <label>Year From</label>
                                        <input
                                            type="number"
                                            required
                                            placeholder="eg.2001"
                                            value={bulkForm.year_from}
                                            onChange={(e) => setBulkForm({ ...bulkForm, year_from: e.target.value })}
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>Year To</label>
                                        <input
                                            type="number"
                                            required
                                            placeholder="eg.2014"
                                            value={bulkForm.year_to}
                                            onChange={(e) => setBulkForm({ ...bulkForm, year_to: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Annual Dues Amount (GH₵)</label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        step="0.01"
                                        placeholder="e.g. 200.00"
                                        value={bulkForm.amount}
                                        onChange={(e) => setBulkForm({ ...bulkForm, amount: e.target.value })}
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Description (optional)</label>
                                    <textarea
                                        rows={2}
                                        placeholder="e.g. Bulk assigned annual dues"
                                        value={bulkForm.description}
                                        onChange={(e) => setBulkForm({ ...bulkForm, description: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className={styles.modalFooter}>
                                <button type="button" className={styles.cancelBtn} onClick={() => setBulkModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className={styles.submitBtn} disabled={bulkSaving}>
                                    <Save size={16} />
                                    {bulkSaving ? "Saving..." : "Apply Bulk Fees"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </motion.div>
    );
}

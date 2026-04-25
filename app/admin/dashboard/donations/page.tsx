"use client";

import { useState, useEffect } from "react";
import {
    Heart,
    Search,
    Download,
    ArrowUpRight,
    Loader2,
    AlertCircle,
    RefreshCw,
    X,
    User,
    Mail,
    Phone,
    Calendar,
    Award,
    Users,
    Eye
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import styles from "./donations.module.css";

interface Donation {
    id: string;
    reference: string;
    donor_name: string;
    maiden_name: string | null;
    year_group: string | null;
    email: string;
    phone: string | null;
    amount: number;
    donation_type: string;
    honour_of: string;
    honour_of_name: string | null;
    recognition: string;
    connection: string;
    status: string;
    created_at: string;
}

export default function DonationsPage() {
    const [donations, setDonations] = useState<Donation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeTab, setActiveTab] = useState("All");
    const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null);

    const fetchDonations = async () => {
        try {
            setLoading(true);
            setError(null);

            const { data, error: fetchError } = await supabase
                .from('donations')
                .select('*')
                .order('created_at', { ascending: false });

            if (fetchError) throw fetchError;
            if (data) setDonations(data);
        } catch (err: any) {
            console.error('Error fetching donations:', err);
            setError(err.message || 'Failed to fetch donations');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDonations();

        const channel = supabase
            .channel('donations-realtime')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'donations' },
                (payload) => {
                    if (payload.eventType === 'INSERT') {
                        setDonations(prev => [payload.new as Donation, ...prev]);
                    } else if (payload.eventType === 'UPDATE') {
                        setDonations(prev => prev.map(d =>
                            d.id === payload.new.id ? payload.new as Donation : d
                        ));
                    } else if (payload.eventType === 'DELETE') {
                        setDonations(prev => prev.filter(d => d.id !== payload.old.id));
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const donationTypes = ["All", "Classroom Sponsorship", "Brick-by-Brick", "Custom Giving"];

    const filteredDonations = donations.filter(d => {
        const matchesTab = activeTab === "All" || d.donation_type === activeTab;
        const matchesSearch = searchQuery === "" ||
            d.donor_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            d.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            d.reference.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesTab && matchesSearch;
    });

    const totalAmount = filteredDonations.reduce((sum, d) => sum + Number(d.amount), 0);

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
                    <h1>Donations</h1>
                    <p>Track all contributions to the school building fund.</p>
                </div>
                <div className={styles.headerTools}>
                    <div className={styles.searchWrapper}>
                        <Search size={18} />
                        <input
                            type="text"
                            placeholder="Search donor, email, ref..."
                            className={styles.searchInput}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <button className={styles.filterBtn} onClick={fetchDonations}>
                        <RefreshCw size={18} />
                        Refresh
                    </button>
                </div>
            </header>

            {/* Summary Cards */}
            <motion.div className={styles.summaryRow} variants={itemVariants}>
                <div className={styles.summaryCard}>
                    <span className={styles.summaryLabel}>TOTAL RAISED</span>
                    <span className={styles.summaryValue}>GH₵{totalAmount.toLocaleString()}</span>
                </div>
                <div className={styles.summaryCard}>
                    <span className={styles.summaryLabel}>TOTAL DONATIONS</span>
                    <span className={styles.summaryValue}>{filteredDonations.length}</span>
                </div>
                <div className={styles.summaryCard}>
                    <span className={styles.summaryLabel}>AVG. DONATION</span>
                    <span className={styles.summaryValue}>
                        GH₵{filteredDonations.length > 0
                            ? Math.round(totalAmount / filteredDonations.length).toLocaleString()
                            : '0'}
                    </span>
                </div>
            </motion.div>

            {/* Tabs */}
            <div className={styles.tabs}>
                {donationTypes.map(tab => (
                    <span
                        key={tab}
                        className={`${styles.tab} ${activeTab === tab ? styles.activeTab : ""}`}
                        onClick={() => setActiveTab(tab)}
                    >
                        {tab}
                    </span>
                ))}
            </div>

            {/* Table */}
            <motion.div className={styles.tableCard} variants={itemVariants}>
                {loading ? (
                    <div className={styles.loadingState}>
                        <Loader2 className={styles.spinner} size={32} />
                        <p>Loading donations...</p>
                    </div>
                ) : error ? (
                    <div className={styles.errorState}>
                        <AlertCircle size={32} />
                        <p>{error}</p>
                        <button onClick={fetchDonations} className={styles.retryBtn}>Try Again</button>
                    </div>
                ) : filteredDonations.length === 0 ? (
                    <div className={styles.emptyState}>
                        <Heart size={48} />
                        <h3>No donations found</h3>
                        <p>{activeTab === "All" ? "No donations have been made yet." : `No ${activeTab} donations.`}</p>
                    </div>
                ) : (
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Donor</th>
                                <th>Type</th>
                                <th>Amount</th>
                                <th>Connection</th>
                                <th>Date</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            <AnimatePresence>
                                {filteredDonations.map((donation) => (
                                    <motion.tr
                                        key={donation.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <td data-label="Donor">
                                            <div className={styles.donorCell}>
                                                <h4>{donation.donor_name}</h4>
                                                <p>{donation.email}</p>
                                            </div>
                                        </td>
                                        <td data-label="Type">
                                            <span className={`${styles.typeBadge} ${
                                                donation.donation_type === 'Classroom Sponsorship' ? styles.typeClassroom :
                                                donation.donation_type === 'Brick-by-Brick' ? styles.typeBrick :
                                                styles.typeCustom
                                            }`}>
                                                {donation.donation_type}
                                            </span>
                                        </td>
                                        <td data-label="Amount" style={{ fontWeight: 700, color: 'var(--burgundy)' }}>
                                            GH₵{Number(donation.amount).toLocaleString()}
                                        </td>
                                        <td data-label="Connection">{donation.connection}</td>
                                        <td data-label="Date">{formatDate(donation.created_at)}</td>
                                        <td data-label="Action">
                                            <button
                                                className={styles.viewBtn}
                                                onClick={() => setSelectedDonation(donation)}
                                            >
                                                Details <ArrowUpRight size={14} />
                                            </button>
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        </tbody>
                    </table>
                )}
            </motion.div>

            {/* Details Modal */}
            <AnimatePresence>
                {selectedDonation && (
                    <motion.div
                        className={styles.modalOverlay}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedDonation(null)}
                    >
                        <motion.div
                            className={styles.modal}
                            initial={{ opacity: 0, y: 40, scale: 0.97 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 40, scale: 0.97 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className={styles.modalHeader}>
                                <div>
                                    <span className={`${styles.typeBadge} ${
                                        selectedDonation.donation_type === 'Classroom Sponsorship' ? styles.typeClassroom :
                                        selectedDonation.donation_type === 'Brick-by-Brick' ? styles.typeBrick :
                                        styles.typeCustom
                                    }`}>
                                        {selectedDonation.donation_type}
                                    </span>
                                    <h2 className={styles.modalTitle}>
                                        GH₵{Number(selectedDonation.amount).toLocaleString()}
                                    </h2>
                                    <p className={styles.modalRef}>REF: {selectedDonation.reference}</p>
                                </div>
                                <button className={styles.modalClose} onClick={() => setSelectedDonation(null)}>
                                    <X size={20} />
                                </button>
                            </div>

                            <div className={styles.modalBody}>
                                <div className={styles.detailSection}>
                                    <h3 className={styles.detailSectionTitle}>Donor Information</h3>
                                    <div className={styles.detailGrid}>
                                        <div className={styles.detailItem}>
                                            <User size={16} />
                                            <div>
                                                <span className={styles.detailLabel}>Full Name</span>
                                                <span className={styles.detailValue}>{selectedDonation.donor_name}</span>
                                            </div>
                                        </div>
                                        {selectedDonation.maiden_name && (
                                            <div className={styles.detailItem}>
                                                <User size={16} />
                                                <div>
                                                    <span className={styles.detailLabel}>Maiden Name</span>
                                                    <span className={styles.detailValue}>{selectedDonation.maiden_name}</span>
                                                </div>
                                            </div>
                                        )}
                                        <div className={styles.detailItem}>
                                            <Mail size={16} />
                                            <div>
                                                <span className={styles.detailLabel}>Email</span>
                                                <span className={styles.detailValue}>{selectedDonation.email}</span>
                                            </div>
                                        </div>
                                        {selectedDonation.phone && (
                                            <div className={styles.detailItem}>
                                                <Phone size={16} />
                                                <div>
                                                    <span className={styles.detailLabel}>Phone</span>
                                                    <span className={styles.detailValue}>{selectedDonation.phone}</span>
                                                </div>
                                            </div>
                                        )}
                                        {selectedDonation.year_group && (
                                            <div className={styles.detailItem}>
                                                <Calendar size={16} />
                                                <div>
                                                    <span className={styles.detailLabel}>Year Group</span>
                                                    <span className={styles.detailValue}>{selectedDonation.year_group}</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className={styles.detailSection}>
                                    <h3 className={styles.detailSectionTitle}>Donation Details</h3>
                                    <div className={styles.detailGrid}>
                                        <div className={styles.detailItem}>
                                            <Award size={16} />
                                            <div>
                                                <span className={styles.detailLabel}>In Honour Of</span>
                                                <span className={styles.detailValue}>
                                                    {selectedDonation.honour_of}
                                                    {selectedDonation.honour_of_name && ` — ${selectedDonation.honour_of_name}`}
                                                </span>
                                            </div>
                                        </div>
                                        <div className={styles.detailItem}>
                                            <Eye size={16} />
                                            <div>
                                                <span className={styles.detailLabel}>Recognition</span>
                                                <span className={styles.detailValue}>{selectedDonation.recognition}</span>
                                            </div>
                                        </div>
                                        <div className={styles.detailItem}>
                                            <Users size={16} />
                                            <div>
                                                <span className={styles.detailLabel}>Connection</span>
                                                <span className={styles.detailValue}>{selectedDonation.connection}</span>
                                            </div>
                                        </div>
                                        <div className={styles.detailItem}>
                                            <Calendar size={16} />
                                            <div>
                                                <span className={styles.detailLabel}>Date & Time</span>
                                                <span className={styles.detailValue}>
                                                    {formatDate(selectedDonation.created_at)} at {formatTime(selectedDonation.created_at)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

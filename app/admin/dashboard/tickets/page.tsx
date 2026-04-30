"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
    Ticket,
    Search,
    Download,
    Loader2,
    AlertCircle,
    RefreshCw,
    Package
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { exportToExcel, exportToPDF } from "@/lib/exportUtils";
import styles from "../orders/orders.module.css"; // Reuse orders styles for consistency

interface TicketRecord {
    id: string;
    ticket_type_id: string;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    payment_reference: string;
    payment_status: string;
    ticket_code: string;
    created_at: string;
    ticket_types?: {
        name: string;
        price: number;
    }
}

export default function TicketsPage() {
    const [tickets, setTickets] = useState<TicketRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [page, setPage] = useState(0);
    const pageRef = useRef(0);
    const [hasMore, setHasMore] = useState(true);
    const PAGE_SIZE = 20;

    const fetchTickets = useCallback(async (isLoadMore = false) => {
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
                .from('tickets')
                .select('*, ticket_types(name, price)')
                .order('created_at', { ascending: false })
                .range(start, end);

            if (fetchError) throw fetchError;

            if (data) {
                if (isLoadMore) {
                    setTickets(prev => [...prev, ...data]);
                    setPage(currentPage);
                    pageRef.current = currentPage;
                } else {
                    setTickets(data);
                }
                setHasMore(data.length === PAGE_SIZE);
            }
        } catch (err: any) {
            console.error('Error fetching tickets:', err);
            setError(err.message || 'Failed to fetch tickets');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTickets();
    }, [fetchTickets]);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const filteredTickets = tickets.filter(ticket => {
        const matchesSearch = searchQuery === "" ||
            ticket.ticket_code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            ticket.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            ticket.customer_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            ticket.payment_reference.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesSearch;
    });

    const handleExport = (type: 'excel' | 'pdf') => {
        if (tickets.length === 0) {
            alert("No data to export");
            return;
        }

        if (type === 'excel') {
            const exportData = tickets.map(ticket => ({
                Ticket_Code: ticket.ticket_code,
                Event: ticket.ticket_types?.name,
                Customer_Name: ticket.customer_name,
                Customer_Email: ticket.customer_email,
                Customer_Phone: ticket.customer_phone,
                Price: ticket.ticket_types?.price,
                Payment_Ref: ticket.payment_reference,
                Status: ticket.payment_status,
                Date: new Date(ticket.created_at).toLocaleString()
            }));
            exportToExcel(exportData, `tickets_report_${new Date().getTime()}`);
        } else {
            const headers = ['Code', 'Event', 'Customer', 'Status', 'Date'];
            const data = tickets.map(ticket => [
                ticket.ticket_code,
                ticket.ticket_types?.name,
                ticket.customer_name,
                ticket.payment_status,
                new Date(ticket.created_at).toLocaleDateString()
            ]);
            exportToPDF(headers, data, `tickets_report_${new Date().getTime()}`, 'Event Tickets Report');
        }
    };

    return (
        <motion.div
            className={styles.container}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            <header className={styles.header}>
                <div className={styles.headerTitle}>
                    <h1>Ticket Management</h1>
                    <p>Manage and track event ticket sales and attendees.</p>
                </div>
                <div className={styles.headerTools}>
                    <div className={styles.searchWrapper}>
                        <Search size={18} />
                        <input
                            type="text"
                            placeholder="Search code, customer, ref..."
                            className={styles.searchInput}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <button className={styles.filterBtn} onClick={() => fetchTickets(false)}>
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

            <motion.div className={styles.tableCard}>
                {loading ? (
                    <div className={styles.loadingState}>
                        <Loader2 className={styles.spinner} size={32} />
                        <p>Loading tickets...</p>
                    </div>
                ) : error ? (
                    <div className={styles.errorState}>
                        <AlertCircle size={32} />
                        <p>{error}</p>
                        <button onClick={() => fetchTickets(false)} className={styles.retryBtn}>Try Again</button>
                    </div>
                ) : filteredTickets.length === 0 ? (
                    <div className={styles.emptyState}>
                        <Package size={48} />
                        <h3>No tickets found</h3>
                        <p>No tickets have been purchased yet.</p>
                    </div>
                ) : (
                    <div className={styles.tableWrapper}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Ticket Code</th>
                                    <th>Attendee</th>
                                    <th>Event</th>
                                    <th>Payment Ref</th>
                                    <th>Status</th>
                                    <th>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                <AnimatePresence>
                                    {filteredTickets.map((ticket) => (
                                        <motion.tr
                                            key={ticket.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                        >
                                            <td data-label="Ticket Code">
                                                <h3>{ticket.ticket_code || 'N/A'}</h3>
                                            </td>
                                            <td data-label="Attendee">
                                                <div className={styles.customerCell}>
                                                    <h4>{ticket.customer_name}</h4>
                                                    <p>{ticket.customer_email}</p>
                                                </div>
                                            </td>
                                            <td data-label="Event">
                                                <p>{ticket.ticket_types?.name}</p>
                                                <p style={{ fontSize: '0.8rem', color: '#666' }}>
                                                    GHS {ticket.ticket_types?.price.toLocaleString()}
                                                </p>
                                            </td>
                                            <td data-label="Payment Ref">
                                                <code style={{ fontSize: '0.8rem' }}>{ticket.payment_reference}</code>
                                            </td>
                                            <td data-label="Status">
                                                <span className={`${styles.statusBadge} ${ticket.payment_status === 'success' || ticket.payment_status === 'completed' ? styles.statusPaid : styles.statusPending}`}>
                                                    {ticket.payment_status}
                                                </span>
                                            </td>
                                            <td data-label="Date">{formatDate(ticket.created_at)}</td>
                                        </motion.tr>
                                    ))}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    </div>
                )}

                {hasMore && !loading && filteredTickets.length >= PAGE_SIZE && (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '1.5rem', borderTop: '1px solid #f3f4f6' }}>
                        <button 
                            onClick={() => fetchTickets(true)} 
                            className={styles.viewBtn}
                        >
                            Load More Tickets
                        </button>
                    </div>
                )}
            </motion.div>
        </motion.div>
    );
}

"use client";

import { useState, useEffect } from "react";
import {
    Mail,
    Search,
    Trash2,
    Send,
    Users,
    AlertCircle,
    Info,
    CheckCircle
} from "lucide-react";
import { motion } from "framer-motion";
import styles from "./alumni-family.module.css";

export default function AlumniFamilyPage() {
    const [subscribers, setSubscribers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    
    // Broadcast Form State
    const [subject, setSubject] = useState("");
    const [message, setMessage] = useState("");
    const [sending, setSending] = useState(false);
    const [status, setStatus] = useState<{type: 'success' | 'error', text: string} | null>(null);

    useEffect(() => {
        fetchSubscribers();
    }, []);

    async function fetchSubscribers() {
        try {
            setLoading(true);
            const res = await fetch('/api/admin/subscribers');
            const data = await res.json();
            if (data.subscribers) {
                setSubscribers(data.subscribers);
            }
        } catch (error) {
            console.error('Error fetching subscribers:', error);
        } finally {
            setLoading(false);
        }
    }

    const handleDelete = async (id: string, email: string) => {
        if (!window.confirm(`Are you sure you want to remove ${email} from the Alumni Family?`)) return;

        try {
            const res = await fetch('/api/admin/subscribers', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id }),
            });

            if (res.ok) {
                setSubscribers(subscribers.filter(s => s.id !== id));
            } else {
                alert("Failed to delete subscriber");
            }
        } catch (error) {
            console.error('Delete error:', error);
        }
    };

    const handleSendBroadcast = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!subject || !message) return;

        if (!window.confirm(`Are you sure you want to send this broadcast to all ${subscribers.length} members?`)) return;

        setSending(true);
        setStatus(null);

        try {
            const res = await fetch('/api/admin/bulk-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ subject, message }),
            });

            const data = await res.json();

            if (res.ok) {
                setStatus({ type: 'success', text: data.message });
                setSubject("");
                setMessage("");
            } else {
                throw new Error(data.error || "Failed to send broadcast");
            }
        } catch (error: any) {
            setStatus({ type: 'error', text: error.message });
        } finally {
            setSending(false);
        }
    };

    const filteredSubscribers = subscribers.filter(s =>
        s.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
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
                    <h1>CTKIS Alumni Family</h1>
                    <p>Manage community members and send email broadcasts.</p>
                </div>
                <div className={styles.headerTools}>
                    <div className={styles.searchWrapper}>
                        <Search size={18} />
                        <input 
                            type="text" 
                            placeholder="Search by email..." 
                            className={styles.searchInput}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </header>

            <div className={styles.grid}>
                <motion.div className={styles.tableCard} variants={itemVariants}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Subscriber</th>
                                <th>Joined Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={3} style={{ textAlign: 'center', padding: '3rem' }}>Loading subscribers...</td>
                                </tr>
                            ) : filteredSubscribers.length === 0 ? (
                                <tr>
                                    <td colSpan={3} style={{ textAlign: 'center', padding: '3rem' }}>No members found.</td>
                                </tr>
                            ) : (
                                filteredSubscribers.map((s) => (
                                    <tr key={s.id}>
                                        <td>
                                            <div className={styles.subscriberCell}>
                                                <div className={styles.avatar}>
                                                    {s.email.charAt(0).toUpperCase()}
                                                </div>
                                                <div className={styles.emailInfo}>
                                                    <h4>{s.email}</h4>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            {new Date(s.created_at).toLocaleDateString(undefined, {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </td>
                                        <td>
                                            <button 
                                                className={styles.actionBtn} 
                                                onClick={() => handleDelete(s.id, s.email)}
                                                title="Remove Member"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </motion.div>

                <motion.div className={styles.broadcastCard} variants={itemVariants}>
                    <h2><Send size={24} color="var(--burgundy)" /> Email Broadcast</h2>
                    <p style={{ fontSize: '0.9rem', color: 'var(--muted-foreground)', marginBottom: '1.5rem' }}>
                        Send a message to all <strong>{subscribers.length}</strong> verified members of the Alumni Family.
                    </p>

                    <form onSubmit={handleSendBroadcast}>
                        <div className={styles.formGroup}>
                            <label>Email Subject</label>
                            <input 
                                type="text" 
                                placeholder="e.g. New Alumni Merchandise Collection Out Now!" 
                                value={subject}
                                onChange={e => setSubject(e.target.value)}
                                required
                                disabled={sending}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Message Body</label>
                            <textarea 
                                rows={8} 
                                placeholder="Write your message here..." 
                                value={message}
                                onChange={e => setMessage(e.target.value)}
                                required
                                disabled={sending}
                            />
                        </div>

                        {status && (
                            <div style={{ 
                                padding: '1rem', 
                                borderRadius: '0.5rem', 
                                marginBottom: '1.5rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                backgroundColor: status.type === 'success' ? '#ecfdf5' : '#fef2f2',
                                color: status.type === 'success' ? '#065f46' : '#991b1b',
                                border: `1px solid ${status.type === 'success' ? '#a7f3d0' : '#fecaca'}`
                            }}>
                                {status.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                                <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{status.text}</span>
                            </div>
                        )}

                        <button 
                            type="submit" 
                            className={styles.sendBtn}
                            disabled={sending || subscribers.length === 0}
                        >
                            {sending ? 'SENDING BROADCAST...' : 'SEND BROADCAST TO ALL MEMBERS'}
                        </button>
                    </form>

                    <div className={styles.statsGrid}>
                        <div className={styles.statItem}>
                            <span className={styles.statValue}>{subscribers.length}</span>
                            <span className={styles.statLabel}>Total Members</span>
                        </div>
                    </div>

                    <div style={{ marginTop: '2rem', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                        <Info size={16} color="var(--muted-foreground)" style={{ marginTop: '2px', flexShrink: 0 }} />
                        <p style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', lineHeight: 1.5 }}>
                            Email broadcasts are delivered immediately. Use this responsibly to maintain community engagement.
                        </p>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
}

"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import {
    User,
    Bell,
    Shield,
    Store,
    Save,
    Loader2
} from "lucide-react";
import { motion } from "framer-motion";
import styles from "./settings.module.css";

export default function SettingsPage() {
    const [activeSection, setActiveSection] = useState("Profile");
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [notificationEmail, setNotificationEmail] = useState("");
    const [message, setMessage] = useState({ type: "", text: "" });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            setFetching(true);
            const { data, error } = await supabase
                .from('site_settings')
                .select('*')
                .eq('key', 'admin_notification_email')
                .single();

            if (data) {
                setNotificationEmail(data.value);
            } else if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
                console.error('Error fetching settings:', error);
            }
        } catch (error) {
            console.error('Failed to fetch settings:', error);
        } finally {
            setFetching(false);
        }
    };

    const handleSaveNotificationEmail = async () => {
        try {
            setLoading(true);
            setMessage({ type: "", text: "" });
            
            const { error } = await supabase
                .from('site_settings')
                .upsert({ 
                    key: 'admin_notification_email', 
                    value: notificationEmail 
                }, { onConflict: 'key' });

            if (!error) {
                setMessage({ type: "success", text: "Notification email updated successfully!" });
            } else {
                console.error('Error updating setting:', error);
                setMessage({ type: "error", text: error.message || "Failed to update email." });
            }
        } catch (error) {
            setMessage({ type: "error", text: "Something went wrong. Please try again." });
        } finally {
            setLoading(false);
        }
    };

    const sections = [
        { id: "Profile", icon: <User size={20} /> },
        { id: "Store Settings", icon: <Store size={20} /> },
        { id: "Notifications", icon: <Bell size={20} /> },
        { id: "Security", icon: <Shield size={20} /> },
    ];

    return (
        <motion.div
            className={styles.container}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            <header className={styles.header}>
                <h1>Account Settings</h1>
                <p>Manage your account preferences and store configuration.</p>
            </header>

            <div className={styles.grid}>
                <aside className={styles.sidebar}>
                    <nav>
                        {sections.map(section => (
                            <button
                                key={section.id}
                                className={`${styles.navBtn} ${activeSection === section.id ? styles.activeNav : ""}`}
                                onClick={() => setActiveSection(section.id)}
                            >
                                {section.icon}
                                {section.id}
                            </button>
                        ))}
                    </nav>
                </aside>

                <main className={styles.content}>
                    {activeSection === "Profile" && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                        >
                            <div className={styles.section}>
                                <h2 className={styles.sectionTitle}>Profile Information</h2>
                                <div className={styles.formGroup}>
                                    <label>Full Name</label>
                                    <input type="text" defaultValue="Administrator" />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Email Address</label>
                                    <input type="email" defaultValue="admin@oaa.org.gh" />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Bio / Role</label>
                                    <textarea rows={4} defaultValue="Managing the official OAA Store and Alumni Relations." />
                                </div>
                            </div>
                            <button className={styles.saveBtn}>Save Changes</button>
                        </motion.div>
                    )}

                    {activeSection === "Store Settings" && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                        >
                            <div className={styles.section}>
                                <h2 className={styles.sectionTitle}>Store Configuration</h2>
                                <div className={styles.formGroup}>
                                    <label>Store Name</label>
                                    <input type="text" defaultValue="OAA Official Store" />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Currency</label>
                                    <select defaultValue="GHS">
                                        <option value="GHS">Ghana Cedi (GHS)</option>
                                        <option value="USD">US Dollar ($)</option>
                                    </select>
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Contact Email</label>
                                    <input type="email" defaultValue="shop@oaa.org.gh" />
                                </div>
                            </div>
                            <button className={styles.saveBtn}>Update Store</button>
                        </motion.div>
                    )}

                    {activeSection === "Notifications" && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                        >
                            <div className={styles.section}>
                                <h2 className={styles.sectionTitle}>Email Notifications</h2>
                                <p className={styles.sectionDesc}>
                                    Set the email address that will receive order confirmations, low stock alerts, and system notifications.
                                </p>
                                
                                <div className={styles.formGroup}>
                                    <label>Notification Recipient Email</label>
                                    <div className={styles.inputWithIcon}>
                                        <input 
                                            type="email" 
                                            value={notificationEmail} 
                                            onChange={(e) => setNotificationEmail(e.target.value)}
                                            placeholder="e.g. admin@example.com"
                                            disabled={fetching || loading}
                                        />
                                        {fetching && <Loader2 className={styles.spinner} size={18} />}
                                    </div>
                                    <span className={styles.helpText}>
                                        This email is used for all automated system alerts.
                                    </span>
                                </div>

                                {message.text && (
                                    <div className={`${styles.alert} ${message.type === 'success' ? styles.success : styles.error}`}>
                                        {message.text}
                                    </div>
                                )}
                            </div>
                            <button 
                                className={styles.saveBtn} 
                                onClick={handleSaveNotificationEmail}
                                disabled={loading || fetching}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className={styles.spin} size={18} />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save size={18} />
                                        Save Notification Settings
                                    </>
                                )}
                            </button>
                        </motion.div>
                    )}

                    {activeSection === "Security" && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                        >
                            <div className={styles.section}>
                                <h2 className={styles.sectionTitle}>Security & Password</h2>
                                <div className={styles.formGroup}>
                                    <label>Current Password</label>
                                    <input type="password" />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>New Password</label>
                                    <input type="password" />
                                </div>
                            </div>
                            <button className={styles.saveBtn}>Change Password</button>

                            <div className={styles.section} style={{ marginTop: '4rem' }}>
                                <h2 className={styles.sectionTitle} style={{ color: '#ef4444' }}>Danger Zone</h2>
                                <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1.5rem' }}>
                                    Technically, this will sign you out and deactivate your admin privileges.
                                </p>
                                <button className={styles.dangerBtn}>Deactivate Account</button>
                            </div>
                        </motion.div>
                    )}
                </main>
            </div>
        </motion.div>
    );
}

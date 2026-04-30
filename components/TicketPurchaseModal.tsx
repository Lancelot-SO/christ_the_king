"use client";

import { useState, useEffect } from "react";
import { X, Loader2, User, Mail, Phone, Ticket } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import PaymentButton from "./PaymentButton";
import styles from "./TicketPurchaseModal.module.css";

interface TicketPurchaseModalProps {
    isOpen: boolean;
    onClose: () => void;
    eventTitle: string;
    price: number;
}

export default function TicketPurchaseModal({ isOpen, onClose, eventTitle, price }: TicketPurchaseModalProps) {
    const { user } = useAuth();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [ticketCode, setTicketCode] = useState("");

    useEffect(() => {
        if (user) {
            setName(user.user_metadata?.full_name || "");
            setEmail(user.email || "");
        }
    }, [user, isOpen]);

    const paystackConfig = {
        reference: (new Date()).getTime().toString(),
        email: email,
        amount: price * 100, // Paystack amount is in kobo/pesewas
        currency: "GHS",
        publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
        metadata: {
            custom_fields: [
                {
                    display_name: "Customer Name",
                    variable_name: "customer_name",
                    value: name
                },
                {
                    display_name: "Event",
                    variable_name: "event",
                    value: eventTitle
                }
            ]
        }
    };

    const handleSuccess = async (reference: any) => {
        setLoading(true);
        try {
            const generatedCode = `CTKIS-70-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
            setTicketCode(generatedCode);

            // Call API to save ticket and send emails
            const response = await fetch('/api/tickets', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customer_name: name,
                    customer_email: email,
                    customer_phone: phone,
                    payment_reference: reference.reference,
                    event_title: eventTitle,
                    price: price,
                    ticket_code: generatedCode
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to process ticket');
            }

            setSuccess(true);
        } catch (err: any) {
            console.error("Error saving ticket:", err);
            alert("Payment successful but there was an error saving your ticket: " + err.message + ". Please contact support with your reference: " + reference.reference);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className={styles.overlay} onClick={onClose}>
                <motion.div
                    className={styles.modal}
                    onClick={e => e.stopPropagation()}
                    initial={{ opacity: 0, y: 50, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 50, scale: 0.9 }}
                >
                    <button className={styles.closeBtn} onClick={onClose}><X size={24} /></button>

                    {!success ? (
                        <>
                            <div className={styles.modalHeader}>
                                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                                    <Ticket color="var(--gold)" size={48} />
                                </div>
                                <h2>Get Your Ticket</h2>
                                <p>{eventTitle}</p>
                            </div>

                            <div className={styles.ticketSummary}>
                                <div className={styles.summaryItem}>
                                    <span>Ticket Price</span>
                                    <strong>GHS {price.toLocaleString()}</strong>
                                </div>
                            </div>

                            <form className={styles.form} onSubmit={e => e.preventDefault()}>
                                <div className={styles.inputGroup}>
                                    <label><User size={16} /> Full Name</label>
                                    <input
                                        type="text"
                                        placeholder="Enter your name"
                                        value={name}
                                        onChange={e => setName(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className={styles.inputGroup}>
                                    <label><Mail size={16} /> Email Address</label>
                                    <input
                                        type="email"
                                        placeholder="Enter your email"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className={styles.inputGroup}>
                                    <label><Phone size={16} /> Phone Number (Optional)</label>
                                    <input
                                        type="tel"
                                        placeholder="Enter your phone number"
                                        value={phone}
                                        onChange={e => setPhone(e.target.value)}
                                    />
                                </div>

                                <div className={styles.actions}>
                                    <PaymentButton
                                        config={paystackConfig}
                                        onSuccess={handleSuccess}
                                        onClose={() => setLoading(false)}
                                        loading={loading}
                                        setLoading={setLoading}
                                        styles={styles}
                                        label={<span>Pay GHS {price.toLocaleString()}</span>}
                                        skipCartCheck={true}
                                    />
                                </div>
                            </form>
                        </>
                    ) : (
                        <div className={styles.successState}>
                            <div className={styles.successIcon}>✓</div>
                            <h2>Payment Successful!</h2>
                            <p>Your ticket has been confirmed.</p>
                            <div className={styles.ticketCodeBox}>
                                <span>TICKET CODE</span>
                                <h3>{ticketCode}</h3>
                            </div>
                            <p className={styles.emailNote}>A confirmation has been sent to {email}.</p>
                            <button className="btn btn-primary" onClick={onClose} style={{ width: '100%' }}>
                                Close
                            </button>
                        </div>
                    )}
                </motion.div>
            </div>
        </AnimatePresence>
    );
}

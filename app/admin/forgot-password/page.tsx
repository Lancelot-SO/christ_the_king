"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Mail } from "lucide-react";
import { supabase } from "@/lib/supabase";
import styles from "../login/login.module.css"; // Reuse login styles

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/admin/reset-password`,
            });

            if (error) throw error;
            setSuccess(true);
        } catch (error: any) {
            alert(error.message || "Error sending recovery email");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.loginCard}>
                <div className={styles.header}>
                    <Image src="/logo.png" alt="Christ the King Logo" width={80} height={80} />
                    <h1>Recovery</h1>
                    <p>Enter your email to reset your password</p>
                </div>

                {success ? (
                    <div className={styles.successState} style={{ textAlign: "center", padding: "2rem 0" }}>
                        <div style={{ background: "#dcfce7", color: "#166534", width: "60px", height: "60px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem" }}>
                            <Mail size={32} />
                        </div>
                        <h3 style={{ marginBottom: "0.5rem" }}>Check your email</h3>
                        <p style={{ color: "#6b7280", marginBottom: "2rem" }}>
                            We've sent password reset instructions to <strong>{email}</strong>
                        </p>
                        <Link href="/admin/login" className={styles.loginBtn} style={{ textDecoration: "none", display: "inline-block" }}>
                            Back to Login
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={handleReset} className={styles.form}>
                        <div className={styles.inputGroup}>
                            <label>Email Address</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="admin@christtheking.edu.gh"
                            />
                        </div>
                        
                        <button type="submit" className={styles.loginBtn} disabled={loading}>
                            {loading ? "Sending Link..." : "Send Reset Link"}
                        </button>

                        <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
                            <Link href="/admin/login" style={{ color: "#6b7280", textDecoration: "none", fontSize: "0.9rem", display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
                                <ArrowLeft size={14} /> Back to Login
                            </Link>
                        </div>
                    </form>
                )}

                {!success && (
                    <div className={styles.footer}>
                        <p>&copy; 2027 Christ the King School</p>
                    </div>
                )}
            </div>
        </div>
    );
}

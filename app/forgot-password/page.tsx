"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import styles from "./forgot-password.module.css";
import { ArrowLeft, Mail, CheckCircle } from "lucide-react";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState("");
    const [resendCooldown, setResendCooldown] = useState(0);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password`,
            });

            if (error) {
                setError(error.message);
                return;
            }

            setSent(true);
            startResendCooldown();
        } catch {
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const startResendCooldown = () => {
        setResendCooldown(60);
        const interval = setInterval(() => {
            setResendCooldown((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const handleResend = async () => {
        if (resendCooldown > 0) return;
        setLoading(true);
        setError("");
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password`,
            });
            if (error) {
                setError(error.message);
            } else {
                startResendCooldown();
            }
        } catch {
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                {!sent ? (
                    <>
                        <div className={styles.header}>
                            <div className={styles.iconWrap}>
                                <Mail size={32} />
                            </div>
                            <h1>Forgot Password?</h1>
                            <p>
                                No worries! Enter your email address below and we&apos;ll send
                                you a link to reset your password.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className={styles.form}>
                            {error && <div className={styles.errorMessage}>{error}</div>}

                            <div className={styles.inputGroup}>
                                <label htmlFor="email">Email Address</label>
                                <input
                                    id="email"
                                    type="email"
                                    required
                                    autoFocus
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="your@email.com"
                                />
                            </div>

                            <button
                                type="submit"
                                className={styles.submitBtn}
                                disabled={loading}
                            >
                                {loading ? "Sending..." : "Send Reset Link"}
                            </button>
                        </form>

                        <div className={styles.footer}>
                            <Link href="/login" className={styles.link}>
                                <ArrowLeft size={16} />
                                Back to Sign In
                            </Link>
                        </div>
                    </>
                ) : (
                    <>
                        <div className={styles.successState}>
                            <div className={styles.successIcon}>
                                <CheckCircle size={36} />
                            </div>
                            <h2>Check Your Email</h2>
                            <p>
                                We&apos;ve sent a password reset link to{" "}
                                <span className={styles.emailHighlight}>{email}</span>.
                            </p>
                            <p>
                                Click the link in the email to create a new password. The link
                                expires in 1 hour.
                            </p>

                            <p className={styles.resendText}>
                                Didn&apos;t receive the email?{" "}
                                <button
                                    onClick={handleResend}
                                    className={styles.resendBtn}
                                    disabled={resendCooldown > 0 || loading}
                                >
                                    {resendCooldown > 0
                                        ? `Resend in ${resendCooldown}s`
                                        : "Resend email"}
                                </button>
                            </p>

                            {error && (
                                <div
                                    className={styles.errorMessage}
                                    style={{ marginTop: "1rem" }}
                                >
                                    {error}
                                </div>
                            )}
                        </div>

                        <div className={styles.footer}>
                            <Link href="/login" className={styles.link}>
                                <ArrowLeft size={16} />
                                Back to Sign In
                            </Link>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

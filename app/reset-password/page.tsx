"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import styles from "./reset-password.module.css";
import {
    KeyRound,
    Eye,
    EyeOff,
    CheckCircle,
    AlertCircle,
    ArrowLeft,
} from "lucide-react";

function getPasswordStrength(password: string): {
    score: number;
    label: string;
    color: "weak" | "fair" | "good" | "strong" | "";
} {
    if (!password) return { score: 0, label: "", color: "" };
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 1) return { score: 1, label: "Weak", color: "weak" };
    if (score === 2) return { score: 2, label: "Fair", color: "fair" };
    if (score === 3) return { score: 3, label: "Good", color: "good" };
    return { score: 4, label: "Strong", color: "strong" };
}

function ResetPasswordForm() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [sessionReady, setSessionReady] = useState<boolean | null>(null);

    // Supabase sends the token via the URL hash fragment (#access_token=...).
    // The Supabase JS client automatically picks it up on load via onAuthStateChange.
    useEffect(() => {
        const { data: listener } = supabase.auth.onAuthStateChange(
            (event, session) => {
                if (event === "PASSWORD_RECOVERY") {
                    // Session is ready; user can now update their password
                    setSessionReady(true);
                } else if (event === "SIGNED_IN" && session) {
                    // Some Supabase versions fire SIGNED_IN instead
                    setSessionReady(true);
                }
            }
        );

        // If there's already a session (user re-opened the page), check it
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) setSessionReady(true);
        });

        return () => listener.subscription.unsubscribe();
    }, []);

    // If after 3 seconds we still have no session, assume invalid/expired link
    useEffect(() => {
        if (sessionReady === null) {
            const timer = setTimeout(() => {
                setSessionReady(false);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [sessionReady]);

    const strength = getPasswordStrength(password);
    const passwordsMatch = confirmPassword && password === confirmPassword;
    const passwordMismatch = confirmPassword && password !== confirmPassword;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }
        if (password.length < 8) {
            setError("Password must be at least 8 characters.");
            return;
        }
        setLoading(true);
        setError("");

        try {
            const { error } = await supabase.auth.updateUser({ password });
            if (error) {
                setError(error.message);
                return;
            }
            setSuccess(true);
            // Auto-redirect to login after 3 seconds
            setTimeout(() => router.push("/login"), 3000);
        } catch {
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // --- Render states ---

    if (sessionReady === null) {
        return (
            <div className={styles.card}>
                <div className={styles.header} style={{ marginBottom: 0, paddingBottom: "1rem" }}>
                    <div className={styles.iconWrap}>
                        <KeyRound size={32} />
                    </div>
                    <h1>Verifying link…</h1>
                    <p>Please wait while we verify your reset link.</p>
                </div>
            </div>
        );
    }

    if (sessionReady === false) {
        return (
            <div className={styles.card}>
                <div className={styles.invalidState}>
                    <div className={styles.invalidIcon}>
                        <AlertCircle size={36} />
                    </div>
                    <h2>Link Expired or Invalid</h2>
                    <p>
                        This password reset link has expired or is no longer valid. Reset
                        links are only valid for 1 hour.
                    </p>
                    <Link href="/forgot-password" className={styles.loginBtn}>
                        Request a New Link
                    </Link>
                </div>
                <div className={styles.footer}>
                    <Link href="/login" className={styles.link}>
                        <ArrowLeft size={16} />
                        Back to Sign In
                    </Link>
                </div>
            </div>
        );
    }

    if (success) {
        return (
            <div className={styles.card}>
                <div className={styles.successState}>
                    <div className={styles.successIcon}>
                        <CheckCircle size={36} />
                    </div>
                    <h2>Password Updated!</h2>
                    <p>
                        Your password has been successfully reset. You can now sign in with
                        your new password.
                    </p>
                    <Link href="/login" className={styles.loginBtn}>
                        Go to Sign In
                    </Link>
                </div>
            </div>
        );
    }

    // Main form
    return (
        <div className={styles.card}>
            <div className={styles.header}>
                <div className={styles.iconWrap}>
                    <KeyRound size={32} />
                </div>
                <h1>Set New Password</h1>
                <p>Choose a strong password for your account.</p>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
                {error && <div className={styles.errorMessage}>{error}</div>}

                {/* New Password */}
                <div className={styles.inputGroup}>
                    <label htmlFor="password">New Password</label>
                    <div className={styles.inputWrapper}>
                        <input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            required
                            autoFocus
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            minLength={8}
                        />
                        <button
                            type="button"
                            className={styles.eyeBtn}
                            onClick={() => setShowPassword((v) => !v)}
                            aria-label="Toggle password visibility"
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>

                    {/* Strength bar */}
                    {password && (
                        <>
                            <div className={styles.strengthBar}>
                                {[1, 2, 3, 4].map((i) => (
                                    <div
                                        key={i}
                                        className={`${styles.strengthSegment} ${
                                            i <= strength.score ? styles[strength.color] : ""
                                        }`}
                                    />
                                ))}
                            </div>
                            <span className={styles.strengthLabel}>
                                Strength: {strength.label}
                            </span>
                        </>
                    )}
                    <span className={styles.hint}>Minimum 8 characters</span>
                </div>

                {/* Confirm Password */}
                <div className={styles.inputGroup}>
                    <label htmlFor="confirm-password">Confirm New Password</label>
                    <div className={styles.inputWrapper}>
                        <input
                            id="confirm-password"
                            type={showConfirm ? "text" : "password"}
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="••••••••"
                        />
                        <button
                            type="button"
                            className={styles.eyeBtn}
                            onClick={() => setShowConfirm((v) => !v)}
                            aria-label="Toggle confirm password visibility"
                        >
                            {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                    {passwordMismatch && (
                        <span className={styles.hintError}>Passwords do not match</span>
                    )}
                    {passwordsMatch && (
                        <span className={styles.hint} style={{ color: "#16a34a" }}>
                            ✓ Passwords match
                        </span>
                    )}
                </div>

                <button
                    type="submit"
                    className={styles.submitBtn}
                    disabled={loading || !!passwordMismatch}
                >
                    {loading ? "Updating..." : "Update Password"}
                </button>
            </form>

            <div className={styles.footer}>
                <Link href="/login" className={styles.link}>
                    <ArrowLeft size={16} />
                    Back to Sign In
                </Link>
            </div>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <div className={styles.container}>
            <Suspense
                fallback={
                    <div className={styles.card}>
                        <div className={styles.header} style={{ marginBottom: 0 }}>
                            <div className={styles.iconWrap}>
                                <KeyRound size={32} />
                            </div>
                            <h1>Loading…</h1>
                        </div>
                    </div>
                }
            >
                <ResetPasswordForm />
            </Suspense>
        </div>
    );
}

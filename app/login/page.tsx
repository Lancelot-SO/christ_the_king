"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import styles from "./login.module.css";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { refreshSession } = useAuth();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { data: { user }, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                if (error.message === "Invalid login credentials") {
                    alert("Incorrect email or password. Please try again or create an account.");
                } else {
                    alert(error.message);
                }
                setLoading(false);
                return;
            }

            if (user) {
                // Ensure a profile exists for this user (auto-create with 'Customer' role if missing)
                const { data: existingProfile } = await supabase
                    .from("profiles")
                    .select("id")
                    .eq("id", user.id)
                    .maybeSingle();

                if (!existingProfile) {
                    await supabase.from("profiles").insert([
                        {
                            id: user.id,
                            email: user.email,
                            name: user.email?.split("@")[0] || "User",
                            role: "Customer",
                        },
                    ]);
                }

                // Check if user is admin
                const { data: adminData } = await supabase
                    .from("admin_users")
                    .select("role")
                    .eq("id", user.id)
                    .eq("is_active", true)
                    .single();

                // Refresh context to ensure global state is up to date
                await refreshSession();

                if (adminData) {
                    router.push("/admin/dashboard");
                } else {
                    router.push("/account");
                }
            }
        } catch (error: any) {
            console.error("Login error:", error.message);
            alert("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.loginCard}>
                <div className={styles.header}>
                    <Image src="/logo.png" alt="Christ the King Logo" width={80} height={80} />
                    <h1>Welcome Back</h1>
                    <p>Sign in to your account</p>
                </div>

                <form onSubmit={handleLogin} className={styles.form}>
                    <div className={styles.inputGroup}>
                        <label>Email Address</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="your@email.com"
                        />
                    </div>
                    <div className={styles.inputGroup}>
                        <label>Password</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                        />
                        <div style={{ textAlign: 'right', marginTop: '0.5rem' }}>
                            <Link href="/forgot-password" className={styles.link} style={{ fontSize: '0.875rem' }}>
                                Forgot Password?
                            </Link>
                        </div>
                    </div>
                    <button type="submit" className={styles.loginBtn} disabled={loading}>
                        {loading ? "Signing in..." : "Sign In"}
                    </button>
                </form>

                <div className={styles.footer}>
                    <p>Don't have an account? <Link href="/signup" className={styles.link}>Create one</Link></p>
                    <Link href="/" className={styles.link} style={{ fontSize: '0.875rem' }}>Return to Home</Link>
                </div>
            </div>
        </div>
    );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import styles from "./login.module.css";
import { useAuth } from "@/context/AuthContext";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
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
                // Fetch user's role from the profiles table
                const { data: profileData } = await supabase
                    .from("profiles")
                    .select("role")
                    .eq("id", user.id)
                    .maybeSingle();

                // Refresh context to ensure global state is up to date
                await refreshSession();

                if (profileData?.role === "Admin") {
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
                    <Image src="/Logo_new.png" alt="Christ the King Logo" width={180} height={90} style={{ objectFit: 'contain' }} />
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
                        <div className={styles.passwordWrapper}>
                            <input
                                type={showPassword ? "text" : "password"}
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                            />
                            <button 
                                type="button" 
                                className={styles.toggleButton} 
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
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

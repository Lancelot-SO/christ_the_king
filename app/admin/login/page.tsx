"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import styles from "./login.module.css";

export default function AdminLogin() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const router = useRouter();

    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;

            router.push("/admin/dashboard");
        } catch (error: any) {
            console.error("Login error:", error.message);
            alert(error.message || "Invalid credentials");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.loginCard}>
                <div className={styles.header}>
                    <Image src="/logo.png" alt="AOSA Logo" width={80} height={80} />
                    <h1>Admin Portal</h1>
                    <p>Sign in to manage the centenary store</p>
                </div>

                <form onSubmit={handleLogin} className={styles.form}>
                    <div className={styles.inputGroup}>
                        <label>Email Address</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="admin@achimota.edu.gh"
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
                            <Link href="/admin/forgot-password" style={{ color: '#d4af37', textDecoration: 'none', fontSize: '0.875rem' }}>
                                Forgot Password?
                            </Link>
                        </div>
                    </div>
                    <button type="submit" className={styles.loginBtn}>
                        Secure Login
                    </button>
                </form>

                <div className={styles.footer}>
                    <p>&copy; 2027 Achimota School</p>
                </div>
            </div>
        </div>
    );
}

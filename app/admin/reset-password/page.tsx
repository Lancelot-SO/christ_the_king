"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import styles from "../login/login.module.css"; // Reuse login styles

export default function ResetPassword() {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    // The recovery token is handled automatically by Supabase client
    // when the user lands on this page from the email link.
    // Ideally, we wait for the session to be established.

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (password !== confirmPassword) {
            alert("Passwords do not match");
            return;
        }

        if (password.length < 6) {
            alert("Password must be at least 6 characters");
            return;
        }

        setLoading(true);

        try {
            const { error } = await supabase.auth.updateUser({
                password: password
            });

            if (error) throw error;

            alert("Password updated successfully! Redirecting to dashboard...");
            router.push("/admin/dashboard");
        } catch (error: any) {
            console.error("Error updating password:", error);
            alert(error.message || "Failed to update password");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.loginCard}>
                <div className={styles.header}>
                    <Image src="/Logo_new.png" alt="Christ the King Logo" width={80} height={80} />
                    <h1>Reset Password</h1>
                    <p>Create a new strong password for your account</p>
                </div>

                <form onSubmit={handleUpdatePassword} className={styles.form}>
                    <div className={styles.inputGroup}>
                        <label>New Password</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="New password"
                        />
                    </div>
                    <div className={styles.inputGroup}>
                        <label>Confirm Password</label>
                        <input
                            type="password"
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm new password"
                        />
                    </div>
                    <button type="submit" className={styles.loginBtn}>
                        {loading ? "Updating..." : "Update Password"}
                    </button>
                </form>

                <div className={styles.footer}>
                    <p>&copy; 2027 Christ the King School</p>
                </div>
            </div>
        </div>
    );
}

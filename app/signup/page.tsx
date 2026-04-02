"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import styles from "./signup.module.css";
import { Eye, EyeOff } from "lucide-react";




export default function SignupPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [yearGroup, setYearGroup] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            alert("Passwords do not match");
            return;
        }

        setLoading(true);

        try {
            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: name || email.split('@')[0],
                        class_year: yearGroup || null,
                    }
                }
            });

            if (error) throw error;

            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                // Create profile
                const { error: profileError } = await supabase
                    .from('profiles')
                    .insert([
                        {
                            id: user.id,
                            email: email,
                            role: 'Customer', // Default role
                            name: email.split('@')[0], // Default name
                        }
                    ]);

                if (profileError) {
                    console.error("Error creating profile:", profileError);
                }
            }
            alert("Registration successful! Please sign in.");
            router.push("/login");

        } catch (error: any) {
            console.error("Signup Error:", error);
            const msg: string = error.message || "";
            
            if (msg.toLowerCase().includes("already registered") || msg.toLowerCase().includes("already been registered")) {
                alert("This email is already registered. If you deleted it recently, please wait 30 seconds and try again, or use the SQL Deep Clean.");
                router.push("/login");
            } else if (msg.toLowerCase().includes("rate limit")) {
                alert("Too many signup attempts. Please wait a few minutes and try again.");
            } else {
                alert(`Error: ${msg}`);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.signupCard}>
                <div className={styles.header}>
                    <Image src="/Logo_new.png" alt="Christ the King Logo" width={180} height={90} style={{ objectFit: 'contain' }} />
                    <h1>Create Account</h1>
                    <p>Join the Christ the King community</p>
                </div>

                <form onSubmit={handleSignup} className={styles.form}>
                    <div className={styles.inputGroup}>
                        <label>Full Name</label>
                        <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Kwame Mensah"
                        />
                    </div>
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
                        <label>Year Group <span className={styles.optionalLabel}>(Graduation Year)</span></label>
                        <input
                            type="text"
                            value={yearGroup}
                            onChange={(e) => setYearGroup(e.target.value)}
                            placeholder="e.g. 1998"
                            maxLength={4}
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
                    </div>
                    <div className={styles.inputGroup}>
                        <label>Confirm Password</label>
                        <div className={styles.passwordWrapper}>
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="••••••••"
                            />
                            <button 
                                type="button" 
                                className={styles.toggleButton} 
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>
                    <button type="submit" className={styles.signupBtn} disabled={loading}>
                        {loading ? "Creating Account..." : "Create Account"}
                    </button>
                </form>

                <div className={styles.footer}>
                    <p>Already have an account? <Link href="/login" className={styles.link}>Sign in</Link></p>
                    <Link href="/" className={styles.link} style={{ fontSize: '0.875rem' }}>Return to Home</Link>
                </div>
            </div>
        </div>
    );
}

"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import styles from "./DuesSection.module.css";

export default function DuesSection() {
    return (
        <section className={styles.duesSection}>
            <div className={`container ${styles.grid}`}>
                {/* Left Side: Editorial Storytelling */}
                <div className={styles.storyContent}>
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1 }}
                    >
                        <span className={styles.kicker}>THE LEGACY CIRCLE</span>
                        <h2 className={styles.title}>
                            Support the institutions<br />
                            that <span className="gold-accent">formed you.</span>
                        </h2>
                        <p className={styles.lead}>
                            Your annual dues aren't just a membership fee—they are a direct investment 
                            into the scholarships, infrastructure, and community that define 
                            the Christ the King experience. Together, we preserve the legacy.
                        </p>
                        
                        <div className={styles.impactGrid}>
                            <div className={styles.impactItem}>
                                <span className={styles.impactValue}>70%</span>
                                <span className={styles.impactLabel}>Scholarship Support</span>
                            </div>
                            <div className={styles.impactItem}>
                                <span className={styles.impactValue}>25%</span>
                                <span className={styles.impactLabel}>Campus Development</span>
                            </div>
                            <div className={styles.impactItem}>
                                <span className={styles.impactValue}>05%</span>
                                <span className={styles.impactLabel}>Alumni Network</span>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Right Side: Fintech Hub */}
                <div className={styles.fintechHub}>
                    <div className={styles.hubCard}>
                        <div className={styles.hubHeader}>
                            <span className={styles.hubLabel}>CALENDAR YEAR 2026</span>
                            <h3 className={styles.hubTitle}>Class of 2015</h3>
                        </div>
                        
                        <div className={styles.statsContainer}>
                            <div className={styles.statRow}>
                                <span className={styles.statLabel}>Contribution Status</span>
                                <span className={`${styles.status} ${styles.pending}`}>Pending Activation</span>
                            </div>
                            
                            <div className={styles.progressSection}>
                                <div className={styles.progressBar}>
                                    <div className={styles.progressFill} style={{ width: '45%' }}></div>
                                </div>
                                <div className={styles.progressLabels}>
                                    <span>GHS 0.00 Paid</span>
                                    <span>GHS 500.00 Goal</span>
                                </div>
                            </div>

                            <div className={styles.amountDisplay}>
                                <span className={styles.currency}>GHS</span>
                                <span className={styles.amount}>500.00</span>
                            </div>
                        </div>

                        <Link href="/dues" className="btn btn-primary" style={{ width: '100%', marginTop: '2rem' }}>
                            CONTRIBUTE NOW
                        </Link>
                        
                        <p className={styles.secureNote}>
                            Secure payment processed through CTK Treasury. 
                            Your contribution is tax-deductible in applicable regions.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}

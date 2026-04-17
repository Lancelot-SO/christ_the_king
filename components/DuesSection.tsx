"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import styles from "./DuesSection.module.css";

export default function DuesSection() {
    return (
        <section className={styles.duesSection}>
            <div className={`container ${styles.grid}`}>
                {/* Left Side: How You Can Help */}
                <div className={styles.storyContent}>
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1 }}
                    >
                        <span className={styles.kicker}>HOW YOU CAN HELP</span>
                        <h2 className={styles.title}>
                            Be part of the<br />
                            <span className="gold-accent">transformation.</span>
                        </h2>
                        <p className={styles.lead}>
                            CTKIS is calling on alumni, parents, and friends of the school 
                            to support in the following ways.
                        </p>
                        
                        <div className={styles.impactGrid}>
                            <div className={styles.impactItem}>
                                <span className={styles.impactValue}>01</span>
                                <span className={styles.impactLabel}>Donate</span>
                                <p className={styles.impactDesc}>Every contribution — big or small — brings us closer to completing Phase Two.</p>
                            </div>
                            <div className={styles.impactItem}>
                                <span className={styles.impactValue}>02</span>
                                <span className={styles.impactLabel}>Sponsor a Project</span>
                                <p className={styles.impactDesc}>Consider sponsoring a classroom, library resource, tablet, or scholarship.</p>
                            </div>
                            <div className={styles.impactItem}>
                                <span className={styles.impactValue}>03</span>
                                <span className={styles.impactLabel}>Volunteer</span>
                                <p className={styles.impactDesc}>Help spread the word. Engage your year groups and networks.</p>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Right Side: Call to Action */}
                <div className={styles.fintechHub}>
                    <div className={styles.hubCard}>
                        <div className={styles.hubHeader}>
                            <span className={styles.hubLabel}>CORPORATE &amp; INDIVIDUAL</span>
                            <h3 className={styles.hubTitle}>Together, We Build</h3>
                        </div>
                        
                        <p className={styles.hubText}>
                            Together, we can leave a lasting legacy for current and future generations of CTKIS students. 
                            Your generosity will ensure that the next 70 years continue to shine with grace, growth, and greatness.
                        </p>

                        <div className={styles.ctaGroup}>
                            <Link href="/dues" className="btn btn-primary" style={{ width: '100%' }}>
                                DONATE NOW
                            </Link>
                            <Link href="/contact" className="btn btn-outline" style={{ width: '100%', color: 'var(--burgundy)', borderColor: 'var(--burgundy)' }}>
                                VOLUNTEER
                            </Link>
                        </div>
                        
                        <p className={styles.secureNote}>
                            If you are part of a business or organisation, explore partnership 
                            opportunities to sponsor or contribute to the redevelopment project.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}

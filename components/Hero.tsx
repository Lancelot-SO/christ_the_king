"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import styles from "./Hero.module.css";

export default function Hero() {
    return (
        <section className={styles.hero}>
            <div className={styles.overlay}></div>
            <div className={`container ${styles.container}`}>
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                    className={styles.content}
                >
                    <span className={styles.subtitle}>FAITH • EXCELLENCE • SERVICE</span>
                    <h1 className={styles.title}>
                        <span className={styles.upper}>A Legacy of</span>
                        <span className="premium-gold-text">Christ the King Excellence</span>
                    </h1>
                    <p className={styles.description}>
                        Celebrate a legacy of faith, heritage, leadership, and unity.
                        Official commemorative merchandise for the Christ the King alumni community worldwide.
                    </p>
                    <div className={styles.actions}>
                        <Link href="/catalog" className={styles.primaryBtn}>
                            Shop the Collection
                        </Link>
                        <Link href="/about" className={styles.secondaryBtn}>
                            The Legacy
                        </Link>
                    </div>
                </motion.div>
            </div>

            <div className={styles.scrollIndicator}>
                <span>SCROLL</span>
                <div className={styles.line}></div>
            </div>

            <div className={styles.motto}>
                <span>CHRIST THE KING</span>
            </div>
        </section>
    );
}

"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import styles from "./Hero.module.css";

export default function Hero() {
    return (
        <section id="hero-section" className={styles.hero}>
            <div className={styles.imageWrapper}>
                <Image 
                    src="/ctk_hero_editorial_1775074466912.png" 
                    alt="Christ the King Alumni Heritage" 
                    fill 
                    className={styles.image}
                    priority
                />
                <div className={styles.imageOverlay}></div>
            </div>

            <div className={styles.contentWrapper}>
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                    className={styles.textContent}
                >
                    <span className={styles.label}>ESTABLISHED HERITAGE</span>
                    <h1 className={styles.title}>
                        Your Year.<br />
                        <span className="gold-accent">Your Legacy.</span>
                    </h1>
                    <p className={styles.description}>
                        A premium digital experience for the Christ the King community. 
                        Celebrate your journey, contribute to the future, and wear your identity.
                    </p>
                    <div className={styles.actions}>
                        <Link href="/catalog" className="btn btn-primary">
                            Explore Collection
                        </Link>
                        <Link href="/dues" className="btn btn-outline">
                            Contribution
                        </Link>
                    </div>
                </motion.div>
            </div>

            <div className={styles.sidebarSection}>
                <div className={styles.verticalTitle}>CHRIST THE KING</div>
                <div className={styles.scrollInvite}>
                    <span>SCROLL TO BEGIN</span>
                    <div className={styles.dot}></div>
                </div>
            </div>
        </section>
    );
}

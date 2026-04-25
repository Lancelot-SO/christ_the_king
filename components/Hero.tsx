"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import styles from "./Hero.module.css";

export default function Hero() {
    return (
        <section id="hero-section" className={styles.hero}>
            <div className={styles.imageWrapper}>
                <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    preload="auto"
                    className={styles.image}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                >
                    <source src="/New Video.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                </video>
                <div className={styles.imageOverlay}></div>
            </div>

            <div className={styles.contentWrapper}>
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                    className={styles.textContent}
                >
                    <span className={styles.label}>70 YEARS OF GRACE, GROWTH, AND GREATNESS</span>
                    <h1 className={styles.title}>
                        Welcome to Christ the King<br />International School<br />
                        <span className="gold-accent">70th Anniversary.</span>
                    </h1>
                    <p className={styles.description}>
                        This year, we celebrate 70 remarkable years of nurturing children in faith, character,
                        and academic excellence under the guidance of the Catholic Church.
                    </p>
                    <div className={styles.actions}>
                        <Link href="/dues" className="btn btn-primary">
                            Support the Anniversary
                        </Link>
                        <Link href="/about" className="btn btn-outline">
                            Discover Our Story
                        </Link>
                    </div>
                </motion.div>
            </div>

        </section>
    );
}

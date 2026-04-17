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
                    src="/blazer+lapel pin.png"
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
                    <span className={styles.label}>70 YEARS OF GRACE, GROWTH, AND GREATNESS</span>
                    <h1 className={styles.title}>
                        Welcome to Christ the King<br />
                        <span className="gold-accent">70th Anniversary.</span>
                    </h1>
                    <p className={styles.description}>
                        This year, we celebrate 70 remarkable years of nurturing children in faith, character, 
                        and academic excellence under the guidance of the Catholic Church.
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

        </section>
    );
}

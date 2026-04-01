"use client";

import Link from "next/link";
import styles from "./DualCTA.module.css";

export default function DualCTA() {
  return (
    <section className={styles.ctaContainer}>
      <Link href="/catalog" className={`${styles.ctaSide} ${styles.shopSide}`}>
        <div className={styles.content}>
          <span className={styles.label}>Action 01</span>
          <h2 className={styles.title}>SHOP MERCHANDISE</h2>
        </div>
      </Link>
      <Link href="/dues" className={`${styles.ctaSide} ${styles.duesSide}`}>
        <div className={styles.content}>
          <span className={styles.label}>Action 02</span>
          <h2 className={styles.title}>MEMBER DUES</h2>
        </div>
      </Link>
    </section>
  );
}

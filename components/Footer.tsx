import Link from "next/link";
import styles from "./Footer.module.css";

export default function Footer() {
    return (
        <footer className={styles.footer}>
            <div className="container">
                <div className={styles.topSection}>
                    <div className={styles.statement}>
                        <h2 className={styles.title}>A Legacy of <span className="gold-accent">Excellence.</span></h2>
                        <p className={styles.desc}>
                            Preserving the traditions, celebrating the achievements, 
                            and building the future of the Christ the King community.
                        </p>
                    </div>
                    
                    <div className={styles.navGrid}>
                        <div className={styles.navCol}>
                            <span className={styles.label}>EXPLORE</span>
                            <Link href="/catalog">The Collection</Link>
                            <Link href="/about">Our Legacy</Link>
                            <Link href="/dues">Contribution</Link>
                        </div>
                        <div className={styles.navCol}>
                            <span className={styles.label}>SUPPORT</span>
                            <Link href="/contact">Inquiries</Link>
                            <Link href="/catalog">Shipping</Link>
                            <Link href="/catalog">Terms</Link>
                        </div>
                        <div className={styles.navCol}>
                            <span className={styles.label}>SOCIAL</span>
                            <a href="#">Instagram</a>
                            <a href="#">LinkedIn</a>
                            <a href="#">Twitter</a>
                        </div>
                    </div>
                </div>

                <div className={styles.brandingSection}>
                    <h1 className={styles.massiveBranding}>CHRIST THE KING</h1>
                </div>

                <div className={styles.bottomBar}>
                    <span>&copy; 2026 CHRIST THE KING HERITAGE</span>
                    <span>ESTABLISHED 1958</span>
                </div>
            </div>
        </footer>
    );
}

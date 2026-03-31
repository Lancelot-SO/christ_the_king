import Link from "next/link";
import styles from "./Footer.module.css";

export default function Footer() {
    return (
        <footer className={styles.footer}>
            <div className="container">
                <div className={styles.footerGrid}>
                    <div className={styles.footerBrand}>
                        <h3>Christ the King Store</h3>
                        <p>The official marketplace for the Christ the King Old Students Association.</p>
                    </div>
                    <div className={styles.footerLinks}>
                        <div>
                            <h4>Shop</h4>
                            <ul>
                                <li><Link href="/catalog">Apparel</Link></li>
                                <li><Link href="/catalog">Accessories</Link></li>
                                <li><Link href="/catalog">Collectibles</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4>Legacy</h4>
                            <ul>
                                <li><Link href="/about">Our Story</Link></li>
                                <li>School Events</li>
                                <li>Foundation</li>
                            </ul>
                        </div>
                        <div>
                            <h4>Support</h4>
                            <ul>
                                <li>Shipping</li>
                                <li><Link href="/contact">Inquiries</Link></li>
                                <li>Terms</li>
                            </ul>
                        </div>
                    </div>
                </div>
                <div className={styles.copyright}>
                    <p>&copy; 2026 Christ the King Old Students Association. <span className="text-gold-footer">CHRIST THE KING</span></p>
                </div>
            </div>
        </footer>
    );
}

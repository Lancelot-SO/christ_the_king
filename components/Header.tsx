"use client";

import Link from "next/link";
import Image from "next/image";
import { ShoppingBag, Menu, X, Heart, CircleUser as UserIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./Header.module.css";

interface HeaderProps {
    light?: boolean;
}

export default function Header({ light = false }: HeaderProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const { cartCount } = useCart();
    const { wishlistCount } = useWishlist();
    const { user, signOut } = useAuth();
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        
        window.addEventListener("scroll", handleScroll);
        // Immediate check and delayed check for hydrating states
        handleScroll();
        setTimeout(handleScroll, 100);
        setTimeout(handleScroll, 500);
        
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const handleSignOut = async () => {
        await signOut();
        setIsUserMenuOpen(false);
    };

    return (
        <header 
            className={`${styles.header} ${isScrolled ? styles.scrolled : ""} ${light && !isScrolled ? styles.light : ""}`}
        >
            <div className={styles.pillContainer}>
                {/* Left: Nav */}
                <nav className={styles.nav}>
                    <Link href="/catalog" className={styles.navLink}>Collection</Link>
                    <Link href="/about" className={styles.navLink}>Legacy</Link>
                </nav>

                {/* Center: Logo */}
                <Link href="/" className={styles.logoArea}>
                    <Image
                        src={light && !isScrolled ? "/Asset 2only.png" : "/Logo_new.png"}
                        alt="Christ the King"
                        width={140}
                        height={46}
                        className={styles.logo}
                        priority
                    />
                    <span className={styles.brandName}>CHRIST THE KING</span>
                </Link>

                {/* Right: Actions */}
                <div className={styles.actions}>
                    <Link href="/dues" className={`${styles.navLink} ${styles.desktopOnly}`}>Contribute</Link>
                    <div className={styles.iconButtons}>
                        <Link href="/wishlist" className={styles.iconBtn}>
                            <Heart size={20} />
                            {mounted && wishlistCount > 0 && <span className={styles.badge}>{wishlistCount}</span>}
                        </Link>
                        <Link href="/cart" className={styles.iconBtn}>
                            <ShoppingBag size={20} />
                            {mounted && cartCount > 0 && <span className={styles.badge}>{cartCount}</span>}
                        </Link>
                        {mounted && user ? (
                            <div className={styles.userWrapper}>
                                <button 
                                    className={`${styles.iconBtn} ${isUserMenuOpen ? styles.activeIcon : ""}`}
                                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                >
                                    <UserIcon size={20} />
                                </button>
                                <AnimatePresence>
                                    {isUserMenuOpen && (
                                        <motion.div 
                                            className={styles.userDropdown}
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            transition={{ duration: 0.2, ease: "easeOut" }}
                                        >
                                            <div className={styles.dropdownHeader}>
                                                <span>{user.email}</span>
                                            </div>
                                            <Link href="/account" className={styles.dropdownItem} onClick={() => setIsUserMenuOpen(false)}>My Dashboard</Link>
                                            <Link href="/account" className={styles.dropdownItem} onClick={() => setIsUserMenuOpen(false)}>Order History</Link>
                                            <button onClick={handleSignOut} className={styles.signOutItem}>Sign Out</button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ) : (
                            <Link href="/login" className={styles.loginBtn}>LOGIN</Link>
                        )}
                    </div>
                    <button className={styles.mobileToggle} onClick={() => setIsMenuOpen(true)}>
                        <Menu size={24} />
                    </button>
                </div>
            </div>

            {/* Mobile Overlay Menu */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div 
                        className={styles.mobileOverlay}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    >
                        <div className={styles.overlayHeader}>
                            <span className={styles.overlayBrand}>CHRIST THE KING</span>
                            <button onClick={() => setIsMenuOpen(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
                                <X size={32} />
                            </button>
                        </div>
                        
                        <motion.nav 
                            className={styles.overlayNav}
                            initial="initial"
                            animate="animate"
                            variants={{
                                animate: {
                                    transition: {
                                        staggerChildren: 0.1
                                    }
                                }
                            }}
                        >
                            {[
                                { label: "THE COLLECTION", href: "/catalog", id: "01" },
                                { label: "OUR LEGACY", href: "/about", id: "02" },
                                { label: "CONTRIBUTION", href: "/dues", id: "03" },
                                { label: "MY ACCOUNT", href: "/account", id: "04" },
                            ].map((item) => (
                                <motion.div
                                    key={item.id}
                                    variants={{
                                        initial: { opacity: 0, x: -20 },
                                        animate: { opacity: 1, x: 0 }
                                    }}
                                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                                >
                                    <Link 
                                        href={item.href} 
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        <span>{item.id} /</span> {item.label}
                                    </Link>
                                </motion.div>
                            ))}
                        </motion.nav>

                        <motion.div 
                            className={styles.overlayFooter}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5, duration: 0.8 }}
                        >
                            <span className={styles.motto}>EXCELLENCE & FAITH</span>
                            <div className={styles.socialLinks}>
                                <span>INSTAGRAM</span>
                                <span>LINKEDIN</span>
                                <span>X.COM</span>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}

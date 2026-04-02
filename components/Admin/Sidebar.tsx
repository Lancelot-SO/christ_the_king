"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
    LayoutDashboard,
    Package,
    ShoppingBag,
    Users,
    Settings,
    LogOut,
    ChevronLeft,
    Menu,
    Mail,
    X,
    Store,
    CreditCard
} from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import styles from "./Sidebar.module.css";

export default function Sidebar() {
    const pathname = usePathname();
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [isDesktop, setIsDesktop] = useState(false);
    const router = useRouter();
    const { signOut } = useAuth();

    useEffect(() => {
        const checkDesktop = () => {
            setIsDesktop(window.innerWidth > 1024);
            if (window.innerWidth > 1024) {
                setIsMobileOpen(false);
            }
        };
        checkDesktop();
        window.addEventListener('resize', checkDesktop);
        return () => window.removeEventListener('resize', checkDesktop);
    }, []);

    const menuItems = [
        { label: "Dashboard", icon: <LayoutDashboard size={20} />, href: "/admin/dashboard" },
        { label: "Inventory", icon: <Package size={20} />, href: "/admin/dashboard/inventory" },
        { label: "Orders", icon: <ShoppingBag size={20} />, href: "/admin/dashboard/orders" },
        { label: "Customers", icon: <Users size={20} />, href: "/admin/dashboard/customers" },
        { label: "Alumni Family", icon: <Mail size={20} />, href: "/admin/dashboard/alumni-family" },
        { label: "Dues", icon: <CreditCard size={20} />, href: "/admin/dashboard/dues" },
        { label: "Settings", icon: <Settings size={20} />, href: "/admin/dashboard/settings" },
    ];

    const handleLogout = async () => {
        await signOut();
    };

    const toggleMobile = () => setIsMobileOpen(!isMobileOpen);

    return (
        <>
            {/* Mobile Toggle Button */}
            {!isDesktop && (
                <button className={styles.mobileToggle} onClick={toggleMobile}>
                    {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            )}

            {/* Backdrop */}
            <AnimatePresence>
                {isMobileOpen && (
                    <motion.div 
                        className={styles.backdrop}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsMobileOpen(false)}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                <motion.aside 
                    className={`${styles.sidebar} ${isMobileOpen ? styles.sidebarOpen : ""}`}
                    initial={false}
                    animate={{ x: (isDesktop || isMobileOpen) ? 0 : "-100%" }}
                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                >
                    <div className={styles.logo}>
                        <Image src="/Logo_new.png" alt="Christ the King Logo" width={50} height={50} priority />
                    </div>

                    <nav className={styles.nav}>
                        {menuItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`${styles.navItem} ${pathname === item.href ? styles.active : ""}`}
                                onClick={() => setIsMobileOpen(false)}
                            >
                                {item.icon}
                                <span>{item.label}</span>
                            </Link>
                        ))}
                    </nav>

                    <div className={styles.footer}>
                        <Link href="/catalog" className={styles.viewWebsiteBtn}>
                            <Store size={20} />
                            <span>View Shop</span>
                        </Link>
                        <button className={styles.logoutBtn} onClick={handleLogout}>
                            <LogOut size={20} />
                            <span>Logout</span>
                        </button>
                    </div>
                </motion.aside>
            </AnimatePresence>
        </>
    );
}

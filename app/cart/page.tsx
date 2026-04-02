"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useCart, MAX_CART_ITEMS, MAX_ITEM_QUANTITY } from "@/context/CartContext";
import Image from "next/image";
import Link from "next/link";
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag } from "lucide-react";
import styles from "./cart.module.css";

export default function CartPage() {
    const { cart, removeFromCart, updateQuantity, cartTotal, clearCart, cartCount } = useCart();

    if (cart.length === 0) {
        return (
            <main>
                <Header light />
                <div className={styles.emptyCart}>
                    <div className="container animate-fade-up">
                        <ShoppingBag size={72} className={styles.emptyIcon} />
                        <h1>Your collection is currently empty.</h1>
                        <p>Discover heritage artifacts in the Boutique Collection.</p>
                        <Link href="/catalog" className={styles.continueBtn}>
                            THE COLLECTION
                        </Link>
                    </div>
                </div>
                <Footer />
            </main>
        );
    }

    return (
        <main>
            <Header light />
            <div className="container">
                <header id="hero-section" className={styles.cartHeader}>
                    <h1 className={styles.title}>Archival Review</h1>
                </header>

                <div className={styles.cartGrid}>
                    <div className={styles.itemsList}>
                        {cart.map((item) => (
                            <div key={`${item.id}-${item.size}`} className={styles.cartItem}>
                                <div className={styles.itemImage}>
                                    <Image src={item.image} alt={item.name} fill />
                                </div>
                                <div className={styles.itemInfo}>
                                    <p className={styles.itemDetails}>
                                        {item.size && `SIZE: ${item.size}`}
                                        {item.color && ` • COLOR: ${item.color}`}
                                    </p>
                                    <h3>{item.name}</h3>
                                    <p className={styles.itemPrice}>GHS {item.price.toLocaleString()}</p>
                                </div>
                                <div className={styles.itemActions}>
                                    <div className={styles.quantityControls}>
                                        <button onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1), item.size)}>
                                            <Minus size={14} />
                                        </button>
                                        <span>{item.quantity}</span>
                                        <button 
                                            onClick={() => updateQuantity(item.id, item.quantity + 1, item.size)}
                                            disabled={item.quantity >= MAX_ITEM_QUANTITY || cartCount >= MAX_CART_ITEMS}
                                        >
                                            <Plus size={14} />
                                        </button>
                                    </div>
                                    <button
                                        className={styles.removeBtn}
                                        onClick={() => removeFromCart(item.id, item.size)}
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                        
                        <button className={styles.clearAllBtn} onClick={() => clearCart()}>
                            Clear Entire Review
                        </button>
                    </div>

                    <div className={styles.summary}>
                        <h3>Archival Review</h3>
                        <div className={styles.summaryRow}>
                            <span>Subtotal</span>
                            <span>GHS {cartTotal.toLocaleString()}</span>
                        </div>
                        <div className={styles.summaryRow}>
                            <span>Logistics Fee</span>
                            <span>COMPLIMENTARY</span>
                        </div>
                        <div className={`${styles.summaryRow} ${styles.totalRow}`}>
                            <span>Total Valuation</span>
                            <span>GHS {cartTotal.toLocaleString()}</span>
                        </div>

                        <Link href="/checkout" className={styles.checkoutBtn}>
                            Secure Access to Checkout <ArrowRight size={16} />
                        </Link>

                        <p className={styles.secureText}>
                            ✓ Encrypted Transactional Security
                        </p>
                    </div>
                </div>
            </div>
            <Footer />
        </main>
    );
}

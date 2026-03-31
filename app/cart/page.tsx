"use client";

import Header from "@/components/Header";
import { useCart, MAX_CART_ITEMS, MAX_ITEM_QUANTITY } from "@/context/CartContext";
import Image from "next/image";
import Link from "next/link";
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, XCircle } from "lucide-react";
import styles from "./cart.module.css";

export default function CartPage() {
    const { cart, removeFromCart, updateQuantity, cartTotal, clearCart, cartCount } = useCart();

    if (cart.length === 0) {
        return (
            <main>
                <Header />
                <div className="container" style={{ paddingTop: '150px', textAlign: 'center' }}>
                    <div className={styles.emptyCart}>
                        <ShoppingBag size={64} style={{ marginBottom: '2rem', opacity: 0.2 }} />
                        <h1>Your cart is empty</h1>
                        <p>Looks like you haven't added any items yet.</p>
                        <Link href="/catalog" className={styles.continueBtn}>
                            Start Shopping
                        </Link>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main>
            <Header />
            <div className="container" style={{ paddingTop: '120px' }}>
                <div className={styles.cartHeader}>
                    <h1 className={styles.title}>Shopping Cart</h1>
                    <button className={styles.clearAllBtn} onClick={() => clearCart()}>
                        <XCircle size={16} />
                        Clear All
                    </button>
                </div>

                <div className={styles.cartGrid}>
                    <div className={styles.itemsList}>
                        {cart.map((item) => (
                            <div key={`${item.id}-${item.size}`} className={styles.cartItem}>
                                <div className={styles.itemImage}>
                                    <Image src={item.image} alt={item.name} fill />
                                </div>
                                <div className={styles.itemInfo}>
                                    <h3>{item.name}</h3>
                                    <p className={styles.itemDetails}>
                                        {item.size && `Size: ${item.size}`}
                                        {item.color && ` • Color: ${item.color}`}
                                    </p>
                                    <p className={styles.itemPrice}>GHS {item.price.toLocaleString()}</p>
                                </div>
                                <div className={styles.itemActions}>
                                    <div className={styles.quantityControls}>
                                        <button onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1), item.size)}>
                                            <Minus size={16} />
                                        </button>
                                        <span>{item.quantity}</span>
                                        <button 
                                            onClick={() => updateQuantity(item.id, item.quantity + 1, item.size)}
                                            disabled={item.quantity >= MAX_ITEM_QUANTITY || cartCount >= MAX_CART_ITEMS}
                                            title={item.quantity >= MAX_ITEM_QUANTITY ? "Maximum quantity reached" : cartCount >= MAX_CART_ITEMS ? "Cart is full" : ""}
                                        >
                                            <Plus size={16} />
                                        </button>
                                    </div>
                                    <button
                                        className={styles.removeBtn}
                                        onClick={() => removeFromCart(item.id, item.size)}
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className={styles.summary}>
                        <h3>Order Summary</h3>
                        <div className={styles.summaryRow}>
                            <span>Subtotal</span>
                            <span>GH₵ {cartTotal.toLocaleString()}</span>
                        </div>
                        <div className={styles.summaryRow}>
                            <span>Delivery Fee</span>
                            <span>GHS 0.00</span>
                        </div>
                        <div className={styles.divider}></div>
                        <div className={`${styles.summaryRow} ${styles.totalRow}`}>
                            <span>Total</span>
                            <span>GH₵ {cartTotal.toLocaleString()}</span>
                        </div>

                        <Link href="/checkout" className={styles.checkoutBtn}>
                            Proceed to Checkout <ArrowRight size={20} />
                        </Link>

                        <p className={styles.secureText}>
                            ✓ Secure checkout powered by Paystack
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );
}

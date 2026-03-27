"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Check, Eye } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useCart } from "@/context/CartContext";
import styles from "./BestSelling.module.css";

interface Product {
    id: string;
    name: string;
    price: number;
    images: string[];
    stock_quantity: number;
    categories: { name: string } | null;
}

export default function BestSelling() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const { addToCart } = useCart();
    const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

    useEffect(() => {
        fetchBestSelling();
    }, []);

    async function fetchBestSelling() {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from("products")
                .select("*, categories(name)")
                .eq("is_active", true)
                .order("created_at", { ascending: false })
                .limit(2);

            if (error) {
                console.error("Error fetching best sellers:", error);
                setProducts([]);
            } else {
                setProducts(data || []);
            }
        } catch (err) {
            console.error("Error fetching best sellers:", err);
            setProducts([]);
        } finally {
            setLoading(false);
        }
    }

    const handleAddToCart = (e: React.MouseEvent, product: Product) => {
        e.preventDefault();
        e.stopPropagation();

        if (product.stock_quantity <= 0) return;

        const imageUrl = product.images?.[0] || "/products/blazer.png";

        addToCart({
            id: product.id,
            name: product.name,
            price: product.price,
            image: imageUrl,
            quantity: 1,
            size: "M",
        });

        setAddedIds((prev) => new Set(prev).add(product.id));
        setTimeout(() => {
            setAddedIds((prev) => {
                const next = new Set(prev);
                next.delete(product.id);
                return next;
            });
        }, 1500);
    };

    const getImageSrc = (product: Product) => {
        const img = product.images?.[0];
        if (!img) return "/products/blazer.png";
        try {
            new URL(img);
            return img;
        } catch {
            return img.startsWith("/") ? img : "/products/blazer.png";
        }
    };

    // Don't render the section at all if no products
    if (!loading && products.length === 0) return null;

    return (
        <section className={styles.section}>
            <div className="container">
                <div className={styles.header}>
                    <span className={styles.label}>TOP PICKS</span>
                    <h2 className={styles.heading}>Best Selling Items</h2>
                </div>

                {loading ? (
                    <div className={styles.skeleton}>
                        <div className={styles.skeletonCard} />
                        <div className={styles.skeletonCard} />
                    </div>
                ) : (
                    <div className={styles.grid}>
                        {products.map((product) => {
                            const isSoldOut = product.stock_quantity <= 0;
                            const isAdded = addedIds.has(product.id);

                            return (
                                <div key={product.id} className={styles.card}>
                                    <Image
                                        src={getImageSrc(product)}
                                        alt={product.name}
                                        fill
                                        className={styles.cardImage}
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src =
                                                "/products/blazer.png";
                                        }}
                                    />
                                    {isSoldOut && (
                                        <div className={styles.soldOutBadge}>
                                            Sold Out
                                        </div>
                                    )}
                                    <div className={styles.cardOverlay}>
                                        <span className={styles.cardCategory}>
                                            {product.categories?.name || "Shop"}
                                        </span>
                                        <h3 className={styles.cardName}>
                                            {product.name}
                                        </h3>
                                        <p className={styles.cardPrice}>
                                            GH₵{" "}
                                            {product.price.toLocaleString()}
                                        </p>
                                        <div className={styles.cardActions}>
                                            <button
                                                className={`${styles.addToCartBtn} ${isAdded ? styles.added : ""} ${isSoldOut ? styles.soldOut : ""}`}
                                                onClick={(e) =>
                                                    handleAddToCart(e, product)
                                                }
                                                disabled={isSoldOut}
                                            >
                                                {isAdded ? (
                                                    <>
                                                        <Check size={16} />{" "}
                                                        Added
                                                    </>
                                                ) : isSoldOut ? (
                                                    <>
                                                        <ShoppingCart
                                                            size={16}
                                                        />{" "}
                                                        Sold Out
                                                    </>
                                                ) : (
                                                    <>
                                                        <ShoppingCart
                                                            size={16}
                                                        />{" "}
                                                        Add to Cart
                                                    </>
                                                )}
                                            </button>
                                            <Link
                                                href={`/product/${product.id}`}
                                                className={styles.viewBtn}
                                            >
                                                <Eye size={16} /> View
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </section>
    );
}

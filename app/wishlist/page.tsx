"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import ProductCard from "@/components/ProductCard";
import { useWishlist } from "@/context/WishlistContext";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { Heart } from "lucide-react";
import styles from "./wishlist.module.css";

export default function WishlistPage() {
    const { wishlist } = useWishlist();
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchWishlistProducts() {
            if (wishlist.length === 0) {
                setProducts([]);
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const { data, error } = await supabase
                    .from('products')
                    .select('*, categories(name)')
                    .in('id', wishlist)
                    .eq('is_active', true);

                if (error) throw error;
                setProducts(data || []);
            } catch (error: any) {
                console.error('Error fetching wishlist products:', error.message);
            } finally {
                setLoading(false);
            }
        }

        fetchWishlistProducts();
    }, [wishlist]);

    return (
        <main>
            <Header />
            <div className={styles.hero}>
                <div className="container">
                    <h1>My Wishlist</h1>
                    <p>Keep track of the items you love.</p>
                </div>
            </div>

            <div className="container" style={{ minHeight: '50vh' }}>
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '60px' }}>Loading your favorites...</div>
                ) : products.length > 0 ? (
                    <div className={styles.grid}>
                        {products.map(product => (
                            <ProductCard
                                key={product.id}
                                id={product.id}
                                name={product.name}
                                price={product.price}
                                image={product.images?.[0] || "/products/blazer.png"}
                                category={product.categories?.name}
                                stock_quantity={product.stock_quantity}
                            />
                        ))}
                    </div>
                ) : (
                    <div className={styles.emptyState}>
                        <Heart size={64} color="#e5e7eb" strokeWidth={1.5} />
                        <h2>Your wishlist is empty</h2>
                        <p>Discover something you like and save it for later.</p>
                        <Link href="/catalog" className={styles.shopBtn}>
                            Explore Catalog
                        </Link>
                    </div>
                )}
            </div>

            <footer className={styles.simpleFooter}>
                <p>&copy; 2026 Christ the King Old Students Association</p>
            </footer>
        </main>
    );
}

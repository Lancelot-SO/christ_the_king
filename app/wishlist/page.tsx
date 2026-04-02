"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
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
            <div className={`${styles.hero} animate-fade-up`}>
                <div className="container">
                    <h1>My Wishlist</h1>
                    <p>Keep track of the items you love.</p>
                </div>
            </div>

            <div className={`container ${styles.pageContent}`}>
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '60px', fontStyle: 'italic', color: 'var(--muted-foreground)' }}>Loading your favorites...</div>
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
                    <div className={`${styles.emptyState} animate-fade-up`}>
                        <Heart size={80} color="#7C1936" style={{ opacity: 0.1, marginBottom: '1rem' }} strokeWidth={1} />
                        <h2>Your wishlist is empty</h2>
                        <p>Discover something you like and save it for later.</p>
                        <Link href="/catalog" className={styles.shopBtn}>
                            Explore Catalog
                        </Link>
                    </div>
                )}
            </div>

            <Footer />
        </main>
    );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import ProductCard from "./ProductCard";
import styles from "./FeaturedProducts.module.css";

// Mock data for demo purposes if DB is empty
const MOCK_PRODUCTS = [
    {
        id: "1",
        name: "Centenary Bespoke Blazer",
        price: 1200,
        images: ["/centenary_blazer_1769187792564.png"],
        categories: { name: "Apparel" }
    },
    {
        id: "2",
        name: "Heritage Gold Watch",
        price: 2500,
        images: ["/luxury_watch_gold_1769187808007.png"],
        categories: { name: "Accessories" }
    },
    {
        id: "3",
        name: "Commemorative Centenary Coin",
        price: 450,
        images: ["/commemorative_coin_1769187825033.png"],
        categories: { name: "Collectibles" }
    },
    {
        id: "4",
        name: "Official Silk Centenary Tie",
        price: 350,
        images: ["/official_tie_silk_1769187839635.png"],
        categories: { name: "Apparel" }
    }
];

export default function FeaturedProducts() {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchFeaturedProducts();
    }, []);

    async function fetchFeaturedProducts() {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('products')
                .select('*, categories(name)')
                .eq('is_active', true)
                .limit(4);

            if (error || !data || data.length === 0) {
                // Use mock data if DB is empty or fails
                console.log("Using mock data due to empty database or error");
                setProducts(MOCK_PRODUCTS);
            } else {
                setProducts(data);
            }
        } catch (error) {
            console.error('Error fetching featured products:', error);
            setProducts(MOCK_PRODUCTS);
        } finally {
            setLoading(false);
        }
    }

    return (
        <section className="section">
            <div className="container">
                <div className={styles.header}>
                    <div className={styles.titleArea}>
                        <span className="section-title">EXCLUSIVE SELECTION</span>
                        <h2 className="section-heading">Featured Centenary Items</h2>
                    </div>
                    <Link href="/catalog" className={styles.viewAll}>View All Store</Link>
                </div>

                <div className={styles.grid}>
                    {loading ? (
                        <div style={{ textAlign: 'center', gridColumn: '1/-1', padding: '40px' }}>
                            <div className={styles.loader}></div>
                            <p>Loading the collection...</p>
                        </div>
                    ) : products.length > 0 ? (
                        products.map((product) => (
                            <ProductCard
                                key={product.id}
                                id={product.id}
                                name={product.name}
                                price={product.price}
                                image={product.images?.[0] || "/products/blazer.png"}
                                category={product.categories?.name}
                                stock_quantity={product.stock_quantity}
                            />
                        ))
                    ) : (
                        <div style={{ textAlign: 'center', gridColumn: '1/-1', padding: '40px', color: '#6b7280' }}>
                            No items found in the shop.
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}

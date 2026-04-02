"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import styles from "./FeaturedProducts.module.css";
import { motion } from "framer-motion";

// Mock data for demo purposes if DB is empty
const MOCK_PRODUCTS = [
    {
        id: "1",
        name: "Heritage Wool Blazer",
        price: 1200,
        images: ["/products/blazer_new.png"],
        categories: { name: "Apparel" },
        featured: true
    },
    {
        id: "2",
        name: "Gold Signet Cufflinks",
        price: 850,
        images: ["/products/cufflinks.png"],
        categories: { name: "Accessories" }
    },
    {
        id: "3",
        name: "Director's Portfolio",
        price: 450,
        images: ["/products/portfolio.png"],
        categories: { name: "Leather" }
    },
    {
        id: "4",
        name: "Official Silk Ceremonial Tie",
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

            if (error || !data) {
                setProducts(MOCK_PRODUCTS);
            } else {
                // Combine live data with mocks to ensure the editorial layout is full
                const combined = [...data];
                if (combined.length < 4) {
                    const extraMocks = MOCK_PRODUCTS.slice(0, 4 - combined.length);
                    // Give mock products distinct IDs to avoid key collisions
                    const uniqueMocks = extraMocks.map(m => ({ ...m, id: `mock-${m.id}` }));
                    setProducts([...combined, ...uniqueMocks]);
                } else {
                    setProducts(data);
                }
            }
        } catch (error) {
            console.error('Error fetching featured products:', error);
            setProducts(MOCK_PRODUCTS);
        } finally {
            setLoading(false);
        }
    }

    return (
        <section className={styles.boutiqueSection}>
            <div className="container">
                <div className={styles.header}>
                    <div className={styles.intro}>
                        <span className={styles.kicker}>CURATED ARCHIVE</span>
                        <h2 className={styles.title}>The Heritage Collection</h2>
                        <p className={styles.description}>
                            Exclusive pieces precision-crafted to celebrate the 70th 
                            Anniversary of Christ the King. Limited edition and heritage-bound.
                        </p>
                    </div>
                    <div className={styles.tabs}>
                        <button className={`${styles.tab} ${styles.tabActive}`}>ALL</button>
                        <button className={styles.tab}>APPAREL</button>
                        <button className={styles.tab}>ACCESSORIES</button>
                    </div>
                </div>

                <div className={styles.categoryGrid}>
                    {products.slice(0, 4).map((product) => (
                        <Link 
                            key={product.id}
                            href={`/catalog?category=${product.categories?.name}`}
                            className={styles.card}
                        >
                            <Image 
                                src={product.images?.[0] || "/products/blazer.png"} 
                                alt={product.name}
                                fill
                                className={styles.image}
                            />
                            <div className={styles.label}>
                                {product.categories?.name || "ARCHIVE"}
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}

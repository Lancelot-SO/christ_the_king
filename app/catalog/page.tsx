"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { Search } from "lucide-react";
import { supabase } from "@/lib/supabase";
import styles from "./catalog.module.css";

const SORT_OPTIONS = ["Newest", "Price: Low to High", "Price: High to Low"];

export default function Catalog() {
    const [products, setProducts] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [activeCategory, setActiveCategory] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");
    const [sortOption, setSortOption] = useState("Newest");
    const [minPrice, setMinPrice] = useState("");
    const [maxPrice, setMaxPrice] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchInitialData();
    }, []);

    useEffect(() => {
        let isMounted = true;

        async function loadProducts() {
            try {
                setLoading(true);
                let query = supabase
                    .from('products')
                    .select('*, categories!inner(name)')
                    .eq('is_active', true);

                if (activeCategory !== "All") {
                    query = query.eq('categories.name', activeCategory);
                }

                if (searchQuery) {
                    query = query.ilike('name', `%${searchQuery}%`);
                }

                if (minPrice !== "") {
                    const min = parseFloat(minPrice);
                    if (!isNaN(min)) {
                        query = query.gte('price', min);
                    }
                }

                if (maxPrice !== "") {
                    const max = parseFloat(maxPrice);
                    if (!isNaN(max)) {
                        query = query.lte('price', max);
                    }
                }

                if (sortOption === "Price: Low to High") {
                    query = query.order('price', { ascending: true });
                } else if (sortOption === "Price: High to Low") {
                    query = query.order('price', { ascending: false });
                } else {
                    query = query.order('created_at', { ascending: false });
                }

                const { data, error } = await query;

                if (error) throw error;
                if (isMounted) {
                    setProducts(data || []);
                }
            } catch (error: any) {
                if (isMounted) {
                    console.error('Error fetching products:', error.message);
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        }

        loadProducts();

        return () => {
            isMounted = false;
        };
    }, [activeCategory, searchQuery, sortOption, minPrice, maxPrice]);

    async function fetchInitialData() {
        try {
            const { data: catData, error } = await supabase.from('categories').select('*');
            if (error) throw error;
            setCategories(catData || []);
        } catch (error: any) {
            console.error('Error fetching categories:', error.message);
        }
    }

    const clearPriceFilter = () => {
        setMinPrice("");
        setMaxPrice("");
    };

    const hasPriceFilter = minPrice !== "" || maxPrice !== "";

    return (
        <main>
            <Header light />
            <header id="hero-section" className={styles.hero}>
                <div className="container">
                    <span className="editorial-kicker">THE ARCHIVE</span>
                    <h1>The Collection</h1>
                    <p>A catalog of heritage, tradition, and exclusive artifacts for the CTK community.</p>
                </div>
            </header>

            <div className="container">
                <div className={styles.controls}>
                    <div className={styles.searchWrapper}>
                        <Search size={24} className={styles.searchIcon} />
                        <input
                            type="text"
                            placeholder="SEARCH THE COLLECTION"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={styles.searchInput}
                        />
                    </div>

                    <div className={styles.filters}>
                        <div className={styles.filterGroup}>
                            <span className={styles.filterLabel}>Artifact Type</span>
                            <div className={styles.categoryChips}>
                                <button
                                    className={`${styles.chip} ${activeCategory === "All" ? styles.chipActive : ""}`}
                                    onClick={() => setActiveCategory("All")}
                                >
                                    All
                                </button>
                                {categories.map(cat => (
                                    <button
                                        key={cat.id}
                                        className={`${styles.chip} ${activeCategory === cat.name ? styles.chipActive : ""}`}
                                        onClick={() => setActiveCategory(cat.name)}
                                    >
                                        {cat.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className={styles.sortWrapper}>
                            <span className={styles.filterLabel}>SORT BY</span>
                            <div className={styles.selectWrapper}>
                                <select
                                    className={styles.sortSelect}
                                    value={sortOption}
                                    onChange={(e) => setSortOption(e.target.value)}
                                >
                                    {SORT_OPTIONS.map(opt => (
                                        <option key={opt}>{opt}</option>
                                    ))}
                                </select>
                                <div className={styles.selectArrow}>
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="6 9 12 15 18 9"></polyline>
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={styles.priceFilter}>
                        <span className={styles.filterLabel}>VALUATION (GHS)</span>
                        <div className={styles.priceInputs}>
                            <input
                                type="number"
                                placeholder="MIN"
                                value={minPrice}
                                onChange={(e) => setMinPrice(e.target.value)}
                                className={styles.priceInput}
                            />
                            <span className={styles.priceSeparator}>—</span>
                            <input
                                type="number"
                                placeholder="MAX"
                                value={maxPrice}
                                onChange={(e) => setMaxPrice(e.target.value)}
                                className={styles.priceInput}
                            />
                            {hasPriceFilter && (
                                <button
                                    className={styles.clearPriceBtn}
                                    onClick={clearPriceFilter}
                                >
                                    CLEAR FILTERS
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                <div className={styles.resultsInfo}>
                    {loading ? "SEARCHING..." : `${products.length} ARTIFACTS FOUND`}
                </div>

                <div className={styles.grid}>
                    {products.length > 0 ? (
                        products.map(product => (
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
                    ) : !loading && (
                        <div style={{ textAlign: 'center', gridColumn: '1/-1', padding: '100px', color: 'var(--muted-foreground)' }}>
                            No artifacts matching your criteria were discovered in the archive.
                        </div>
                    )}
                </div>
            </div>

            <Footer />
        </main>
    );
}

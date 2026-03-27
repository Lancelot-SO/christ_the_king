"use client";

import { useState, useEffect, useMemo } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { Filter, Search } from "lucide-react";
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

                // Price filters applied at database level
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

                // Sort at database level
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
                    if (error.name === 'AbortError' || error.message?.includes('aborted')) {
                        return;
                    }
                    console.error('Error fetching products:', {
                        message: error.message,
                        details: error.details,
                        hint: error.hint,
                        code: error.code
                    });
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
            <Header />
            <div className={styles.hero}>
                <div className="container">
                    <h1>Catalog</h1>
                    <p>Explore the full range of centenary merchandise.</p>
                </div>
            </div>

            <div className="container">
                <div className={styles.controls}>
                    <div className={styles.searchWrapper}>
                        <Search size={18} className={styles.searchIcon} />
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={styles.searchInput}
                        />
                    </div>

                    <div className={styles.filters}>
                        <div className={styles.filterGroup}>
                            <span className={styles.filterLabel}>Category</span>
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
                            <Filter size={18} />
                            <select
                                className={styles.sortSelect}
                                value={sortOption}
                                onChange={(e) => setSortOption(e.target.value)}
                            >
                                {SORT_OPTIONS.map(opt => (
                                    <option key={opt}>{opt}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Price Filter */}
                    <div className={styles.priceFilter}>
                        <span className={styles.filterLabel}>Price Range (GHS)</span>
                        <div className={styles.priceInputs}>
                            <input
                                type="number"
                                placeholder="Min"
                                value={minPrice}
                                onChange={(e) => setMinPrice(e.target.value)}
                                className={styles.priceInput}
                                min="0"
                                step="0.01"
                            />
                            <span className={styles.priceSeparator}>—</span>
                            <input
                                type="number"
                                placeholder="Max"
                                value={maxPrice}
                                onChange={(e) => setMaxPrice(e.target.value)}
                                className={styles.priceInput}
                                min="0"
                                step="0.01"
                            />
                            {hasPriceFilter && (
                                <button
                                    className={styles.clearPriceBtn}
                                    onClick={clearPriceFilter}
                                >
                                    Clear
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                <div className={styles.resultsInfo}>
                    {loading ? "Updating results..." : `Showing ${products.length} products`}
                </div>

                <div className={styles.grid}>
                    {loading && products.length === 0 ? (
                        <div style={{ textAlign: 'center', gridColumn: '1/-1', padding: '40px' }}>Loading catalog...</div>
                    ) : products.length > 0 ? (
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
                    ) : (
                        <div style={{ textAlign: 'center', gridColumn: '1/-1', padding: '60px', color: '#6b7280' }}>
                            No products found matching your criteria.
                        </div>
                    )}
                </div>
            </div>

            <Footer />
        </main>
    );
}

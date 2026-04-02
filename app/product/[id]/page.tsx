"use client";

import { useState, useEffect, use } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ChevronLeft, ShoppingCart, Loader2, Check, Plus, Minus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useCart, MAX_CART_ITEMS, MAX_ITEM_QUANTITY } from "@/context/CartContext";
import styles from "./product.module.css";

const SIZES = ["S", "M", "L", "XL", "XXL"];

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const id = resolvedParams.id;

    const router = useRouter();
    const { addToCart, cartCount, cart: cartItems } = useCart();
    const [product, setProduct] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [selectedSize, setSelectedSize] = useState("M");
    const [selectedColor, setSelectedColor] = useState<string | null>(null);
    const [quantity, setQuantity] = useState(1);
    const [added, setAdded] = useState(false);
    const [activeImage, setActiveImage] = useState<string | null>(null);

    useEffect(() => {
        fetchProduct();
    }, [id]);

    async function fetchProduct() {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('products')
                .select('*, categories(name)')
                .eq('id', id)
                .single();

            if (error) throw error;
            setProduct(data);
            if (data?.colors && data.colors.length > 0) {
                setSelectedColor(data.colors[0]);
            }
            if (data?.images && data.images.length > 0) {
                setActiveImage(data.images[0]);
            }
        } catch (error) {
            console.error('Error fetching product:', error);
        } finally {
            setLoading(false);
        }
    }

    const handleAddToCart = () => {
        if (!product) return;

        const existingItem = cartItems.find(i => i.id === product.id && i.size === selectedSize);
        const currentItemQuantity = existingItem ? existingItem.quantity : 0;

        if (currentItemQuantity + quantity > MAX_ITEM_QUANTITY) {
            alert(`Maximum ${MAX_ITEM_QUANTITY} of this item allowed in cart.`);
            return;
        }

        addToCart({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.images?.[0] || "/products/blazer.png",
            quantity: quantity,
            size: selectedSize,
            color: selectedColor || undefined
        });

        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
    };

    const handleBuyNow = () => {
        handleAddToCart();
        router.push("/checkout");
    };

    if (loading) {
        return (
            <main>
                <Header />
                <div className={styles.loaderContainer}>
                    <Loader2 className={styles.spin} size={40} />
                    <p className="editorial-kicker">ARCHIVE SEARCH IN PROGRESS</p>
                </div>
            </main>
        );
    }

    if (!product) {
        return (
            <main>
                <Header />
                <div className={styles.errorContainer}>
                    <h2 className={styles.title}>Artifact Not Discovered</h2>
                    <p>The piece you seek is currently unavailable in our archives.</p>
                    <Link href="/catalog" className={styles.backBtn}>
                        <ChevronLeft size={16} /> RETURN TO THE COLLECTION
                    </Link>
                </div>
                <Footer />
            </main>
        );
    }

    const galleryImages = product.images?.length > 0 ? product.images : ["/products/blazer.png"];
    const displayImage = activeImage || galleryImages[0];
    const isSoldOut = (product.stock_quantity ?? 0) <= 0;

    return (
        <main>
            <Header />

            <div id="hero-section" className="container" style={{ paddingTop: '160px' }}>
                <Link href="/catalog" className={styles.backBtn}>
                    <ChevronLeft size={16} /> THE COLLECTION
                </Link>

                <div className={styles.productGrid}>
                    <div className={styles.imageGallery}>
                        <div className={styles.mainImage}>
                            <Image
                                src={displayImage}
                                alt={product.name}
                                fill
                                className={styles.img}
                                priority
                            />
                            {isSoldOut && (
                                <div className={styles.soldOutBadge}>DEPLEATED</div>
                            )}
                        </div>
                        <div className={styles.thumbnails}>
                            {galleryImages.map((img: string, i: number) => (
                                <div 
                                    key={i} 
                                    className={`${styles.thumbnail} ${displayImage === img ? styles.thumbnailActive : ""}`}
                                    onClick={() => setActiveImage(img)}
                                >
                                    <Image src={img} alt={product.name} fill className={styles.img} />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className={styles.details}>
                        <span className={styles.category}>{product.categories?.name || 'Heritage Piece'}</span>
                        <h1 className={styles.title}>{product.name}</h1>
                        <p className={styles.price}>GHS {product.price.toLocaleString()}</p>

                        <div className={styles.divider}></div>

                        <p className={styles.description}>{product.description || "Official commemorative archival heritage piece for Christ the King School."}</p>
                        
                        <div className={styles.optionGroup}>
                            <span className={styles.optionLabel}>SELECT SIZE</span>
                            <div className={styles.sizeSelector}>
                                {(product.sizes && product.sizes.length > 0 ? product.sizes : SIZES).map((size: string) => (
                                    <button
                                        key={size}
                                        className={`${styles.sizeBtn} ${selectedSize === size ? styles.sizeActive : ""}`}
                                        onClick={() => setSelectedSize(size)}
                                        disabled={isSoldOut}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className={styles.optionGroup}>
                            <span className={styles.optionLabel}>QUANTITY</span>
                            <div className={styles.quantitySelector}>
                                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} disabled={isSoldOut}>
                                    <Minus size={14} />
                                </button>
                                <span>{quantity}</span>
                                <button onClick={() => setQuantity(quantity + 1)} disabled={isSoldOut}>
                                    <Plus size={14} />
                                </button>
                            </div>
                        </div>

                        <div className={styles.actions}>
                            <button
                                className={`${styles.addToCart} ${added ? styles.added : ""}`}
                                onClick={handleAddToCart}
                                disabled={added || isSoldOut || cartCount >= MAX_CART_ITEMS}
                            >
                                {isSoldOut ? 'DEPLEATED' : (added ? <><Check size={16} /> IN CART</> : <><ShoppingCart size={16} /> ADD TO CART</>)}
                            </button>
                            <button 
                                className={styles.buyNow} 
                                onClick={handleBuyNow}
                                disabled={isSoldOut}
                            >
                                PURCHASE NOW
                            </button>
                        </div>

                        <div className={styles.shippingInfo}>
                            <p>✓ PRIORITY SHIPPING IN ACCRA</p>
                            <p>✓ GLOBAL HERITAGE LOGISTICS AVAILABLE</p>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </main>
    );
}

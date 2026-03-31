"use client";

import { useState, useEffect, use } from "react";
import Header from "@/components/Header";
import { ChevronLeft, ShoppingCart, Share2, Heart, Loader2, Check } from "lucide-react";
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
            // Set default color if colors are available
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
            alert(`You can only have up to ${MAX_ITEM_QUANTITY} of this item in your cart.`);
            return;
        }

        if (cartCount + quantity > MAX_CART_ITEMS) {
            alert(`Your cart is full. Maximum ${MAX_CART_ITEMS} items allowed.`);
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
                    <p>Loading product details...</p>
                </div>
            </main>
        );
    }

    if (!product) {
        return (
            <main>
                <Header />
                <div className={styles.errorContainer}>
                    <h2>Product Not Found</h2>
                    <p>The product you're looking for doesn't exist or has been removed.</p>
                    <Link href="/catalog" className={styles.backBtn}>Return to Catalog</Link>
                </div>
            </main>
        );
    }

    const fallbackImage = "/products/blazer.png";
    const galleryImages = product.images?.length > 0 ? product.images : [fallbackImage];
const displayImage = activeImage || galleryImages[0] || fallbackImage;
    const isSoldOut = (product.stock_quantity ?? 0) <= 0;
    const isLowStock = !isSoldOut && product.stock_quantity <= 10;

    return (
        <main>
            <Header />

            <div className="container" style={{ paddingTop: '120px' }}>
                <Link href="/catalog" className={styles.backBtn}>
                    <ChevronLeft size={20} /> Back to Catalog
                </Link>

                <div className={styles.productGrid}>
                    <div className={styles.imageGallery}>
                        <div className={styles.mainImage}>
                            <Image
                                src={displayImage}
                                alt={product.name}
                                fill
                                className={`${styles.img} ${isSoldOut ? styles.soldOutImage : ""}`}
                                priority
                            />
                            {isSoldOut && (
                                <div className={styles.soldOutBadge}>Sold Out</div>
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
                        {isLowStock && (
                            <div className={styles.lowStockLabel}>Only {product.stock_quantity} remaining</div>
                        )}
                        <span className={styles.category}>{product.categories?.name || 'Commemorative'}</span>
                        <h1 className={styles.title}>{product.name}</h1>
                        <p className={styles.price}>GH₵ {product.price.toLocaleString()}</p>

                        <div className={styles.divider}></div>

                        <p className={styles.description}>{product.description || "Official commemorative merchandise for Christ the King School."}</p>
                        {product.sku && <p className={styles.sku}><strong>SKU:</strong> {product.sku}</p>}

                        <div className={styles.options}>
                            {/* Color Selector */}
                            {product.colors && product.colors.length > 0 && (
                                <div className={styles.optionGroup}>
                                    <span className={styles.optionLabel}>Color</span>
                                    <div className={styles.colorSelector}>
                                        {product.colors.map((color: string) => (
                                            <button
                                                key={color}
                                                className={`${styles.colorBtn} ${selectedColor === color ? styles.colorActive : ""}`}
                                                onClick={() => setSelectedColor(color)}
                                                title={color}
                                                style={{ backgroundColor: color.toLowerCase() }}
                                            >
                                                <span className={styles.colorLabel}>{color}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Size Selector */}
                            <div className={styles.optionGroup}>
                                <span className={styles.optionLabel}>Size</span>
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
                                <span className={styles.optionLabel}>Quantity</span>
                                <div className={styles.quantitySelector}>
                                    <button 
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        disabled={isSoldOut}
                                    >-</button>
                                    <span>{quantity}</span>
                                    <button 
                                        onClick={() => {
                                            const existingItem = cartItems.find(i => i.id === product.id && i.size === selectedSize);
                                            const currentItemQuantity = existingItem ? existingItem.quantity : 0;
                                            setQuantity(Math.min(product.stock_quantity || 1, MAX_ITEM_QUANTITY - currentItemQuantity, quantity + 1));
                                        }}
                                        disabled={isSoldOut || quantity >= (product.stock_quantity || 0) || (quantity + (cartItems.find(i => i.id === product.id && i.size === selectedSize)?.quantity || 0)) >= MAX_ITEM_QUANTITY}
                                    >+</button>
                                </div>
                            </div>
                        </div>

                        <div className={styles.actions}>
                            <button
                                className={`${styles.addToCart} ${added ? styles.added : ""} ${isSoldOut || cartCount >= MAX_CART_ITEMS ? styles.soldOutBtn : ""}`}
                                onClick={handleAddToCart}
                                disabled={added || isSoldOut || cartCount >= MAX_CART_ITEMS}
                                title={cartCount >= MAX_CART_ITEMS ? "Cart is full" : ""}
                            >
                                {isSoldOut ? 'Sold Out' : (added ? <><Check size={20} /> Added!</> : <><ShoppingCart size={20} /> Add to Cart</>)}
                            </button>
                            <button 
                                className={`${styles.buyNow} ${isSoldOut || cartCount >= MAX_CART_ITEMS ? styles.soldOutBtn : ""}`} 
                                onClick={handleBuyNow}
                                disabled={isSoldOut || cartCount >= MAX_CART_ITEMS}
                            >
                                {isSoldOut ? 'Out of Stock' : 'Buy It Now'}
                            </button>
                        </div>

                        <div className={styles.shippingInfo}>
                            <p>✓ Free delivery within Accra</p>
                            <p>✓ International shipping available</p>
                            <p>✓ Estimated delivery: 3-5 business days</p>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}

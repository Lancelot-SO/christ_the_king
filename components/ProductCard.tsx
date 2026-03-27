"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Eye, Check, Heart } from "lucide-react";
import { useCart, MAX_CART_ITEMS } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import styles from "./ProductCard.module.css";

interface ProductCardProps {
    id: string;
    name: string;
    price: number;
    image: string;
    category: string;
    stock_quantity?: number;
}

// Validate if a URL is a proper image URL
function isValidImageUrl(url: string): boolean {
    if (!url) return false;

    // Check for common invalid patterns (page URLs instead of image URLs)
    const invalidPatterns = [
        /pinterest\.com\/pin\//i,
        /instagram\.com\/p\//i,
        /facebook\.com/i,
        /twitter\.com/i,
    ];

    if (invalidPatterns.some(pattern => pattern.test(url))) {
        return false;
    }

    // Basic URL validation
    try {
        new URL(url);
        return true;
    } catch {
        return url.startsWith('/'); // Allow relative paths
    }
}

const FALLBACK_IMAGE = "/products/blazer.png";

export default function ProductCard({ id, name, price, image, category, stock_quantity = 0 }: ProductCardProps) {
    const { addToCart, cartCount } = useCart();
    const { toggleWishlist, isInWishlist } = useWishlist();
    const isWishlisted = isInWishlist(id);
    const [imgSrc, setImgSrc] = useState(() =>
        isValidImageUrl(image) ? image : FALLBACK_IMAGE
    );
    const [hasError, setHasError] = useState(false);
    const [added, setAdded] = useState(false);

    const isSoldOut = stock_quantity <= 0;

    const handleImageError = () => {
        if (!hasError) {
            setHasError(true);
            setImgSrc(FALLBACK_IMAGE);
        }
    };

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (isSoldOut) return;

        addToCart({
            id,
            name,
            price,
            image: imgSrc,
            quantity: 1,
            size: "M", // Default size for quick add
        });

        setAdded(true);
        setTimeout(() => setAdded(false), 1500);
    };

    return (
        <div className={`${styles.card} premium-card ${isSoldOut ? styles.soldOutCard : ''}`}>
            <div className={styles.imageContainer}>
                <Link href={`/product/${id}`} className={styles.imageLink}>
                    <Image
                        src={imgSrc}
                        alt={name}
                        fill
                        className={styles.image}
                        onError={handleImageError}
                    />
                    {isSoldOut && (
                        <div className={styles.soldOutBadge}>Sold Out</div>
                    )}
                </Link>
                <div className={styles.actions}>
                    <button 
                        className={`${styles.actionBtn} ${added ? styles.added : ""} ${isSoldOut || cartCount >= MAX_CART_ITEMS ? styles.disabledBtn : ""}`}
                        onClick={handleAddToCart}
                        disabled={isSoldOut || cartCount >= MAX_CART_ITEMS}
                        title={isSoldOut ? "Sold Out" : (cartCount >= MAX_CART_ITEMS ? "Cart is full" : (added ? "Added to cart!" : "Add to cart"))}
                    >
                        {added ? <Check size={18} /> : (isSoldOut ? <ShoppingCart size={18} opacity={0.5} /> : <ShoppingCart size={18} />)}
                    </button>
                    <button 
                        className={`${styles.actionBtn} ${isWishlisted ? styles.activeWishlist : ""}`}
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            toggleWishlist(id);
                        }}
                        title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                    >
                        <Heart size={18} fill={isWishlisted ? "currentColor" : "none"} />
                    </button>
                    <Link href={`/product/${id}`} className={styles.actionBtn}>
                        <Eye size={18} />
                    </Link>
                </div>
            </div>
            <div className={styles.content}>
                <div className={styles.meta}>
                    <span className={styles.category}>{category}</span>
                    {stock_quantity > 0 && stock_quantity <= 10 && (
                        <span className={styles.lowStock}>Only {stock_quantity} left</span>
                    )}
                </div>
                <Link href={`/product/${id}`}>
                    <h3 className={styles.name}>{name}</h3>
                </Link>
                <div className={styles.priceRow}>
                    <p className={styles.price}>GH₵ {price.toLocaleString()}</p>
                    {isSoldOut && <span className={styles.soldOutText}>Sold Out</span>}
                </div>
            </div>
        </div>
    );
}

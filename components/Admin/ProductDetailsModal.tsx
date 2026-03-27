"use client";

import { X, Package, Tag, Layers, Scale, Calendar, BarChart3, Eye, EyeOff, Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import styles from "./ProductDetailsModal.module.css";

interface Product {
    id: string;
    name: string;
    slug: string;
    sku: string;
    price: number;
    sale_price: number | null;
    stock_quantity: number;
    category_id: string | null;
    description: string | null;
    weight: number | null;
    images: string[];
    sizes: string[];
    colors: string[];
    low_stock_threshold: number;
    is_active: boolean;
    is_featured: boolean;
    created_at: string;
    updated_at: string;
    categories?: { name: string } | null;
}

interface ProductDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    product: Product | null;
    onEdit: () => void;
}

export default function ProductDetailsModal({ isOpen, onClose, product, onEdit }: ProductDetailsModalProps) {
    if (!product) return null;

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStockStatus = () => {
        if (product.stock_quantity === 0) return { label: 'Out of Stock', className: styles.outOfStock };
        if (product.stock_quantity <= product.low_stock_threshold) return { label: 'Low Stock', className: styles.lowStock };
        return { label: 'In Stock', className: styles.inStock };
    };

    const stockStatus = getStockStatus();

    return (
        <AnimatePresence>
            {isOpen && (
                <div className={styles.overlay} onClick={onClose}>
                    <motion.div
                        className={styles.drawer}
                        initial={{ opacity: 0, x: 100 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 100 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <header className={styles.header}>
                            <h2>Product Details</h2>
                            <button onClick={onClose} className={styles.closeBtn}>
                                <X size={20} />
                            </button>
                        </header>

                        <div className={styles.content}>
                            {/* Product Images Gallery */}
                            <div className={styles.imageGallery}>
                                {product.images && product.images.length > 0 ? (
                                    <div className={styles.mainImage}>
                                        <Image
                                            src={product.images[0]}
                                            alt={product.name}
                                            fill
                                            style={{ objectFit: 'cover' }}
                                        />
                                    </div>
                                ) : (
                                    <div className={styles.noImage}>
                                        <Package size={48} />
                                        <span>No image available</span>
                                    </div>
                                )}
                                {product.images && product.images.length > 1 && (
                                    <div className={styles.thumbnails}>
                                        {product.images.slice(1, 4).map((img, idx) => (
                                            <div key={idx} className={styles.thumbnail}>
                                                <Image
                                                    src={img}
                                                    alt={`${product.name} ${idx + 2}`}
                                                    fill
                                                    style={{ objectFit: 'cover' }}
                                                />
                                            </div>
                                        ))}
                                        {product.images.length > 4 && (
                                            <div className={styles.moreImages}>
                                                +{product.images.length - 4} more
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Product Info */}
                            <div className={styles.productHeader}>
                                <div className={styles.badges}>
                                    <span className={`${styles.statusBadge} ${stockStatus.className}`}>
                                        {stockStatus.label}
                                    </span>
                                    {product.is_featured && (
                                        <span className={styles.featuredBadge}>
                                            <Star size={12} /> Featured
                                        </span>
                                    )}
                                    <span className={`${styles.activeBadge} ${product.is_active ? styles.active : styles.inactive}`}>
                                        {product.is_active ? <><Eye size={12} /> Active</> : <><EyeOff size={12} /> Inactive</>}
                                    </span>
                                </div>
                                <h1 className={styles.productName}>{product.name}</h1>
                                <p className={styles.sku}><Tag size={14} /> SKU: {product.sku || 'N/A'}</p>
                            </div>

                            {/* Pricing */}
                            <div className={styles.priceSection}>
                                <div className={styles.priceMain}>
                                    {product.sale_price ? (
                                        <>
                                            <span className={styles.salePrice}>GHS {product.sale_price.toLocaleString()}</span>
                                            <span className={styles.originalPrice}>GHS {product.price.toLocaleString()}</span>
                                            <span className={styles.discount}>
                                                -{Math.round((1 - product.sale_price / product.price) * 100)}%
                                            </span>
                                        </>
                                    ) : (
                                        <span className={styles.price}>GHS {product.price.toLocaleString()}</span>
                                    )}
                                </div>
                            </div>

                            {/* Stats Grid */}
                            <div className={styles.statsGrid}>
                                <div className={styles.statCard}>
                                    <BarChart3 size={20} />
                                    <div className={styles.statInfo}>
                                        <span className={styles.statValue}>{product.stock_quantity}</span>
                                        <span className={styles.statLabel}>In Stock</span>
                                    </div>
                                </div>
                                <div className={styles.statCard}>
                                    <Layers size={20} />
                                    <div className={styles.statInfo}>
                                        <span className={styles.statValue}>{product.low_stock_threshold}</span>
                                        <span className={styles.statLabel}>Low Threshold</span>
                                    </div>
                                </div>
                                {product.weight && (
                                    <div className={styles.statCard}>
                                        <Scale size={20} />
                                        <div className={styles.statInfo}>
                                            <span className={styles.statValue}>{product.weight} kg</span>
                                            <span className={styles.statLabel}>Weight</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Category */}
                            {product.categories?.name && (
                                <div className={styles.infoRow}>
                                    <span className={styles.infoLabel}>Category</span>
                                    <span className={styles.infoValue}>{product.categories.name}</span>
                                </div>
                            )}

                            {/* Sizes */}
                            {product.sizes && product.sizes.length > 0 && (
                                <div className={styles.section}>
                                    <h3 className={styles.sectionTitle}>Available Sizes</h3>
                                    <div className={styles.sizeTags}>
                                        {product.sizes.map(size => (
                                            <span key={size} className={styles.sizeTag}>{size}</span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Colors */}
                            {product.colors && product.colors.length > 0 && (
                                <div className={styles.section}>
                                    <h3 className={styles.sectionTitle}>Available Colors</h3>
                                    <div className={styles.colorSwatches}>
                                        {product.colors.map((color, idx) => (
                                            <div
                                                key={idx}
                                                className={styles.colorSwatch}
                                                style={{ backgroundColor: color }}
                                                title={color}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Description */}
                            {product.description && (
                                <div className={styles.section}>
                                    <h3 className={styles.sectionTitle}>Description</h3>
                                    <p className={styles.description}>{product.description}</p>
                                </div>
                            )}

                            {/* Timestamps */}
                            <div className={styles.timestamps}>
                                <div className={styles.timestamp}>
                                    <Calendar size={14} />
                                    <span>Created: {formatDate(product.created_at)}</span>
                                </div>
                                {product.updated_at && (
                                    <div className={styles.timestamp}>
                                        <Calendar size={14} />
                                        <span>Updated: {formatDate(product.updated_at)}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <footer className={styles.footer}>
                            <button onClick={onClose} className={styles.cancelBtn}>
                                Close
                            </button>
                            <button onClick={onEdit} className={styles.editBtn}>
                                Edit Product
                            </button>
                        </footer>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

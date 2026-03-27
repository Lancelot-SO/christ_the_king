"use client";

import { useState } from "react";
import { X, Trash2, Loader2, AlertTriangle, Package } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import styles from "./DeleteConfirmModal.module.css";

interface Product {
    id: string;
    name: string;
    sku: string;
    stock_quantity: number;
    images?: string[];
}

interface DeleteConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    product: Product | null;
}

export default function DeleteConfirmModal({ isOpen, onClose, onSuccess, product }: DeleteConfirmModalProps) {
    const [loading, setLoading] = useState(false);
    const [confirmText, setConfirmText] = useState('');

    const handleDelete = async () => {
        if (!product) return;

        setLoading(true);

        try {
            const { error } = await supabase
                .from('products')
                .delete()
                .eq('id', product.id);

            if (error) throw error;

            onSuccess();
            onClose();
            setConfirmText('');
        } catch (error: any) {
            console.error('Error deleting product:', error);
            alert(`Failed to delete product: ${error.message || 'Unknown error'}`);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        onClose();
        setConfirmText('');
    };

    const canDelete = confirmText.toLowerCase() === 'delete';

    return (
        <AnimatePresence>
            {isOpen && product && (
                <div className={styles.overlay}>
                    <motion.div
                        className={styles.modal}
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    >
                        <header className={styles.header}>
                            <div className={styles.warningIcon}>
                                <AlertTriangle size={24} />
                            </div>
                            <h2>Delete Product</h2>
                            <button onClick={handleClose} className={styles.closeBtn}>
                                <X size={20} />
                            </button>
                        </header>

                        <div className={styles.content}>
                            {/* Product Info */}
                            <div className={styles.productInfo}>
                                <div className={styles.productImage}>
                                    {product.images?.[0] ? (
                                        <img src={product.images[0]} alt={product.name} />
                                    ) : (
                                        <Package size={24} />
                                    )}
                                </div>
                                <div className={styles.productDetails}>
                                    <h3>{product.name}</h3>
                                    <span>SKU: {product.sku || 'N/A'}</span>
                                    <span className={styles.stockInfo}>
                                        {product.stock_quantity} items in stock
                                    </span>
                                </div>
                            </div>

                            <div className={styles.warningBox}>
                                <p>
                                    <strong>This action cannot be undone.</strong> This will permanently delete the
                                    product <strong>&quot;{product.name}&quot;</strong> from your inventory.
                                </p>
                                <ul>
                                    <li>All product data will be lost</li>
                                    <li>Stock history will be deleted</li>
                                    <li>Product will be removed from all categories</li>
                                </ul>
                            </div>

                            <div className={styles.confirmInput}>
                                <label>
                                    Type <strong>DELETE</strong> to confirm:
                                </label>
                                <input
                                    type="text"
                                    value={confirmText}
                                    onChange={(e) => setConfirmText(e.target.value)}
                                    placeholder="DELETE"
                                    autoComplete="off"
                                />
                            </div>
                        </div>

                        <footer className={styles.footer}>
                            <button onClick={handleClose} className={styles.cancelBtn}>
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                className={styles.deleteBtn}
                                disabled={loading || !canDelete}
                            >
                                {loading ? (
                                    <Loader2 className={styles.spin} size={18} />
                                ) : (
                                    <Trash2 size={18} />
                                )}
                                {loading ? "Deleting..." : "Delete Product"}
                            </button>
                        </footer>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

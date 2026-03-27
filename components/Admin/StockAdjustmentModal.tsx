"use client";

import { useState } from "react";
import { X, Plus, Minus, Save, Loader2, Package, ArrowUp, ArrowDown, RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import styles from "./StockAdjustmentModal.module.css";

interface Product {
    id: string;
    name: string;
    sku: string;
    stock_quantity: number;
    low_stock_threshold: number;
    images?: string[];
}

interface StockAdjustmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    product: Product | null;
}

type AdjustmentType = 'add' | 'remove' | 'set';

const ADJUSTMENT_REASONS = [
    'Stock Received',
    'Inventory Correction',
    'Return Processed',
    'Damaged Goods',
    'Order Cancelled',
    'Manual Adjustment',
    'Stocktake',
    'Transfer In',
    'Transfer Out',
    'Other'
];

export default function StockAdjustmentModal({ isOpen, onClose, onSuccess, product }: StockAdjustmentModalProps) {
    const [loading, setLoading] = useState(false);
    const [adjustmentType, setAdjustmentType] = useState<AdjustmentType>('add');
    const [quantity, setQuantity] = useState('');
    const [reason, setReason] = useState('');
    const [notes, setNotes] = useState('');

    const calculateNewStock = (): number => {
        if (!product || !quantity) return product?.stock_quantity || 0;
        const qty = parseInt(quantity) || 0;

        switch (adjustmentType) {
            case 'add':
                return product.stock_quantity + qty;
            case 'remove':
                return Math.max(0, product.stock_quantity - qty);
            case 'set':
                return qty;
            default:
                return product.stock_quantity;
        }
    };

    const getStockDifference = (): number => {
        if (!product) return 0;
        return calculateNewStock() - product.stock_quantity;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!product || !quantity) return;

        setLoading(true);

        try {
            const newQuantity = calculateNewStock();
            const changeAmount = getStockDifference();

            // Update product stock
            const { error: updateError } = await supabase
                .from('products')
                .update({
                    stock_quantity: newQuantity,
                    updated_at: new Date().toISOString()
                })
                .eq('id', product.id);

            if (updateError) throw updateError;

            // Log stock history
            const { error: historyError } = await supabase
                .from('stock_history')
                .insert([{
                    product_id: product.id,
                    change_amount: changeAmount,
                    reason: `${reason}${notes ? ': ' + notes : ''}`
                }]);

            if (historyError) {
                console.warn('Could not log stock history:', historyError);
                // Continue anyway as main operation succeeded
            }

            onSuccess();
            onClose();
            resetForm();
        } catch (error: any) {
            console.error('Error adjusting stock:', error);
            alert(`Failed to adjust stock: ${error.message || 'Unknown error'}`);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setAdjustmentType('add');
        setQuantity('');
        setReason('');
        setNotes('');
    };

    const handleClose = () => {
        onClose();
        resetForm();
    };

    const newStock = calculateNewStock();
    const stockDiff = getStockDifference();

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
                            <h2>Adjust Stock</h2>
                            <button onClick={handleClose} className={styles.closeBtn}>
                                <X size={20} />
                            </button>
                        </header>

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
                                <span className={styles.sku}>SKU: {product.sku || 'N/A'}</span>
                            </div>
                            <div className={styles.currentStock}>
                                <span className={styles.stockLabel}>Current Stock</span>
                                <span className={styles.stockValue}>{product.stock_quantity}</span>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className={styles.form}>
                            {/* Adjustment Type */}
                            <div className={styles.adjustmentTypes}>
                                <button
                                    type="button"
                                    className={`${styles.typeBtn} ${adjustmentType === 'add' ? styles.active : ''}`}
                                    onClick={() => setAdjustmentType('add')}
                                >
                                    <Plus size={18} />
                                    <span>Add Stock</span>
                                </button>
                                <button
                                    type="button"
                                    className={`${styles.typeBtn} ${adjustmentType === 'remove' ? styles.active : ''}`}
                                    onClick={() => setAdjustmentType('remove')}
                                >
                                    <Minus size={18} />
                                    <span>Remove Stock</span>
                                </button>
                                <button
                                    type="button"
                                    className={`${styles.typeBtn} ${adjustmentType === 'set' ? styles.active : ''}`}
                                    onClick={() => setAdjustmentType('set')}
                                >
                                    <RotateCcw size={18} />
                                    <span>Set Total</span>
                                </button>
                            </div>

                            {/* Quantity Input */}
                            <div className={styles.inputGroup}>
                                <label>
                                    {adjustmentType === 'set' ? 'New Stock Quantity' : 'Quantity to ' + (adjustmentType === 'add' ? 'Add' : 'Remove')}
                                </label>
                                <div className={styles.quantityInput}>
                                    <button
                                        type="button"
                                        className={styles.quantityBtn}
                                        onClick={() => setQuantity(String(Math.max(0, (parseInt(quantity) || 0) - 1)))}
                                    >
                                        <Minus size={16} />
                                    </button>
                                    <input
                                        type="number"
                                        min="0"
                                        value={quantity}
                                        onChange={(e) => setQuantity(e.target.value)}
                                        placeholder="0"
                                        required
                                    />
                                    <button
                                        type="button"
                                        className={styles.quantityBtn}
                                        onClick={() => setQuantity(String((parseInt(quantity) || 0) + 1))}
                                    >
                                        <Plus size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Stock Preview */}
                            {quantity && (
                                <div className={styles.stockPreview}>
                                    <div className={styles.previewRow}>
                                        <span>Current Stock</span>
                                        <span>{product.stock_quantity}</span>
                                    </div>
                                    <div className={styles.previewRow}>
                                        <span>Change</span>
                                        <span className={stockDiff >= 0 ? styles.positive : styles.negative}>
                                            {stockDiff >= 0 ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                                            {stockDiff >= 0 ? '+' : ''}{stockDiff}
                                        </span>
                                    </div>
                                    <div className={`${styles.previewRow} ${styles.newStock}`}>
                                        <span>New Stock</span>
                                        <span className={newStock <= product.low_stock_threshold ? styles.warning : ''}>
                                            {newStock}
                                            {newStock <= product.low_stock_threshold && ' ⚠️'}
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* Reason */}
                            <div className={styles.inputGroup}>
                                <label>Reason for Adjustment</label>
                                <select
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    required
                                >
                                    <option value="">Select a reason...</option>
                                    {ADJUSTMENT_REASONS.map(r => (
                                        <option key={r} value={r}>{r}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Notes */}
                            <div className={styles.inputGroup}>
                                <label>Additional Notes (Optional)</label>
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Add any additional details..."
                                    rows={2}
                                />
                            </div>

                            <footer className={styles.footer}>
                                <button type="button" onClick={handleClose} className={styles.cancelBtn}>
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className={styles.submitBtn}
                                    disabled={loading || !quantity || !reason}
                                >
                                    {loading ? <Loader2 className={styles.spin} size={18} /> : <Save size={18} />}
                                    {loading ? "Updating..." : "Update Stock"}
                                </button>
                            </footer>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

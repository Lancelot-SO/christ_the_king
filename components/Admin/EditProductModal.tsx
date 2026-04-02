"use client";

import { useState, useEffect } from "react";
import { X, Save, Loader2, Plus, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import styles from "./AddProductModal.module.css";
import ImageUpload from "./ImageUpload";

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
}

interface EditProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    product: Product | null;
}

export default function EditProductModal({ isOpen, onClose, onSuccess, product }: EditProductModalProps) {
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState<any[]>([]);
    const [formData, setFormData] = useState({
        name: "",
        slug: "",
        sku: "",
        price: "",
        sale_price: "",
        stock_quantity: "",
        category_id: "",
        description: "",
        weight: "",
        low_stock_threshold: "",
        is_active: true,
        is_featured: false,
    });
    const [images, setImages] = useState<string[]>([]);
    const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
    const [colors, setColors] = useState<string[]>(['#000000']);

    const availableSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

    useEffect(() => {
        if (isOpen) {
            fetchCategories();
            if (product) {
                setFormData({
                    name: product.name || "",
                    slug: product.slug || "",
                    sku: product.sku || "",
                    price: product.price?.toString() || "",
                    sale_price: product.sale_price?.toString() || "",
                    stock_quantity: product.stock_quantity?.toString() || "",
                    category_id: product.category_id || "",
                    description: product.description || "",
                    weight: product.weight?.toString() || "",
                    low_stock_threshold: product.low_stock_threshold?.toString() || "5",
                    is_active: product.is_active ?? true,
                    is_featured: product.is_featured ?? false,
                });
                setImages(product.images || []);
                setSelectedSizes(product.sizes || []);
                setColors(product.colors?.length ? product.colors : ['#000000']);
            }
        }
    }, [isOpen, product]);

    async function fetchCategories() {
        const { data } = await supabase.from('categories').select('*');
        setCategories(data || []);
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;

        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData(prev => ({
                ...prev,
                [name]: checked
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value,
                ...(name === 'name' ? { slug: value.toLowerCase().replace(/\s+/g, '-') } : {})
            }));
        }
    };


    const toggleSize = (size: string) => {
        setSelectedSizes(prev =>
            prev.includes(size)
                ? prev.filter(s => s !== size)
                : [...prev, size]
        );
    };

    const handleColorChange = (index: number, value: string) => {
        const newColors = [...colors];
        newColors[index] = value;
        setColors(newColors);
    };

    const addColorField = () => {
        setColors([...colors, '#000000']);
    };

    const removeColorField = (index: number) => {
        if (colors.length > 1) {
            const newColors = colors.filter((_, i) => i !== index);
            setColors(newColors);
        }
    };

    const generateUniqueSlug = async (baseSlug: string, currentProductId: string) => {
        let slug = baseSlug;
        let counter = 1;
        let unique = false;
        const maxAttempts = 10;
        let attempts = 0;

        while (!unique && attempts < maxAttempts) {
            attempts++;
            const { data, error } = await supabase
                .from('products')
                .select('slug')
                .eq('slug', slug)
                .neq('id', currentProductId)
                .maybeSingle();

            if (error) {
                console.error("Error checking slug uniqueness:", error);
                return slug;
            }

            if (!data) {
                unique = true;
            } else {
                slug = `${baseSlug}-${counter}`;
                counter++;
            }
        }
        return slug;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!product) return;

        setLoading(true);

        try {
            const baseSlug = formData.slug || formData.name.toLowerCase().replace(/\s+/g, '-');
            const uniqueSlug = await generateUniqueSlug(baseSlug, product.id);

            const productData = {
                name: formData.name,
                slug: uniqueSlug,
                sku: formData.sku,
                price: parseFloat(formData.price),
                sale_price: formData.sale_price ? parseFloat(formData.sale_price) : null,
                stock_quantity: parseInt(formData.stock_quantity),
                category_id: formData.category_id || null,
                description: formData.description || null,
                weight: formData.weight ? parseFloat(formData.weight) : null,
                images: images.filter(img => img.trim() !== ''),
                sizes: selectedSizes,
                colors: colors.filter(c => c.trim() !== ''),
                low_stock_threshold: parseInt(formData.low_stock_threshold) || 5,
                is_active: formData.is_active,
                is_featured: formData.is_featured,
                updated_at: new Date().toISOString(),
            };

            const updatePromise = supabase
                .from('products')
                .update(productData)
                .eq('id', product.id);
                
            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error("Database request timed out (15s). Please check your connection.")), 15000)
            );

            const { error } = await Promise.race([updatePromise, timeoutPromise]) as any;

            if (error) throw error;

            onSuccess();
            onClose();
        } catch (error: any) {
            console.error('Error updating product:', error.message || error);
            alert(`Failed to update product: ${error.message || 'Unknown error'}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className={styles.overlay}>
                    <motion.div
                        className={styles.modal}
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    >
                        <header className={styles.header}>
                            <h2>Edit Product</h2>
                            <button onClick={onClose} className={styles.closeBtn}>
                                <X size={20} />
                            </button>
                        </header>

                        <form onSubmit={handleSubmit} className={styles.form}>
                            <div className={styles.grid}>
                                <div className={styles.inputGroup}>
                                    <label>Product Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        placeholder="e.g. School Blazer"
                                    />
                                </div>
                                <div className={styles.inputGroup}>
                                    <label>SKU</label>
                                    <input
                                        type="text"
                                        name="sku"
                                        value={formData.sku}
                                        onChange={handleChange}
                                        required
                                        placeholder="e.g. CB-001"
                                    />
                                </div>
                                <div className={styles.inputGroup}>
                                    <label>Price (GHS)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleChange}
                                        required
                                        placeholder="0.00"
                                    />
                                </div>
                                <div className={styles.inputGroup}>
                                    <label>Sale Price (GHS)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        name="sale_price"
                                        value={formData.sale_price}
                                        onChange={handleChange}
                                        placeholder="0.00 (optional)"
                                    />
                                </div>
                                <div className={styles.inputGroup}>
                                    <label>Stock Quantity</label>
                                    <input
                                        type="number"
                                        name="stock_quantity"
                                        value={formData.stock_quantity}
                                        onChange={handleChange}
                                        required
                                        placeholder="0"
                                    />
                                </div>
                                <div className={styles.inputGroup}>
                                    <label>Low Stock Threshold</label>
                                    <input
                                        type="number"
                                        name="low_stock_threshold"
                                        value={formData.low_stock_threshold}
                                        onChange={handleChange}
                                        placeholder="5"
                                    />
                                </div>
                                <div className={styles.inputGroup}>
                                    <label>Weight (kg)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        name="weight"
                                        value={formData.weight}
                                        onChange={handleChange}
                                        placeholder="0.00 (optional)"
                                    />
                                </div>
                                <div className={styles.inputGroup}>
                                    <label>Category</label>
                                    <select
                                        name="category_id"
                                        value={formData.category_id}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">Select Category</option>
                                        {categories.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className={styles.inputGroupFull}>
                                    <label>Product Status</label>
                                    <div className={styles.checkboxGroup}>
                                        <label className={styles.checkboxLabel}>
                                            <input
                                                type="checkbox"
                                                name="is_active"
                                                checked={formData.is_active}
                                                onChange={handleChange}
                                            />
                                            <span>Active (visible to customers)</span>
                                        </label>
                                        <label className={styles.checkboxLabel}>
                                            <input
                                                type="checkbox"
                                                name="is_featured"
                                                checked={formData.is_featured}
                                                onChange={handleChange}
                                            />
                                            <span>Featured Product</span>
                                        </label>
                                    </div>
                                </div>
                                <div className={styles.inputGroupFull}>
                                    <label>Available Sizes</label>
                                    <div className={styles.sizeChips}>
                                        {availableSizes.map(size => (
                                            <button
                                                key={size}
                                                type="button"
                                                className={`${styles.sizeChip} ${selectedSizes.includes(size) ? styles.sizeChipActive : ''}`}
                                                onClick={() => toggleSize(size)}
                                            >
                                                {size}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className={styles.inputGroupFull}>
                                    <label>Colors</label>
                                    <div className={styles.colorInputs}>
                                        {colors.map((color, index) => (
                                            <div key={index} className={styles.colorInputRow}>
                                                <input
                                                    type="color"
                                                    value={color}
                                                    onChange={(e) => handleColorChange(index, e.target.value)}
                                                    className={styles.colorPicker}
                                                />
                                                <input
                                                    type="text"
                                                    value={color}
                                                    onChange={(e) => handleColorChange(index, e.target.value)}
                                                    placeholder="#000000"
                                                    className={styles.colorTextInput}
                                                />
                                                {colors.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => removeColorField(index)}
                                                        className={styles.removeBtn}
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                        <button type="button" onClick={addColorField} className={styles.addFieldBtn}>
                                            <Plus size={16} /> Add Color
                                        </button>
                                    </div>
                                </div>
                                <div className={styles.inputGroupFull}>
                                    <label>Product Images</label>
                                    <ImageUpload 
                                        images={images} 
                                        onChange={setImages} 
                                        maxImages={5} 
                                    />
                                </div>
                                <div className={styles.inputGroupFull}>
                                    <label>Description</label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        rows={3}
                                        placeholder="Product description..."
                                    />
                                </div>
                            </div>

                            <footer className={styles.footer}>
                                <button type="button" onClick={onClose} className={styles.cancelBtn}>
                                    Cancel
                                </button>
                                <button type="submit" className={styles.submitBtn} disabled={loading}>
                                    {loading ? <Loader2 className={styles.spin} size={18} /> : <Save size={18} />}
                                    {loading ? "Updating..." : "Update Product"}
                                </button>
                            </footer>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

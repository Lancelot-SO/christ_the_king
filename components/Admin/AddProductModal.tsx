"use client";

import { useState, useEffect } from "react";
import { X, Save, Loader2, Plus, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import styles from "./AddProductModal.module.css";
import ImageUpload from "./ImageUpload";

interface AddProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function AddProductModal({ isOpen, onClose, onSuccess }: AddProductModalProps) {
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
    });
    const [images, setImages] = useState<string[]>([]);
    const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
    const [colors, setColors] = useState<string[]>(['#000000']);

    const availableSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

    useEffect(() => {
        if (isOpen) {
            fetchCategories();
        }
    }, [isOpen]);

    async function fetchCategories() {
        const { data } = await supabase.from('categories').select('*');
        setCategories(data || []);
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
            ...(name === 'name' ? { slug: value.toLowerCase().replace(/\s+/g, '-') } : {})
        }));
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

    const generateUniqueSlug = async (baseSlug: string) => {
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
        if (loading) return;
        setLoading(true);

        console.log("Starting product submission...");

        try {
            // 1. Validate inputs
            const price = parseFloat(formData.price);
            const stock = parseInt(formData.stock_quantity);
            const weight = formData.weight ? parseFloat(formData.weight) : null;
            const salePrice = formData.sale_price ? parseFloat(formData.sale_price) : null;

            if (isNaN(price)) throw new Error("Invalid Price: Please enter a valid number");
            if (isNaN(stock)) throw new Error("Invalid Stock: Please enter a valid number");
            if (formData.weight && weight !== null && isNaN(weight)) throw new Error("Invalid Weight: Please enter a valid number");
            if (formData.sale_price && salePrice !== null && isNaN(salePrice)) throw new Error("Invalid Sale Price: Please enter a valid number");

            const baseSlug = formData.slug || formData.name.toLowerCase().replace(/\s+/g, '-');
            const uniqueSlug = await generateUniqueSlug(baseSlug);

            const productData = {
                name: formData.name,
                slug: uniqueSlug,
                sku: formData.sku,
                price: price,
                sale_price: salePrice,
                stock_quantity: stock,
                category_id: formData.category_id || null,
                description: formData.description,
                weight: weight,
                images: images.filter(img => img.trim() !== ''),
                sizes: selectedSizes,
                colors: colors.filter(c => c.trim() !== ''),
                is_active: true,
                is_featured: false,
                low_stock_threshold: 5,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            console.log("Product data prepared:", productData);
            // window.alert("1. Data prepared. Sending to Supabase...");

            // 2. Insert into Supabase with timeout
            console.log("Calling Supabase insert with 15s timeout...");
            
            const insertPromise = supabase.from('products').insert([productData]);
            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error("Database request timed out (15s). Please check your connection.")), 15000)
            );

            const { error } = await Promise.race([insertPromise, timeoutPromise]) as any;

            if (error) {
                console.error("Supabase insert error details:", error);
                alert(`Error: ${error.message || JSON.stringify(error)}`);
                throw error;
            }

            console.log("Supabase insert successful");
            // window.alert("2. Insert successful. Refreshing inventory...");
            
            try {
                onSuccess();
            } catch (e) {
                console.error("Error in onSuccess:", e);
            }
            
            console.log("Calling onClose...");
            onClose();
            
            // Reset form
            setFormData({
                name: "",
                slug: "",
                sku: "",
                price: "",
                sale_price: "",
                stock_quantity: "",
                category_id: "",
                description: "",
                weight: "",
            });
            setImages([]);
            setSelectedSizes([]);
            setColors(['#000000']);

        } catch (error: any) {
            console.error('Error adding product:', error.message || error);
            console.error('Full Error Object:', error);
            alert(`Failed to add product: ${error.message || 'Unknown error'}`);
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
                            <h2>Add New Product</h2>
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
                                <div className={styles.inputGroupFull}>
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
                                    {loading ? "Saving..." : "Save Product"}
                                </button>
                            </footer>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

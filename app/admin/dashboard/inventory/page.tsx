"use client";

import { useState, useEffect, useRef } from "react";
import {
    Package,
    Plus,
    Search,
    Filter,
    MoreVertical,
    Edit2,
    Trash2,
    ArrowUpDown,
    Eye,
    PackagePlus,
    RefreshCw,
    Loader2,
    ChevronDown,
    CheckCircle2,
    XCircle,
    AlertCircle,
    Download
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./inventory.module.css";
import AddProductModal from "@/components/Admin/AddProductModal";
import EditProductModal from "@/components/Admin/EditProductModal";
import ProductDetailsModal from "@/components/Admin/ProductDetailsModal";
import StockAdjustmentModal from "@/components/Admin/StockAdjustmentModal";
import DeleteConfirmModal from "@/components/Admin/DeleteConfirmModal";
import { supabase } from "@/lib/supabase";
import { exportToExcel, exportToPDF } from "@/lib/exportUtils";

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

type FilterType = 'all' | 'in_stock' | 'low_stock' | 'out_of_stock' | 'active' | 'inactive';

export default function InventoryPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [inventory, setInventory] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [filter, setFilter] = useState<FilterType>('all');
    const [showFilterDropdown, setShowFilterDropdown] = useState(false);

    // Modal states
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showStockModal, setShowStockModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    // Action menu state
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchInventory();
    }, []);

    // Close menu when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setOpenMenuId(null);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    async function fetchInventory() {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('products')
                .select('*, categories(name)')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setInventory(data || []);
        } catch (error) {
            console.error('Error fetching inventory:', error);
        } finally {
            setLoading(false);
        }
    }

    async function refreshInventory() {
        setRefreshing(true);
        await fetchInventory();
        setRefreshing(false);
    }

    const getFilteredInventory = () => {
        let filtered = inventory;

        // Apply search filter
        if (searchTerm) {
            filtered = filtered.filter(item =>
                item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.sku?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Apply status filter
        switch (filter) {
            case 'in_stock':
                filtered = filtered.filter(item => item.stock_quantity > item.low_stock_threshold);
                break;
            case 'low_stock':
                filtered = filtered.filter(item => item.stock_quantity > 0 && item.stock_quantity <= item.low_stock_threshold);
                break;
            case 'out_of_stock':
                filtered = filtered.filter(item => item.stock_quantity === 0);
                break;
            case 'active':
                filtered = filtered.filter(item => item.is_active);
                break;
            case 'inactive':
                filtered = filtered.filter(item => !item.is_active);
                break;
        }

        return filtered;
    };

    const filteredInventory = getFilteredInventory();

    const getFilterLabel = (filterType: FilterType) => {
        const labels: Record<FilterType, string> = {
            all: 'All Products',
            in_stock: 'In Stock',
            low_stock: 'Low Stock',
            out_of_stock: 'Out of Stock',
            active: 'Active',
            inactive: 'Inactive'
        };
        return labels[filterType];
    };

    const getStockBadgeClass = (item: Product) => {
        if (item.stock_quantity === 0) return styles.outOfStock;
        if (item.stock_quantity <= item.low_stock_threshold) return styles.lowStock;
        return styles.inStock;
    };

    const getStockLabel = (item: Product) => {
        if (item.stock_quantity === 0) return 'Out of Stock';
        if (item.stock_quantity <= item.low_stock_threshold) return 'Low Stock';
        return 'In Stock';
    };

    // Action handlers
    const handleViewDetails = (product: Product) => {
        setSelectedProduct(product);
        setShowDetailsModal(true);
        setOpenMenuId(null);
    };

    const handleEdit = (product: Product) => {
        setSelectedProduct(product);
        setShowEditModal(true);
        setOpenMenuId(null);
    };

    const handleAdjustStock = (product: Product) => {
        setSelectedProduct(product);
        setShowStockModal(true);
        setOpenMenuId(null);
    };

    const handleDelete = (product: Product) => {
        setSelectedProduct(product);
        setShowDeleteModal(true);
        setOpenMenuId(null);
    };

    const handleEditFromDetails = () => {
        setShowDetailsModal(false);
        setShowEditModal(true);
    };

    // Stats
    const stats = {
        total: inventory.length,
        inStock: inventory.filter(p => p.stock_quantity > p.low_stock_threshold).length,
        lowStock: inventory.filter(p => p.stock_quantity > 0 && p.stock_quantity <= p.low_stock_threshold).length,
        outOfStock: inventory.filter(p => p.stock_quantity === 0).length
    };

    const handleExport = (type: 'excel' | 'pdf') => {
        if (inventory.length === 0) {
            alert("No data to export");
            return;
        }

        if (type === 'excel') {
            const exportData = inventory.map(item => ({
                Name: item.name,
                SKU: item.sku || 'N/A',
                Category: item.categories?.name || 'Uncategorized',
                Price: item.price,
                Sale_Price: item.sale_price || 'N/A',
                Stock: item.stock_quantity,
                Status: item.is_active ? 'Active' : 'Inactive'
            }));
            exportToExcel(exportData, `inventory_report_${new Date().getTime()}`);
        } else {
            const headers = ['Name', 'SKU', 'Category', 'Price', 'Stock', 'Status'];
            const data = inventory.map(item => [
                item.name,
                item.sku || 'N/A',
                item.categories?.name || 'Uncategorized',
                `GHS ${item.price}`,
                item.stock_quantity,
                item.is_active ? 'Active' : 'Inactive'
            ]);
            exportToPDF(headers, data, `inventory_report_${new Date().getTime()}`, 'Inventory Status Report');
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <motion.div
            className={styles.container}
            initial="hidden"
            animate="visible"
            variants={containerVariants}
        >
            <header className={styles.header}>
                <div className={styles.headerTitle}>
                    <h1>Inventory Management</h1>
                    <p>Track, manage and update your product stocks.</p>
                </div>
                <div className={styles.headerTools}>
                    <div className={styles.searchWrapper}>
                        <Search size={18} />
                        <input
                            type="text"
                            placeholder="Search products, SKU..."
                            className={styles.searchInput}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className={styles.filterWrapper}>
                        <button
                            className={styles.filterBtn}
                            onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                        >
                            <Filter size={18} />
                            {getFilterLabel(filter)}
                            <ChevronDown size={14} />
                        </button>
                        {showFilterDropdown && (
                            <div className={styles.filterDropdown}>
                                {(['all', 'in_stock', 'low_stock', 'out_of_stock', 'active', 'inactive'] as FilterType[]).map(f => (
                                    <button
                                        key={f}
                                        className={`${styles.filterOption} ${filter === f ? styles.filterActive : ''}`}
                                        onClick={() => {
                                            setFilter(f);
                                            setShowFilterDropdown(false);
                                        }}
                                    >
                                        {getFilterLabel(f)}
                                        {filter === f && <CheckCircle2 size={14} />}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className={styles.filterWrapper}>
                        <button
                            className={styles.filterBtn}
                            onClick={() => {
                                const choice = window.confirm("Export as Excel? (Cancel for PDF)");
                                handleExport(choice ? 'excel' : 'pdf');
                            }}
                        >
                            <Download size={18} />
                            Export
                        </button>
                    </div>
                    <button
                        className={styles.refreshBtn}
                        onClick={refreshInventory}
                        disabled={refreshing}
                    >
                        <RefreshCw size={18} className={refreshing ? styles.spinning : ''} />
                    </button>
                    <button className={styles.addBtn} onClick={() => setShowAddModal(true)}>
                        <Plus size={18} />
                        Add Product
                    </button>
                </div>
            </header>

            {/* Quick Stats */}
            <motion.div className={styles.statsRow} variants={itemVariants}>
                <div className={styles.statCard}>
                    <Package size={20} />
                    <div>
                        <span className={styles.statValue}>{stats.total}</span>
                        <span className={styles.statLabel}>Total Products</span>
                    </div>
                </div>
                <div className={`${styles.statCard} ${styles.statGreen}`}>
                    <CheckCircle2 size={20} />
                    <div>
                        <span className={styles.statValue}>{stats.inStock}</span>
                        <span className={styles.statLabel}>In Stock</span>
                    </div>
                </div>
                <div className={`${styles.statCard} ${styles.statYellow}`}>
                    <AlertCircle size={20} />
                    <div>
                        <span className={styles.statValue}>{stats.lowStock}</span>
                        <span className={styles.statLabel}>Low Stock</span>
                    </div>
                </div>
                <div className={`${styles.statCard} ${styles.statRed}`}>
                    <XCircle size={20} />
                    <div>
                        <span className={styles.statValue}>{stats.outOfStock}</span>
                        <span className={styles.statLabel}>Out of Stock</span>
                    </div>
                </div>
            </motion.div>

            <motion.div className={styles.tableCard} variants={itemVariants}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Product Details</th>
                            <th>SKU <ArrowUpDown size={14} style={{ marginLeft: 4, display: 'inline' }} /></th>
                            <th>Category</th>
                            <th>Stock Level</th>
                            <th>Price</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            // Skeleton loader rows
                            [...Array(6)].map((_, index) => (
                                <tr key={index} className={styles.skeletonRow}>
                                    <td>
                                        <div className={styles.skeletonProduct}>
                                            <div className={`${styles.skeleton} ${styles.skeletonImg}`}></div>
                                            <div className={styles.skeletonInfo}>
                                                <div className={`${styles.skeleton} ${styles.skeletonTitle}`}></div>
                                                <div className={`${styles.skeleton} ${styles.skeletonSubtitle}`}></div>
                                            </div>
                                        </div>
                                    </td>
                                    <td><div className={`${styles.skeleton} ${styles.skeletonSku}`}></div></td>
                                    <td><div className={`${styles.skeleton} ${styles.skeletonCategory}`}></div></td>
                                    <td><div className={`${styles.skeleton} ${styles.skeletonStock}`}></div></td>
                                    <td><div className={`${styles.skeleton} ${styles.skeletonPrice}`}></div></td>
                                    <td><div className={`${styles.skeleton} ${styles.skeletonStatus}`}></div></td>
                                    <td>
                                        <div className={styles.skeletonActions}>
                                            <div className={`${styles.skeleton} ${styles.skeletonBtn}`}></div>
                                            <div className={`${styles.skeleton} ${styles.skeletonBtn}`}></div>
                                            <div className={`${styles.skeleton} ${styles.skeletonBtn}`}></div>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : filteredInventory.length === 0 ? (
                            <tr>
                                <td colSpan={7} className={styles.emptyCell}>
                                    <Package size={48} />
                                    <h3>No products found</h3>
                                    <p>{searchTerm || filter !== 'all' ? 'Try adjusting your filters' : 'Add your first product to get started'}</p>
                                    {!searchTerm && filter === 'all' && (
                                        <button className={styles.addBtnEmpty} onClick={() => setShowAddModal(true)}>
                                            <Plus size={16} /> Add Product
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ) : (
                            filteredInventory.map((item) => (
                                <tr key={item.id} className={!item.is_active ? styles.inactiveRow : ''}>
                                    <td data-label="Product Details">
                                        <div className={styles.productCell} onClick={() => handleViewDetails(item)}>
                                            <div className={styles.productImg}>
                                                {item.images?.[0] && <img src={item.images[0]} alt={item.name} />}
                                            </div>
                                            <div className={styles.productInfo}>
                                                <h4>{item.name}</h4>
                                                <span>ID: #{item.id.slice(0, 8)}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td data-label="SKU"><code>{item.sku || 'N/A'}</code></td>
                                    <td data-label="Category">{item.categories?.name || 'Uncategorized'}</td>
                                    <td data-label="Stock Level">
                                        <span className={`${styles.stockBadge} ${getStockBadgeClass(item)}`}>
                                            {item.stock_quantity} {getStockLabel(item)}
                                        </span>
                                    </td>
                                    <td data-label="Price" style={{ fontWeight: 600 }}>
                                        {item.sale_price ? (
                                            <div className={styles.priceCol}>
                                                <span className={styles.salePrice}>GHS {item.sale_price}</span>
                                                <span className={styles.originalPrice}>GHS {item.price}</span>
                                            </div>
                                        ) : (
                                            `GHS ${item.price}`
                                        )}
                                    </td>
                                    <td data-label="Status">
                                        <span className={`${styles.statusBadge} ${item.is_active ? styles.activeBadge : styles.inactiveBadge}`}>
                                            {item.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td>
                                        <div className={styles.actions} ref={openMenuId === item.id ? menuRef : null}>
                                            <button
                                                className={styles.actionBtn}
                                                title="View Details"
                                                onClick={() => handleViewDetails(item)}
                                            >
                                                <Eye size={16} />
                                            </button>
                                            <button
                                                className={styles.actionBtn}
                                                title="Edit"
                                                onClick={() => handleEdit(item)}
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                className={styles.actionBtn}
                                                title="More Actions"
                                                onClick={() => setOpenMenuId(openMenuId === item.id ? null : item.id)}
                                            >
                                                <MoreVertical size={16} />
                                            </button>

                                            <AnimatePresence>
                                                {openMenuId === item.id && (
                                                    <motion.div
                                                        className={styles.actionMenu}
                                                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                                    >
                                                        <button onClick={() => handleAdjustStock(item)}>
                                                            <PackagePlus size={16} />
                                                            Adjust Stock
                                                        </button>
                                                        <button onClick={() => handleEdit(item)}>
                                                            <Edit2 size={16} />
                                                            Edit Product
                                                        </button>
                                                        <button className={styles.deleteOption} onClick={() => handleDelete(item)}>
                                                            <Trash2 size={16} />
                                                            Delete Product
                                                        </button>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </motion.div>

            {/* Modals */}
            <AddProductModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                onSuccess={fetchInventory}
            />

            <EditProductModal
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                onSuccess={fetchInventory}
                product={selectedProduct}
            />

            <ProductDetailsModal
                isOpen={showDetailsModal}
                onClose={() => setShowDetailsModal(false)}
                product={selectedProduct}
                onEdit={handleEditFromDetails}
            />

            <StockAdjustmentModal
                isOpen={showStockModal}
                onClose={() => setShowStockModal(false)}
                onSuccess={fetchInventory}
                product={selectedProduct}
            />

            <DeleteConfirmModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onSuccess={fetchInventory}
                product={selectedProduct}
            />
        </motion.div>
    );
}


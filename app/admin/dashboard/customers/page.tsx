"use client";

import { useState, useEffect } from "react";
import {
    Users,
    Search,
    UserPlus,
    Mail,
    MoreHorizontal,
    GraduationCap,
    Trash2,
    Edit2,
    Download
} from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { exportToExcel, exportToPDF } from "@/lib/exportUtils";
import styles from "./customers.module.css";

export default function CustomersPage() {
    const [customers, setCustomers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newUser, setNewUser] = useState({ name: "", email: "", role: "Alumni", classYear: "" });

    const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
    const [editingUser, setEditingUser] = useState<any | null>(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    async function fetchUsers() {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setCustomers(data || []);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    }

    const filteredCustomers = customers.filter(user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (user.class_year && user.class_year.includes(searchQuery))
    );

    const handleExport = (type: 'excel' | 'pdf') => {
        if (customers.length === 0) {
            alert("No data to export");
            return;
        }

        if (type === 'excel') {
            const exportData = customers.map(user => ({
                Name: user.name,
                Email: user.email,
                Role: user.role,
                Class_Year: user.class_year || 'N/A',
                Orders_Count: user.orders_count || 0,
                Total_Spent: user.total_spent || 0,
                Joined_At: new Date(user.created_at).toLocaleDateString()
            }));
            exportToExcel(exportData, `users_report_${new Date().getTime()}`);
        } else {
            const headers = ['Name', 'Email', 'Role', 'Class Year', 'Orders', 'Spent'];
            const data = customers.map(user => [
                user.name,
                user.email,
                user.role,
                user.class_year || 'N/A',
                user.orders_count || 0,
                `GHS ${user.total_spent || 0}`
            ]);
            exportToPDF(headers, data, `users_report_${new Date().getTime()}`, 'Users/Customers Report');
        }
    };

    const handleSaveUser = async (e: React.FormEvent) => {
        e.preventDefault();
        
        try {
            if (editingUser) {
                // Update existing user profile
                const { error } = await supabase
                    .from('profiles')
                    .update({
                        name: newUser.name,
                        email: newUser.email,
                        role: newUser.role,
                        class_year: newUser.classYear || null
                    })
                    .eq('id', editingUser.id);

                if (error) throw error;

                // Sync admin_users table based on role change
                const wasAdmin = editingUser.role === 'Admin';
                const isNowAdmin = newUser.role === 'Admin';

                if (isNowAdmin && !wasAdmin) {
                    // Promote to admin: add to admin_users table
                    const { error: adminError } = await supabase
                        .from('admin_users')
                        .upsert({ id: editingUser.id, role: 'staff', is_active: true });
                    if (adminError) console.error('Error adding admin role:', adminError);
                } else if (!isNowAdmin && wasAdmin) {
                    // Demote from admin: remove from admin_users table
                    const { error: removeError } = await supabase
                        .from('admin_users')
                        .delete()
                        .eq('id', editingUser.id);
                    if (removeError) console.error('Error removing admin role:', removeError);
                }

                // Update local state
                setCustomers(customers.map(u => u.id === editingUser.id ? { ...u, name: newUser.name, email: newUser.email, role: newUser.role, class_year: newUser.classYear } : u));
                alert("User updated successfully");
            } else {
                // Create new user
                const { data, error } = await supabase
                    .from('profiles')
                    .insert([
                        {
                            name: newUser.name,
                            email: newUser.email,
                            role: newUser.role,
                            class_year: newUser.classYear || null,
                            orders_count: 0,
                            total_spent: 0
                        }
                    ])
                    .select()
                    .single();

                if (error) throw error;
                setCustomers([data, ...customers]);
                alert("User added successfully");
            }

            closeModal();
        } catch (error: any) {
            console.error('Error saving user:', error);
            alert(error.message || "Failed to save user");
        }
    };

    const confirmDelete = async () => {
        if (!deleteUserId) return;

        try {
            const { error } = await supabase
                .from('profiles')
                .delete()
                .eq('id', deleteUserId);

            if (error) throw error;

            setCustomers(customers.filter(user => user.id !== deleteUserId));
            setDeleteUserId(null); // Close confirmation modal
        } catch (error: any) {
            console.error('Error deleting user:', error);
            alert("Failed to delete user");
        }
    };

    const openAddModal = () => {
        setEditingUser(null);
        setNewUser({ name: "", email: "", role: "Customer", classYear: "" });
        setIsModalOpen(true);
    };

    const openEditModal = (user: any) => {
        setEditingUser(user);
        setNewUser({ 
            name: user.name, 
            email: user.email, 
            role: user.role, 
            classYear: user.class_year || "" 
        });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingUser(null);
        setNewUser({ name: "", email: "", role: "Alumni", classYear: "" });
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
                    <h1>User Management</h1>
                    <p>View and manage all registered alumni, students and administrators.</p>
                </div>
                <div className={styles.headerTools}>
                    <div className={styles.searchWrapper}>
                        <Search size={18} />
                        <input 
                            type="text" 
                            placeholder="Search by name, email or class..." 
                            className={styles.searchInput}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <button 
                        className={styles.addBtn}
                        onClick={() => {
                            const choice = window.confirm("Export as Excel? (Cancel for PDF)");
                            handleExport(choice ? 'excel' : 'pdf');
                        }}
                        style={{ background: '#4b5563' }}
                    >
                        <Download size={18} />
                        Export
                    </button>
                    <button className={styles.addBtn} onClick={openAddModal}>
                        <UserPlus size={18} />
                        Add User
                    </button>
                </div>
            </header>

            <motion.div className={styles.tableCard} variants={itemVariants}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>User Details</th>
                            <th>Class Year</th>
                            <th>Account Role</th>
                            <th>Orders</th>
                            <th>Total Spent</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>Loading users...</td>
                            </tr>
                        ) : filteredCustomers.length === 0 ? (
                            <tr>
                                <td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>No users found</td>
                            </tr>
                        ) : (
                            filteredCustomers.map((user) => (
                                <tr key={user.id}>
                                    <td>
                                        <div className={styles.userCell}>
                                            <div className={styles.avatar}>
                                                {user.name.charAt(0)}
                                            </div>
                                            <div className={styles.userInfo}>
                                                <h4>{user.name}</h4>
                                                <p>{user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td data-label="Class Year">
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'inherit' }}>
                                            <GraduationCap size={16} color="#6b7280" className={styles.mobileHideIcon} />
                                            {user.class_year || "N/A"}
                                        </div>
                                    </td>
                                    <td data-label="Role">
                                        <span className={`${styles.roleBadge} ${user.role === 'Admin' ? styles.roleAdmin :
                                                user.role === 'Alumni' ? styles.roleAlumni :
                                                    user.role === 'Customer' ? styles.roleCustomer :
                                                        styles.roleStudent
                                            }`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td data-label="Orders">{user.orders_count || 0} Orders</td>
                                    <td data-label="Total Spent" style={{ fontWeight: 600 }}>GHS {user.total_spent || 0}</td>
                                    <td data-label="Actions">
                                        <div style={{ display: 'flex', gap: 12, justifyContent: 'inherit' }}>
                                            <button 
                                                className={styles.actionBtn} 
                                                title="Edit User"
                                                onClick={() => openEditModal(user)}
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                            <a 
                                                href={`mailto:${user.email}`}
                                                className={styles.actionBtn} 
                                                title="Message"
                                            >
                                                <Mail size={18} />
                                            </a>
                                            <button 
                                                className={styles.actionBtn} 
                                                title="Delete User"
                                                onClick={() => setDeleteUserId(user.id)}
                                                style={{ color: '#ef4444' }}
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </motion.div>

            {/* Add/Edit Modal */}
            {isModalOpen && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <div className={styles.modalHeader}>
                            <h2>{editingUser ? "Edit User" : "Add New User"}</h2>
                            <button className={styles.modalClose} onClick={closeModal}>×</button>
                        </div>
                        <form onSubmit={handleSaveUser}>
                            <div className={styles.modalBody}>
                                <div className={styles.formGroup}>
                                    <label>Full Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={newUser.name}
                                        onChange={e => setNewUser({ ...newUser, name: e.target.value })}
                                        placeholder="e.g. Yaw Boakye"
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Email Address</label>
                                    <input
                                        type="email"
                                        required
                                        value={newUser.email}
                                        onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                                        placeholder="e.g. yaw@example.com"
                                    />
                                </div>
                                <div className={styles.formRow}>
                                    <div className={styles.formGroup}>
                                        <label>Role</label>
                                        <select
                                            value={newUser.role}
                                            onChange={e => setNewUser({ ...newUser, role: e.target.value })}
                                        >
                                            <option value="Customer">Customer</option>
                                            <option value="Alumni">Alumni</option>
                                            <option value="Student">Student</option>
                                            <option value="Admin">Admin</option>
                                        </select>
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>Class Year</label>
                                        <input
                                            type="text"
                                            value={newUser.classYear}
                                            onChange={e => setNewUser({ ...newUser, classYear: e.target.value })}
                                            placeholder="e.g. 1998"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className={styles.modalFooter}>
                                <button type="button" className={styles.modalCancelBtn} onClick={closeModal}>Cancel</button>
                                <button type="submit" className={styles.modalSubmitBtn}>
                                    <UserPlus size={16} /> {editingUser ? "Save Changes" : "Add User"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteUserId && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal} style={{ maxWidth: '400px' }}>
                        <div className={styles.modalHeader}>
                            <h2>Confirm Deletion</h2>
                            <button className={styles.modalClose} onClick={() => setDeleteUserId(null)}>×</button>
                        </div>
                        <div className={styles.modalBody}>
                            <p>Are you sure you want to delete this user? This action cannot be undone.</p>
                        </div>
                        <div className={styles.modalFooter}>
                            <button className={styles.modalCancelBtn} onClick={() => setDeleteUserId(null)}>Cancel</button>
                            <button 
                                className={styles.modalSubmitBtn} 
                                onClick={confirmDelete}
                                style={{ background: '#ef4444' }}
                            >
                                Delete User
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </motion.div>
    );
}

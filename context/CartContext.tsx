"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface CartItem {
    id: string;
    name: string;
    price: number;
    image: string;
    quantity: number;
    size?: string;
    color?: string;
}

export const MAX_CART_ITEMS = 20;
export const MAX_ITEM_QUANTITY = 10;

interface CartContextType {
    cart: CartItem[];
    addToCart: (item: CartItem) => void;
    removeFromCart: (id: string, size?: string) => void;
    updateQuantity: (id: string, quantity: number, size?: string) => void;
    clearCart: () => void;
    cartTotal: number;
    cartCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [mounted, setMounted] = useState(false);

    // Load cart from localStorage on mount
    useEffect(() => {
        setMounted(true);
        const savedCart = localStorage.getItem("aosa-cart");
        if (savedCart) {
            try {
                setCart(JSON.parse(savedCart));
            } catch (e) {
                console.error("Failed to load cart", e);
            }
        }
    }, []);

    // Save cart to localStorage on changes
    useEffect(() => {
        if (mounted) {
            localStorage.setItem("aosa-cart", JSON.stringify(cart));
        }
    }, [cart, mounted]);

    const addToCart = (item: CartItem) => {
        setCart(prev => {
            const existingItem = prev.find(i => i.id === item.id && i.size === item.size);
            const currentTotalQuantity = prev.reduce((sum, i) => sum + i.quantity, 0);

            if (existingItem) {
                const newQuantity = existingItem.quantity + item.quantity;
                if (newQuantity > MAX_ITEM_QUANTITY) {
                    alert(`Maximum quantity reached for this item (max ${MAX_ITEM_QUANTITY})`);
                    return prev;
                }
                if (currentTotalQuantity + item.quantity > MAX_CART_ITEMS) {
                    alert(`Maximum cart capacity reached (max ${MAX_CART_ITEMS} items)`);
                    return prev;
                }
                return prev.map(i =>
                    i.id === item.id && i.size === item.size
                        ? { ...i, quantity: newQuantity }
                        : i
                );
            }

            if (currentTotalQuantity + item.quantity > MAX_CART_ITEMS) {
                alert(`Maximum cart capacity reached (max ${MAX_CART_ITEMS} items)`);
                return prev;
            }
            if (item.quantity > MAX_ITEM_QUANTITY) {
                alert(`Maximum quantity reached for this item (max ${MAX_ITEM_QUANTITY})`);
                return prev;
            }

            return [...prev, item];
        });
    };

    const removeFromCart = (id: string, size?: string) => {
        setCart(prev => prev.filter(i => !(i.id === id && i.size === size)));
    };

    const updateQuantity = (id: string, quantity: number, size?: string) => {
        setCart(prev => {
            const itemToUpdate = prev.find(i => i.id === id && i.size === size);
            if (!itemToUpdate) return prev;

            const diff = quantity - itemToUpdate.quantity;
            const currentTotalQuantity = prev.reduce((sum, i) => sum + i.quantity, 0);

            if (quantity > MAX_ITEM_QUANTITY) {
                alert(`Maximum quantity reached for this item (max ${MAX_ITEM_QUANTITY})`);
                return prev;
            }

            if (currentTotalQuantity + diff > MAX_CART_ITEMS) {
                alert(`Maximum cart capacity reached (max ${MAX_CART_ITEMS} items)`);
                return prev;
            }

            return prev.map(i =>
                i.id === id && i.size === size ? { ...i, quantity } : i
            );
        });
    };

    const clearCart = () => setCart([]);

    const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    const cartCount = cart.reduce((count, item) => count + item.quantity, 0);

    return (
        <CartContext.Provider value={{
            cart,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            cartTotal,
            cartCount
        }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error("useCart must be used within a CartProvider");
    }
    return context;
}

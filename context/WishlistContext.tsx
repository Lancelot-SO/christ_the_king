"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface WishlistContextType {
    wishlist: string[];
    toggleWishlist: (productId: string) => void;
    isInWishlist: (productId: string) => boolean;
    clearWishlist: () => void;
    wishlistCount: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
    const [wishlist, setWishlist] = useState<string[]>([]);
    const [mounted, setMounted] = useState(false);

    // Load wishlist from localStorage on mount
    useEffect(() => {
        setMounted(true);
        const savedWishlist = localStorage.getItem("ctk-wishlist");
        if (savedWishlist) {
            try {
                setWishlist(JSON.parse(savedWishlist));
            } catch (e) {
                console.error("Failed to load wishlist", e);
            }
        }
    }, []);

    // Save wishlist to localStorage on changes
    useEffect(() => {
        if (mounted) {
            localStorage.setItem("ctk-wishlist", JSON.stringify(wishlist));
        }
    }, [wishlist, mounted]);

    const toggleWishlist = (productId: string) => {
        setWishlist(prev => {
            if (prev.includes(productId)) {
                return prev.filter(id => id !== productId);
            }
            return [...prev, productId];
        });
    };

    const isInWishlist = (productId: string) => wishlist.includes(productId);

    const clearWishlist = () => setWishlist([]);

    const wishlistCount = wishlist.length;

    return (
        <WishlistContext.Provider value={{
            wishlist,
            toggleWishlist,
            isInWishlist,
            clearWishlist,
            wishlistCount
        }}>
            {children}
        </WishlistContext.Provider>
    );
}

export function useWishlist() {
    const context = useContext(WishlistContext);
    if (context === undefined) {
        throw new Error("useWishlist must be used within a WishlistProvider");
    }
    return context;
}

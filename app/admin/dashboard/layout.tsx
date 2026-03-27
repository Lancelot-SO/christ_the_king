"use client";

import Sidebar from "@/components/Admin/Sidebar";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, isAdmin, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading) {
            if (!user) {
                router.push("/login");
            } else if (!isAdmin) {
                router.push("/catalog"); // Or some "Unauthorized" page
            }
        }
    }, [user, isAdmin, isLoading, router]);

    if (isLoading) {
        return <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>Loading...</div>;
    }

    if (!user || !isAdmin) {
        return (
            <div style={{ 
                height: '100vh', 
                display: 'flex', 
                flexDirection: 'column',
                alignItems: 'center', 
                justifyContent: 'center',
                gap: '1rem',
                background: '#fff'
            }}>
                <p>Redirecting to login...</p>
                <button 
                    onClick={() => router.push("/")}
                    style={{ 
                        padding: '0.5rem 1rem', 
                        background: '#000', 
                        color: '#fff', 
                        border: 'none', 
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Return Home
                </button>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex' }}>
            <Sidebar />
            <main style={{ 
                flex: 1, 
                minHeight: '100vh', 
                background: '#f9f9f9', 
                position: 'relative',
                transition: 'padding-left 0.3s ease'
            }} className="admin-main">
                <style jsx>{`
                    .admin-main {
                        padding-left: 0;
                    }
                    @media (min-width: 1025px) {
                        .admin-main {
                            padding-left: 260px;
                        }
                    }
                `}</style>
                {children}
            </main>
        </div>
    );
}

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
        <div style={{ display: 'flex', background: 'var(--background)', minHeight: '100vh' }}>
            <Sidebar />
            <main className="admin-main">
                <div className="admin-content-inner">
                    {children}
                </div>
                <style jsx>{`
                    .admin-main {
                        flex: 1;
                        min-height: 100vh;
                        background: var(--muted);
                        position: relative;
                        transition: padding-left 0.4s cubic-bezier(0.16, 1, 0.3, 1);
                        padding: 1rem;
                    }

                    .admin-content-inner {
                        background: var(--background);
                        min-height: calc(100vh - 2rem);
                        border-radius: var(--radius);
                        padding: 1.5rem 3vw;
                        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);
                        border: 1px solid var(--border);
                    }

                    @media (min-width: 1025px) {
                        .admin-main {
                            padding-left: 272px; /* 240px width + 16px left + 16px gap */
                        }
                    }

                    @media (max-width: 1024px) {
                        .admin-main {
                            padding-top: 5rem;
                            padding-left: 0.5rem;
                            padding-right: 0.5rem;
                            padding-bottom: 2rem;
                        }

                        .admin-content-inner {
                            padding: 1.25rem 0.75rem;
                        }
                    }
                `}</style>
            </main>
        </div>
    );
}

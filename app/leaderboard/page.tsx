"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";
import {
    BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from "recharts";
import { motion } from "framer-motion";
import { Trophy, TrendingUp, Users, HeartHandshake } from "lucide-react";
import styles from "./leaderboard.module.css";

interface Donation {
    id: string;
    donor_name: string;
    year_group: string | null;
    amount: number;
    donation_type: string;
    recognition: string;
}

export default function LeaderboardPage() {
    const [donations, setDonations] = useState<Donation[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch('/api/leaderboard');
                const result = await res.json();
                
                if (result.success && result.data) {
                    setDonations(result.data);
                } else {
                    console.error("Failed to fetch leaderboard data");
                }
            } catch (err) {
                console.error("Error fetching leaderboard:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Analytics Aggregations
    const totalAmount = donations.reduce((sum, d) => sum + Number(d.amount), 0);
    const totalContributors = donations.length;

    // 1. Top Year Groups (Bar Chart)
    const yearGroupTotals = donations.reduce((acc, curr) => {
        const group = curr.year_group || 'Other';
        acc[group] = (acc[group] || 0) + Number(curr.amount);
        return acc;
    }, {} as Record<string, number>);

    const yearGroupData = Object.entries(yearGroupTotals)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 7); // Top 7

    // 2. Donation Type Distribution (Pie Chart)
    const typeTotals = donations.reduce((acc, curr) => {
        const type = curr.donation_type;
        acc[type] = (acc[type] || 0) + Number(curr.amount);
        return acc;
    }, {} as Record<string, number>);

    const typeData = Object.entries(typeTotals)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);

    const PIE_COLORS = ['#7C1936', '#D4AF37', '#1f2937', '#f3f4f6'];

    // 3. Top Individual Donors (List)
    const topDonors = [...donations]
        .filter(d => d.recognition !== 'Anonymous')
        .sort((a, b) => Number(b.amount) - Number(a.amount));
        
    const totalPages = Math.ceil(topDonors.length / itemsPerPage);
    const paginatedDonors = topDonors.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const formatCurrency = (value: number) => {
        if (value >= 1000000) return `GH₵${(value / 1000000).toFixed(1)}M`;
        if (value >= 1000) return `GH₵${(value / 1000).toFixed(1)}k`;
        return `GH₵${value}`;
    };

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className={styles.tooltip}>
                    <p className={styles.tooltipLabel}>{payload[0].name || payload[0].payload.name}</p>
                    <p className={styles.tooltipValue}>GH₵{payload[0].value.toLocaleString()}</p>
                </div>
            );
        }
        return null;
    };

    return (
        <main className={styles.main}>
            <Header />

            <header className={styles.hero}>
                <motion.div 
                    className={styles.heroContent}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                >
                    <span className={styles.subtitle}>FUNDRAISING CAMPAIGN</span>
                    <h1 className={styles.title}>Impact Leaderboard</h1>
                    <p className={styles.description}>
                        Track our collective progress. See which year groups are leading the charge 
                        and celebrate the generosity of our alumni community.
                    </p>
                </motion.div>
            </header>

            <section className={styles.statsSection}>
                <div className={styles.statsGrid}>
                    <div className={styles.statCard}>
                        <TrendingUp size={24} className={styles.statIcon} />
                        <div>
                            <span className={styles.statLabel}>Total Raised</span>
                            <h3 className={styles.statValue}>GH₵{totalAmount.toLocaleString()}</h3>
                        </div>
                    </div>
                    <div className={styles.statCard}>
                        <Users size={24} className={styles.statIcon} />
                        <div>
                            <span className={styles.statLabel}>Total Contributors</span>
                            <h3 className={styles.statValue}>{totalContributors}</h3>
                        </div>
                    </div>
                </div>
            </section>

            <section className={styles.chartsSection}>
                <div className={styles.chartsGrid}>
                    {/* Bar Chart: Year Groups */}
                    <div className={styles.chartCard}>
                        <div className={styles.chartHeader}>
                            <Trophy size={20} className={styles.chartIcon} />
                            <h2>Top Year Groups</h2>
                        </div>
                        <p className={styles.chartDesc}>Which class is leading the fundraising effort?</p>
                        
                        <div className={styles.chartWrapper}>
                            {loading ? (
                                <p className={styles.loadingText}>Loading data...</p>
                            ) : yearGroupData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={yearGroupData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                                        <YAxis tickFormatter={formatCurrency} axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                                        <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
                                        <Bar dataKey="value" fill="#7C1936" radius={[4, 4, 0, 0]} maxBarSize={50} />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <p className={styles.emptyText}>No data available yet.</p>
                            )}
                        </div>
                    </div>

                    {/* Pie Chart: Donation Types */}
                    <div className={styles.chartCard}>
                        <div className={styles.chartHeader}>
                            <HeartHandshake size={20} className={styles.chartIcon} />
                            <h2>Contribution Types</h2>
                        </div>
                        <p className={styles.chartDesc}>How our community is choosing to give.</p>
                        
                        <div className={styles.chartWrapper}>
                            {loading ? (
                                <p className={styles.loadingText}>Loading data...</p>
                            ) : typeData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={typeData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={100}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {typeData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <RechartsTooltip content={<CustomTooltip />} />
                                        <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <p className={styles.emptyText}>No data available yet.</p>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            <section className={styles.listSection}>
                <div className={styles.listContainer}>
                    <div className={styles.listHeader}>
                        <h2>Hall of Benefactors</h2>
                        <p>Our top individual contributors making the vision a reality.</p>
                    </div>

                    <div className={styles.list}>
                        {loading ? (
                            <p className={styles.loadingText}>Loading donors...</p>
                        ) : paginatedDonors.length > 0 ? (
                            <>
                                {paginatedDonors.map((donor, index) => (
                                    <motion.div 
                                        key={donor.id} 
                                        className={styles.listItem}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                    >
                                        <div className={styles.listRank}>
                                            {(currentPage - 1) * itemsPerPage + index + 1}
                                        </div>
                                        <div className={styles.listInfo}>
                                            <h4>{donor.donor_name}</h4>
                                            <span>{donor.year_group || 'Alumni / Supporter'}</span>
                                        </div>
                                        <div className={styles.listAmount}>
                                            GH₵{Number(donor.amount).toLocaleString()}
                                        </div>
                                    </motion.div>
                                ))}
                                {totalPages > 1 && (
                                    <div className={styles.pagination}>
                                        <button 
                                            className={styles.pageBtn} 
                                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                            disabled={currentPage === 1}
                                        >
                                            Prev
                                        </button>
                                        <span className={styles.pageInfo}>Page {currentPage} of {totalPages}</span>
                                        <button 
                                            className={styles.pageBtn} 
                                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                            disabled={currentPage === totalPages}
                                        >
                                            Next
                                        </button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className={styles.emptyList}>No public donors to display yet.</div>
                        )}
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}

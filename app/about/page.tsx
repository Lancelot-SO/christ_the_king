"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import styles from "./about.module.css";
import Image from "next/image";

export default function AboutPage() {
    return (
        <main>
            <Header light />
            
            <header id="hero-section" className={styles.hero}>
                <div className="container">
                    <span className={styles.chapterTitle}>CHAPTER I</span>
                    <h1>Our Heritage</h1>
                </div>
            </header>

            <section className={styles.contentContainer}>
                <div className="container">
                    <div className={styles.aboutGrid}>
                        <div className={styles.visuals}>
                            <div className={styles.imageWrapper}>
                                <Image 
                                    src="/ctk-school.png" 
                                    alt="Christ the King School Campus"
                                    fill
                                    className={styles.img}
                                />
                            </div>
                        </div>

                        <div className={styles.textContent}>
                            <span className={styles.historyLabel} style={{ color: 'var(--burgundy)', margin: 0 }}>1956 — 2026</span>
                            <h2 className={styles.historyHeading} style={{ color: 'var(--foreground)', textAlign: 'left', fontSize: '3rem' }}>A Brief History of CTKIS</h2>
                            <div className={styles.historyText} style={{ textAlign: 'left' }}>
                                <p style={{ color: 'var(--muted-foreground)', textAlign: 'left' }}>
                                    For over seven decades, CTKIS has remained dedicated to nurturing children in faith, character, 
                                    and academic excellence under the guidance of the Catholic Church.
                                </p>
                                <p style={{ color: 'var(--muted-foreground)', textAlign: 'left' }}>
                                    Christ the King International School (CTKIS) is a Ghanaian Catholic private basic school 
                                    located in Cantonments, Accra. Established on 31st January 1956 with just six students, the 
                                    school has grown to a current population of 858 pupils. Renowned for its academic excellence 
                                    and strong emphasis on moral formation, CTKIS has educated children from diverse backgrounds 
                                    and religious traditions, shaping them into well-rounded individuals prepared for the future.
                                </p>
                            </div>

                            <div className={styles.historyMetrics} style={{ borderTop: '1px solid var(--border)', marginTop: '2rem', paddingTop: '2rem' }}>
                                <div className={styles.metric}>
                                    <span className={styles.metricValue}>1956</span>
                                    <span className={styles.metricLabel} style={{ color: 'var(--muted-foreground)' }}>Year Founded</span>
                                </div>
                                <div className={styles.metric}>
                                    <span className={styles.metricValue}>6</span>
                                    <span className={styles.metricLabel} style={{ color: 'var(--muted-foreground)' }}>First Students</span>
                                </div>
                                <div className={styles.metric}>
                                    <span className={styles.metricValue}>858</span>
                                    <span className={styles.metricLabel} style={{ color: 'var(--muted-foreground)' }}>Current Pupils</span>
                                </div>
                                <div className={styles.metric}>
                                    <span className={styles.metricValue}>70</span>
                                    <span className={styles.metricLabel} style={{ color: 'var(--muted-foreground)' }}>Years of Excellence</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}


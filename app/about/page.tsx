"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import styles from "./about.module.css";

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
                                <video
                                    autoPlay
                                    loop
                                    muted
                                    playsInline
                                    preload="auto"
                                    className={styles.img}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                >
                                    <source src="/Compressed.mp4" type="video/mp4" />
                                    Your browser does not support the video tag.
                                </video>
                            </div>
                        </div>

                        <div className={styles.textContent}>
                            <span className={styles.historyLabel}>1956 — 2026</span>
                            <h2 className={styles.historyHeading}>A Brief History of CTKIS</h2>
                            <div className={styles.historyText}>
                                <p>
                                    For over seven decades, CTKIS has remained dedicated to nurturing children in faith, character, 
                                    and academic excellence under the guidance of the Catholic Church.
                                </p>
                                <p>
                                    Christ the King International School (CTKIS) is a Ghanaian Catholic private basic school 
                                    located in Cantonments, Accra. Established on 31st January 1956 with just six students, the 
                                    school has grown to a current population of 858 pupils. Renowned for its academic excellence 
                                    and strong emphasis on moral formation, CTKIS has educated children from diverse backgrounds 
                                    and religious traditions, shaping them into well-rounded individuals prepared for the future.
                                </p>
                            </div>

                            <div className={styles.historyMetrics}>
                                <div className={styles.metric}>
                                    <span className={styles.metricValue}>1956</span>
                                    <span className={styles.metricLabel}>Year Founded</span>
                                </div>
                                <div className={styles.metric}>
                                    <span className={styles.metricValue}>6</span>
                                    <span className={styles.metricLabel}>First Students</span>
                                </div>
                                <div className={styles.metric}>
                                    <span className={styles.metricValue}>858</span>
                                    <span className={styles.metricLabel}>Current Pupils</span>
                                </div>
                                <div className={styles.metric}>
                                    <span className={styles.metricValue}>70</span>
                                    <span className={styles.metricLabel}>Years of Excellence</span>
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


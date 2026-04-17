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
                            <h2>A Sanctuary of Knowledge & Faith</h2>
                            <p>
                                Founded in 1956 on the bedrock of Catholic values, Christ the King School stands as an 
                                architectural and spiritual landmark in Accra. Our institution is not merely a 
                                school, but a sanctuary where young minds are sculpted through the dual lenses of 
                                academic rigor and moral fortitude.
                            </p>
                            <p>
                                For decades, CTK has nurtured the leaders of tomorrow, instilling a sense of purpose 
                                that transcends the classroom. The burgundy and gold we wear are more than colors; 
                                they are symbols of a standard that we uphold in every endeavor—be it intellectual, 
                                spiritual, or social.
                            </p>
                            <p>
                                The artifacts found within this digital archive are curated to represent this 
                                legacy. Each piece of merchandise is a thread in the rich tapestry of our community, 
                                designed to be worn with pride and preserved as a part of our collective history.
                            </p>
                            
                            <h2 style={{ marginTop: '4rem' }}>Our Mission</h2>
                            <p>
                                To develop the whole person, preparing students to lead with integrity and serve 
                                with compassion. We believe in an education that empowers, a faith that inspires, 
                                and a community that lasts a lifetime.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Brief History Section */}
            <section className={styles.historySection}>
                <div className="container">
                    <div className={styles.historyContent}>
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
            </section>

            <Footer />
        </main>
    );
}


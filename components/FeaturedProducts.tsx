"use client";

import Image from "next/image";
import styles from "./FeaturedProducts.module.css";

export default function FeaturedProducts() {

    return (
        <section className={styles.boutiqueSection}>
            <div className="container">
                <div className={styles.header}>
                    <div className={styles.intro}>
                        <span className={styles.kicker}>FUNDRAISING CAMPAIGN</span>
                        <h2 className={styles.title}>Building for the Future</h2>
                        <p className={styles.description}>
                            As we celebrate <em>70 Years of Grace, Growth, and Greatness</em>, we are taking a bold step forward to 
                            transform our school&apos;s infrastructure and create modern, inspiring learning spaces for our students.
                        </p>
                    </div>
                    <div className={styles.goalBox}>
                        <span className={styles.goalLabel}>OUR GOAL</span>
                        <span className={styles.goalAmount}>GH₵13,540,211.44</span>
                        <p className={styles.goalDesc}>
                            Phase Two of the school&apos;s redevelopment — additional classrooms, 
                            furnished learning spaces, and enhanced facilities.
                        </p>
                    </div>
                </div>

                <div className={styles.categoryGrid}>
                    <div className={styles.card}>
                        <Image 
                            src="/fundraising/classroom.png" 
                            alt="Modern classrooms"
                            fill
                            className={styles.image}
                        />
                        <div className={styles.label}>CLASSROOMS</div>
                    </div>
                    <div className={styles.card}>
                        <Image 
                            src="/fundraising/building.png" 
                            alt="School building expansion"
                            fill
                            className={styles.image}
                        />
                        <div className={styles.label}>INFRASTRUCTURE</div>
                    </div>
                    <div className={styles.card}>
                        <Image 
                            src="/fundraising/students.png" 
                            alt="Students learning"
                            fill
                            className={styles.image}
                        />
                        <div className={styles.label}>STUDENT IMPACT</div>
                    </div>
                    <div className={styles.card}>
                        <Image 
                            src="/fundraising/ict-lab.png" 
                            alt="ICT computer lab"
                            fill
                            className={styles.image}
                        />
                        <div className={styles.label}>ICT FACILITIES</div>
                    </div>
                </div>
            </div>
        </section>
    );
}

"use client";

import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import styles from "./dues.module.css";

export default function DuesPage() {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        yearGroup: "",
        subscription: "annual",
        amount: 250,
    });

    const yearGroups = ["Class of 1990", "Class of 1995", "Class of 2000", "Class of 2005", "Class of 2010", "Class of 2015", "Class of 2020", "Class of 2024"];

    return (
        <main className={styles.main}>
            <Header />
            
            <header id="hero-section" className={styles.pageHeader}>
                <span className={styles.subtitle}>INSTITUTIONAL GOVERNANCE</span>
                <h1 className={styles.title}>Member Dues</h1>
                
                <div className={styles.stepsNav}>
                    {[1, 2, 3].map((s) => (
                        <div 
                            key={s} 
                            className={`${styles.stepIndicator} ${step >= s ? styles.stepActive : ""}`}
                        >
                            <span>STEP 0{s}</span>
                        </div>
                    ))}
                </div>
            </header>

            <section className={styles.formSection}>
                <div className={styles.formContainer}>
                    {step === 1 && (
                        <div className={styles.stepContent}>
                            <h2 className={styles.stepTitle}>Identify Year Group</h2>
                            <p className={styles.stepDesc}>Select the class year group you are registering your dues for.</p>
                            <div className={styles.grid}>
                                {yearGroups.map((yg) => (
                                    <button 
                                        key={yg}
                                        className={`${styles.selectionBtn} ${formData.yearGroup === yg ? styles.selected : ""}`}
                                        onClick={() => setFormData({...formData, yearGroup: yg})}
                                    >
                                        {yg}
                                    </button>
                                ))}
                            </div>
                            <button 
                                disabled={!formData.yearGroup}
                                className={styles.nextBtn}
                                onClick={() => setStep(2)}
                            >
                                CONTINUE TO FREQUENCY
                            </button>
                        </div>
                    )}

                    {step === 2 && (
                        <div className={styles.stepContent}>
                            <h2 className={styles.stepTitle}>Contribution Frequency</h2>
                            <p className={styles.stepDesc}>Choose your contribution schedule for the {formData.yearGroup}.</p>
                            <div className={styles.grid}>
                                {[
                                    {id: "monthly", label: "Monthly", price: 25},
                                    {id: "annual", label: "Annual", price: 250},
                                    {id: "lifetime", label: "Lifetime", price: 5000},
                                ].map((plan) => (
                                    <button 
                                        key={plan.id}
                                        className={`${styles.selectionBtn} ${formData.subscription === plan.id ? styles.selected : ""}`}
                                        onClick={() => setFormData({...formData, subscription: plan.id, amount: plan.price})}
                                    >
                                        <span className={styles.planLabel}>{plan.label}</span>
                                        <span className={styles.planPrice}>GHS {plan.price.toLocaleString()}</span>
                                    </button>
                                ))}
                            </div>
                            <div className={styles.btnRow}>
                                <button className={styles.backBtn} onClick={() => setStep(1)}>MODIFY SELECTION</button>
                                <button className={styles.nextBtn} onClick={() => setStep(3)}>PREVIEW CONTRIBUTION</button>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className={styles.stepContent}>
                            <h2 className={styles.stepTitle}>Review & Secure</h2>
                            <p className={styles.stepDesc}>Verify your details before proceeding to the secure payment hub.</p>
                            <div className={styles.summaryBox}>
                                <div className={styles.summaryItem}>
                                    <span>DESTINATION</span>
                                    <span>{formData.yearGroup.toUpperCase()} HUB</span>
                                </div>
                                <div className={styles.summaryItem}>
                                    <span>FREQUENCY</span>
                                    <span>{formData.subscription.toUpperCase()}</span>
                                </div>
                                <div className={styles.totalRow}>
                                    <span>VALUATION</span>
                                    <span>GHS {formData.amount.toLocaleString()}</span>
                                </div>
                            </div>
                            <button className={styles.payBtn}>AUTHORIZE PAYMENT</button>
                            <button className={styles.backBtn} style={{ display: 'block', margin: '0 auto' }} onClick={() => setStep(2)}>RETURN TO SCHEDULE</button>
                        </div>
                    )}
                </div>
            </section>

            <Footer />
        </main>
    );
}

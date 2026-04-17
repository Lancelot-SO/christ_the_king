"use client";

import { useState, useEffect } from "react";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";
import dynamic from "next/dynamic";
import styles from "./dues.module.css";

const PaymentButton = dynamic(() => import("@/components/PaymentButton"), { 
    ssr: false,
    loading: () => (
        <button className={styles.payBtn} disabled>
            Loading...
        </button>
    )
});

interface DuesFee {
    year_group: string;
    amount: number;
}

export default function DuesPage() {
    const [step, setStep] = useState(1);
    const [fees, setFees] = useState<DuesFee[]>([]);
    const [loading, setLoading] = useState(true);
    const [isPaying, setIsPaying] = useState(false);
    const [formData, setFormData] = useState({
        email: "", // Added email for payment
        yearGroup: "",
        subscription: "annual",
        amount: 250,
    });

    // Fundraising contribution modal state
    const [showContribModal, setShowContribModal] = useState(false);
    const [contribData, setContribData] = useState({
        name: "",
        email: "",
        amount: 0,
        tier: "",
        reference: "",
    });
    const [isContribPaying, setIsContribPaying] = useState(false);

    const openContribModal = (tier: string, suggestedAmount: number) => {
        setContribData({
            name: "",
            email: "",
            amount: suggestedAmount,
            tier,
            reference: `FUND-${tier.replace(/\s+/g, "-").toUpperCase()}-${Date.now()}`,
        });
        setShowContribModal(true);
    };

    useEffect(() => {
        const fetchFees = async () => {
            try {
                setLoading(true);
                const { data, error } = await supabase
                    .from('dues_fees')
                    .select('year_group, amount')
                    .order('year_group', { ascending: false });

                if (data) {
                    setFees(data);
                }
            } catch (err) {
                console.error("Error fetching dues fees:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchFees();
    }, []);

    const getYearGroups = () => {
        if (fees.length > 0) {
            return fees.map((f: DuesFee) => `Class of ${f.year_group}`);
        }
        return ["Class of 1990", "Class of 1995", "Class of 2000", "Class of 2005", "Class of 2010", "Class of 2015", "Class of 2020", "Class of 2024"];
    };

    const getAnnualPrice = () => {
        if (!formData.yearGroup) return 250;
        const year = formData.yearGroup.split(" ").pop();
        const fee = fees.find((f: DuesFee) => f.year_group === year);
        return fee ? fee.amount : 250;
    };

    // Update amount when year group changes to reflect admin settings
    useEffect(() => {
        if (formData.yearGroup && formData.subscription === "annual") {
            const price = getAnnualPrice();
            setFormData((prev: any) => ({ ...prev, amount: price }));
        }
    }, [formData.yearGroup]);

    return (
        <main className={styles.main}>
            <Header light />
            

            {/* Fundraising Opportunities Section */}
            <section className={styles.fundraisingSection}>
                <div className={styles.fundraisingContainer}>
                    <span className={styles.fundraisingLabel}>BUILDING THE FUTURE</span>
                    <h2 className={styles.fundraisingTitle}>Fundraising Opportunities</h2>
                    <p className={styles.fundraisingIntro}>
                        Join us in shaping the next chapter of CTKIS. Every contribution, 
                        no matter the size, builds a legacy that will inspire generations.
                    </p>

                    <div className={styles.fundraisingGrid}>
                        {/* Sponsor a Classroom */}
                        <div className={styles.fundCard}>
                            <span className={styles.fundCardLabel}>PREMIER TIER</span>
                            <h3 className={styles.fundCardTitle}>Sponsor a Classroom</h3>
                            <p className={styles.fundCardDesc}>
                                Bring your graduating class or decade together to sponsor a classroom 
                                and make a lasting impact on CTKIS students.
                            </p>
                            <div className={styles.fundCardPrice}>
                                <span className={styles.fundCardAmount}>GH₵3,600,000</span>
                                <span className={styles.fundCardUnit}>per floor</span>
                            </div>
                            <div className={styles.fundCardDetails}>
                                <p>Pool contributions with your peers — smaller gifts from many alumni make this achievable.</p>
                                <p>Leave your mark through classroom naming and recognition.</p>
                            </div>
                            <p className={styles.fundCardQuote}>
                                &ldquo;If 300 of us give GH₵3,000 each, we can fund a full classroom!&rdquo;
                            </p>
                            <button className={styles.fundCardBtn} onClick={() => openContribModal("Classroom Sponsorship", 3000)}>
                                CONTRIBUTE NOW
                            </button>
                        </div>

                        {/* Brick-by-Brick */}
                        <div className={styles.fundCard}>
                            <span className={styles.fundCardLabel}>FOUNDATION</span>
                            <h3 className={styles.fundCardTitle}>Brick-by-Brick</h3>
                            <p className={styles.fundCardDesc}>
                                Dedicate a brick to yourself, a loved one, or your graduating class. 
                                Your name will be recognised in our publications.
                            </p>
                            <div className={styles.fundCardPrice}>
                                <span className={styles.fundCardAmount}>GH₵1,000</span>
                                <span className={styles.fundCardUnit}>per brick</span>
                            </div>
                            <div className={styles.fundCardDetails}>
                                <p>900 bricks build one complete classroom.</p>
                            </div>
                            <p className={styles.fundCardQuote}>
                                &ldquo;Be part of the foundation — help build a classroom that will shape generations.&rdquo;
                            </p>
                            <button className={styles.fundCardBtn} onClick={() => openContribModal("Brick-by-Brick", 1000)}>
                                CONTRIBUTE NOW
                            </button>
                        </div>

                        {/* Custom Giving */}
                        <div className={styles.fundCard}>
                            <span className={styles.fundCardLabel}>FLEXIBLE</span>
                            <h3 className={styles.fundCardTitle}>Custom Giving</h3>
                            <p className={styles.fundCardDesc}>
                                Contribute any amount toward the total project cost. 
                                Every gift brings us closer to our goal.
                            </p>
                            <div className={styles.fundCardPrice}>
                                <span className={styles.fundCardAmount}>Any Amount</span>
                                <span className={styles.fundCardUnit}>your choice</span>
                            </div>
                            <button className={styles.fundCardBtn} onClick={() => openContribModal("Custom Giving", 0)}>
                                CONTRIBUTE NOW
                            </button>
                        </div>
                    </div>

                    {/* Furniture & Equipment — featured showcase */}
                    <div className={styles.equipmentSection}>
                        <span className={styles.fundCardLabel}>EQUIP A CLASSROOM</span>
                        <h3 className={styles.equipmentTitle}>Furniture &amp; Equipment</h3>
                        <p className={styles.equipmentDesc}>
                            Sponsor furniture and equipment to make lessons more engaging and dynamic.
                        </p>
                        <div className={styles.equipmentGrid}>
                            <div className={styles.equipItem}>
                                <span className={styles.equipPrice}>GH₵699</span>
                                <span className={styles.equipName}>Cabinets</span>
                            </div>
                            <div className={styles.equipItem}>
                                <span className={styles.equipPrice}>GH₵1,699</span>
                                <span className={styles.equipName}>Desks</span>
                            </div>
                            <div className={styles.equipItem}>
                                <span className={styles.equipPrice}>GH₵2,334</span>
                                <span className={styles.equipName}>Furniture Sets</span>
                            </div>
                            <div className={styles.equipItem}>
                                <span className={styles.equipPrice}>GH₵7,591</span>
                                <span className={styles.equipName}>ICT Lab PCs</span>
                            </div>
                            <div className={styles.equipItem}>
                                <span className={styles.equipPrice}>GH₵42,050</span>
                                <span className={styles.equipName}>Interactive Boards</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Contribution Modal */}
            {showContribModal && (
                <div className={styles.modalOverlay} onClick={() => setShowContribModal(false)}>
                    <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <button className={styles.modalClose} onClick={() => setShowContribModal(false)}>
                            ✕
                        </button>
                        <span className={styles.modalLabel}>{contribData.tier.toUpperCase()}</span>
                        <h3 className={styles.modalTitle}>Make a Contribution</h3>
                        <p className={styles.modalDesc}>Your generosity helps build the future of CTKIS.</p>

                        <div className={styles.modalForm}>
                            <div className={styles.modalField}>
                                <label className={styles.modalFieldLabel}>FULL NAME</label>
                                <input
                                    type="text"
                                    placeholder="Your full name"
                                    value={contribData.name}
                                    onChange={(e) => setContribData({...contribData, name: e.target.value})}
                                    className={styles.modalInput}
                                />
                            </div>
                            <div className={styles.modalField}>
                                <label className={styles.modalFieldLabel}>RECEIPT EMAIL</label>
                                <input
                                    type="email"
                                    placeholder="your@email.com"
                                    value={contribData.email}
                                    onChange={(e) => setContribData({...contribData, email: e.target.value})}
                                    className={styles.modalInput}
                                />
                            </div>
                            <div className={styles.modalField}>
                                <label className={styles.modalFieldLabel}>AMOUNT (GH₵)</label>
                                <input
                                    type="number"
                                    placeholder="Enter amount"
                                    value={contribData.amount || ""}
                                    onChange={(e) => setContribData({...contribData, amount: Number(e.target.value)})}
                                    className={styles.modalInput}
                                />
                            </div>
                        </div>

                        <PaymentButton
                            config={{
                                publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
                                email: contribData.email,
                                amount: Math.round(contribData.amount * 100),
                                currency: 'GHS',
                                reference: contribData.reference,
                                metadata: {
                                    custom_fields: [
                                        { display_name: "Donor Name", variable_name: "donor_name", value: contribData.name },
                                        { display_name: "Contribution Tier", variable_name: "tier", value: contribData.tier },
                                    ]
                                }
                            }}
                            onSuccess={(response: any) => {
                                setShowContribModal(false);
                                alert("Thank you for your generous contribution!");
                            }}
                            onClose={() => setIsContribPaying(false)}
                            loading={isContribPaying}
                            setLoading={setIsContribPaying}
                            styles={{ payBtn: styles.modalPayBtn }}
                            label={`CONTRIBUTE GH₵${contribData.amount ? contribData.amount.toLocaleString() : '0'}`}
                            skipCartCheck={true}
                        />
                    </div>
                </div>
            )}

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
                                {loading ? (
                                    <p className={styles.loadingText}>Fetching year groups...</p>
                                ) : (
                                    getYearGroups().map((yg: string) => (
                                        <button 
                                            key={yg}
                                            className={`${styles.selectionBtn} ${formData.yearGroup === yg ? styles.selected : ""}`}
                                            onClick={() => setFormData({...formData, yearGroup: yg})}
                                        >
                                            {yg}
                                        </button>
                                    ))
                                )}
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
                                    {id: "monthly", label: "Monthly", price: Math.round(getAnnualPrice() / 10)},
                                    {id: "annual", label: "Annual", price: getAnnualPrice()},
                                    {id: "lifetime", label: "Lifetime", price: getAnnualPrice() * 20},
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
                            
                            <div className={styles.formGroup} style={{ marginBottom: '2rem', padding: '0 1rem' }}>
                                <label style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.1em', color: 'var(--muted-foreground)', display: 'block', marginBottom: '0.5rem', paddingLeft: '1rem' }}>RECEIPT EMAIL</label>
                                <input 
                                    type="email" 
                                    placeholder="your@email.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                                    style={{ width: '100%', background: 'var(--muted)', border: '1px solid var(--border)', padding: '1rem', borderRadius: '2rem', fontSize: '0.875rem' }}
                                />
                            </div>

                            <PaymentButton 
                                config={{
                                    publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
                                    email: formData.email,
                                    amount: Math.round(formData.amount * 100),
                                    currency: 'GHS',
                                    reference: `CONTRIB-${formData.yearGroup.split(" ").pop()}-${Date.now()}`
                                }}
                                onSuccess={(response: any) => {
                                    alert("Thank you for your contribution!");
                                    window.location.href = "/checkout/success";
                                }}
                                onClose={() => setIsPaying(false)}
                                loading={isPaying}
                                setLoading={setIsPaying}
                                styles={{ payBtn: styles.payBtn }}
                                label="AUTHORIZE CONTRIBUTION"
                                skipCartCheck={true}
                            />
                            <button className={styles.backBtn} style={{ display: 'block', margin: '0 auto', border: 'none', background: 'none', color: 'var(--muted-foreground)', fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.1em', marginTop: '1.5rem', cursor: 'pointer', }} onClick={() => setStep(2)}>RETURN TO SCHEDULE</button>
                        </div>
                    )}
                </div>
            </section>


            <Footer />
        </main>
    );
}

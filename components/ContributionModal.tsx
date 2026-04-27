"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import styles from "../app/dues/dues.module.css";

const PaymentButton = dynamic(() => import("@/components/PaymentButton"), {
    ssr: false,
    loading: () => (
        <button className={styles.payBtn} disabled>
            Loading...
        </button>
    )
});

interface ContributionModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialTier: string;
    initialAmount: number;
}

export default function ContributionModal({ isOpen, onClose, initialTier, initialAmount }: ContributionModalProps) {
    const [contribStep, setContribStep] = useState(1);
    const [isContribPaying, setIsContribPaying] = useState(false);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    const validateEmail = (v: string) =>
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? "" : "Please enter a valid email address.";

    const validatePhone = (v: string) => {
        const digits = v.replace(/\D/g, '');
        return digits.length === 10 ? "" : "Phone number must be exactly 10 digits.";
    };

    const validateYearGroup = (v: string) => {
        const match = v.match(/(\d{4})/);
        if (!match) return "Please include a year (e.g. Class of 1995).";
        const year = parseInt(match[1], 10);
        if (year < 1956) return "Year must be 1956 or later.";
        if (year > new Date().getFullYear()) return "Year cannot be in the future.";
        return "";
    };

    const setError = (field: string, msg: string) =>
        setFieldErrors((prev) => ({ ...prev, [field]: msg }));

    // We only initialize this once when the modal opens
    const [contribData, setContribData] = useState({
        name: "",
        maidenName: "",
        yearGroup: "",
        email: "",
        phone: "",
        amount: initialAmount,
        tier: initialTier,
        reference: `CTKIS-${Date.now()}`,
        honourOf: "Self",
        honourOfOther: "",
        honourOfName: "",
        recognition: "Use my name",
        connection: "Alumni",
        connectionOther: "",
    });

    const step1Valid =
        !!contribData.name &&
        !!contribData.yearGroup &&
        !!contribData.phone &&
        !!contribData.email &&
        !validateEmail(contribData.email) &&
        !validatePhone(contribData.phone) &&
        !validateYearGroup(contribData.yearGroup);

    useEffect(() => {
        if (isOpen) {
            setContribStep(1);
            setFieldErrors({});
            setContribData({
                name: "",
                maidenName: "",
                yearGroup: "",
                email: "",
                phone: "",
                amount: initialAmount,
                tier: initialTier,
                reference: `CTKIS-${Date.now()}`,
                honourOf: "Self",
                honourOfOther: "",
                honourOfName: "",
                recognition: "Use my name",
                connection: "Alumni",
                connectionOther: "",
            });
        }
    }, [isOpen, initialTier, initialAmount]);

    if (!isOpen) return null;

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <button className={styles.modalClose} onClick={onClose}>
                    ✕
                </button>
                
                <div className={styles.modalHeader}>
                    <div className={styles.modalProgress}>
                        {[1, 2, 3].map((s) => (
                            <div 
                                key={s} 
                                className={`${styles.modalStepDot} ${contribStep >= s ? styles.modalStepActive : ""}`} 
                            />
                        ))}
                    </div>
                    <span className={styles.modalLabel}>STEP {contribStep} OF 3 — {contribData.tier.toUpperCase()}</span>
                    <h3 className={styles.modalTitle}>
                        {contribData.tier}
                    </h3>
                    <p className={styles.modalDesc}>
                        {contribStep === 1 && "Start by providing your basic details."}
                        {contribStep === 2 && "Tell us who this donation is in honour of."}
                        {contribStep === 3 && "Review your amount and complete your donation."}
                    </p>
                </div>

                <div className={styles.modalScrollArea}>
                    <div className={styles.modalForm}>
                        {contribStep === 1 && (
                            <>
                                <div className={styles.formGrid}>
                                    <div className={styles.modalField}>
                                        <label className={styles.modalFieldLabel}>FULL NAME</label>
                                        <input
                                            type="text"
                                            placeholder="Your full name"
                                            value={contribData.name}
                                            onChange={(e) => {
                                                setContribData({ ...contribData, name: e.target.value });
                                                setError('name', '');
                                            }}
                                            onBlur={(e) => setError('name', e.target.value.trim() ? '' : 'Full name is required.')}
                                            className={`${styles.modalInput} ${fieldErrors.name ? styles.inputError : ''}`}
                                        />
                                        {fieldErrors.name && <span className={styles.fieldError}>{fieldErrors.name}</span>}
                                    </div>
                                    <div className={styles.modalField}>
                                        <label className={styles.modalFieldLabel}>MAIDEN NAME</label>
                                        <input
                                            type="text"
                                            placeholder="Maiden name (if any)"
                                            value={contribData.maidenName}
                                            onChange={(e) => setContribData({ ...contribData, maidenName: e.target.value })}
                                            className={styles.modalInput}
                                        />
                                    </div>
                                </div>

                                <div className={styles.formGrid}>
                                    <div className={styles.modalField}>
                                        <label className={styles.modalFieldLabel}>YEAR GROUP / CLASS</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Class of 1995"
                                            value={contribData.yearGroup}
                                            onChange={(e) => {
                                                setContribData({ ...contribData, yearGroup: e.target.value });
                                                setError('yearGroup', '');
                                            }}
                                            onBlur={(e) => setError('yearGroup', validateYearGroup(e.target.value))}
                                            className={`${styles.modalInput} ${fieldErrors.yearGroup ? styles.inputError : ''}`}
                                        />
                                        {fieldErrors.yearGroup && <span className={styles.fieldError}>{fieldErrors.yearGroup}</span>}
                                    </div>
                                    <div className={styles.modalField}>
                                        <label className={styles.modalFieldLabel}>PHONE NUMBER</label>
                                        <input
                                            type="tel"
                                            placeholder="e.g. 0241234567"
                                            value={contribData.phone}
                                            onChange={(e) => {
                                                setContribData({ ...contribData, phone: e.target.value });
                                                setError('phone', '');
                                            }}
                                            onBlur={(e) => setError('phone', validatePhone(e.target.value))}
                                            className={`${styles.modalInput} ${fieldErrors.phone ? styles.inputError : ''}`}
                                        />
                                        {fieldErrors.phone && <span className={styles.fieldError}>{fieldErrors.phone}</span>}
                                    </div>
                                </div>

                                <div className={styles.modalField}>
                                    <label className={styles.modalFieldLabel}>RECEIPT EMAIL</label>
                                    <input
                                        type="email"
                                        placeholder="your@email.com"
                                        value={contribData.email}
                                        onChange={(e) => {
                                            setContribData({ ...contribData, email: e.target.value });
                                            setError('email', '');
                                        }}
                                        onBlur={(e) => setError('email', validateEmail(e.target.value))}
                                        className={`${styles.modalInput} ${fieldErrors.email ? styles.inputError : ''}`}
                                    />
                                    {fieldErrors.email && <span className={styles.fieldError}>{fieldErrors.email}</span>}
                                </div>
                            </>
                        )}

                        {contribStep === 2 && (
                            <>
                                <div className={styles.modalField}>
                                    <h4 className={styles.sectionTitle}>This donation is in honour of:</h4>
                                    <div className={styles.radioGroup}>
                                        {['Self', 'Alumni', 'Parent', 'Spouse', 'Friend', 'Other'].map((option) => (
                                            <div key={option}>
                                                <input
                                                    type="radio"
                                                    id={`honour-${option}`}
                                                    name="honourOf"
                                                    value={option}
                                                    checked={contribData.honourOf === option}
                                                    onChange={(e) => setContribData({ ...contribData, honourOf: e.target.value })}
                                                    className={styles.radioInput}
                                                />
                                                <label htmlFor={`honour-${option}`} className={styles.radioLabel}>{option}</label>
                                            </div>
                                        ))}
                                    </div>
                                    {contribData.honourOf === 'Other' && (
                                        <div className={styles.modalField} style={{ marginTop: '1rem' }}>
                                            <input
                                                type="text"
                                                placeholder="Specify other..."
                                                value={contribData.honourOfOther}
                                                onChange={(e) => setContribData({ ...contribData, honourOfOther: e.target.value })}
                                                className={styles.modalInput}
                                            />
                                        </div>
                                    )}
                                </div>

                                <div className={styles.modalField} style={{ marginTop: '2rem' }}>
                                    <label className={styles.modalFieldLabel}>NAME (IF APPLICABLE)</label>
                                    <input
                                        type="text"
                                        placeholder="Name of person being honoured"
                                        value={contribData.honourOfName}
                                        onChange={(e) => setContribData({ ...contribData, honourOfName: e.target.value })}
                                        className={styles.modalInput}
                                    />
                                </div>

                                <div className={styles.formSection}>
                                    <h4 className={styles.sectionTitle}>Connection to School:</h4>
                                    <div className={styles.radioGroup}>
                                        {['Alumni', 'Parent', 'Friend', 'Staff', 'Other'].map((option) => (
                                            <div key={option}>
                                                <input
                                                    type="radio"
                                                    id={`connection-${option}`}
                                                    name="connection"
                                                    value={option}
                                                    checked={contribData.connection === option}
                                                    onChange={(e) => setContribData({ ...contribData, connection: e.target.value })}
                                                    className={styles.radioInput}
                                                />
                                                <label htmlFor={`connection-${option}`} className={styles.radioLabel}>{option}</label>
                                            </div>
                                        ))}
                                    </div>
                                    {contribData.connection === 'Other' && (
                                        <div className={styles.modalField} style={{ marginTop: '1rem' }}>
                                            <input
                                                type="text"
                                                placeholder="Specify other..."
                                                value={contribData.connectionOther}
                                                onChange={(e) => setContribData({ ...contribData, connectionOther: e.target.value })}
                                                className={styles.modalInput}
                                            />
                                        </div>
                                    )}
                                </div>

                                <div className={styles.formSection}>
                                    <h4 className={styles.sectionTitle}>Recognition Preference:</h4>
                                    <div className={styles.radioGroup}>
                                        {['Use my name', 'Remain anonymous'].map((option) => (
                                            <div key={option}>
                                                <input
                                                    type="radio"
                                                    id={`recognition-${option}`}
                                                    name="recognition"
                                                    value={option}
                                                    checked={contribData.recognition === option}
                                                    onChange={(e) => setContribData({ ...contribData, recognition: e.target.value })}
                                                    className={styles.radioInput}
                                                />
                                                <label htmlFor={`recognition-${option}`} className={styles.radioLabel}>{option}</label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}

                        {contribStep === 3 && (
                            <div className={styles.finalizeSection}>
                                <div className={styles.modalField} style={{ marginBottom: '2.5rem' }}>
                                    <label className={styles.modalFieldLabel}>DONATION AMOUNT (GH₵)</label>
                                    <input
                                        type="number"
                                        placeholder="0.00"
                                        value={contribData.amount || ""}
                                        onChange={(e) => setContribData({ ...contribData, amount: Number(e.target.value) })}
                                        className={styles.amountInputLarge}
                                    />
                                </div>

                                <div className={styles.contributionSummary}>
                                    <h4 className={styles.summaryTitle}>CONTRIBUTION SUMMARY</h4>
                                    <div className={styles.summaryGrid}>
                                        <div className={styles.summaryInfoItem}>
                                            <span className={styles.summaryLabel}>DONOR</span>
                                            <span className={styles.summaryValue}>{contribData.name || 'ANONYMOUS'}</span>
                                        </div>
                                        <div className={styles.summaryInfoItem}>
                                            <span className={styles.summaryLabel}>HONOURING</span>
                                            <span className={styles.summaryValue}>{contribData.honourOf.toUpperCase()}</span>
                                        </div>
                                        <div className={styles.summaryInfoItem}>
                                            <span className={styles.summaryLabel}>CONNECTION</span>
                                            <span className={styles.summaryValue}>{contribData.connection.toUpperCase()}</span>
                                        </div>
                                    </div>
                                    
                                    <div className={styles.summaryTotal}>
                                        <span className={styles.totalLabel}>TOTAL CONTRIBUTION</span>
                                        <div className={styles.totalValueWrapper}>
                                            <span className={styles.totalCurrency}>GH₵</span>
                                            <span className={styles.totalAmount}>{contribData.amount.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className={styles.modalFooter}>
                        {contribStep < 3 ? (
                            <button 
                                className={styles.nextBtn} 
                                onClick={() => setContribStep(contribStep + 1)}
                                disabled={
                                    (contribStep === 1 && !step1Valid) ||
                                    (contribStep === 2 && (!contribData.honourOf || (contribData.honourOf === 'Other' && !contribData.honourOfOther) || !contribData.connection || (contribData.connection === 'Other' && !contribData.connectionOther) || !contribData.recognition))
                                }
                            >
                                CONTINUE
                            </button>
                        ) : (
                        <PaymentButton
                            config={{
                                publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || '',
                                email: contribData.email,
                                amount: Math.round(contribData.amount * 100),
                                currency: 'GHS',
                                reference: contribData.reference,
                                metadata: {
                                    custom_fields: [
                                        { display_name: "Donor Name", variable_name: "donor_name", value: contribData.name },
                                        { display_name: "Maiden Name", variable_name: "maiden_name", value: contribData.maidenName },
                                        { display_name: "Year Group", variable_name: "year_group", value: contribData.yearGroup },
                                        { display_name: "Phone", variable_name: "phone", value: contribData.phone },
                                        { display_name: "Contribution Tier", variable_name: "tier", value: contribData.tier },
                                        { display_name: "Honour Of", variable_name: "honour_of", value: contribData.honourOf === 'Other' ? contribData.honourOfOther : contribData.honourOf },
                                        { display_name: "Honour Of Name", variable_name: "honour_of_name", value: contribData.honourOfName },
                                        { display_name: "Recognition", variable_name: "recognition", value: contribData.recognition },
                                        { display_name: "Connection", variable_name: "connection", value: contribData.connection === 'Other' ? contribData.connectionOther : contribData.connection },
                                    ]
                                }
                            }}
                            onSuccess={async (response: any) => {
                                try {
                                    await fetch('/api/donations', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({
                                            reference: contribData.reference,
                                            name: contribData.name,
                                            maidenName: contribData.maidenName,
                                            yearGroup: contribData.yearGroup,
                                            email: contribData.email,
                                            phone: contribData.phone,
                                            amount: contribData.amount,
                                            tier: contribData.tier,
                                            honourOf: contribData.honourOf === 'Other' ? contribData.honourOfOther : contribData.honourOf,
                                            honourOfName: contribData.honourOfName,
                                            recognition: contribData.recognition,
                                            connection: contribData.connection === 'Other' ? contribData.connectionOther : contribData.connection,
                                        }),
                                    });
                                } catch (err) {
                                    if (err instanceof Error && err.name !== 'AbortError') {
                                        console.error('Failed to record donation:', err);
                                    }
                                } finally {
                                    onClose();
                                    alert("Thank you for your generous contribution! A confirmation email has been sent.");
                                }
                            }}
                            onClose={() => setIsContribPaying(false)}
                            loading={isContribPaying}
                            setLoading={setIsContribPaying}
                            styles={{ payBtn: styles.modalPayBtn }}
                            label={`CONTRIBUTE GH₵${contribData.amount ? contribData.amount.toLocaleString() : '0'}`}
                            skipCartCheck={true}
                        />
                        )}

                        {contribStep > 1 && (
                            <button 
                                className={`${styles.nextBtn} ${styles.nextBtnSecondary}`} 
                                onClick={() => setContribStep(contribStep - 1)}
                                style={{ padding: '0 2rem' }}
                            >
                                BACK
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

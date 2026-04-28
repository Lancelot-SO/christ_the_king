"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "../app/page.module.css";
import ContributionModal from "./ContributionModal";

export default function FundraisingPreview() {
    const [showContribModal, setShowContribModal] = useState(false);
    const [contribTier, setContribTier] = useState("");
    const [contribAmount, setContribAmount] = useState(0);

    const openContribModal = (tier: string, suggestedAmount: number) => {
        setContribTier(tier);
        setContribAmount(suggestedAmount);
        setShowContribModal(true);
    };

    return (
        <section className={styles.fundraisingPreview}>
            <div className="container">
                <span className={styles.preTitle}>BUILDING THE FUTURE</span>
                <h2 className={styles.chapterHeading}>
                    Fundraising <span className="gold-accent">Opportunities.</span>
                </h2>
                <p className={styles.fundraisingPreviewDesc}>
                    From sponsoring the 70th Speech and Prize Giving Day to buying a single brick, every contribution
                    helps build the next chapter of CTKIS.
                </p>

                <div className={styles.fundraisingPreviewGrid}>
                    <div className={styles.previewCard}>
                        <span className={styles.previewCardLabel}>PREMIER TIER</span>
                        <h3 className={styles.previewCardTitle}>Sponsor the 70th Speech and Prize Giving Day</h3>
                        <span className={styles.previewCardPrice}>GH₵5,000</span>
                        <span className={styles.previewCardUnit}>per sponsorship</span>
                        <button 
                            onClick={() => openContribModal("70th Speech and Prize Giving Day", 5000)} 
                            className={styles.previewCardBtn}
                        >
                            CONTRIBUTE NOW
                        </button>
                    </div>
                    <div className={styles.previewCard}>
                        <span className={styles.previewCardLabel}>FOUNDATION</span>
                        <h3 className={styles.previewCardTitle}>Brick-by-Brick</h3>
                        <span className={styles.previewCardPrice}>GH₵1,000</span>
                        <span className={styles.previewCardUnit}>per brick</span>
                        <button 
                            onClick={() => openContribModal("Brick-by-Brick", 1000)} 
                            className={styles.previewCardBtn}
                        >
                            CONTRIBUTE NOW
                        </button>
                    </div>
                    <div className={styles.previewCard}>
                        <span className={styles.previewCardLabel}>EQUIP</span>
                        <h3 className={styles.previewCardTitle}>Furniture & Equipment</h3>
                        <span className={styles.previewCardPrice}>From GH₵699</span>
                        <span className={styles.previewCardUnit}>per item</span>
                        <button 
                            onClick={() => openContribModal("Furniture & Equipment", 699)} 
                            className={styles.previewCardBtn}
                        >
                            CONTRIBUTE NOW
                        </button>
                    </div>
                    <div className={styles.previewCard}>
                        <span className={styles.previewCardLabel}>EVENT</span>
                        <h3 className={styles.previewCardTitle}>70th Anniversary Fundraising Dinner</h3>
                        <span className={styles.previewCardPrice}>GH₵1,200</span>
                        <span className={styles.previewCardUnit}>per ticket</span>
                        <button 
                            onClick={() => openContribModal("Fundraising Dinner Ticket", 1200)} 
                            className={styles.previewCardBtn}
                        >
                            BUY TICKET
                        </button>
                    </div>
                </div>

                <Link href="/dues" className={styles.editorialLink}>
                    <span>VIEW ALL OPPORTUNITIES</span>
                    <div className={styles.line}></div>
                </Link>
            </div>

            <ContributionModal
                isOpen={showContribModal}
                onClose={() => setShowContribModal(false)}
                initialTier={contribTier}
                initialAmount={contribAmount}
            />
        </section>
    );
}

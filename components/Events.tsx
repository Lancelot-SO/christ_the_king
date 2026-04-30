"use client";

import Image from "next/image";
import { useState } from "react";
import styles from "./Events.module.css";
import dynamic from "next/dynamic";

const TicketPurchaseModal = dynamic(() => import("./TicketPurchaseModal"), { ssr: false });

export default function Events() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const eventPrice = 1200.00;
    const eventTitle = "70th Anniversary Fundraising Dinner";

    return (
        <section className={styles.eventsSection}>
            <div className="container">
                <span className="editorial-kicker">FEATURED EVENTS</span>
                <h2 className={styles.chapterHeading}>
                    Join the <span className="gold-accent">Celebration.</span>
                </h2>

                <div className={styles.eventCard}>
                    <div className={styles.eventImageWrapper}>
                        <Image
                            src="/events/event_banner_landscape.png"
                            alt={eventTitle}
                            fill
                            className={styles.eventImage}
                            priority
                        />
                    </div>

                    <div className={styles.eventContent}>
                        <div className={styles.eventHeader}>
                            <h3 className={styles.eventTitle}>{eventTitle}</h3>
                            <div className={styles.eventDate}>
                                <span className={styles.dateDay}>16</span>
                                <span className={styles.dateMonth}>MAY 2026</span>
                                <span className={styles.dateTime}>7:00 PM</span>
                            </div>
                        </div>

                        <div className={styles.eventDetails}>
                            <div className={styles.detailItem}>
                                <span className={styles.detailLabel}>Venue</span>
                                <span className={styles.detailValue}>Christ The King Parish Hall</span>
                            </div>
                            
                            <div className={styles.detailItem}>
                                <span className={styles.detailLabel}>Ticket Price</span>
                                <div className={styles.priceWrapper}>
                                    <span className={styles.detailValue}>GHS {eventPrice.toLocaleString()}</span>
                                    <span className={styles.ticketAdmit}>| Admits One</span>
                                </div>
                            </div>
                        </div>

                        <div className={styles.eventActionArea}>
                            <p className={styles.purchaseInfo}>
                                Tickets can be purchased online below or at the <strong>Alumni Office on campus</strong>.
                            </p>
                            <button 
                                className="btn btn-primary"
                                onClick={() => setIsModalOpen(true)}
                            >
                                Pay for Ticket
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <TicketPurchaseModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                eventTitle={eventTitle}
                price={eventPrice}
            />
        </section>
    );
}

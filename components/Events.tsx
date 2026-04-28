import Image from "next/image";
import styles from "./Events.module.css";

export default function Events() {
    return (
        <section className={styles.eventsSection}>
            <div className="container">
                <span className="editorial-kicker">UPCOMING EVENTS</span>
                <h2 className={styles.chapterHeading}>
                    Join the <span className="gold-accent">Celebration.</span>
                </h2>

                <div className={styles.eventCard}>
                    <div className={styles.eventImageWrapper}>
                        <Image
                            src="/events/fundraising_dinner.jpg"
                            alt="70th Anniversary Fundraising Dinner"
                            fill
                            className={styles.eventImage}
                        />
                    </div>

                    <div className={styles.eventContent}>
                        <div className={styles.eventHeader}>
                            <h3 className={styles.eventTitle}>70th Anniversary Fundraising Dinner</h3>
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
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

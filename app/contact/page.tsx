"use client";

import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import styles from "./contact.module.css";

export default function ContactPage() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        subject: "inquiry",
        message: ""
    });
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitted(true);
    };

    return (
        <main>
            <Header />
            <section id="hero-section" className={styles.heroSection}>
                <div className="container">
                    <span className={styles.heroSub}>DIRECT CHANNELS</span>
                    <h1 className={styles.heroTitle}>Inquiries</h1>
                </div>
            </section>

            <section className="container">
                <div className={`${styles.contactGrid}`}>
                    {/* Info Column */}
                    <div className={styles.infoColumn}>
                        <h3>Connect with the Secretariat</h3>
                        <p>Our dedicated team is ready to assist you with any inquiries regarding our heritage artifacts, membership, or institutional governance.</p>

                        <div className={styles.infoItem}>
                            <MapPin className={styles.iconBox} size={24} />
                            <div>
                                <h4>VISIT US</h4>
                                <p>Christ the King School Campus, Accra, Ghana</p>
                            </div>
                        </div>

                        <div className={styles.infoItem}>
                            <Mail className={styles.iconBox} size={24} />
                            <div>
                                <h4>DIRECT EMAIL</h4>
                                <p>archive@christtheking.edu.gh</p>
                            </div>
                        </div>

                        <div className={styles.infoItem}>
                            <Phone className={styles.iconBox} size={24} />
                            <div>
                                <h4>INSTITUTIONAL LINE</h4>
                                <p>+233 20 123 4567</p>
                            </div>
                        </div>
                    </div>

                    {/* Form */}
                    <div className={styles.formColumn}>
                        {submitted ? (
                            <div className={styles.successCard}>
                                <h2>Message Transmitted</h2>
                                <p>Thank you for reaching out. A member of our executive team will review your inquiry and respond within 48 hours.</p>
                                <button
                                    className={styles.infoBtn}
                                    onClick={() => {
                                        setSubmitted(false);
                                        setFormData({ name: "", email: "", subject: "inquiry", message: "" });
                                    }}
                                >
                                    SEND ANOTHER MESSAGE
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className={styles.form}>
                                <h2>Direct Transmission</h2>

                                <div className={styles.formGroup}>
                                    <label>IDENTITY / FULL NAME</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="Enter your name"
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label>SECURE EMAIL ADDRESS</label>
                                    <input
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        placeholder="your@email.com"
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label>INQUIRY TYPE</label>
                                    <select
                                        value={formData.subject}
                                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                    >
                                        <option value="inquiry">General Inquiry</option>
                                        <option value="order">Artifact Support</option>
                                        <option value="opinion">Strategic Feedback</option>
                                        <option value="suggestion">Heritage Suggestions</option>
                                    </select>
                                </div>

                                <div className={styles.formGroup}>
                                    <label>MESSAGE / TRANSMISSION</label>
                                    <textarea
                                        required
                                        rows={6}
                                        value={formData.message}
                                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                        placeholder="State your inquiry..."
                                    ></textarea>
                                </div>

                                <button type="submit" className={styles.submitBtn}>
                                    TRANSMIT MESSAGE <Send size={16} />
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}

"use client";

import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Mail, Phone, MapPin, Send, Globe, MessageSquare } from "lucide-react";
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
        <main className={styles.main}>
            <Header />
            
            {/* Editorial Hero */}
            <section className={styles.heroSection}>
                <div className="container">
                    <div className={`${styles.heroContent} animate-fade-up`}>
                        <span className="editorial-kicker">Direct Channels</span>
                        <h1 className={styles.heroTitle}>
                            Global <br />
                            <span className="gold-accent">Inquiries</span>
                        </h1>
                        <p className={styles.heroLead}>
                            Connect with the Christ the King Governance & Secretariat. 
                            Our team is dedicated to preserving our heritage and serving our global alumni community.
                        </p>
                    </div>
                </div>
            </section>

            <section className="container section">
                <div className={`${styles.contactGrid}`}>
                    {/* Information Module */}
                    <div className={`${styles.infoColumn} animate-fade-up`} style={{ animationDelay: '0.2s' }}>
                        <div className={styles.moduleCard}>
                            <h3 className={styles.moduleTitle}>Institutional Contact</h3>
                            <p className={styles.moduleDesc}>
                                For institutional matters, archive access, or strategic partnerships, 
                                please utilize our direct lines of communication.
                            </p>

                            <div className={styles.contactList}>
                                <div className={styles.contactItem}>
                                    <div className={styles.iconWrapper}>
                                        <MapPin size={20} />
                                    </div>
                                    <div>
                                        <span className={styles.itemLabel}>LOCATE US</span>
                                        <p className={styles.itemText}>Christ the King Campus, <br />P.O. Box CT 2200, Accra, Ghana</p>
                                    </div>
                                </div>

                                <div className={styles.contactItem}>
                                    <div className={styles.iconWrapper}>
                                        <Mail size={20} />
                                    </div>
                                    <div>
                                        <span className={styles.itemLabel}>SECURE ARCHIVE</span>
                                        <p className={styles.itemText}>archive@christtheking.edu.gh</p>
                                    </div>
                                </div>

                                <div className={styles.contactItem}>
                                    <div className={styles.iconWrapper}>
                                        <Phone size={20} />
                                    </div>
                                    <div>
                                        <span className={styles.itemLabel}>SECRETARIAT LINE</span>
                                        <p className={styles.itemText}>+233 20 123 4567</p>
                                    </div>
                                </div>

                                <div className={styles.contactItem}>
                                    <div className={styles.iconWrapper}>
                                        <Globe size={20} />
                                    </div>
                                    <div>
                                        <span className={styles.itemLabel}>GLOBAL OFFICE</span>
                                        <p className={styles.itemText}>Monday — Friday, 09:00 - 17:00 GMT</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Transmission Module */}
                    <div className={`${styles.formColumn} animate-fade-up`} style={{ animationDelay: '0.4s' }}>
                        <div className={styles.formCard}>
                            {submitted ? (
                                <div className={styles.successState}>
                                    <div className={styles.successIcon}>
                                        <MessageSquare size={48} className="gold-accent" />
                                    </div>
                                    <h2 className={styles.successTitle}>Transmission Received</h2>
                                    <p className={styles.successMsg}>
                                        Your inquiry has been logged within our institutional portal. 
                                        A member of the executive secretariat will review your request 
                                        and provide a formal response within 48 business hours.
                                    </p>
                                    <button
                                        className="btn btn-outline"
                                        onClick={() => {
                                            setSubmitted(false);
                                            setFormData({ name: "", email: "", subject: "inquiry", message: "" });
                                        }}
                                    >
                                        NEW TRANSMISSION
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className={styles.form}>
                                    <div className={styles.formHeader}>
                                        <h2 className={styles.formTitle}>Direct Transmission</h2>
                                        <p className={styles.formSubtitle}>Complete the protocol below to initiate reaching out.</p>
                                    </div>

                                    <div className={styles.formBody}>
                                        <div className={styles.formGroup}>
                                            <label className={styles.label}>IDENTITY / FULL NAME</label>
                                            <input
                                                className={styles.input}
                                                type="text"
                                                required
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                placeholder="Enter your full name"
                                            />
                                        </div>

                                        <div className={styles.formGroup}>
                                            <label className={styles.label}>SECURE EMAIL ADDRESS</label>
                                            <input
                                                className={styles.input}
                                                type="email"
                                                required
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                placeholder="your@alumni-identity.com"
                                            />
                                        </div>

                                        <div className={styles.formGroup}>
                                            <label className={styles.label}>INQUIRY CLASSIFICATION</label>
                                            <select
                                                className={styles.select}
                                                value={formData.subject}
                                                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                            >
                                                <option value="inquiry">General Institutional Inquiry</option>
                                                <option value="order">Heritage Collection Support</option>
                                                <option value="opinion">Strategic Alumni Feedback</option>
                                                <option value="suggestion">Heritage & Tradition Proposals</option>
                                            </select>
                                        </div>

                                        <div className={styles.formGroup}>
                                            <label className={styles.label}>MESSAGE CONTENT</label>
                                            <textarea
                                                className={styles.textarea}
                                                required
                                                rows={5}
                                                value={formData.message}
                                                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                                placeholder="State your inquiry with clarity..."
                                            ></textarea>
                                        </div>

                                        <button type="submit" className={`btn btn-primary ${styles.submitBtn}`}>
                                            TRANSMIT MESSAGE <Send size={16} />
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}

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
        // Here you would typically send to an API
        console.log("Form submitted:", formData);
        setSubmitted(true);
    };

    return (
        <main>
            <Header />
            <section className={styles.heroSection}>
                <div className="container">
                    <h1 className={styles.heroTitle}>Get in Touch</h1>
                    <p className={styles.heroSub}>
                        We value your opinion. Whether you have a question about the school store,
                        suggestions for new merchandise, or just want to say hello, we're here to listen.
                    </p>
                </div>
            </section>

            <section className="section">
                <div className={`container ${styles.contactGrid}`}>
                    {/* Contact Info */}
                    <div className={styles.infoColumn}>
                        <div className={styles.infoCard}>
                            <h3>Contact Information</h3>
                            <p>Reach out to the Christ the King Secretariat directly.</p>

                            <div className={styles.infoItem}>
                                <div className={styles.iconBox}><MapPin size={20} /></div>
                                <div>
                                    <h4>Visit Us</h4>
                                    <p>Christ the King School Campus<br />Accra, Ghana</p>
                                </div>
                            </div>

                            <div className={styles.infoItem}>
                                <div className={styles.iconBox}><Mail size={20} /></div>
                                <div>
                                    <h4>Email Us</h4>
                                    <p>store@christtheking.edu.gh</p>
                                </div>
                            </div>

                            <div className={styles.infoItem}>
                                <div className={styles.iconBox}><Phone size={20} /></div>
                                <div>
                                    <h4>Call Us</h4>
                                    <p>+233 20 123 4567</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Form */}
                    <div className={styles.formColumn}>
                        {submitted ? (
                            <div className={styles.successCard}>
                                <div className={styles.checkCircle}>✓</div>
                                <h2>Message Sent!</h2>
                                <p>Thank you for reaching out. We appreciate your feedback and will get back to you shortly.</p>
                                <button
                                    className={styles.infoBtn}
                                    onClick={() => {
                                        setSubmitted(false);
                                        setFormData({ name: "", email: "", subject: "inquiry", message: "" });
                                    }}
                                >
                                    Send Another Message
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className={styles.form}>
                                <h2>Send a Message</h2>

                                <div className={styles.formGroup}>
                                    <label>Full Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="Your Name"
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label>Email Address</label>
                                    <input
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        placeholder="your@email.com"
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label>Subject</label>
                                    <select
                                        value={formData.subject}
                                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                    >
                                        <option value="inquiry">General Inquiry</option>
                                        <option value="order">Order Support</option>
                                        <option value="opinion">My Opinion / Feedback</option>
                                        <option value="suggestion">Merchandise Suggestion</option>
                                    </select>
                                </div>

                                <div className={styles.formGroup}>
                                    <label>Message</label>
                                    <textarea
                                        required
                                        rows={6}
                                        value={formData.message}
                                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                        placeholder="How can we help you?"
                                    ></textarea>
                                </div>

                                <button type="submit" className={styles.submitBtn}>
                                    Send Message <Send size={18} />
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

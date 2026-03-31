import Header from "@/components/Header";
import Footer from "@/components/Footer";
import styles from "./about.module.css";

export default function AboutPage() {
    return (
        <main>
            <Header />
            <div className={styles.hero}>
                <div className="container">
                    <span className="premium-gold-text" style={{ fontWeight: 700, letterSpacing: '0.3em' }}>OUR STORY</span>
                    <h1>A Century of Excellence</h1>
                </div>
            </div>

            <div className="container" style={{ padding: '8rem 1.5rem' }}>
                <div className={styles.contentGrid}>
                    <div className={styles.textContent}>
                        <h2>Christ the King School</h2>
                        <p>
                            Christ the King School is a prestigious Catholic institution located in Accra, Ghana,
                            dedicated to nurturing young minds through faith, academic excellence, and moral values.
                        </p>
                        <p>
                            Rooted in Christian principles, Christ the King has been a beacon of academic excellence, leadership, and faith.
                            The school&apos;s mission is to develop the whole person — intellectually, spiritually, and socially —
                            preparing students to be responsible citizens and leaders of tomorrow.
                        </p>
                        <p>
                            The merchandise collection offered here celebrates the pride and identity of the Christ the King community,
                            supporting the school&apos;s mission and legacy for generations to come.
                        </p>
                    </div>
                    <div className={styles.imageContent}>
                        <img 
                            src="/ctk-school.png" 
                            alt="Christ the King School Campus"
                            style={{ 
                                width: '100%', 
                                height: '500px', 
                                objectFit: 'cover', 
                                borderRadius: 'var(--radius)' 
                            }}
                        />
                    </div>
                </div>
            </div>

            <Footer />
        </main>
    );
}


import Header from "@/components/Header";
import Hero from "@/components/Hero";
import BestSelling from "@/components/BestSelling";
import FeaturedProducts from "@/components/FeaturedProducts";
import Footer from "@/components/Footer";
import styles from "./page.module.css";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main className={styles.main}>
      <Header />
      <Hero />

      <BestSelling />

      <FeaturedProducts />

      {/* Legacy Story Section */}
      <section className={styles.legacySection}>
        <div className="container">
          <div className={styles.legacyGrid}>
            <div className={styles.legacyContent}>
              <span className="section-title">A CENTURY OF EXCELLENCE</span>
              <h2 className="section-heading">Heritage & Leadership</h2>
              <p className={styles.legacyText}>
                Founded as a beacon of faith and learning, Christ the King School was established to provide exceptional education in Ghana.
                As we celebrate our legacy, we honor the "Christ the King Spirit"—a tradition of leadership,
                unity, and excellence that continues to shape the future of our community.
              </p>
              <div className={styles.legacyStats}>
                <div className={styles.statItem}>
                  <span className={styles.statNumber}>Est.</span>
                  <span className={styles.statLabel}>Founded</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statNumber}>100</span>
                  <span className={styles.statLabel}>Years</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statNumber}>50k+</span>
                  <span className={styles.statLabel}>Alumni</span>
                </div>
              </div>
              <Link href="/about" className={styles.outlineBtn}>Explore Our Story</Link>
            </div>
            <div className={styles.legacyImageWrapper}>
              <div className={styles.imageMain}>
                <Image src="/hero-bg.png" alt="Heritage" fill className={styles.img} />
              </div>
              <div className={styles.imageFloating}>
                <Image src="/logo.png" alt="Seal" width={150} height={150} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter / Join Section */}
      <section className={styles.newsletterSection}>
        <div className="container">
          <div className={`${styles.newsletterCard} glass-morphism`}>
            <h2 className={styles.newsletterTitle}>Join the Celebration</h2>
            <p className={styles.newsletterSub}>Subscribe for exclusive access to school events and limited-edition releases.</p>
            <form className={styles.newsletterForm}>
              <input type="email" placeholder="Email Address" className={styles.input} />
              <button type="submit" className={styles.submitBtn}>Subscribe</button>
            </form>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

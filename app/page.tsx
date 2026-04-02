import Header from "@/components/Header";
import Hero from "@/components/Hero";
import FeaturedProducts from "@/components/FeaturedProducts";
import DuesSection from "@/components/DuesSection";
import Footer from "@/components/Footer";
import styles from "./page.module.css";
import Image from "next/image";
import Link from "next/link";
import AlumniJoinForm from "@/components/AlumniJoinForm";

export default function Home() {
  return (
    <main className={styles.main}>
      <Header />
      <Hero />

      {/* Featured Collection Section */}
      <FeaturedProducts />

      {/* Dues & Contribution Hub */}
      <DuesSection />

      {/* Heritage Story Chapter */}
      <section className={styles.heritageChapter}>
        <div className="container">
          <div className={styles.chapterGrid}>
            <div className={styles.chapterVisuals}>
                <div className={styles.mainImageWrapper}>
                    <Image 
                        src="/official_tie_silk_1769187839635.png" 
                        alt="CTK Heritage" 
                        fill 
                        className={styles.img} 
                    />
                </div>
                <div className={styles.accentCrest}>
                    <Image 
                        src="/Asset 2only.png"
                        alt="Christ the King" 
                        width={240} 
                        height={120} 
                        style={{ height: 'auto' }}
                    />
                </div>
            </div>
            
            <div className={styles.chapterContent}>
              <span className={styles.preTitle}>SINCE 1956</span>
              <h2 className={styles.chapterHeading}>
                A Legacy of <br />
                <span className="gold-accent">Excellence & Faith.</span>
              </h2>
              <p className={styles.chapterText}>
                Founded as a beacon of faith and learning, Christ the King School was established to provide exceptional education in Ghana. 
                As we celebrate our legacy, we honor the "Christ the King Spirit"—a tradition of leadership, unity, and excellence 
                that continues to shape the future of our globally-connected alumni community.
              </p>
              
              <div className={styles.metrics}>
                <div className={styles.metricItem}>
                  <span className={styles.metricValue}>1956</span>
                  <span className={styles.metricLabel}>ESTABLISHED</span>
                </div>
                <div className={styles.metricItem}>
                  <span className={styles.metricValue}>5000+</span>
                  <span className={styles.metricLabel}>ACTIVE ALUMNI</span>
                </div>
                <div className={styles.metricItem}>
                  <span className={styles.metricValue}>$2M+</span>
                  <span className={styles.metricLabel}>IMPACT FUND</span>
                </div>
              </div>
              
              <Link href="/about" className={styles.editorialLink}>
                <span>DISCOVER OUR STORY</span>
                <div className={styles.line}></div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Join the Society / Newsletter Section */}
      <section className={styles.societySection}>
        <div className="container">
          <div className={styles.societyWrapper}>
            <AlumniJoinForm />
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

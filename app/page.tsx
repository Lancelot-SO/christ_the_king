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

      {/* Fundraising Preview */}
      <section className={styles.fundraisingPreview}>
        <div className="container">
          <span className={styles.preTitle}>BUILDING THE FUTURE</span>
          <h2 className={styles.chapterHeading}>
            Fundraising <span className="gold-accent">Opportunities.</span>
          </h2>
          <p className={styles.fundraisingPreviewDesc}>
            From sponsoring a classroom to buying a single brick, every contribution 
            helps build the next chapter of CTKIS.
          </p>

          <div className={styles.fundraisingPreviewGrid}>
            <div className={styles.previewCard}>
              <span className={styles.previewCardLabel}>PREMIER TIER</span>
              <h3 className={styles.previewCardTitle}>Sponsor a Classroom</h3>
              <span className={styles.previewCardPrice}>GH₵3,600,000</span>
              <span className={styles.previewCardUnit}>per floor</span>
            </div>
            <div className={styles.previewCard}>
              <span className={styles.previewCardLabel}>FOUNDATION</span>
              <h3 className={styles.previewCardTitle}>Brick-by-Brick</h3>
              <span className={styles.previewCardPrice}>GH₵1,000</span>
              <span className={styles.previewCardUnit}>per brick</span>
            </div>
            <div className={styles.previewCard}>
              <span className={styles.previewCardLabel}>EQUIP</span>
              <h3 className={styles.previewCardTitle}>Furniture & Equipment</h3>
              <span className={styles.previewCardPrice}>From GH₵699</span>
              <span className={styles.previewCardUnit}>per item</span>
            </div>
          </div>

          <Link href="/dues" className={styles.editorialLink}>
            <span>VIEW ALL OPPORTUNITIES</span>
            <div className={styles.line}></div>
          </Link>
        </div>
      </section>

      {/* Heritage Story Chapter */}
      <section className={styles.heritageChapter}>
        <div className="container">
          <div className={styles.chapterGrid}>
            <div className={styles.chapterVisuals}>
                <div className={styles.mainImageWrapper}>
                    <Image 
                        src="/Asset 2only.png" 
                        alt="Christ the King Logo" 
                        fill 
                        className={styles.img} 
                        style={{ objectFit: 'contain', padding: '15%' }}
                    />
                </div>
            </div>
            
            <div className={styles.chapterContent}>
              <span className={styles.preTitle}>1956 — 2026</span>
              <h2 className={styles.chapterHeading}>
                A Brief History of <span className="gold-accent">CTKIS.</span>
              </h2>
              <p className={styles.chapterText}>
                For over seven decades, CTKIS has remained dedicated to nurturing children in faith, character, 
                and academic excellence under the guidance of the Catholic Church.
              </p>
              <p className={styles.chapterText}>
                Christ the King International School (CTKIS) is a Ghanaian Catholic private basic school 
                located in Cantonments, Accra. Established on 31st January 1956 with just six students, the 
                school has grown to a current population of 858 pupils. Renowned for its academic excellence 
                and strong emphasis on moral formation, CTKIS has educated children from diverse backgrounds 
                and religious traditions, shaping them into well-rounded individuals prepared for the future.
              </p>

              
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

import Header from "@/components/Header";
import Hero from "@/components/Hero";
import FeaturedProducts from "@/components/FeaturedProducts";
import DuesSection from "@/components/DuesSection";
import Footer from "@/components/Footer";
import styles from "./page.module.css";
import Image from "next/image";
import Link from "next/link";
import AlumniJoinForm from "@/components/AlumniJoinForm";
import FundraisingPreview from "@/components/FundraisingPreview";
import Events from "@/components/Events";

export default function Home() {
  return (
    <main className={styles.main}>
      <Header />
      <Hero />

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
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
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

      {/* Campaign Section */}
      <FeaturedProducts />

      {/* Events Section */}
      <Events />

      {/* Fundraising Preview */}
      <FundraisingPreview />

      {/* How You Can Help */}
      <DuesSection />

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

import { supabaseAdmin as supabase } from '@/lib/supabaseServer';
import styles from './receipt.module.css';
import Link from 'next/link';

export const metadata = {
    title: 'Donation Receipt | Christ The King',
};

// Next.js page component
export default async function ReceiptPage({ params }: { params: { id: string } }) {
    const { id } = params;

    // Fetch the specific donation securely using the UUID as the token
    const { data: donation, error } = await supabase
        .from('donations')
        .select('*')
        .eq('id', id)
        .single();

    if (error || !donation) {
        return (
            <main className={styles.pageContainer}>
                <div className={styles.receiptCard}>
                    <div className={styles.receiptHeader}>
                        <h1 className={styles.schoolTitle}>CHRIST THE KING</h1>
                        <p className={styles.schoolSubtitle}>INTERNATIONAL SCHOOL</p>
                    </div>
                    <div className={styles.errorContainer}>
                        <h2 className={styles.errorTitle}>Receipt Not Found</h2>
                        <p className={styles.errorText}>
                            We couldn't find a donation matching this link. It may be invalid or have expired.
                        </p>
                        <Link href="/" className={styles.ctaBtn}>
                            RETURN HOME
                        </Link>
                    </div>
                </div>
            </main>
        );
    }

    const formatDate = (dateString: string) => {
        const options: Intl.DateTimeFormatOptions = { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return new Date(dateString).toLocaleDateString('en-GB', options);
    };

    return (
        <main className={styles.pageContainer}>
            <div className={styles.receiptCard}>
                
                {/* Header Section */}
                <div className={styles.receiptHeader}>
                    <h1 className={styles.schoolTitle}>CHRIST THE KING</h1>
                    <p className={styles.schoolSubtitle}>INTERNATIONAL SCHOOL</p>
                </div>

                {/* Body Section */}
                <div className={styles.receiptBody}>
                    <h2 className={styles.thankYouText}>Thank You, {donation.donor_name.split(' ')[0]}!</h2>
                    <p className={styles.dateText}>{formatDate(donation.created_at)}</p>

                    <div className={styles.amountBox}>
                        <span className={styles.amountLabel}>TOTAL CONTRIBUTION</span>
                        <span className={styles.amountValue}>GH₵ {Number(donation.amount).toLocaleString()}</span>
                    </div>

                    <div className={styles.detailsGrid}>
                        <div className={styles.detailRow}>
                            <span className={styles.detailLabel}>DONATION TYPE</span>
                            <span className={styles.detailValue}>{donation.donation_type}</span>
                        </div>
                        
                        {donation.honour_of && (
                            <div className={styles.detailRow}>
                                <span className={styles.detailLabel}>IN HONOUR OF</span>
                                <span className={styles.detailValue}>
                                    {donation.honour_of} {donation.honour_of_name ? ` — ${donation.honour_of_name}` : ''}
                                </span>
                            </div>
                        )}
                        
                        <div className={styles.detailRow}>
                            <span className={styles.detailLabel}>CONNECTION</span>
                            <span className={styles.detailValue}>{donation.connection}</span>
                        </div>
                        
                        <div className={styles.detailRow}>
                            <span className={styles.detailLabel}>REFERENCE NUMBER</span>
                            <span className={styles.detailValue} style={{ fontSize: '0.8rem', opacity: 0.8 }}>
                                {donation.reference}
                            </span>
                        </div>
                    </div>

                    <div className={styles.receiptFooter}>
                        <p className={styles.footerMessage}>
                            Your generous support is making a direct impact on the future of our students. We are deeply grateful for your contribution to the Christ The King community.
                        </p>
                        <Link href="/" className={styles.ctaBtn}>
                            RETURN TO SCHOOL WEBSITE
                        </Link>
                    </div>
                </div>

            </div>
        </main>
    );
}

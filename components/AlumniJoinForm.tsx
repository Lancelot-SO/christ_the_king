"use client";

import { useState } from 'react';
import styles from '../app/page.module.css';

export default function AlumniJoinForm() {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setStatus('loading');
        try {
            const res = await fetch('/api/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();

            if (res.ok) {
                setStatus('success');
                setMessage(data.message || 'Thank you for joining!');
                setEmail('');
            } else {
                throw new Error(data.error || 'Something went wrong');
            }
        } catch (error: any) {
            setStatus('error');
            setMessage(error.message);
        }
    };

    return (
        <div className={styles.societyContent}>
            <h3 className={styles.societyTitle}>Join the CTKIS Alumni Family</h3>
            <p className={styles.societySub}>
                Be the first to receive exclusive drops from the Christ the King collection 
                and updates on alumni events.
            </p>
            
            <form className={styles.societyForm} onSubmit={handleSubmit}>
                <input 
                    type="email" 
                    placeholder="YOUR EMAIL ADDRESS" 
                    className={styles.societyInput} 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={status === 'loading'}
                    required
                />
                <button 
                    type="submit" 
                    className={styles.societyBtn}
                    disabled={status === 'loading'}
                >
                    {status === 'loading' ? 'JOINING...' : 'JOIN US'}
                </button>
            </form>

            {status === 'success' && (
                <p style={{ color: 'var(--gold)', marginTop: '1.5rem', fontWeight: 600 }}>
                    {message}
                </p>
            )}
            {status === 'error' && (
                <p style={{ color: '#dc2626', marginTop: '1.5rem', fontWeight: 600 }}>
                    {message}
                </p>
            )}
        </div>
    );
}

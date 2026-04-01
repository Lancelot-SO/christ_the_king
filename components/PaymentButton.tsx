"use client";

import { usePaystackPayment } from "react-paystack";
import { Loader2, ChevronRight } from "lucide-react";

interface PaymentButtonProps {
    config: any;
    cart?: any[]; // Now optional
    onSuccess: (response: any) => void;
    onClose: () => void;
    loading: boolean;
    setLoading: (loading: boolean) => void;
    styles: any;
    label?: React.ReactNode; // Custom label
    skipCartCheck?: boolean; // Don't check cart.length
}

export default function PaymentButton({ config, cart = [], onSuccess, onClose, loading, setLoading, styles, label, skipCartCheck = false }: PaymentButtonProps) {
    const initializePayment = usePaystackPayment(config);

    const handlePayment = () => {
        if (!skipCartCheck && cart.length === 0) {
            alert("Your cart is empty");
            return;
        }

        if (!config.publicKey) {
            alert("Payment system is not properly configured. Please try again later.");
            return;
        }

        setLoading(true);

        if (!config.email.includes('@')) {
            alert("Please provide a valid email address");
            setLoading(false);
            return;
        }

        initializePayment({
            onSuccess,
            onClose
        });
    };

    return (
        <button 
            type="button" 
            onClick={handlePayment}
            className={styles.payBtn} 
            disabled={loading || (!skipCartCheck && cart.length === 0)}
        >
            {loading ? <><Loader2 className={styles.spin} size={20} /> Processing...</> : <>{label || "Pay Now"} <ChevronRight size={20} /></>}
        </button>
    );
}

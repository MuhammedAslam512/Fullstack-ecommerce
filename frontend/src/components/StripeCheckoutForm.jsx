import { useState } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { CreditCard, Lock } from 'lucide-react';

export default function StripeCheckoutForm({ clientSecret, onPaymentSuccess }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setLoading(true);
    setErrorMessage('');

    const cardElement = elements.getElement(CardElement);

    // Confirm Payment with Stripe
    const { paymentIntent, error } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardElement
      }
    });

    if (error) {
      setErrorMessage(error.message);
      setLoading(false);
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      onPaymentSuccess(paymentIntent);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ background: 'white', padding: '20px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
      <h4 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px' }}>
        <CreditCard size={18} color="#2563eb" /> Card Details
      </h4>

      {errorMessage && (
        <div style={{ background: '#fef2f2', color: '#dc2626', padding: '10px', borderRadius: '6px', fontSize: '13px', marginBottom: '16px' }}>
          {errorMessage}
        </div>
      )}

      <div style={{ padding: '12px', border: '1px solid #cbd5e1', borderRadius: '6px', background: '#f8fafc', marginBottom: '20px' }}>
        <CardElement options={{ style: { base: { fontSize: '15px', color: '#1e293b' } } }} />
      </div>

      <button
        type="submit"
        disabled={!stripe || loading}
        className="btn btn-primary"
        style={{ width: '100%', padding: '14px', fontSize: '16px' }}
      >
        <Lock size={16} /> {loading ? 'Processing Payment...' : 'Pay Now'}
      </button>

      <p style={{ textAlign: 'center', fontSize: '12px', color: '#64748b', marginTop: '12px' }}>
        🔒 Encrypted & Secured by Stripe
      </p>
    </form>
  );
}
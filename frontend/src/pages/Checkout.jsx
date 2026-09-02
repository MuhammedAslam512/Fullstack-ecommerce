import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import api from '../api/axios';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import StripeCheckoutForm from '../components/StripeCheckoutForm';
import { MapPin, ShieldCheck, ArrowLeft } from 'lucide-react';

// Stripe Publishable Key (From backend env)
const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_TYooMQauvdEDq54NiTphI7jx');

export default function Checkout() {
  const { cart, clearCart } = useCart();
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // Step 1: Address, Step 2: Payment
  const [loading, setLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState('');
  const [createdOrder, setCreatedOrder] = useState(null);

  const [shippingAddress, setShippingAddress] = useState({
    street: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India'
  });

  const handleChange = (e) => {
    setShippingAddress({ ...shippingAddress, [e.target.name]: e.target.value });
  };

  // STEP 1: Create Order & Initialize Payment Intent
  const handleProceedToPayment = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Create Order from Cart in MongoDB
      const orderRes = await api.post('/orders', {
        shippingAddress,
        paymentMethod: 'card'
      });

      if (!orderRes.data.success) {
        alert('Failed to create order');
        return;
      }

      const order = orderRes.data.data;
      setCreatedOrder(order);

      // 2. Create Stripe Payment Intent
      const paymentRes = await api.post('/payments/create-payment-intent', {
        orderId: order._id
      });

      if (paymentRes.data.success) {
        setClientSecret(paymentRes.data.clientSecret);
        setStep(2); // Move to Payment step!
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error processing checkout');
    } finally {
      setLoading(false);
    }
  };

  // STEP 2: Payment Success Callback
  const handlePaymentSuccess = async (paymentIntent) => {
    try {
      // Confirm payment with backend
      await api.post('/payments/confirm', {
        paymentIntentId: paymentIntent.id
      });

      await clearCart(); // Clear local cart context
      navigate('/order-success', { state: { order: createdOrder } });
    } catch (err) {
      console.error('Error confirming payment:', err);
      navigate('/order-success', { state: { order: createdOrder } });
    }
  };

  if (!cart.items || cart.items.length === 0) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '60px' }}>
        <h3>Your cart is empty! Add products before checking out.</h3>
      </div>
    );
  }

  return (
    <div className="container" style={{ margin: '30px auto' }}>
      <button className="btn btn-outline" style={{ marginBottom: '20px' }} onClick={() => navigate('/cart')}>
        <ArrowLeft size={16} /> Back to Cart
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '24px' }}>
        {/* Left Column: Form / Payment */}
        <div>
          {step === 1 ? (
            <div style={{ background: 'white', padding: '24px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MapPin size={20} color="#2563eb" /> Shipping Address
              </h3>

              <form onSubmit={handleProceedToPayment}>
                <div style={{ marginBottom: '16px' }}>
                  <label className="sidebar-title" style={{ fontSize: '12px', display: 'block', marginBottom: '4px' }}>Street Address</label>
                  <input
                    type="text"
                    name="street"
                    required
                    value={shippingAddress.street}
                    onChange={handleChange}
                    placeholder="e.g. 123 Main Street, Apt 4B"
                    className="form-input"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label className="sidebar-title" style={{ fontSize: '12px', display: 'block', marginBottom: '4px' }}>City</label>
                    <input
                      type="text"
                      name="city"
                      required
                      value={shippingAddress.city}
                      onChange={handleChange}
                      placeholder="e.g. Mumbai"
                      className="form-input"
                    />
                  </div>
                  <div>
                    <label className="sidebar-title" style={{ fontSize: '12px', display: 'block', marginBottom: '4px' }}>State</label>
                    <input
                      type="text"
                      name="state"
                      required
                      value={shippingAddress.state}
                      onChange={handleChange}
                      placeholder="e.g. Maharashtra"
                      className="form-input"
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '12px' }}>
                  <div>
                    <label className="sidebar-title" style={{ fontSize: '12px', display: 'block', marginBottom: '4px' }}>Pincode</label>
                    <input
                      type="text"
                      name="pincode"
                      required
                      value={shippingAddress.pincode}
                      onChange={handleChange}
                      placeholder="e.g. 400001"
                      className="form-input"
                    />
                  </div>
                  <div>
                    <label className="sidebar-title" style={{ fontSize: '12px', display: 'block', marginBottom: '4px' }}>Country</label>
                    <input
                      type="text"
                      name="country"
                      required
                      value={shippingAddress.country}
                      onChange={handleChange}
                      className="form-input"
                    />
                  </div>
                </div>

                <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', padding: '14px', marginTop: '20px', fontSize: '16px' }}>
                  {loading ? 'Creating Order...' : 'Proceed to Payment'}
                </button>
              </form>
            </div>
          ) : (
            <div>
              {clientSecret && (
                <Elements stripe={stripePromise} options={{ clientSecret }}>
                  <StripeCheckoutForm
                    clientSecret={clientSecret}
                    onPaymentSuccess={handlePaymentSuccess}
                  />
                </Elements>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Order Summary */}
        <div>
          <div style={{ background: 'white', padding: '20px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            <h4 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
              Order Review ({cart.items.length} items)
            </h4>

            {cart.items.map((item) => (
              <div key={item._id} className="flex-between" style={{ marginBottom: '12px', fontSize: '14px' }}>
                <div>
                  <div style={{ fontWeight: '600' }}>{item.product?.name || 'Item'}</div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>Qty: {item.quantity} × ₹{item.price}</div>
                </div>
                <div style={{ fontWeight: '700' }}>₹{item.quantity * item.price}</div>
              </div>
            ))}

            <hr style={{ border: 'none', borderTop: '1px solid #f1f5f9', margin: '16px 0' }} />

            <div className="flex-between" style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>
              <span>Total Payable</span>
              <span style={{ color: '#2563eb' }}>₹{cart.totalAmount}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
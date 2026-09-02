import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Star, MessageSquare, Send } from 'lucide-react';

export default function ProductReviews({ productId, onReviewAdded }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const { isAuthenticated } = useAuth();

  const fetchReviews = async () => {
    try {
      const res = await api.get(`/reviews/product/${productId}`);
      if (res.data.success) {
        setReviews(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (productId) fetchReviews();
  }, [productId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setSubmitting(true);
    setError('');

    try {
      const res = await api.post(`/reviews/product/${productId}`, { rating, comment });
      if (res.data.success) {
        setComment('');
        setRating(5);
        await fetchReviews(); // Refresh review list
        if (onReviewAdded) onReviewAdded();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ marginTop: '24px', borderTop: '1px solid #f1f5f9', paddingTop: '20px' }}>
      <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <MessageSquare size={18} color="#2563eb" /> Customer Reviews ({reviews.length})
      </h3>

      {/* Review Submission Form */}
      {isAuthenticated ? (
        <form onSubmit={handleSubmit} style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', marginBottom: '20px' }}>
          <h4 style={{ fontSize: '14px', marginBottom: '10px' }}>Write a Review</h4>

          {error && (
            <div style={{ background: '#fef2f2', color: '#dc2626', padding: '8px', borderRadius: '4px', fontSize: '12px', marginBottom: '10px' }}>
              {error}
            </div>
          )}

          {/* Star Selection */}
          <div style={{ display: 'flex', gap: '6px', marginBottom: '12px', cursor: 'pointer' }}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={20}
                color="#f59e0b"
                fill={star <= rating ? '#f59e0b' : 'none'}
                onClick={() => setRating(star)}
              />
            ))}
          </div>

          <textarea
            rows="3"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share details about product quality, fit, or performance..."
            className="form-input"
            style={{ resize: 'none', marginBottom: '10px' }}
            required
          />

          <button type="submit" disabled={submitting} className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '13px' }}>
            <Send size={14} /> {submitting ? 'Submitting...' : 'Post Review'}
          </button>
        </form>
      ) : (
        <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px', background: '#f8fafc', padding: '10px', borderRadius: '6px' }}>
          🔒 Log in to write a review.
        </p>
      )}

      {/* Reviews List */}
      {loading ? (
        <div style={{ fontSize: '13px', color: '#64748b' }}>Loading reviews...</div>
      ) : reviews.length === 0 ? (
        <p style={{ fontSize: '13px', color: '#94a3b8' }}>No reviews yet. Be the first to review this product!</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {reviews.map((rev) => (
            <div key={rev._id} style={{ background: 'white', padding: '12px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
              <div className="flex-between" style={{ marginBottom: '6px' }}>
                <span style={{ fontWeight: '600', fontSize: '14px' }}>{rev.user?.name || 'Customer'}</span>
                <div style={{ display: 'flex', gap: '2px' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={14}
                      color="#f59e0b"
                      fill={star <= rev.rating ? '#f59e0b' : 'none'}
                    />
                  ))}
                </div>
              </div>
              <p style={{ fontSize: '13px', color: '#334155', margin: 0 }}>{rev.comment}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
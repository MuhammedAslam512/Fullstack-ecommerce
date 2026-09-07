export default function StatusBadge({ status }) {
  const map = {
    pending: { bg: '#f1f5f9', color: '#475569', label: 'Pending' },
    processing: { bg: '#fef3c7', color: '#b45309', label: 'Processing' },
    shipped: { bg: '#e0f2fe', color: '#0369a1', label: 'Shipped' },
    delivered: { bg: '#dcfce7', color: '#15803d', label: 'Delivered' },
    cancelled: { bg: '#fee2e2', color: '#b91c1c', label: 'Cancelled' },
    paid: { bg: '#dcfce7', color: '#15803d', label: 'Paid' },
    failed: { bg: '#fee2e2', color: '#b91c1c', label: 'Failed' }
  };

  const s = map[status] || map.pending;

  return (
    <span style={{
      background: s.bg,
      color: s.color,
      padding: '4px 10px',
      borderRadius: '999px',
      fontSize: '12px',
      fontWeight: 700,
      textTransform: 'capitalize'
    }}>
      {s.label}
    </span>
  );
}

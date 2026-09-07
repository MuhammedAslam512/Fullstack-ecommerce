export default function StatsCard({ title, value, icon, color = '#2563eb' }) {
  return (
    <div style={{
      background: 'white',
      border: '1px solid #e2e8f0',
      borderRadius: '12px',
      padding: '18px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }}>
      <div>
        <p style={{ margin: 0, color: '#64748b', fontSize: '13px', fontWeight: 600 }}>{title}</p>
        <h3 style={{ margin: '6px 0 0', fontSize: '28px', color: '#0f172a' }}>{value}</h3>
      </div>
      <div style={{
        width: '44px',
        height: '44px',
        borderRadius: '10px',
        background: `${color}15`,
        color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {icon}
      </div>
    </div>
  );
}


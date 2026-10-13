export default function HeaderBanner() {
  return (
    <div style={{
      background: 'linear-gradient(90deg, #2563eb, #7c3aed)',
      color: 'white',
      padding: '16px',
      borderRadius: '8px',
      textAlign: 'center',
      marginBottom: '20px'
    }}>
      <h3>Hello from Remote Micro-Frontend App! (Port 5174)</h3>
      <p style={{ margin: 0, fontSize: '13px' }}>
        This component is served independently from a different server.
      </p>
    </div>
  );
}
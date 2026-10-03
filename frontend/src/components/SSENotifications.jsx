import { useEffect, useState } from 'react';
import { Radio, RefreshCw } from 'lucide-react';

export default function SSENotifications() {
  const [liveStreamMsg, setLiveStreamMsg] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Native Browser EventSource API connecting to Express SSE stream
    const eventSource = new EventSource('http://localhost:5000/api/notifications/stream');

    eventSource.addEventListener('connected', (e) => {
      setIsConnected(true);
      console.log('⚡ SSE Stream Handshake Received:', JSON.parse(e.data));
    });

    // Listen for custom 'order_status_update' events from Express!
    eventSource.addEventListener('order_status_update', (e) => {
      const data = JSON.parse(e.data);
      setLiveStreamMsg(data);

      // Auto-clear banner after 8 seconds
      setTimeout(() => setLiveStreamMsg(null), 8000);
    });

    eventSource.onerror = (err) => {
      setIsConnected(false);
      console.error('SSE Connection Error:', err);
    };

    return () => {
      eventSource.close();
    };
  }, []);

  if (!liveStreamMsg) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '80px',
      right: '20px',
      background: '#2563eb',
      color: 'white',
      padding: '12px 18px',
      borderRadius: '8px',
      boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      zIndex: 2000
    }}>
      <Radio size={18} color="#60a5fa" className="animate-pulse" />
      <div>
        <div style={{ fontWeight: 'bold', fontSize: '13px' }}>📢 SSE Live Event</div>
        <div style={{ fontSize: '12px' }}>{liveStreamMsg.message}</div>
      </div>
    </div>
  );
}
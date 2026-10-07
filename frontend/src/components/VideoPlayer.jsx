import { useState } from 'react';
import { Play, Film } from 'lucide-react';

export default function VideoPlayer({ videoFilename = 'sample-demo.mp4' }) {
  const [isPlaying, setIsPlaying] = useState(false);

  const streamUrl = `http://localhost:5000/api/videos/stream/${videoFilename}`;

  return (
    <div style={{
      background: 'white',
      padding: '20px',
      borderRadius: '12px',
      border: '1px solid #e2e8f0',
      maxWidth: '700px',
      margin: '20px auto'
    }}>
      <h3 style={{ margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '18px' }}>
        <Film size={20} color="#2563eb" /> Live Video Stream (HTTP 206 Chunks)
      </h3>

      {/* HTML5 Native Video Tag automatically issues Range Requests */}
      <div style={{ background: '#0f172a', borderRadius: '8px', overflow: 'hidden' }}>
        <video
          controls
          width="100%"
          height="380"
          preload="metadata"
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          style={{ display: 'block' }}
        >
          <source src={streamUrl} type="video/mp4" />
          Your browser does not support HTML5 video streaming.
        </video>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', fontSize: '13px', color: '#64748b' }}>
        <span>Status: {isPlaying ? '▶️ Streaming in progress' : '⏸️ Paused'}</span>
        <span>URL: <code>/api/videos/stream/{videoFilename}</code></span>
      </div>
    </div>
  );
}
import React, { Suspense } from 'react';

// Dynamically import component from Remote App!
const HeaderBanner = React.lazy(() => import('remoteApp/HeaderBanner'));

export default function App() {
  return (
    <div style={{ padding: '30px', fontFamily: 'sans-serif', maxWidth: '800px', margin: 'auto' }}>
      <h1> Host Container Application (Port 5173)</h1>

      {/* Render Remote Component with Fallback */}
      <Suspense fallback={<div>Loading Micro-Frontend...</div>}>
        <HeaderBanner />
      </Suspense>

      <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
        <p>This is content from the main Host Application.</p>
      </div>
    </div>
  );
}
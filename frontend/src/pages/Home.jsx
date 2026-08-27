import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div style={{ textAlign: 'center', padding: '60px 20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '36px', color: '#1a202c', marginBottom: '16px' }}>
        Welcome to ShopNest E-Commerce
      </h1>
      <p style={{ fontSize: '18px', color: '#718096', marginBottom: '30px' }}>
        A complete Fullstack application powered by React, Express & MongoDB.
      </p>
      <Link to="/register" style={{ background: '#1877f2', color: '#ffffff', padding: '14px 28px', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold', fontSize: '16px' }}>
        Get Started Now
      </Link>
    </div>
  );
}
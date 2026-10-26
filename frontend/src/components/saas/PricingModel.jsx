import { useState } from 'react';
import api from '../../api/axios';

export default function PricingModal({ isOpen, onClose, activeWorkspace }) {
  const [loadingPlan, setLoadingPlan] = useState(null);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  // Handle Plan Upgrade Click -> Calls Backend -> Redirects to Stripe Checkout
  const handleUpgrade = async (plan) => {
    try {
      setLoadingPlan(plan);
      setError('');

      const response = await api.post('/billing/checkout', {
        workspaceId: activeWorkspace._id,
        plan: plan,
      });

      const { url } = response.data;
      if (url) {
        // Redirect browser to Stripe Hosted Checkout URL
        window.location.href = url;
      } else {
        setError('Failed to retrieve checkout URL.');
      }
    } catch (err) {
      console.error('Checkout Error:', err);
      setError(err.response?.data?.message || 'Failed to initiate upgrade.');
    } finally {
      setLoadingPlan(null);
    }
  };

  const currentPlan = activeWorkspace?.subscription?.plan || 'FREE';

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-4xl w-full p-8 text-white relative shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white text-lg font-bold"
        >
          ✕
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-white">⚡ Upgrade Your Workspace</h2>
          <p className="text-slate-400 text-sm mt-2">
            Choose the best plan for <span className="text-indigo-400 font-semibold">{activeWorkspace?.name}</span>
          </p>
        </div>

        {error && (
          <div className="bg-rose-950/80 border border-rose-800 text-rose-200 text-sm p-3 rounded-lg mb-6 text-center">
            {error}
          </div>
        )}

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* FREE TIER */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Free Tier</span>
              <div className="text-3xl font-black text-white mt-2">$0 <span className="text-sm font-normal text-slate-500">/mo</span></div>
              <ul className="text-xs text-slate-400 space-y-2 mt-6">
                <li>✓ Up to 5 Documents</li>
                <li>✓ Up to 3 Team Members</li>
                <li>✓ Basic Real-Time Collaboration</li>
                <li className="text-slate-600 line-through">✗ Pro Analytics</li>
              </ul>
            </div>
            <button
              disabled
              className="w-full mt-6 py-2 px-4 bg-slate-800 text-slate-500 text-xs font-bold rounded-lg cursor-not-allowed"
            >
              {currentPlan === 'FREE' ? 'Current Plan' : 'Downgrade'}
            </button>
          </div>

          {/* PRO TIER (RECOMMENDED) */}
          <div className="bg-gradient-to-b from-indigo-950/50 to-slate-950 border-2 border-indigo-500 rounded-xl p-6 flex flex-col justify-between relative shadow-indigo-500/10 shadow-xl">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[10px] font-extrabold px-3 py-0.5 rounded-full uppercase">
              Most Popular
            </span>
            <div>
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Pro Tier</span>
              <div className="text-3xl font-black text-white mt-2">$29 <span className="text-sm font-normal text-slate-500">/mo</span></div>
              <ul className="text-xs text-slate-300 space-y-2 mt-6">
                <li>✓ Up to 1,000 Documents</li>
                <li>✓ Up to 25 Team Members</li>
                <li>✓ Advanced Pro Analytics</li>
                <li>✓ Priority Socket.io Bandwidth</li>
              </ul>
            </div>
            <button
              onClick={() => handleUpgrade('PRO')}
              disabled={loadingPlan === 'PRO' || currentPlan === 'PRO'}
              className="w-full mt-6 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white text-xs font-bold rounded-lg transition"
            >
              {loadingPlan === 'PRO'
                ? 'Redirecting to Stripe...'
                : currentPlan === 'PRO'
                ? 'Current Plan'
                : 'Upgrade to PRO'}
            </button>
          </div>

          {/* ENTERPRISE TIER */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Enterprise</span>
              <div className="text-3xl font-black text-white mt-2">$99 <span className="text-sm font-normal text-slate-500">/mo</span></div>
              <ul className="text-xs text-slate-400 space-y-2 mt-6">
                <li>✓ Unlimited Documents</li>
                <li>✓ Unlimited Members</li>
                <li>✓ Custom Domain White-Labeling</li>
                <li>✓ Dedicated Audit Trail Logs</li>
              </ul>
            </div>
            <button
              onClick={() => handleUpgrade('ENTERPRISE')}
              disabled={loadingPlan === 'ENTERPRISE' || currentPlan === 'ENTERPRISE'}
              className="w-full mt-6 py-2.5 px-4 bg-slate-800 hover:bg-slate-700 disabled:bg-slate-800 text-white text-xs font-bold rounded-lg transition"
            >
              {loadingPlan === 'ENTERPRISE'
                ? 'Redirecting to Stripe...'
                : currentPlan === 'ENTERPRISE'
                ? 'Current Plan'
                : 'Upgrade to Enterprise'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
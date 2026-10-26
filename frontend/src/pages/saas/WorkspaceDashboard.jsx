import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useWorkspace } from '../../context/WorkspaceContext';
import CollaborativeEditor from '../../components/saas/CollaborativeEditor';
import PricingModal from '../../components/saas/PricingModal';
import api from '../../api/axios';

export default function WorkspaceDashboard() {
  const { activeWorkspace, workspaces, switchWorkspace, fetchWorkspaces, loading } = useWorkspace();
  const [searchParams, setSearchParams] = useSearchParams();

  const [documents, setDocuments] = useState([]);
  const [selectedDocId, setSelectedDocId] = useState(null);
  const [docTitle, setDocTitle] = useState('');
  const [analytics, setAnalytics] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);

  // Check URL Query Parameters for Billing Return State (?billing=success)
  useEffect(() => {
    const billingStatus = searchParams.get('billing');
    if (billingStatus === 'success') {
      setSuccessMsg('🎉 Payment Successful! Your workspace subscription has been upgraded.');
      fetchWorkspaces(); // Refresh workspace context data
      searchParams.delete('billing');
      setSearchParams(searchParams);
    } else if (billingStatus === 'canceled') {
      setErrorMsg('Billing checkout was canceled. No charges were made.');
      searchParams.delete('billing');
      setSearchParams(searchParams);
    }
  }, [searchParams, fetchWorkspaces, setSearchParams]);

  // Fetch Dashboard Data
  useEffect(() => {
    if (!activeWorkspace) return;

    const fetchWorkspaceData = async () => {
      try {
        setErrorMsg('');
        const analyticsRes = await api.get('/analytics/usage');
        setAnalytics(analyticsRes.data.data);

        const docsRes = analyticsRes.data.data.recentlyUpdatedDocuments || [];
        setDocuments(docsRes);

        if (docsRes.length > 0 && !selectedDocId) {
          setSelectedDocId(docsRes[0]._id);
        }
      } catch (err) {
        console.error('Error loading dashboard analytics:', err.message);
      }
    };

    fetchWorkspaceData();
  }, [activeWorkspace]);

  // Handle Opening Stripe Customer Billing Portal
  const handleOpenPortal = async () => {
    try {
      setPortalLoading(true);
      const res = await api.post('/billing/portal', { workspaceId: activeWorkspace._id });
      if (res.data.url) {
        window.location.href = res.data.url;
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to open billing portal.');
    } finally {
      setPortalLoading(false);
    }
  };

  // Create Document (Enforces Limit Check)
  const handleCreateDocument = async (e) => {
    e.preventDefault();
    try {
      setErrorMsg('');
      const res = await api.post('/documents', { title: docTitle || 'Untitled Document' });
      const newDoc = res.data.data;
      setDocuments([newDoc, ...documents]);
      setSelectedDocId(newDoc._id);
      setDocTitle('');
    } catch (err) {
      if (err.response?.data?.error === 'LIMIT_EXCEEDED') {
        setErrorMsg(err.response.data.message);
      } else {
        setErrorMsg('Failed to create document.');
      }
    }
  };

  if (loading) return <div className="p-8 text-white">Loading Workspace Context...</div>;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
      {/* Top Header */}
      <header className="flex flex-col md:flex-row items-center justify-between pb-8 mb-8 border-b border-slate-800 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white">🚀 Donglify SaaS Workspace</h1>
          <p className="text-slate-400 text-sm">Multi-Tenant Collaboration & Subscription Management</p>
        </div>

        {/* Tenant Workspace Selector & Billing CTAs */}
        <div className="flex items-center space-x-3">
          <select
            value={activeWorkspace?._id || ''}
            onChange={(e) => {
              const selected = workspaces.find((w) => w._id === e.target.value);
              if (selected) switchWorkspace(selected);
            }}
            className="bg-slate-900 border border-slate-800 text-white rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
          >
            {workspaces.map((ws) => (
              <option key={ws._id} value={ws._id}>
                {ws.name} ({ws.subscription?.plan || 'FREE'})
              </option>
            ))}
          </select>

          {/* Upgrade Plan Button */}
          <button
            onClick={() => setIsPricingOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2 rounded-lg transition"
          >
            ⚡ Upgrade Plan
          </button>

          {/* Customer Portal Button (If Paid Customer) */}
          {activeWorkspace?.subscription?.stripeCustomerId && (
            <button
              onClick={handleOpenPortal}
              disabled={portalLoading}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold px-4 py-2 rounded-lg transition"
            >
              {portalLoading ? 'Opening Portal...' : '💳 Manage Subscription'}
            </button>
          )}
        </div>
      </header>

      {/* Success Notification Banner */}
      {successMsg && (
        <div className="bg-emerald-950/80 border border-emerald-800 text-emerald-200 p-4 rounded-xl mb-8 flex items-center justify-between">
          <span className="text-sm font-medium">{successMsg}</span>
          <button onClick={() => setSuccessMsg('')} className="text-emerald-400 font-bold text-xs">Dismiss</button>
        </div>
      )}

      {/* Limit / Billing Error Notification Banner */}
      {errorMsg && (
        <div className="bg-rose-950/80 border border-rose-800 text-rose-200 p-4 rounded-xl mb-8 flex items-center justify-between">
          <span className="text-sm font-medium">⚠️ {errorMsg}</span>
          <button
            onClick={() => setIsPricingOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs px-4 py-2 rounded-lg font-bold ml-4"
          >
            Upgrade Plan
          </button>
        </div>
      )}

      {/* Usage Analytics Cards */}
      {analytics && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-8 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <span className="text-xs text-slate-400 block">Workspace Name</span>
            <span className="text-lg font-bold text-white">{analytics.workspaceName}</span>
          </div>

          <div>
            <span className="text-xs text-slate-400 block">Current Plan Tier</span>
            <span className="inline-block mt-1 px-3 py-0.5 bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 rounded-full text-xs font-semibold">
              {analytics.plan}
            </span>
          </div>

          <div>
            <span className="text-xs text-slate-400 block">Document Usage</span>
            <span className="text-lg font-bold text-white">
              {analytics.usage.documentsCount} / {analytics.usage.documentLimit}
            </span>
            <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2">
              <div
                className="bg-indigo-500 h-1.5 rounded-full"
                style={{ width: `${Math.min(100, analytics.usage.usagePercentage)}%` }}
              />
            </div>
          </div>

          <div>
            <span className="text-xs text-slate-400 block">Team Members</span>
            <span className="text-lg font-bold text-white">{analytics.memberCount} Members</span>
          </div>
        </div>
      )}

      {/* Main Grid Body */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Document Sidebar */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">📄 Workspace Documents</h3>

          <form onSubmit={handleCreateDocument} className="flex gap-2 mb-6">
            <input
              type="text"
              placeholder="New document title..."
              value={docTitle}
              onChange={(e) => setDocTitle(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-4 py-2 rounded-lg text-sm transition"
            >
              + Create
            </button>
          </form>

          <div className="space-y-2">
            {documents.length === 0 ? (
              <p className="text-xs text-slate-500">No documents found. Create one above!</p>
            ) : (
              documents.map((doc) => (
                <button
                  key={doc._id}
                  onClick={() => setSelectedDocId(doc._id)}
                  className={`w-full text-left p-3 rounded-lg border text-sm font-medium transition flex justify-between items-center ${
                    selectedDocId === doc._id
                      ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <span>{doc.title}</span>
                  <span className="text-[10px] text-slate-500">
                    {new Date(doc.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Live Collaborative Editor Canvas */}
        <div className="lg:col-span-2">
          {selectedDocId ? (
            <CollaborativeEditor docId={selectedDocId} username="Aslam (Developer)" />
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center text-slate-500">
              Select or create a document to start collaborative editing.
            </div>
          )}
        </div>
      </div>

      {/* Pricing Upgrade Modal */}
      <PricingModal
        isOpen={isPricingOpen}
        onClose={() => setIsPricingOpen(false)}
        activeWorkspace={activeWorkspace}
      />
    </div>
  );
}
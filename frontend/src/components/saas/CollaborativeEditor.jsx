import { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';

export default function CollaborativeEditor({ docId, username = 'Anonymous User' }) {
  const [content, setContent] = useState('');
  const [activeUsers, setActiveUsers] = useState([]);
  const [remoteCursors, setRemoteCursors] = useState({});
  const socketRef = useRef(null);

  useEffect(() => {
    if (!docId) return;

    // Connect to SaaS Workspace WebSocket Server (Port 5005)
    socketRef.current = io('http://localhost:5005');

    // 1. Join Document Room
    socketRef.current.emit('join-document', { docId, username });

    // 2. Listen for Real-Time Content Changes from Others
    socketRef.current.on('receive-changes', ({ content: newContent, updatedBy }) => {
      setContent(newContent);
    });

    // 3. Listen for User Joined Event
    socketRef.current.on('user-joined', ({ username: joinedUser, socketId }) => {
      setActiveUsers((prev) => [...new Set([...prev, joinedUser])]);
    });

    // 4. Listen for Remote Cursors
    socketRef.current.on('cursor-update', ({ socketId, username: cursorUser, position }) => {
      setRemoteCursors((prev) => ({
        ...prev,
        [socketId]: { username: cursorUser, position },
      }));
    });

    // Cleanup on unmount or docId change
    return () => {
      socketRef.current.off('receive-changes');
      socketRef.current.off('user-joined');
      socketRef.current.off('cursor-update');
      socketRef.current.disconnect();
    };
  }, [docId, username]);

  // Handle local text typing
  const handleChange = (e) => {
    const newText = e.target.value;
    setContent(newText);

    // Broadcast changes to other connected clients
    socketRef.current?.emit('send-changes', {
      docId,
      content: newText,
      updatedBy: username,
    });
  };

  // Broadcast cursor position
  const handleSelectionChange = (e) => {
    const cursorIndex = e.target.selectionStart;
    socketRef.current?.emit('cursor-move', {
      docId,
      username,
      position: cursorIndex,
    });
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-white shadow-xl">
      {/* Presence Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
        <div>
          <h2 className="text-xl font-bold text-white">✍️ Live Collaborative Canvas</h2>
          <p className="text-xs text-slate-400">Doc ID: {docId}</p>
        </div>

        {/* Active Presence Bubbles */}
        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-400">Editing Now:</span>
          <div className="flex -space-x-2">
            <span className="px-3 py-1 bg-indigo-600 rounded-full text-xs font-semibold border-2 border-slate-900">
              {username} (You)
            </span>
            {Object.values(remoteCursors).map((user, idx) => (
              <span
                key={idx}
                className="px-3 py-1 bg-emerald-600 rounded-full text-xs font-semibold border-2 border-slate-900"
              >
                {user.username}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Editor Textarea */}
      <textarea
        value={content}
        onChange={handleChange}
        onSelect={handleSelectionChange}
        placeholder="Type here to collaborate in real-time..."
        rows={10}
        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-4 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm leading-relaxed"
      />
    </div>
  );
}
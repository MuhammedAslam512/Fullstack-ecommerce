import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [liveNotification, setLiveNotification] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    // 1. Connect to WebSocket server on Port 5000
    const newSocket = io(import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5000', {
      transports: ['websocket', 'polling']
    });

    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('⚡ WebSockets Connected to Backend via ID:', newSocket.id);

      // Automatically join admin room if current user is admin
      if (user?.role === 'admin') {
        newSocket.emit('join_room', 'admin_room');
      }
    });

    // 2. Listen for Real-Time Order Alerts
    newSocket.on('new_order_placed', (data) => {
      setLiveNotification(data);
      // Auto-clear notification after 6 seconds
      setTimeout(() => setLiveNotification(null), 6000);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket, liveNotification, setLiveNotification }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);

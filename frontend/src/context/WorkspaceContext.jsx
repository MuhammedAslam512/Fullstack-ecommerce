import { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/axios';

const WorkspaceContext = createContext();

export const WorkspaceProvider = ({ children }) => { 
  const [workspaces, setWorkspaces] = useState([]);
  const [activeWorkspace, setActiveWorkspace] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchWorkspaces = async () => {
    try {
      const response = await api.get('/workspaces/my');
      const data = response.data.data || [];
      setWorkspaces(data);

      if (data.length > 0) {
        const savedId = localStorage.getItem('activeWorkspaceId');
        const defaultWs = data.find((w) => w._id === savedId) || data[0];
        setActiveWorkspace(defaultWs);
        localStorage.setItem('activeWorkspaceId', defaultWs._id);
      }
    } catch (err) {
      console.error('Failed to load workspaces:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const switchWorkspace = (workspace) => {
    setActiveWorkspace(workspace);
    localStorage.setItem('activeWorkspaceId', workspace._id);
  };

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  return (
    <WorkspaceContext.Provider
      value={{
        workspaces,
        activeWorkspace,
        switchWorkspace,
        fetchWorkspaces,
        loading,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => useContext(WorkspaceContext);
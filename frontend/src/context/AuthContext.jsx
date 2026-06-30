import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); 

  useEffect(() => {
    const verifySession = async () => {
      try {
        const response = await api.get('/users/me'); 
        setUser(response.data); 
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    verifySession();
  }, []);

  const login = (userData) => {
    setUser(userData);
  };
  
  const logout = async () => {
    try {
      await api.post('/users/logout'); 
    } catch (error) {
      console.error("Failed to log out on the server", error);
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
import React, { createContext, useState, useContext } from 'react';

const AuthContext = createContext(null);

// Provider component that wraps the app
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // function called upon successful login
  const login = (userData) => {
    setUser(userData);
  };

  // function called when user logs out
  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook
export const useAuth = () => {
  return useContext(AuthContext);
};


// A simple comment
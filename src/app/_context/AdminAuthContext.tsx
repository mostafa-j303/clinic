"use client";
// contexts/AdminAuthContext.tsx

import React, { createContext, useContext, useState, useEffect } from 'react';

interface AdminAuthContextType {
  isAdmin: boolean;
  login: () => void;
  logout: () => void;
  checkAdmin: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(false);

  const checkAdmin = async () => {
    try {
      const res = await fetch('/api/check-admin');
      const data = await res.json();
      setIsAdmin(data.isAdmin);
    } catch {
      setIsAdmin(false);
    }
  };

  useEffect(() => {
    checkAdmin(); // run on mount once
  }, []);

  const login = () => setIsAdmin(true);
  const logout = () => setIsAdmin(false);

  return (
    <AdminAuthContext.Provider value={{ isAdmin, login, logout, checkAdmin }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider');
  }
  return context;
};

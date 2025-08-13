"use client";
// contexts/AdminAuthContext.tsx

import React, { createContext, useContext, useState, useEffect } from 'react';

interface AdminAuthContextType {
  isAdmin: boolean;
  isChecking: boolean; 
  login: () => void;
  logout: () => void;
  checkAdmin: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isChecking, setIsChecking] = useState(true); 


  const checkAdmin = async () => {
    setIsChecking(true);
    try {
      const res = await fetch('/api/check-admin');
      const data = await res.json();
      setIsAdmin(data.isAdmin);
    } catch {
      setIsAdmin(false);
    } finally {
      setIsChecking(false); // done checking
    }
  };
  useEffect(() => {
    checkAdmin(); // run on mount once
  }, []);

  const login = () => setIsAdmin(true);
  const logout = () => setIsAdmin(false);

  return (
    <AdminAuthContext.Provider value={{ isAdmin, isChecking, login: () => setIsAdmin(true), logout: () => setIsAdmin(false), checkAdmin }}>
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

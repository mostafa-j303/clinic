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
      const res = await fetch('/api/admin/check-admin');
      const data = await res.json();
      setIsAdmin(data.isAdmin);
    } catch {
      setIsAdmin(false);
    } finally {
      setIsChecking(false); // done checking
    }
  };
  useEffect(() => {
    checkAdmin(); // run on mount

    // A tab restored from the browser's back-forward cache (closing and
    // reopening the site, or navigating back) can repaint the last-rendered
    // React state — including a stale "still logged in" admin UI — without
    // actually re-running this mount effect or hitting the server again.
    // Re-verify with the server whenever that happens, or whenever the tab
    // regains focus/visibility, so a real logout always sticks.
    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted) checkAdmin();
    };
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") checkAdmin();
    };
    window.addEventListener("pageshow", onPageShow);
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      window.removeEventListener("pageshow", onPageShow);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
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

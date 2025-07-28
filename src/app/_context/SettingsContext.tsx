'use client';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface Settings {
  images: { [key: string]: string };
  myLocation: string;
  webtitle: string;
  colors: {
    primary: string;
    hovprimary: string;
    secondary: string;
    hovsecondary: string;
  };
  addressdetail: {
    address: string;
    building: string;
    floor: string;
  };
  social: {
    facebook: string;
    tiktok: string;
    insta: string;
    mail: string;
    number: string;
    wishnb: string;
  };
  discount: string;
  minOrder: string;
  delivery: string;
}

interface SettingsContextType {
  settings: Settings | null;
  loading: boolean;
  error: string | null;
}

const SettingsContext = createContext<SettingsContextType>({
  settings: null,
  loading: true,
  error: null,
});

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider = ({ children }: { children: React.ReactNode }) => {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fetched, setFetched] = useState(false); // ✅ flag to avoid double fetch


  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/fetch-settings-images');
        if (!res.ok) throw new Error('Failed to fetch settings');
        const data = await res.json();
        setSettings(data);
        setFetched(true);
      } catch (err: any) {
        console.error('Error fetching settings:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [fetched]);

  return (
    <SettingsContext.Provider value={{ settings, loading, error }}>
      {children}
    </SettingsContext.Provider>
  );
};

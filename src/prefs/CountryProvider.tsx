import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

type Ctx = {
  country: string;                 // "" means All countries
  setCountry: (c: string) => void; // persists to localStorage
  isOpen: boolean;
  open: () => void;
  close: () => void;
};

const CountryContext = createContext<Ctx | null>(null);
const STORAGE_KEY = "countryPref";

export function CountryProvider({ children }: { children: React.ReactNode }) {
  const [country, setCountryState] = useState<string>("");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved !== null) setCountryState(saved);
  }, []);

  const setCountry = (c: string) => {
    setCountryState(c);
    localStorage.setItem(STORAGE_KEY, c);
  };

  const value = useMemo<Ctx>(() => ({
    country, setCountry, isOpen, open: () => setIsOpen(true), close: () => setIsOpen(false)
  }), [country, isOpen]);

  return (
    <CountryContext.Provider value={value}>
      {children}
    </CountryContext.Provider>
  );
}

export function useCountry() {
  const ctx = useContext(CountryContext);
  if (!ctx) throw new Error("useCountry must be used within CountryProvider");
  return ctx;
}
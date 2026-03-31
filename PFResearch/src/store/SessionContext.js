import React, { createContext, useContext, useState } from 'react';
 
const SessionContext = createContext(null);
 
export function SessionProvider({ children }) {
  const [session, setSession] = useState(null);
  const [config, setConfig]   = useState(null);
 
  return (
    <SessionContext.Provider value={{ session, setSession, config, setConfig }}>
      {children}
    </SessionContext.Provider>
  );
}
 
export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be used within SessionProvider');
  return ctx;
}
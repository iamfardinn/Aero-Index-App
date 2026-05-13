import React, { createContext, useContext, ReactNode } from 'react';
import { useBLE, BLEState } from '../services/useBLE';

const BLEContext = createContext<BLEState | null>(null);

export function BLEProvider({ children }: { children: ReactNode }) {
  const ble = useBLE();
  return <BLEContext.Provider value={ble}>{children}</BLEContext.Provider>;
}

export function useBLEContext(): BLEState {
  const ctx = useContext(BLEContext);
  if (!ctx) throw new Error('useBLEContext must be used inside BLEProvider');
  return ctx;
}

// Utility functions for substrate history and defaults

export const getSubstrateHistory = (): string[] => {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem('substrate-history') || '[]');
  } catch {
    return [];
  }
};

export const getLastSubstrate = (): string => {
  if (typeof window === 'undefined') return '';
  try {
    return localStorage.getItem('last-substrate') || '';
  } catch {
    return '';
  }
};

export const saveSubstrate = (substrate: string) => {
  if (typeof window === 'undefined' || !substrate.trim()) return;

  try {
    const trimmedSubstrate = substrate.trim();

    // Update history
    const history = getSubstrateHistory();
    const updated = [trimmedSubstrate, ...history.filter(s => s !== trimmedSubstrate)].slice(0, 10);
    localStorage.setItem('substrate-history', JSON.stringify(updated));

    // Update last used
    localStorage.setItem('last-substrate', trimmedSubstrate);
  } catch (error) {
    console.warn('Failed to save substrate to localStorage:', error);
  }
};

export const clearSubstrateHistory = () => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem('substrate-history');
    localStorage.removeItem('last-substrate');
  } catch (error) {
    console.warn('Failed to clear substrate history:', error);
  }
};
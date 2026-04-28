// ─── User Context ───────────────────────────────
// Provides user state across the app with localStorage persistence.

import { createContext, useContext, useState, useEffect, ReactNode, createElement } from 'react';
import { getUser, type User } from '@/lib/api';

interface UserContextValue {
  userId: string | null;
  user: User | null;
  isLoading: boolean;
  isOnboarded: boolean;
  setUserId: (id: string) => void;
  refreshUser: () => Promise<void>;
  logout: () => void;
}

const UserContext = createContext<UserContextValue | null>(null);

const STORAGE_KEY = 'echolearn_user_id';

export function UserProvider({ children }: { children: ReactNode }) {
  const [userId, setUserIdState] = useState<string | null>(() => {
    return localStorage.getItem(STORAGE_KEY);
  });
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(!!localStorage.getItem(STORAGE_KEY));

  const setUserId = (id: string) => {
    localStorage.setItem(STORAGE_KEY, id);
    setIsLoading(true); // Prevent redirect guards from firing during fetch
    setUserIdState(id);
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setUserIdState(null);
    setUser(null);
  };

  const refreshUser = async () => {
    if (!userId) return;
    try {
      const u = await getUser(userId);
      setUser(u);
    } catch {
      // If user not found, clear state
      logout();
    }
  };

  useEffect(() => {
    if (userId) {
      setIsLoading(true);
      getUser(userId)
        .then(setUser)
        .catch(() => logout())
        .finally(() => setIsLoading(false));
    } else {
      setUser(null);
      setIsLoading(false);
    }
  }, [userId]);

  const value: UserContextValue = {
    userId,
    user,
    isLoading,
    isOnboarded: !!user,
    setUserId,
    refreshUser,
    logout,
  };

  return createElement(UserContext.Provider, { value }, children);
}

export function useUser(): UserContextValue {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used within a UserProvider');
  return ctx;
}

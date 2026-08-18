import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  token: string | null;
  role: 'customer' | 'talent' | 'admin' | null;
  setAuth: (token: string, role: 'customer' | 'talent' | 'admin') => void;
  logout: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      role: null,
      setAuth: (token, role) => set({ token, role }),
      logout: () => set({ token: null, role: null }),
      isAuthenticated: () => !!get().token,
    }),
    {
      name: 'bbqcarioca-auth-storage', // unique name for localStorage
    }
  )
);

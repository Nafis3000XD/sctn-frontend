import { clearCorrectionDraft } from '../lib/changeRequestDraft';
import { create } from 'zustand';

interface User {
  id: string;
  email: string;
  role: string;
  profilePicture?: string;
  citizenProfile?: any;
}

interface AuthState {
  user: User | null;
  token: string | null;
  login: (user: User, token: string) => void;
  logout: () => void;
  updateProfilePicture: (url: string) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: sessionStorage.getItem('user') ? JSON.parse(sessionStorage.getItem('user') as string) : null,
  token: sessionStorage.getItem('token') || null,
  login: (user, token) => {
    sessionStorage.setItem('user', JSON.stringify(user));
    sessionStorage.setItem('token', token);
    set({ user, token });
  },
  logout: () => {
    const userId = get().user?.id;
    if (userId) clearCorrectionDraft(userId);
    void fetch('/api/auth/logout', { method: 'POST', keepalive: true }).catch(() => undefined);
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('token');
    set({ user: null, token: null });
  },
  updateProfilePicture: (url) => {
    set((state) => {
      if (!state.user) return state;
      const updatedUser = { ...state.user, profilePicture: url };
      sessionStorage.setItem('user', JSON.stringify(updatedUser));
      return { user: updatedUser };
    });
  }
}));

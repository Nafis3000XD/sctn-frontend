import { create } from 'zustand';

interface NotificationState {
  readIds: string[];
  markAsRead: (id: string) => void;
  markAllRead: (ids: string[]) => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  readIds: JSON.parse(localStorage.getItem('read_notifications') || '[]'),
  markAsRead: (id: string) => set((state) => {
    if (!state.readIds.includes(id)) {
      const newRead = [...state.readIds, id];
      localStorage.setItem('read_notifications', JSON.stringify(newRead));
      return { readIds: newRead };
    }
    return state;
  }),
  markAllRead: (ids: string[]) => set((state) => {
    const merged = Array.from(new Set([...state.readIds, ...ids]));
    localStorage.setItem('read_notifications', JSON.stringify(merged));
    return { readIds: merged };
  }),
}));

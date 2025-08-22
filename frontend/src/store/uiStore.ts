import { create } from 'zustand';

interface NotificationState {
  isOpen: boolean;
  message: string;
  type: 'success' | 'error';
}

interface UIState {
  notification: NotificationState;
  showNotification: (message: string, type: 'success' | 'error') => void;
  hideNotification: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  notification: {
    isOpen: false,
    message: '',
    type: 'success',
  },

  showNotification: (message, type) => {
    set({ notification: { isOpen: true, message, type } });
  },

  hideNotification: () => {
    set((state) => ({
      notification: { ...state.notification, isOpen: false },
    }));
  },
}));
import React, { useEffect } from 'react';
import { useUIStore } from '../../store/uiStore';
import { AlertCircle, CheckCircle, X } from 'lucide-react';

export const Notification: React.FC = () => {
  const { notification, hideNotification } = useUIStore();

  useEffect(() => {
    if (notification.isOpen) {
      const timer = setTimeout(() => {
        hideNotification();
      }, 5000); // Auto-hide after 5 seconds
      return () => clearTimeout(timer);
    }
  }, [notification, hideNotification]);

  if (!notification.isOpen) {
    return null;
  }

  const isError = notification.type === 'error';
  const bgColor = isError ? 'bg-red-600' : 'bg-green-600';
  const Icon = isError ? AlertCircle : CheckCircle;

  return (
    <div
      className={`fixed bottom-5 right-5 w-full max-w-sm p-4 rounded-lg shadow-lg text-white ${bgColor} flex items-center justify-between animate-fade-in`}
    >
      <div className="flex items-center">
        <Icon size={24} className="mr-3" />
        <p>{notification.message}</p>
      </div>
      <button onClick={hideNotification} className="p-1 rounded-full hover:bg-black/20">
        <X size={20} />
      </button>
    </div>
  );
};
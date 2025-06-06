import { useState } from 'react';

type TypeNotification = {
  type: string;
  title: string;
  message: string;
};

const useNotification = (
  maxNotifications = 4,
  timeout = 4000
): {
  notifications: TypeNotification[];
  addNotification: (type: string, title: string, message: string) => void;
  removeNotification: (index: number) => void;
} => {
  const [notifications, setNotifications] = useState<TypeNotification[]>([]);

  const addNotification = (type: string, title: string, message: string) => {
    setNotifications((prevNotifications) => {
      const newNotification: TypeNotification = { type, title, message };
      const updatedNotifications = [...prevNotifications, newNotification];
      if (updatedNotifications.length > maxNotifications) {
        updatedNotifications.shift();
      }
      return updatedNotifications;
    });

    setTimeout(() => {
      setNotifications((prevNotifications) => prevNotifications.slice(1));
    }, timeout);
  };

  const removeNotification = (index: number) => {
    setNotifications((prevNotifications) =>
      prevNotifications.filter((_, i) => i !== index)
    );
  };

  return { notifications, addNotification, removeNotification };
};

export default useNotification;
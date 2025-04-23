import { useState } from 'react';

export default function useNotification(maxNotifications = 4, timeout = 4000) {
	const [notifications, setNotifications] = useState([]);

	const addNotification = (type, title, message) => {
		setNotifications((prevNotifications) => {
			const newNotification = { type, title, message };

			// Ограничиваем количество уведомлений
			const updatedNotifications = [...prevNotifications, newNotification];
			if (updatedNotifications.length > maxNotifications) {
				updatedNotifications.shift();
			}

			return updatedNotifications;
		});

		// Автоматическое удаление уведомления после таймаута
		setTimeout(() => {
			setNotifications((prevNotifications) => prevNotifications.slice(1));
		}, timeout);
	};

	const removeNotification = (index) => {
		setNotifications((prevNotifications) => prevNotifications.filter((_, i) => i !== index));
	};

	return { notifications, addNotification, removeNotification };
}

import { FC, useState, useEffect, useRef } from 'react'
import { MessageCircle, Trash2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import {
	getMessagesByUserId,
	getUnreadMessagesCount,
	markMessageAsRead,
	deleteMessage,
} from '@/src/lib/API/supabaseAPI'
import { getUserId } from '@/src/lib/API/supabaseAPI'

interface Message {
	id: number
	text: string
	timestamp: string
	user_id: number
	is_read: boolean
}

const Message: FC = () => {
	const [isOpen, setIsOpen] = useState(false)
	const [messages, setMessages] = useState<Message[]>([])
	const [unreadCount, setUnreadCount] = useState<number>(0)
	const messageRef = useRef<HTMLDivElement>(null) // Для отслеживания кликов вне области

	// Загружаем сообщения и количество непрочитанных
	useEffect(() => {
		const fetchMessages = async () => {
			const userId = getUserId()
			if (userId) {
				// Получаем количество непрочитанных сообщений
				const count = await getUnreadMessagesCount(userId)
				setUnreadCount(count)

				// Загружаем сообщения (пагинация: первые 10)
				const userMessages = await getMessagesByUserId(userId, 10, 0)
				setMessages(
					userMessages.map(msg => ({
						...msg,
						timestamp: new Date(msg.timestamp).toLocaleTimeString([], {
							hour: '2-digit',
							minute: '2-digit',
						}),
					}))
				)
			}
		}
		fetchMessages()
	}, [])

	// Обновляем is_read при открытии компонента
	useEffect(() => {
		if (isOpen && messages.length > 0) {
			const unreadMessages = messages.filter(msg => !msg.is_read)
			if (unreadMessages.length > 0) {
				unreadMessages.forEach(async msg => {
					await markMessageAsRead(msg.id)
				})
				setMessages(prev =>
					prev.map(msg => ({
						...msg,
						is_read: true,
					}))
				)
				setUnreadCount(0) // Сбрасываем счётчик непрочитанных
			}
		}
	}, [isOpen])

	// Закрытие при клике вне области
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (messageRef.current && !messageRef.current.contains(event.target as Node)) {
				setIsOpen(false)
			}
		}

		if (isOpen) {
			document.addEventListener('mousedown', handleClickOutside)
		}

		return () => {
			document.removeEventListener('mousedown', handleClickOutside)
		}
	}, [isOpen])

	const toggleMenu = () => {
		setIsOpen(!isOpen)
	}

	const handleDelete = async (messageId: number) => {
		try {
			// Проверяем, было ли сообщение непрочитанным
			const messageToDelete = messages.find(msg => msg.id === messageId)
			const wasUnread = messageToDelete && !messageToDelete.is_read

			// Удаляем сообщение
			await deleteMessage(messageId)
			setMessages(prev => prev.filter(msg => msg.id !== messageId))

			// Уменьшаем счётчик непрочитанных, если сообщение было непрочитанным
			if (wasUnread) {
				setUnreadCount(prev => Math.max(0, prev - 1)) // Уменьшаем на 1, но не ниже 0
			}
		} catch (error) {
			console.error('Error deleting message:', error)
		}
	}

	return (
		<div className='fixed bottom-[60px] right-4 z-50'>
			<button
				onClick={toggleMenu}
				className='relative bg-blue-500 text-white rounded-full p-3 shadow-lg hover:bg-blue-600 transition-colors focus:outline-none'
				aria-label={isOpen ? 'Закрыть сообщения' : 'Открыть сообщения'}
			>
				<MessageCircle size={24} />
				{unreadCount > 0 && (
					<span className='absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center'>
						{unreadCount}
					</span>
				)}
			</button>
			<AnimatePresence>
				{isOpen && (
					<motion.div
						ref={messageRef}
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: 20 }}
						transition={{ duration: 0.2 }}
						className='absolute bottom-12 right-0 w-80 bg-white rounded-lg shadow-lg p-4 mt-2 border border-gray-200'
					>
						<h3 className='text-lg font-semibold mb-2 text-gray-800'>Сообщения</h3>
						{messages.length === 0 ? (
							<p className='text-gray-500'>Нет новых сообщений</p>
						) : (
							<ul className='space-y-2 max-h-48 overflow-y-auto'>
								{messages.map(message => (
									<li
										key={message.id}
										className={`flex justify-between items-start p-2 rounded-md ${
											message.is_read ? 'bg-gray-100' : 'bg-white'
										} hover:bg-gray-200 transition-colors border-b border-gray-200 last:border-b-0`}
									>
										<div className='flex-1'>
											<p className='text-sm text-gray-800'>{message.text}</p>
											<span className='text-xs text-gray-400'>{message.timestamp}</span>
										</div>
										<button
											onClick={() => handleDelete(message.id)}
											className='ml-2 text-red-500 hover:text-red-700 transition-colors'
											aria-label='Удалить сообщение'
										>
											<Trash2 size={16} />
										</button>
									</li>
								))}
							</ul>
						)}
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	)
}

export default Message

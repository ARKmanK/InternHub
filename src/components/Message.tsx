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
	const [isLoading, setIsLoading] = useState(true)
	const messageRef = useRef<HTMLDivElement>(null)
	const buttonRef = useRef<HTMLButtonElement>(null) // Добавляем реф для кнопки-иконки

	// Загружаем сообщения и количество непрочитанных
	useEffect(() => {
		const fetchMessages = async () => {
			setIsLoading(true)
			try {
				const userId = getUserId()
				if (userId) {
					const count = await getUnreadMessagesCount(userId)
					setUnreadCount(count)
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
				} else {
					console.warn('User ID is not available')
				}
			} catch (error) {
				console.error('Error fetching messages:', error)
			} finally {
				setIsLoading(false)
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
				setUnreadCount(0)
			}
		}
	}, [isOpen])

	// Закрытие при клике вне области
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			// Проверяем, что клик произошёл вне messageRef и не по кнопке-иконке
			if (
				messageRef.current &&
				!messageRef.current.contains(event.target as Node) &&
				buttonRef.current &&
				!buttonRef.current.contains(event.target as Node)
			) {
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
		setIsOpen(prev => !prev)
	}

	const handleDelete = async (messageId: number) => {
		try {
			const messageToDelete = messages.find(msg => msg.id === messageId)
			const wasUnread = messageToDelete && !messageToDelete.is_read

			await deleteMessage(messageId)
			setMessages(prev => prev.filter(msg => msg.id !== messageId))

			if (wasUnread) {
				setUnreadCount(prev => Math.max(0, prev - 1))
			}
		} catch (error) {
			console.error('Error deleting message:', error)
		}
	}

	return (
		<div className='fixed bottom-[60px] right-4 z-50'>
			<motion.button
				ref={buttonRef} // Привязываем реф к кнопке
				whileHover={{ scale: 1.1 }}
				whileTap={{ scale: 0.9 }}
				className='relative p-3 bg-gradient-to-br from-blue-200 to-blue-400 text-gray-800 rounded-full shadow-md hover:from-blue-300 hover:to-blue-500 transition-all focus:outline-none'
				onClick={toggleMenu}
				aria-label={isOpen ? 'Закрыть сообщения' : 'Открыть сообщения'}
			>
				<MessageCircle size={24} />
				{isLoading ? (
					<span className='absolute top-0 right-0 bg-gradient-to-br from-gray-300 to-gray-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center'>
						...
					</span>
				) : (
					unreadCount > 0 && (
						<span className='absolute top-0 right-0 bg-gradient-to-br from-red-300 to-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center'>
							{unreadCount}
						</span>
					)
				)}
			</motion.button>
			<AnimatePresence>
				{isOpen && (
					<motion.div
						ref={messageRef}
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: 20 }}
						transition={{ duration: 0.2 }}
						className='absolute bottom-12 right-0 w-80 bg-gradient-to-br from-blue-50 to-gray-300 rounded-lg shadow-xl p-4 mt-2 border border-gray-200'
					>
						<h3 className='text-lg font-semibold mb-2 text-gray-800'>Сообщения</h3>
						{isLoading ? (
							<p className='text-gray-500'>Загрузка...</p>
						) : messages.length === 0 ? (
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
										<motion.button
											whileHover={{ scale: 1.1 }}
											whileTap={{ scale: 0.9 }}
											onClick={() => handleDelete(message.id)}
											className='ml-2 text-red-500 hover:text-red-700 transition-colors'
											aria-label='Удалить сообщение'
										>
											<Trash2 size={16} />
										</motion.button>
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

import { FC, useState, useEffect, useRef } from 'react'
import { MessageCircle, Trash2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/supabaseClient'
import { getRole, getUserId } from '@lib/API/supabase/userAPI'
import { getEmployerTaskReport } from '@lib/API/supabase/employerAPI'
import {
	deleteMessage,
	getMessagesByUserId,
	getUnreadMessagesCount,
	markMessageAsRead,
} from '@lib/API/supabase/messagesAPI'

type TypeMessage = {
	id: number
	text: string
	timestamp: string
	user_id: number
	is_read: boolean
}

type TypeTaskReport = {
	taskTitle: string
	newActivitiesCount: number
}

const LoadingSpinner = () => (
	<motion.div
		className='flex justify-center items-center h-[100px]'
		initial={{ opacity: 0 }}
		animate={{ opacity: 1 }}
		exit={{ opacity: 0, transition: { duration: 0.3 } }}
	>
		<motion.div
			className='w-6 h-6 border-2 border-t-blue-500 rounded-full'
			animate={{ rotate: 360 }}
			transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
		/>
	</motion.div>
)

const Message: FC = () => {
	const [isOpen, setIsOpen] = useState(false)
	const [messages, setMessages] = useState<TypeMessage[]>([])
	const [unreadCount, setUnreadCount] = useState<number>(0)
	const [taskReport, setTaskReport] = useState<TypeTaskReport[]>([])
	const [isLoading, setIsLoading] = useState(true)
	const messageRef = useRef<HTMLDivElement>(null)
	const buttonRef = useRef<HTMLButtonElement>(null)

	const today = new Date()
	const formattedDate = `${today.getDate().toString().padStart(2, '0')}.${(today.getMonth() + 1)
		.toString()
		.padStart(2, '0')}.${today.getFullYear()}`

	const totalNotifications = messages.filter(msg => !msg.is_read).length + taskReport.length

	const fetchData = async () => {
		setIsLoading(true)
		try {
			const userId = getUserId()
			const role = getRole()

			if (!userId) {
				setMessages([])
				setUnreadCount(0)
				setTaskReport([])
				return
			}

			const {
				data: { session },
			} = await supabase.auth.getSession()
			if (session) {
				supabase.realtime.setAuth(session.access_token)
			} else {
			}

			const [countResult, messagesResult, reportResult] = await Promise.all([
				getUnreadMessagesCount(userId),
				getMessagesByUserId(userId, 10, 0),
				role === 'employer' ? getEmployerTaskReport(userId) : Promise.resolve([]),
			])

			setUnreadCount(countResult)
			setMessages(
				messagesResult.map(msg => ({
					...msg,
					timestamp: new Date(msg.timestamp).toLocaleTimeString([], {
						hour: '2-digit',
						minute: '2-digit',
					}),
				}))
			)
			setTaskReport(reportResult)
		} catch (error) {
			setMessages([])
			setUnreadCount(0)
			setTaskReport([])
		} finally {
			setIsLoading(false)
		}
	}

	useEffect(() => {
		fetchData()
	}, [])

	useEffect(() => {
		const userId = getUserId()
		if (!userId || getRole() !== 'employer') return

		const setupSubscription = async () => {
			const { data: tasks, error } = await supabase
				.from('tasks')
				.select('id')
				.eq('employer_id', userId)

			if (error) {
				return
			}

			const taskIds = tasks?.map(task => task.id) || []
			if (taskIds.length === 0) {
				return
			}

			const channel = supabase
				.channel('task-activity-changes')
				.on(
					'postgres_changes',
					{
						event: 'UPDATE',
						schema: 'public',
						table: 'task_activity',
						filter: `task_id=in.(${taskIds.join(',')})`,
					},
					payload => {
						fetchData()
					}
				)
				.subscribe(status => {
					if (status === 'SUBSCRIBED') {
					} else if (status === 'CHANNEL_ERROR') {
					}
				})

			return channel
		}

		const subscriptionPromise = setupSubscription()
		subscriptionPromise.then(channel => {
			if (channel) {
				return () => {
					supabase.removeChannel(channel)
				}
			}
		})

		return () => {
			subscriptionPromise.then(channel => {
				if (channel) supabase.removeChannel(channel)
			})
		}
	}, [])

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
	}, [isOpen, messages])

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
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
		} catch (error) {}
	}

	const handleDeleteReport = () => {
		setTaskReport([])
	}

	return (
		<div className='fixed bottom-[60px] right-4 z-50'>
			<motion.button
				ref={buttonRef}
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
					totalNotifications > 0 && (
						<span className='absolute top-0 right-0 bg-gradient-to-br from-red-300 to-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center'>
							{totalNotifications > 99 ? '99+' : totalNotifications}
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
							<LoadingSpinner />
						) : (
							<>
								{taskReport.length > 0 && (
									<div className='mb-4 p-3 bg-gray-100 rounded-md border border-gray-300'>
										<div className='flex justify-between items-center mb-2'>
											<h4 className='text-sm font-semibold text-gray-700'>
												Отчет по задачам за {formattedDate}:
											</h4>
											<motion.button
												whileHover={{ scale: 1.1 }}
												whileTap={{ scale: 0.9 }}
												onClick={handleDeleteReport}
												className='text-red-500 hover:text-red-600 transition-colors'
												aria-label='Удалить отчет'
											>
												<Trash2 size={16} />
											</motion.button>
										</div>
										<ul className='space-y-1 text-sm text-gray-600'>
											{taskReport.map((item, index) => (
												<li key={index}>
													{item.taskTitle} - {item.newActivitiesCount} новых записей
												</li>
											))}
										</ul>
									</div>
								)}
								{messages.length === 0 && taskReport.length === 0 ? (
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
							</>
						)}
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	)
}

export default Message

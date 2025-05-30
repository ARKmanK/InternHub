import { FC, useState, useEffect } from 'react'
import { MessageCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/supabaseClient'
import { getMessagesByUserId } from '@/src/lib/API/supabaseAPI'

interface Message {
	id: number
	text: string
	timestamp: string
	user_id: string
	is_read: boolean
}

const Message: FC = () => {
	const [isOpen, setIsOpen] = useState(false)
	const [messages, setMessages] = useState<Message[]>([])

	// Загружаем сообщения при монтировании компонента
	useEffect(() => {
		const fetchMessages = async () => {
			const {
				data: { session },
			} = await supabase.auth.getSession()
			if (session?.user) {
				const userId = session.user.id // UUID пользователя
				const userMessages = await getMessagesByUserId(userId)
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

	const toggleMenu = () => {
		setIsOpen(!isOpen)
	}

	return (
		<div className='fixed bottom-[60px] right-4 z-50'>
			<button
				onClick={toggleMenu}
				className='bg-blue-500 text-white rounded-full p-3 shadow-lg hover:bg-blue-600 transition-colors focus:outline-none'
				aria-label={isOpen ? 'Закрыть сообщения' : 'Открыть сообщения'}
			>
				<MessageCircle size={24} />
			</button>
			<AnimatePresence>
				{isOpen && (
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: 20 }}
						transition={{ duration: 0.2 }}
						className='absolute bottom-12 right-0 w-64 bg-white rounded-lg shadow-lg p-4 mt-2'
					>
						<h3 className='text-lg font-semibold mb-2'>Сообщения</h3>
						{messages.length === 0 ? (
							<p className='text-gray-500'>Нет новых сообщений</p>
						) : (
							<ul className='space-y-2 max-h-48 overflow-y-auto'>
								{messages.map(message => (
									<li key={message.id} className='text-sm'>
										<p>{message.text}</p>
										<span className='text-xs text-gray-400'>{message.timestamp}</span>
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

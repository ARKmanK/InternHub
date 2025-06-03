import { FC, useState, MouseEventHandler } from 'react'
import { deleteTask } from '@/src/lib/API/supabaseAPI'
import { getUserId } from '@/src/lib/API/supabaseAPI'
import useNotification from '@hooks/useNotification'
import Notification from '@components/UI/Notification/Notification'
import { motion } from 'framer-motion'

type DeleteConfirmationProps = {
	taskId: number
	taskTitle: string
	onConfirm: () => void
	onCancel: MouseEventHandler<HTMLButtonElement>
}

const DeleteConfirmation: FC<DeleteConfirmationProps> = ({
	taskId,
	taskTitle,
	onConfirm,
	onCancel,
}) => {
	const [inputText, setInputText] = useState('')
	const { notifications, addNotification } = useNotification()
	const userId = getUserId()

	const words = taskTitle.trim().split(/\s+/)
	const firstTwoWordsLength = words.slice(0, 2).map(word => word.length)
	const requiredWordsCount = firstTwoWordsLength.some(length => length > 5) ? 2 : 3
	const requiredTitlePart = words.slice(0, requiredWordsCount).join(' ')

	const handleConfirm = async (e: React.FormEvent) => {
		e.preventDefault()

		if (!inputText.trim()) {
			addNotification('warning', 'Ошибка', 'Пожалуйста, заполните поле для подтверждения.')
			return
		}

		if (!userId) {
			addNotification('error', 'Ошибка', 'Пользователь не авторизован')
			return
		}

		if (inputText.trim().toLowerCase() === requiredTitlePart.toLowerCase()) {
			try {
				await deleteTask(taskId, userId)
				addNotification('success', 'Успешно', 'Задача успешно удалена!')
				onConfirm()
			} catch (error: any) {
				addNotification('error', 'Ошибка', `Не удалось удалить задачу: ${error.message}`)
			}
		} else {
			addNotification(
				'warning',
				'Ошибка',
				`Пожалуйста, введите верное название задачи: "${requiredTitlePart}" для подтверждения.`
			)
		}
	}

	return (
		<>
			<div className='fixed inset-0 bg-[rgba(0,0,0,0.5)] backdrop-blur-sm flex items-center justify-center z-50'>
				<motion.div
					className='p-6 bg-gradient-to-br from-blue-50 to-gray-300 rounded-xl shadow-xl flex flex-col w-[400px]'
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					exit={{ opacity: 0, y: 20 }}
				>
					<div className='h-[45px] flex justify-between items-center mb-6'>
						<p className='font-medium text-lg text-gray-900 mt-3 ml-2'>Подтверждение удаления</p>
					</div>
					<form className='ml-2 space-y-6' onSubmit={handleConfirm}>
						<div className='flex flex-col'>
							<p className='mt-1 text-sm font-medium text-gray-900'>
								Введите название задачи "{requiredTitlePart}" для подтверждения.
							</p>
							<input
								type='text'
								value={inputText}
								onChange={e => setInputText(e.target.value)}
								className='w-full px-3 py-2 mt-2 border border-gray-400 rounded-md text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 outline-none bg-white shadow-sm'
								placeholder={`Введите "${requiredTitlePart}"`}
								disabled={!taskTitle}
								autoFocus
							/>
						</div>
						<div className='mt-2 flex justify-center gap-x-4'>
							<motion.button
								whileHover={{ scale: 1.1 }}
								whileTap={{ scale: 0.9 }}
								onClick={onCancel}
								className='w-1/3 py-2 text-gray-900 font-semibold bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg shadow-md hover:from-gray-300 hover:to-gray-400 transition-all'
							>
								<span className='text-sm'>Отмена</span>
							</motion.button>
							<motion.button
								whileHover={{ scale: 1.1 }}
								whileTap={{ scale: 0.9 }}
								type='submit'
								className='w-1/3 py-2 text-white font-semibold bg-gradient-to-br from-red-400 to-red-600 rounded-lg shadow-md hover:from-red-500 hover:to-red-700 transition-all'
								disabled={!taskTitle}
							>
								<span className='text-sm'>Удалить</span>
							</motion.button>
						</div>
					</form>
				</motion.div>
			</div>
			<Notification notifications={notifications} />
		</>
	)
}

export default DeleteConfirmation

import { FC, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useNotification from '@hooks/useNotification'
import Notification from '@UI/Notification/Notification'
import { TypeTaskSubmission } from '@/src/types/TypeTaskSubmission'
import { NavigateFunction } from 'react-router-dom'
import { addMessage } from '@lib/API/supabase/messagesAPI'
import BackButton from '@UI/Buttons/BackButton'
import LogoutButton from '@UI/Buttons/LogoutButton'
import {
	approveTaskSubmission,
	getPendingTaskSubmissions,
	rejectTaskSubmission,
} from '@lib/API/supabase/adminAPI'

type TypeAdminProfileProps = {
	navigate: NavigateFunction
	goBack: () => void
	handleLogout: () => void
}

const AdminProfile: FC<TypeAdminProfileProps> = ({ goBack, handleLogout }) => {
	const { notifications, addNotification } = useNotification()
	const [pendingTasks, setPendingTasks] = useState<TypeTaskSubmission[]>([])
	const [isLoading, setIsLoading] = useState<boolean>(true)

	const loadPendingTasks = async () => {
		setIsLoading(true)
		try {
			const submissions = await getPendingTaskSubmissions()
			setPendingTasks(submissions)
		} catch (error: any) {
			addNotification(
				'error',
				'Ошибка',
				`Не удалось загрузить задачи для верификации: ${error.message}`
			)
		} finally {
			setIsLoading(false)
		}
	}

	useEffect(() => {
		loadPendingTasks()
	}, [])

	const handleApprove = async (submissionId: number) => {
		try {
			const submission = pendingTasks.find(task => task.id === submissionId)
			if (!submission) {
				addNotification('error', 'Ошибка', 'Задача не найдена')
				return
			}

			await approveTaskSubmission(submissionId)
			setPendingTasks(prev => prev.filter(task => task.id !== submissionId))

			if (submission.employer_id) {
				await addMessage(
					submission.employer_id,
					`Ваша задача "${submission.title}" прошла модерацию`
				)
			}
			addNotification('success', 'Успешно', 'Задача одобрена')
		} catch (error: any) {
			addNotification('error', 'Ошибка', `Не удалось одобрить задачу: ${error.message}`)
		}
	}

	const handleReject = async (submissionId: number) => {
		try {
			const submission = pendingTasks.find(task => task.id === submissionId)
			if (!submission) {
				addNotification('error', 'Ошибка', 'Задача не найдена')
				return
			}

			await rejectTaskSubmission(submissionId)
			setPendingTasks(prev => prev.filter(task => task.id !== submissionId))

			if (submission.employer_id) {
				await addMessage(
					submission.employer_id,
					`Ваша задача "${submission.title}" не прошла модерацию`
				)
			}

			addNotification('warning', 'Внимание', 'Задача отклонена')
		} catch (error: any) {
			addNotification('error', 'Ошибка', `Не удалось отклонить задачу: ${error.message}`)
		}
	}

	if (isLoading) {
		return <></>
	}

	return (
		<div className='md:flex md:justify-center md:py-[20px] md:px-[10px]'>
			<div className='md:min-h-[730px] md:w-[980px]'>
				<div className='md:flex md:flex-col'>
					<div className='md:py-4 md:flex md:justify-end items-center'>
						<BackButton goBack={goBack} />
						<LogoutButton handleLogout={handleLogout} />
					</div>
					<h1 className='text-2xl font-bold mb-14'>Панель администратора</h1>
					<div className='md:mb-10'>
						<h2 className='text-xl font-semibold'>Ожидающие верификации задачи</h2>
					</div>
					<div>
						{pendingTasks.length === 0 ? (
							<div className='text-center text-gray-500'>Нет задач, ожидающих верификации</div>
						) : (
							pendingTasks.map(task => (
								<AnimatePresence key={task.id}>
									<motion.div
										initial={{ opacity: 0, y: -20 }}
										animate={{ opacity: 1, y: 0 }}
										exit={{ opacity: 0, y: -20 }}
										transition={{ duration: 0.5 }}
										className='md:flex md:items-center md:justify-between md:min-w-[300px] md:min-h-[100px] rounded-xl md:mb-4 border-2 border-blue-200 bg-gradient-to-br from-blue-100 to-blue-200 p-4 shadow-md'
									>
										<div className='flex-1'>
											<h3 className='text-lg font-semibold text-gray-800'>{task.title}</h3>
											<p className='text-sm text-gray-600 mt-4'>{task.description}</p>
											<div className='flex gap-2 mt-2'>
												{task.tags?.map(tag => (
													<span
														key={tag}
														className='bg-blue-300 rounded-md px-2 py-0.5 text-sm text-gray-800'
													>
														{tag}
													</span>
												))}
											</div>
											<p className='text-sm mt-2 text-gray-700'>Компания: {task.company_name}</p>
											<p className='text-sm text-gray-700'>Крайний срок: {task.deadline}</p>
										</div>
										<div className='flex gap-2 mt-4 md:mt-0 ml-2'>
											<motion.button
												whileHover={{ scale: 1.1 }}
												whileTap={{ scale: 0.9 }}
												className='p-2 bg-gradient-to-br from-green-200 to-green-400 text-gray-800 rounded-lg shadow-md hover:from-green-300 hover:to-green-500 transition-all'
												onClick={() => handleApprove(task.id)}
											>
												<span className='text-sm font-semibold'>Одобрить</span>
											</motion.button>
											<motion.button
												whileHover={{ scale: 1.1 }}
												whileTap={{ scale: 0.9 }}
												className='p-2 bg-gradient-to-br from-red-200 to-red-400 text-gray-800 rounded-lg shadow-md hover:from-red-300 hover:to-red-500 transition-all'
												onClick={() => handleReject(task.id)}
											>
												<span className='text-sm font-semibold'>Отклонить</span>
											</motion.button>
										</div>
									</motion.div>
								</AnimatePresence>
							))
						)}
					</div>
				</div>
			</div>
			<Notification notifications={notifications} />
		</div>
	)
}

export default AdminProfile

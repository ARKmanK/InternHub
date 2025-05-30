import { FC, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useNotification from '@hooks/useNotification'
import Notification from '@components/UI/Notification/Notification'
import { TypeTaskSubmission } from '@/src/types/TypeTaskSubmission'
import {
	getPendingTaskSubmissions,
	approveTaskSubmission,
	rejectTaskSubmission,
} from '@/src/lib/API/supabaseAPI'

const AdminProfile: FC = () => {
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
			await approveTaskSubmission(submissionId)
			setPendingTasks(prev => prev.filter(task => task.id !== submissionId))
			addNotification('success', 'Успешно', 'Задача одобрена и добавлена в общий список')
		} catch (error: any) {
			addNotification('error', 'Ошибка', `Не удалось одобрить задачу: ${error.message}`)
		}
	}

	const handleReject = async (submissionId: number) => {
		try {
			await rejectTaskSubmission(submissionId)
			setPendingTasks(prev => prev.filter(task => task.id !== submissionId))
			addNotification('warning', 'Внимание', 'Задача отклонена и удалена')
		} catch (error: any) {
			addNotification('error', 'Ошибка', `Не удалось отклонить задачу: ${error.message}`)
		}
	}

	if (isLoading) {
		return <div className='text-center text-gray-500'>Загрузка...</div>
	}

	return (
		<div className='md:flex md:justify-center md:py-[20px] md:px-[10px]'>
			<div className='md:min-h-[730px] md:w-[980px]'>
				<div className='md:flex md:flex-col'>
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
										className='md:flex md:items-center md:justify-between md:min-w-[300px] md:min-h-[100px] rounded-xl md:mb-4 border-2 border-gray-[#dce3eb] bg-[#96bddd] p-4'
									>
										<div className='flex-1'>
											<h3 className='text-lg font-semibold'>{task.title}</h3>
											<p className='text-sm text-gray-600'>{task.description}</p>
											<div className='flex gap-2 mt-2'>
												{task.tags?.map(tag => (
													<span key={tag} className='bg-[#6092bb] rounded-md px-2 py-0.5 text-sm'>
														{tag}
													</span>
												))}
											</div>
											<p className='text-sm mt-2'>Компания: {task.company_name}</p>
											<p className='text-sm'>Дедлайн: {task.deadline}</p>
										</div>
										<div className='flex gap-2 mt-4 md:mt-0'>
											<button
												onClick={() => handleApprove(task.id)}
												className='bg-green-500 text-white rounded-lg px-4 py-1 hover:bg-green-600 transition-colors'
											>
												Одобрить
											</button>
											<button
												onClick={() => handleReject(task.id)}
												className='bg-red-500 text-white rounded-lg px-4 py-1 hover:bg-red-600 transition-colors'
											>
												Отклонить
											</button>
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

import { FC, useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
	getTaskById,
	getTaskActivity,
	getUserFavorites,
	getUserId,
	addTaskToFavorites,
	removeTaskFromFavorite,
	getRole,
	addTaskToFinished,
	addMessage,
	getUserUuidById,
} from '@/src/lib/API/supabaseAPI'
import { setPage, goBack } from '@data/userData'
import { BadgeCheck, Star, CircleCheckBig, Hourglass, Heart, Undo2 } from 'lucide-react'
import { motion } from 'framer-motion'
import useNotification from '@hooks/useNotification'
import Notification from '@components/UI/Notification/Notification'
import Header from '@components/Header'
import NavBar from '@components/NavBar'
import AddAnswerForm from '@components/AddAnswerForm'
import { supabase } from '@/supabaseClient'
import { TypeTaskActivity } from '@/src/types/TypeTaskActivity'
import AnswerVerifyWindow from '@components/AnswerVerifyWindow'
import Message from '../Message'

type TypeTasksData = {
	id: number
	tracking_number: number
	title: string
	description: string
	difficulty: number
	company_name: string
	deadline: string
	tags: string[]
	employer_id: number
}

const TaskPage: FC = () => {
	const { taskId } = useParams<{ taskId?: string }>()
	const navigate = useNavigate()
	const { notifications, addNotification } = useNotification()
	const [task, setTask] = useState<TypeTasksData | null>(null)
	const [activityData, setActivityData] = useState<TypeTaskActivity[] | null>(null)
	const [favoriteTasks, setFavoriteTasks] = useState<number[]>([])
	const [showAddAnswerForm, setShowAddAnswerForm] = useState<boolean>(false)
	const [role, setRole] = useState(getRole())
	const [userId, setUserId] = useState<number | null>(getUserId())
	const [isLoading, setIsLoading] = useState<boolean>(true)
	const [selectedActivity, setSelectedActivity] = useState<TypeTaskActivity | null>(null)
	const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
	const modalRefs = useRef<Map<number, HTMLDivElement>>(new Map())

	const handleGoBack = goBack(navigate)

	const loadData = async () => {
		setIsLoading(true)
		try {
			if (!userId) {
				addNotification('warning', 'Ошибка', 'Пользователь не авторизован')
				navigate('/login')
				return
			}

			if (!taskId || isNaN(Number(taskId))) {
				addNotification('error', 'Ошибка', 'Некорректный идентификатор задачи')
				navigate('/tasks')
				return
			}

			const taskIdNum = Number(taskId)
			const foundTask = await getTaskById(taskIdNum)
			if (!foundTask) {
				addNotification('error', 'Ошибка', 'Задача не найдена')
				navigate('/tasks')
				return
			}
			setTask({
				id: foundTask.id,
				tracking_number: foundTask.tracking_number,
				title: foundTask.title,
				description: foundTask.description,
				difficulty: foundTask.difficulty,
				company_name: foundTask.company_name,
				deadline: foundTask.deadline,
				tags: foundTask.tags ?? [],
				employer_id: foundTask.employer_id,
			} as TypeTasksData)

			const favorites = await getUserFavorites(userId)
			setFavoriteTasks(favorites)

			const taskActivity = await getTaskActivity(taskIdNum)
			setActivityData(taskActivity)
		} catch (error: any) {
			addNotification(
				'error',
				'Ошибка',
				`Не удалось загрузить данные: ${error.message || 'Неизвестная ошибка'}`
			)
		} finally {
			setIsLoading(false)
		}
	}

	useEffect(() => {
		setPage(`/task/${taskId}`)
		loadData()
	}, [taskId, userId])

	useEffect(() => {
		const handleStorageChange = (e: StorageEvent) => {
			if (e.key === 'userData') {
				const userData = JSON.parse(localStorage.getItem('userData') || '{}')
				const newUserId = userData.user?.id || null
				setUserId(newUserId)
				loadData()
			}
		}
		window.addEventListener('storage', handleStorageChange)
		return () => window.removeEventListener('storage', handleStorageChange)
	}, [])

	const handleFavorite = async () => {
		if (!task || !userId) return

		if (favoriteTasks.includes(task.id)) {
			try {
				await removeTaskFromFavorite(userId, task.id)

				const { data: taskData, error: fetchError } = await supabase
					.from('tasks')
					.select('tracking_number')
					.eq('id', task.id)
					.single()

				if (fetchError) throw fetchError
				if (!taskData) throw new Error('Task not found')

				const newTrackingNumber = Math.max(taskData.tracking_number - 1, 0)

				const { error: updateTrackingError } = await supabase
					.from('tasks')
					.update({ tracking_number: newTrackingNumber })
					.eq('id', task.id)

				if (updateTrackingError) throw updateTrackingError

				setFavoriteTasks(favoriteTasks.filter(id => id !== task.id))
				setTask(prev => (prev ? { ...prev, tracking_number: newTrackingNumber } : null))
				addNotification('warning', 'Внимание', 'Задача убрана из избранного')
			} catch (error: any) {
				addNotification(
					'error',
					'Ошибка',
					`Не удалось убрать задачу из избранного: ${error.message}`
				)
			}
		} else {
			try {
				await addTaskToFavorites(userId, task.id)

				const { data: taskData, error: fetchError } = await supabase
					.from('tasks')
					.select('tracking_number')
					.eq('id', task.id)
					.single()

				if (fetchError) throw fetchError
				if (!taskData) throw new Error('Task not found')

				const newTrackingNumber = taskData.tracking_number + 1

				const { error: updateError } = await supabase
					.from('tasks')
					.update({ tracking_number: newTrackingNumber })
					.eq('id', task.id)

				if (updateError) throw updateError

				setFavoriteTasks([...favoriteTasks, task.id])
				setTask(prev => (prev ? { ...prev, tracking_number: newTrackingNumber } : null))
				addNotification('success', 'Успешно', 'Задача добавлена в избранное')
			} catch (error: any) {
				addNotification(
					'error',
					'Ошибка',
					`Не удалось добавить задачу в избранное: ${error.message}`
				)
			}
		}
	}

	const handleClick = () => {
		if (!task) return
		if (role === 'employer') {
			addNotification('warning', 'Роль', 'Ваша роль не соответствует необходимой')
			return
		}
		if (!favoriteTasks.includes(task.id)) {
			addNotification('warning', 'Нет в избранном', 'Добавьте задачу в избранное')
			return
		}
		setShowAddAnswerForm(true)
	}

	const handleOpenModal = (activity: TypeTaskActivity) => {
		setSelectedActivity(activity)
		setIsModalOpen(true)
	}

	const handleCloseModal = () => {
		setSelectedActivity(null)
		setIsModalOpen(false)
	}

	const handleApprove = async (activityId: number) => {
		try {
			const currentActivity = activityData?.find(activity => activity.id === activityId)
			if (currentActivity?.status === 'done') {
				addNotification('info', 'Информация', 'Решение уже одобрено')
				return
			}

			const { error } = await supabase
				.from('task_activity')
				.update({ status: 'done' })
				.eq('id', activityId)
			if (error) throw error

			if (currentActivity && task) {
				await addTaskToFinished(currentActivity.user_id, currentActivity.task_id)
				await addMessage(
					currentActivity.user_id,
					`Ваше решение по задаче "${task.title}" было одобрено!`
				)
			}

			setActivityData(prev =>
				prev
					? prev.map(activity =>
							activity.id === activityId ? { ...activity, status: 'done' as const } : activity
					  )
					: null
			)
			addNotification('success', 'Успешно', 'Решение одобрено')
			handleCloseModal()
		} catch (error: any) {
			addNotification('error', 'Ошибка', `Не удалось одобрить решение: ${error.message}`)
		}
	}

	const handleReject = async (activityId: number) => {
		try {
			const currentActivity = activityData?.find(activity => activity.id === activityId)
			const { error } = await supabase.from('task_activity').delete().eq('id', activityId)
			if (error) throw error

			if (currentActivity && task) {
				await addMessage(
					currentActivity.user_id,
					`Ваше решение по задаче "${task.title}" было отклонено.`
				)
			}

			setActivityData(prev => (prev ? prev.filter(activity => activity.id !== activityId) : null))
			addNotification('warning', 'Внимание', 'Решение отклонено и удалено')
			handleCloseModal()
		} catch (error: any) {
			addNotification('error', 'Ошибка', `Не удалось отклонить и удалить решение: ${error.message}`)
		}
	}

	const renderDifficultyStars = (difficulty: number) => {
		const starsCount = difficulty >= 1 && difficulty <= 3 ? difficulty : 1
		const starColorClass =
			{
				1: 'fill-green-500 stroke-green-500',
				2: 'fill-orange-500 stroke-orange-500',
				3: 'fill-red-500 stroke-red-500',
			}[difficulty] || 'fill-green-500 stroke-green-500'

		return (
			<div className='flex gap-1'>
				{Array.from({ length: starsCount }).map((_, index) => (
					<Star key={index} size={20} className={starColorClass} />
				))}
			</div>
		)
	}

	if (!task || isLoading) {
		return <div>{isLoading ? 'Загрузка...' : 'Задача не найдена'}</div>
	}

	const isEmployerTaskOwner = role === 'employer' && task.employer_id === userId

	return (
		<>
			<Header />
			<NavBar />
			<div className='md:flex md:justify-center md:py-[20px] md:px-[10px]'>
				<div className='md:min-h-[1200px] md:w-[980px]'>
					<div className='md:flex md:flex-col'>
						<div className='md:py-4 md:flex md:justify-end md:items-center md:gap-4'>
							<motion.button
								whileHover={{ scale: 1.1 }}
								whileTap={{ scale: 0.9 }}
								className='p-2 bg-gradient-to-br from-blue-200 to-blue-400 text-gray-800 rounded-lg shadow-md hover:from-blue-300 hover:to-blue-500 transition-all flex items-center space-x-2'
								onClick={handleGoBack}
								aria-label='Вернуться назад'
							>
								<Undo2 size={24} />
								<span className='text-sm font-semibold'>Назад</span>
							</motion.button>
							{role === 'user' && (
								<button className='p-1 rounded-full transition-colors' onClick={handleFavorite}>
									<Heart
										fill={favoriteTasks.includes(task.id) ? 'red' : 'gray'}
										color={favoriteTasks.includes(task.id) ? 'red' : 'red'}
										className={
											favoriteTasks.includes(task.id) ? '' : 'hover:fill-red-500 hover:text-red-500'
										}
										size={32}
									/>
								</button>
							)}
						</div>

						<div className='md:min-w-[300px] md:min-h-[250px] rounded-xl md:mb-11 border-2 border-gray-200 bg-gradient-to-br from-blue-100 to-blue-200 shadow-lg'>
							<div className='md:py-4 md:px-6'>
								<div className='md:flex md:justify-between text-gray-600 text-sm font-medium'>
									<p>Сейчас отслеживают {task.tracking_number}</p>
								</div>
								<h3 className='text-2xl font-bold md:pt-4 text-gray-800'>{task.title}</h3>
								<div className='w-[70%] md:pt-4 text-gray-700'>{task.description}</div>
								<div className='md:flex md:py-3 md:mt-4'>
									<p className='text-gray-600'>{`Срок до: ${task.deadline}`}</p>
									<div className='md:ml-4 md:flex'>
										{task.tags.map(tag => (
											<div
												key={tag}
												className='bg-blue-400 text-white md:mx-3 md:min-w-[40px] rounded-full md:text-center md:px-3 md:py-1 text-sm'
											>
												{tag}
											</div>
										))}
									</div>
								</div>
								<div className='md:flex md:flex-col md:mb-4'>
									<p className='md:mb-2 text-gray-600 font-medium'>Сложность</p>
									{renderDifficultyStars(task.difficulty)}
								</div>
								<div className='md:flex md:justify-end'>
									<div className='md:flex items-center text-gray-700 font-medium'>
										{task.company_name}
										<BadgeCheck className='ml-2' fill='green' />
									</div>
								</div>
							</div>
						</div>

						{role === 'user' && (
							<div className='md:flex md:justify-end md:mb-4'>
								<button
									className='md:py-2 md:px-4 md:rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors shadow-md'
									onClick={handleClick}
								>
									Добавить решение
								</button>
							</div>
						)}

						{showAddAnswerForm && (
							<div className='md:flex md:flex-row md:gap-6'>
								<div className='md:flex-1'>
									<AddAnswerForm
										taskId={taskId || ''}
										onClose={() => setShowAddAnswerForm(false)}
										loadData={loadData}
									/>
								</div>
								<div className='md:flex-1'>
									{!showAddAnswerForm && (
										<div className='md:min-w-[300px] md:min-h-[250px] md:rounded-xl md:mb-10 bg-white shadow-xl border border-gray-200'>
											<div className='bg-gradient-to-r from-blue-500 to-blue-600 md:rounded-t-xl'>
												<div
													className={`grid ${
														isEmployerTaskOwner ? 'grid-cols-4' : 'grid-cols-3'
													} md:items-center md:w-full md:rounded-t-xl`}
												>
													<div className='border-r border-blue-400 md:py-3 md:flex md:justify-center'>
														<span className='text-white font-semibold'>Статус</span>
													</div>
													<div className='border-r border-blue-400 md:py-3 md:flex md:justify-center'>
														<span className='text-white font-semibold'>Пользователь</span>
													</div>
													<div
														className={`${
															isEmployerTaskOwner ? 'border-r' : ''
														} border-blue-400 md:py-3 md:flex md:justify-center`}
													>
														<span className='text-white font-semibold'>Дата</span>
													</div>
													{isEmployerTaskOwner && (
														<div className='md:py-3 md:flex md:justify-center'>
															<span className='text-white font-semibold'>Действие</span>
														</div>
													)}
												</div>
											</div>
											<div className='md:min-h-[150px]'>
												{activityData && activityData.length > 0 ? (
													activityData.map((activity, index) => (
														<div
															key={index}
															className={`relative grid ${
																isEmployerTaskOwner ? 'grid-cols-4' : 'grid-cols-3'
															} md:mb-2 md:border-b border-gray-200 last:border-b-0 last:mb-0 md:w-full items-center md:py-4 hover:bg-gray-50 transition-colors`}
															ref={el => {
																if (el) modalRefs.current.set(activity.id, el)
															}}
														>
															<div className='flex items-center md:justify-center'>
																<div className='mr-3'>
																	{activity.status === 'done' ? (
																		<CircleCheckBig size={20} className='text-green-500' />
																	) : activity.status === 'rejected' ? (
																		<span className='text-red-500'>✗</span>
																	) : (
																		<Hourglass size={20} className='text-yellow-500' />
																	)}
																</div>
																<span className='text-sm text-gray-700'>
																	{activity.status === 'verifying'
																		? 'Верифицируется'
																		: activity.status === 'done'
																		? 'Готово'
																		: 'Отклонено'}
																</span>
															</div>
															<div className='md:text-center text-sm text-gray-700 truncate'>
																{activity.username || 'Неизвестно'}
															</div>
															<div className='md:text-center text-sm text-gray-700'>
																<span>
																	{activity.activity_date ||
																		new Date(activity.created_at).toLocaleDateString()}
																</span>
															</div>
															{isEmployerTaskOwner && (
																<div className='md:flex md:justify-center'>
																	<button
																		className='text-blue-600 hover:underline text-sm font-medium'
																		onClick={() => handleOpenModal(activity)}
																	>
																		Просмотреть
																	</button>
																</div>
															)}
															{isEmployerTaskOwner && (
																<AnswerVerifyWindow
																	activity={selectedActivity || activity}
																	isOpen={isModalOpen && selectedActivity?.id === activity.id}
																	onClose={handleCloseModal}
																	onApprove={handleApprove}
																	onReject={handleReject}
																/>
															)}
														</div>
													))
												) : (
													<div className='flex items-center justify-center h-[150px]'>
														<span className='text-3xl text-gray-400 opacity-70 font-semibold'>
															Нет данных
														</span>
													</div>
												)}
											</div>
										</div>
									)}
								</div>
							</div>
						)}

						{!showAddAnswerForm && (
							<div className='md:min-w-[300px] md:min-h-[250px] md:rounded-xl md:mb-10 bg-white shadow-xl border border-gray-200'>
								<div className='bg-gradient-to-r from-blue-500 to-blue-600 md:rounded-t-xl'>
									<div
										className={`grid ${
											isEmployerTaskOwner ? 'grid-cols-4' : 'grid-cols-3'
										} md:items-center md:w-full md:rounded-t-xl`}
									>
										<div className='border-r border-blue-400 md:py-3 md:flex md:justify-center'>
											<span className='text-white font-semibold'>Статус</span>
										</div>
										<div className='border-r border-blue-400 md:py-3 md:flex md:justify-center'>
											<span className='text-white font-semibold'>Пользователь</span>
										</div>
										<div
											className={`${
												isEmployerTaskOwner ? 'border-r' : ''
											} border-blue-400 md:py-3 md:flex md:justify-center`}
										>
											<span className='text-white font-semibold'>Дата</span>
										</div>
										{isEmployerTaskOwner && (
											<div className='md:py-3 md:flex md:justify-center'>
												<span className='text-white font-semibold'>Действие</span>
											</div>
										)}
									</div>
								</div>
								<div className='md:min-h-[150px]'>
									{activityData && activityData.length > 0 ? (
										activityData.map((activity, index) => (
											<div
												key={index}
												className={`relative grid ${
													isEmployerTaskOwner ? 'grid-cols-4' : 'grid-cols-3'
												} md:mb-2 md:border-b border-gray-200 last:border-b-0 last:mb-0 md:w-full items-center md:py-4 hover:bg-gray-50 transition-colors`}
												style={{ minHeight: '60px' }}
												ref={el => {
													if (el) modalRefs.current.set(activity.id, el)
												}}
											>
												<div className='flex items-center justify-center'>
													<div className='mr-3 flex items-center'>
														{activity.status === 'done' ? (
															<CircleCheckBig size={20} className='text-green-500' />
														) : activity.status === 'rejected' ? (
															<span className='text-red-500 text-xl'>✗</span>
														) : (
															<Hourglass size={20} className='text-yellow-500' />
														)}
													</div>
													<span className='text-sm text-gray-700 flex items-center'>
														{activity.status === 'verifying'
															? 'Верифицируется'
															: activity.status === 'done'
															? 'Готово'
															: 'Отклонено'}
													</span>
												</div>
												<div className='md:text-center text-sm text-gray-700 truncate flex items-center justify-center'>
													{activity.username || 'Неизвестно'}
												</div>
												<div className='md:text-center text-sm text-gray-700 flex items-center justify-center'>
													<span>
														{activity.activity_date ||
															new Date(activity.created_at).toLocaleDateString()}
													</span>
												</div>
												{isEmployerTaskOwner && (
													<div className='flex items-center justify-center'>
														<button
															className='text-blue-600 hover:underline text-sm font-medium py-1'
															onClick={() => handleOpenModal(activity)}
														>
															Просмотреть
														</button>
													</div>
												)}
												{isEmployerTaskOwner && (
													<AnswerVerifyWindow
														activity={selectedActivity || activity}
														isOpen={isModalOpen && selectedActivity?.id === activity.id}
														onClose={handleCloseModal}
														onApprove={handleApprove}
														onReject={handleReject}
													/>
												)}
											</div>
										))
									) : (
										<div className='flex items-center justify-center h-[150px]'>
											<span className='text-3xl text-gray-400 opacity-70 font-semibold'>
												Нет данных
											</span>
										</div>
									)}
								</div>
							</div>
						)}
					</div>
				</div>
			</div>
			<Notification notifications={notifications} />
			<Message />
		</>
	)
}

export default TaskPage

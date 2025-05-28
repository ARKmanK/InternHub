import { FC, useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
	getTaskById,
	getTaskActivity,
	getUserFavorites,
	getUserId,
	addTaskToFavorites,
	removeTaskFromFavorite,
	getRole,
} from '@/src/lib/API/supabaseAPI'
import { setPage, goBack } from '@data/userData'
import { BadgeCheck, Star, CircleCheckBig, Hourglass, Heart, Undo2 } from 'lucide-react'
import useNotification from '@hooks/useNotification'
import Notification from '@components/UI/Notification/Notification'
import Header from '@components/Header'
import NavBar from '@components/NavBar'
import AddAnswerForm from '@components/AddAnswerForm'
import { supabase } from '@/supabaseClient'

type TypeTasksData = {
	id: number
	tracking_number: number
	title: string
	description: string
	difficulty: number
	company_name: string
	deadline: string
	tags: string[]
}

type TypeTaskActivity = {
	id: number
	task_id: number
	user_id: number
	status: 'verifying' | 'done'
	username: string
	activity_date: string
	created_at: string
	url: string | null
	comment: string | null
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
			} as TypeTasksData)

			const favorites = await getUserFavorites(userId)
			setFavoriteTasks(favorites)

			const taskActivity = await getTaskActivity(taskIdNum)
			const normalizedActivity = taskActivity.map(activity => ({
				...activity,
				status:
					activity.status === 'verifying' || activity.status === 'done'
						? activity.status
						: 'verifying',
			}))
			setActivityData(normalizedActivity)
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

	return (
		<>
			<Header />
			<NavBar />
			<div className='md:flex md:justify-center md:py-[20px] md:px-[10px]'>
				<div className='md:min-h-[1200px] md:w-[980px]'>
					<div className='md:flex md:flex-col'>
						<div className='md:py-4 md:flex md:justify-end md:items-center md:gap-4'>
							<button
								className='md:p-1 hover:bg-gray-300'
								onClick={() => goBack(navigate)}
								aria-label='Вернуться назад'
							>
								<Undo2 size={30} />
							</button>
							{role === 'user' && (
								<button className='p-1 rounded transition-colors' onClick={handleFavorite}>
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

						<div className='md:min-w-[300px] md:min-h-[250px] rounded-xl md:mb-11 border-2 border-gray-[#dce3eb] bg-[#96bddd]'>
							<div className='md:py-2 md:px-3'>
								<div className='md:flex md:justify-between text-gray-500 text-sm'>
									<p>Сейчас отслеживают {task.tracking_number}</p>
								</div>
								<h3 className='text-xl font-semibold md:pt-4'>{task.title}</h3>
								<div className='w-[70%] md:pt-4'>{task.description}</div>
								<div className='md:flex md:py-2 md:mt-4'>
									<p>{`Срок до: ${task.deadline}`}</p>
									<div className='md:ml-4 md:flex'>
										{task.tags.map(tag => (
											<div
												key={tag}
												className='bg-[#6092bb] md:mx-3 md:min-w-[40px] rounded-md md:text-center md:px-2 md:py-0.5'
											>
												{tag}
											</div>
										))}
									</div>
								</div>
								<div className='md:flex md:flex-col md:mb-4'>
									<p className='md:mb-2'>Сложность</p>
									{renderDifficultyStars(task.difficulty)}
								</div>
								<div className='md:flex md:justify-end'>
									<div className='md:flex'>
										{task.company_name}
										<BadgeCheck className='ml-2' fill='green' />
									</div>
								</div>
							</div>
						</div>

						{role === 'user' && (
							<div className='md:flex md:justify-end md:mb-2'>
								<button
									className='md:py-1.5 md:px-2 md:rounded-lg bg-[#0c426f] text-white font-semibold'
									onClick={handleClick}
								>
									Добавить решение
								</button>
							</div>
						)}

						{showAddAnswerForm && (
							<AddAnswerForm
								taskId={taskId || ''}
								onClose={() => {
									setShowAddAnswerForm(false)
									loadData()
								}}
							/>
						)}

						{!showAddAnswerForm && (
							<div className='md:min-w-[300px] md:min-h-[250px] md:rounded-xl md:mb-10 border-1 border-gray-[#dce3eb] bg-[#96bddd]'>
								<div className='md:flex bg-[#69a9dd] md:items-center md:w-full md:rounded-t-xl md:border-b-1 md:justify-between'>
									<div className='md:flex md:gap-4'>
										<div className='md:border-r md:py-2.5 min-w-[150px] md:flex md:justify-center'>
											<span>Статус</span>
										</div>
										<div className='md:border-r md:py-2.5 min-w-[180px] md:flex md:justify-center'>
											<span>Имя пользователя</span>
										</div>
									</div>
									<div className='border-l min-w-[100px] md:flex md:justify-center md:py-2.5'>
										<div className='flex justify-between w-full px-4'>
											<span>Дата</span>
											<span className='ml-4'>Ссылка</span>
										</div>
									</div>
								</div>
								<div>
									{activityData && activityData.length > 0 ? (
										activityData.map((activity, index) => (
											<div
												key={index}
												className='md:mb-2 md:border-b-1 last:border-b-0 last:mb-0 md:w-full md:flex items-center justify-between'
											>
												<div className='flex items-center md:min-w-[150px] md:justify-center'>
													<div className='mr-4'>
														{activity.status === 'done' ? (
															<CircleCheckBig size={20} />
														) : (
															<Hourglass size={20} />
														)}
													</div>
													<span className='text-sm'>
														{activity.status === 'verifying' ? 'Верифицируется' : 'Готово'}
													</span>
												</div>
												<div className='md:flex-1 md:min-w-[180px] md:text-center text-sm truncate'>
													{activity.username || 'Неизвестно'}
												</div>
												<div className='md:min-w-[100px] md:flex md:flex-1 justify-between md:px-4 text-sm'>
													<span>
														{activity.activity_date ||
															new Date(activity.created_at).toLocaleDateString()}
													</span>
													{activity.url && (
														<a
															href={activity.url}
															target='_blank'
															rel='noopener noreferrer'
															className='text-blue-600 hover:underline truncate max-w-[150px]'
														>
															{activity.url}
														</a>
													)}
												</div>
											</div>
										))
									) : (
										<div className='ml-20 text-sm md:flex-none'>Нет данных</div>
									)}
								</div>
							</div>
						)}
					</div>
				</div>
			</div>
			<Notification notifications={notifications} />
		</>
	)
}

export default TaskPage

import { FC, useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getTasks, TypeTasksData } from '@data/tasksData'
import { addToFavorite, removeTaskFromFavorite, getRole, setPage, TypePages } from '@data/userData'
import { BadgeCheck, Star, CircleCheckBig, CircleEllipsis, Heart, Undo2 } from 'lucide-react'
import useNotification from '@hooks/useNotification'
import Notification from '@components/UI/Notification/Notification'
import Header from '@components/Header'
import NavBar from '@components/NavBar'
import AddAnswerForm from '@components/AddAnswerForm'
import TaskData from '@data/TaskData.json'
import { TypeTaskActivity } from '@/src/types/TypeTaskActivity'
import {
	getTaskActivity,
	getTaskById,
	getUserFavorites,
	getUserId,
} from '@/src/lib/API/supabaseAPI'

type UserActivity = {
	status: string
	username: string
	date: string
}

type TaskActivity = {
	usersActivity: UserActivity[]
}

type TaskDataJSON = {
	tasks: {
		[key: string]: TaskActivity
	}
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

	useEffect(() => {
		setPage(`/task/${taskId}`)
		const loadData = async () => {
			try {
				if (!userId) {
					addNotification('warning', 'Ошибка', 'Пользователь не авторизован')
					navigate('/login')
					return
				}

				if (taskId) {
					const foundTask = await getTaskById(Number(taskId))
					if (!foundTask) {
						addNotification('error', 'Ошибка', 'Задача не найдена')
						return
					}
					setTask({
						...foundTask,
						tags: foundTask.tags ?? [],
						trackingNumber: foundTask.tracking_number,
						companyName: foundTask.company_name,
					} as TypeTasksData)
					const favorites = await getUserFavorites(userId) // Теперь userId гарантированно number
					setFavoriteTasks(favorites)
					const taskActivity = await getTaskActivity(Number(taskId))
					setActivityData(taskActivity)
				}
			} catch (error: any) {
				addNotification('error', 'Ошибка', `Не удалось загрузить данные: ${error.message}`)
			}
		}

		loadData()
	}, [taskId, navigate, addNotification, userId])

	useEffect(() => {
		const handleStorageChange = (e: StorageEvent) => {
			if (e.key === 'userData') {
				const userData = JSON.parse(localStorage.getItem('userData') || '{}')
				setFavoriteTasks(userData.user?.favoriteTasks?.id || [])
			}
		}
		window.addEventListener('storage', handleStorageChange)
		return () => window.removeEventListener('storage', handleStorageChange)
	}, [])

	const handleFavorite = () => {
		if (!task) return
		if (favoriteTasks.includes(task.id)) {
			removeTaskFromFavorite(task.id)
			setFavoriteTasks(favoriteTasks.filter(id => id !== task.id))
			addNotification('warning', 'Внимание', 'Задача убрана из избранного')
		} else {
			addToFavorite(task.id)
			setFavoriteTasks([...favoriteTasks, task.id])
			addNotification('success', 'Успешно', 'Задача добавлена в избранное')
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

	const goBack = () => {
		const data = localStorage.getItem('prevPage')
		let prevPage = '/tasks'
		if (data) {
			const parsedData: TypePages = JSON.parse(data)
			prevPage = parsedData.prevPage || '/tasks'
		}
		navigate(prevPage)
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

	if (!task) {
		return <div>Задача не найдена</div>
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
								onClick={goBack}
								aria-label='Вернуться к задачам'
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
									<p>Сейчас отслеживают {task.trackingNumber}</p>
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
										{task.companyName}
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
									Привести решение
								</button>
							</div>
						)}

						{showAddAnswerForm && (
							<AddAnswerForm taskId={taskId || ''} onClose={() => setShowAddAnswerForm(false)} />
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
									<div className='border-l min-w-[120px] md:flex md:justify-center md:py-2.5'>
										<span>Дата</span>
									</div>
								</div>
								<div className=''>
									{activityData && activityData.length > 0 ? (
										activityData.map((activity, index) => (
											<div
												key={index}
												className='md:mb-2 md:border-b-1 last:border-b-0 last:mb-0 md:px-4 md:py-1.5'
											>
												<div className='md:flex md:w-full md:justify-between'>
													<div className='md:flex md:justify-start'>
														<div className='md:flex min-w-[150px] md:justify-start md:pl-4'>
															{activity.status === 'completed' ? (
																<CircleCheckBig size={20} />
															) : (
																<CircleEllipsis size={20} />
															)}
															<span className='md:max-w-[60px] md:flex md:justify-center md:ml-1'>
																{activity.status || 'Не указан'}
															</span>
														</div>
														<div className='md:min-w-[180px] md:flex md:justify-start md:pl-12'>
															<span className=''>{activity.username || 'Неизвестно'}</span>
														</div>
													</div>
													<div className=''>
														<span>
															{activity.activity_date ||
																new Date(activity.created_at).toLocaleDateString()}
														</span>
													</div>
												</div>
											</div>
										))
									) : (
										<div className='ml-7'>Нет данных</div>
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

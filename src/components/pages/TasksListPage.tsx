import { FC, useState, useEffect, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import Header from '@UI/Header'
import NavBar from '@UI/NavBar'
import TaskCard from '@components/TaskCard'
import TaskFilter from '@components/TaskFilter'
import { supabase } from '@/supabaseClient'
import { List, BookCopy, CircleUserRound, Plus } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import useNotification from '@hooks/useNotification'
import Notification from '@UI/Notification/Notification'
import { setPage } from '@data/userData'
import Message from '@UI/Message'
import ScreenLoadingAnimation from '@/src/components/UI/ScreenLoadingAnimation'
import { getTaskSubmissionsCount } from '@lib/API/supabase/adminAPI'
import { getRole, getUserByEmail, getUserId } from '@lib/API/supabase/userAPI'
import {
	addTaskToFavorites,
	getAllTasks,
	getUniqueCompanies,
	getUserFavorites,
	removeTaskFromFavorite,
} from '@lib/API/supabase/taskAPI'

type TypeTask = {
	id: number
	tracking_number: number
	title: string
	description: string
	difficulty: number
	company_name: string
	deadline: string
	tags: string[]
}

type TypeFilter = {
	companies: string | null
	difficulty: number | null
	tracking: '0' | '1-5' | '6-10' | '15-20' | '20+' | null
	tags: string[] | null
}

const TasksListPage: FC = () => {
	const [listType, setListType] = useState('list')
	const [role, setRole] = useState<'user' | 'employer' | 'admin' | null>(null)
	const [favoriteTasks, setFavoriteTasks] = useState<number[]>([])
	const [tasks, setTasks] = useState<TypeTask[]>([])
	const [employerTaskIds, setEmployerTaskIds] = useState<number[]>([])
	const [submissionsCount, setSubmissionsCount] = useState<number>(0)
	const [submissionsLoading, setSubmissionsLoading] = useState<boolean>(true)
	const { notifications, addNotification } = useNotification()
	const [filter, setFilter] = useState<TypeFilter>({
		companies: null,
		difficulty: null,
		tracking: null,
		tags: null,
	})
	const [userId, setUserId] = useState<number | null>(null)
	const [loading, setLoading] = useState(true)
	const [companies, setCompanies] = useState<string[]>([])
	const [hasFetched, setHasFetched] = useState(false) // Добавляем флаг
	const navigate = useNavigate()
	const location = useLocation()

	// Обработка уведомления при переходе с AddTaskForm
	useEffect(() => {
		if (location.state?.showSuccessNotification) {
			addNotification('success', 'Успешно', 'Задача отправлена на модерацию')
			navigate(location.pathname, { replace: true, state: {} })
		}
	}, [])

	const addToFavorite = async (id: number) => {
		if (!role || !userId) {
			addNotification('warning', '', 'Пользователь не авторизован')
			return
		}
		if (favoriteTasks.includes(id)) {
			return
		}
		try {
			await addTaskToFavorites(userId, id)
			const { data: taskData, error: fetchError } = await supabase
				.from('tasks')
				.select('tracking_number')
				.eq('id', id)
				.single()
			if (fetchError) throw fetchError
			if (!taskData) throw new Error('Task not found')
			const newTrackingNumber = taskData.tracking_number + 1
			const { error: updateError } = await supabase
				.from('tasks')
				.update({ tracking_number: newTrackingNumber })
				.eq('id', id)
			if (updateError) throw updateError
			setFavoriteTasks([...favoriteTasks, id])
			setTasks(prev =>
				prev.map(task => (task.id === id ? { ...task, tracking_number: newTrackingNumber } : task))
			)
			addNotification('success', 'Успешно', 'Задача добавлена в избранное')
		} catch (error: any) {
			addNotification('error', 'Ошибка', `Не удалось добавить задачу в избранное: ${error.message}`)
		}
	}

	const removeFromFavorite = async (id: number) => {
		if (!role || !userId) {
			addNotification('warning', '', 'Пользователь не авторизован')
			return
		}
		if (!favoriteTasks.includes(id)) {
			return
		}
		try {
			await removeTaskFromFavorite(userId, id)
			const { data: taskData, error: fetchError } = await supabase
				.from('tasks')
				.select('tracking_number')
				.eq('id', id)
				.single()
			if (fetchError) throw fetchError
			if (!taskData) throw new Error('Task not found')
			const newTrackingNumber = Math.max(taskData.tracking_number - 1, 0)
			const { error: updateError } = await supabase
				.from('tasks')
				.update({ tracking_number: newTrackingNumber })
				.eq('id', id)
			if (updateError) throw updateError
			setFavoriteTasks(favoriteTasks.filter(task => task !== id))
			setTasks(prev =>
				prev.map(task => (task.id === id ? { ...task, tracking_number: newTrackingNumber } : task))
			)
			addNotification('warning', '', 'Задача убрана из избранного')
		} catch (error: any) {
			addNotification('error', 'Ошибка', `Не удалось убрать задачу из избранного: ${error.message}`)
		}
	}

	const loadFavoriteTasks = async (userId: number) => {
		try {
			const favorites = await getUserFavorites(userId)
			setFavoriteTasks(favorites)
		} catch (error: any) {
			addNotification('error', 'Ошибка', `Не удалось загрузить избранные задачи: ${error.message}`)
		}
	}

	const loadEmployerTasks = async (userId: number) => {
		try {
			const { data, error } = await supabase.from('tasks').select('id').eq('employer_id', userId)
			if (error) throw error
			setEmployerTaskIds(data.map(task => task.id))
		} catch (error: any) {
			addNotification(
				'error',
				'Ошибка',
				`Не удалось загрузить задачи работодателя: ${error.message}`
			)
		}
	}

	const loadSubmissionsCount = async () => {
		try {
			setSubmissionsLoading(true)
			const count = await getTaskSubmissionsCount()
			setSubmissionsCount(count)
		} catch (error: any) {
			addNotification('error', 'Ошибка', `Не удалось загрузить количество заявок: ${error.message}`)
		} finally {
			setSubmissionsLoading(false)
		}
	}

	useEffect(() => {
		if (hasFetched) {
			return
		}

		setPage('/tasks')
		const fetchUserAndTasks = async () => {
			setLoading(true)
			try {
				const {
					data: { session },
				} = await supabase.auth.getSession()

				if (!session?.user) {
					addNotification('warning', 'Ошибка', 'Пользователь не авторизован')
					navigate('/login')
					return
				}

				const storedUserId = getUserId()
				const storedRole = getRole()

				let finalUserId = storedUserId
				let finalRole: 'user' | 'employer' | 'admin' | null = storedRole

				if (!storedUserId || !storedRole) {
					const user = await getUserByEmail(session.user.email!)
					if (!user) {
						addNotification('error', 'Ошибка', 'Пользователь не найден в базе данных')
						navigate('/login')
						return
					}
					finalUserId = user.id
					finalRole = user.role
				}

				setUserId(finalUserId)
				setRole(finalRole as 'user' | 'employer' | 'admin' | null)

				const uniqueCompanies = await getUniqueCompanies()
				setCompanies(uniqueCompanies)

				if (finalUserId) {
					await loadFavoriteTasks(finalUserId)
				}

				if (finalRole === 'employer' && finalUserId) {
					await loadEmployerTasks(finalUserId)
				} else if (finalRole === 'admin' && finalUserId) {
					setEmployerTaskIds([])
					await loadSubmissionsCount()
				}

				const tasksData = await getAllTasks()
				const normalizedTasks = tasksData.map(task => ({
					...task,
					tags: task.tags ?? [],
				}))
				setTasks(normalizedTasks)
			} catch (error: any) {
				addNotification('error', 'Ошибка', `Не удалось загрузить данные: ${error.message}`)
			} finally {
				setHasFetched(true)
				setLoading(false)
			}
		}

		fetchUserAndTasks()

		const channel = supabase.channel('tasks-changes')

		channel
			.on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'tasks' }, payload => {
				setTasks(prev =>
					prev.map(task =>
						task.id === payload.new.id
							? { ...task, tracking_number: payload.new.tracking_number }
							: task
					)
				)
			})
			.subscribe()

		return () => {
			channel.unsubscribe()
			supabase.removeChannel(channel)
		}
	}, [])

	// Отдельный эффект для сохранения userId и role в localStorage
	useEffect(() => {
		if (userId && role) {
			localStorage.setItem('userId', userId.toString())
			localStorage.setItem('role', role)
		}
	}, [userId, role])

	const visibleTasks = useMemo(() => {
		let filteredTasks = [...tasks]
		if (filter.companies !== null) {
			filteredTasks = filteredTasks.filter(task => task.company_name === filter.companies)
		}
		if (filter.difficulty !== null) {
			filteredTasks = filteredTasks.filter(task => task.difficulty === filter.difficulty)
		}
		if (filter.tracking !== null) {
			filteredTasks = filteredTasks.filter(task => {
				const num = task.tracking_number
				switch (filter.tracking) {
					case '0':
						return num === 0
					case '1-5':
						return num >= 1 && num <= 5
					case '6-10':
						return num >= 6 && num <= 10
					case '15-20':
						return num >= 15 && num <= 20
					case '20+':
						return num > 20
					default:
						return true
				}
			})
		}
		if (filter.tags && filter.tags.length > 0) {
			filteredTasks = filteredTasks.filter(task =>
				filter.tags!.some(tag => task.tags.includes(tag))
			)
		}
		return filteredTasks
	}, [filter, tasks])

	const openProfile = () => navigate('/user')
	const openCreateTaskPage = () => navigate('/create-task')

	const taskCard = useMemo(() => {
		return visibleTasks.map((task, index) => (
			<AnimatePresence key={task.id.toString()}>
				<motion.div
					layout
					initial={{ opacity: 0, y: -20, scale: 0.9 }}
					animate={{ opacity: 1, y: 0, scale: 1 }}
					exit={{ opacity: 0, y: -20, scale: 0.9 }}
					transition={{
						duration: 0.5,
						type: 'spring',
						stiffness: 100,
						velocity: 4,
						damping: 20,
						delay: index * 0.1,
					}}
				>
					<TaskCard
						id={task.id}
						trackingNumber={task.tracking_number}
						title={task.title}
						description={task.description}
						difficulty={task.difficulty}
						companyName={task.company_name}
						type={listType}
						addToFavorite={addToFavorite}
						removeFromFavorite={removeFromFavorite}
						isFavorite={favoriteTasks.includes(task.id)}
						deadline={task.deadline}
						tags={task.tags}
						isMine={role === 'employer' && employerTaskIds.includes(task.id)}
						role={role}
						showControls={false}
					/>
				</motion.div>
			</AnimatePresence>
		))
	}, [visibleTasks, listType, role, favoriteTasks, employerTaskIds])

	if (loading) {
		return <ScreenLoadingAnimation loading={true} />
	}

	if (!role) {
		return null
	}

	return (
		<>
			<Header />
			<NavBar />
			<div className='md:flex md:justify-center md:py-[20px] md:px-[10px] relative'>
				<div className='md:min-h-[1200px] md:w-[980px]'>
					<div className='md:flex md:flex-col'>
						<div className='md:py-4 md:flex md:justify-end items-center'>
							{role === 'employer' && (
								<motion.button
									whileHover={{ scale: 1.1 }}
									whileTap={{ scale: 0.9 }}
									className='mr-4 p-2 bg-gradient-to-br from-blue-200 to-blue-400 text-gray-800 rounded-lg shadow-md hover:from-blue-300 hover:to-blue-500 transition-all flex items-center space-x-2'
									onClick={openCreateTaskPage}
								>
									<Plus size={24} />
									<span className='text-sm font-semibold'>Разместить задачу</span>
								</motion.button>
							)}
							<motion.button
								whileHover={{ scale: 1.1 }}
								whileTap={{ scale: 0.9 }}
								className='md:ml-4 p-2 bg-gradient-to-br from-blue-200 to-blue-400 text-gray-800 rounded-lg shadow-md hover:from-blue-300 hover:to-blue-500 transition-all flex items-center space-x-2 relative'
								onClick={openProfile}
								aria-label='Открыть профиль'
							>
								<CircleUserRound size={24} />
								<span className='text-sm font-semibold'>Профиль</span>
								{role === 'admin' &&
									(submissionsLoading ? (
										<span className='absolute top-[-10px] right-[-10px] bg-gradient-to-br from-gray-300 to-gray-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center'>
											...
										</span>
									) : (
										submissionsCount > 0 && (
											<span className='absolute top-[-10px] right-[-10px] bg-gradient-to-br from-red-300 to-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center'>
												{submissionsCount}
											</span>
										)
									))}
							</motion.button>
						</div>
						<div className='md:flex md:justify-end'>
							<motion.button
								whileHover={{ scale: 1.1 }}
								whileTap={{ scale: 0.9 }}
								className='md:mr-4 p-2 bg-gradient-to-br from-blue-200 to-blue-400 text-gray-800 rounded-lg shadow-md hover:from-blue-300 hover:to-blue-500 transition-all'
								onClick={() => setListType('list')}
							>
								<List size={24} />
							</motion.button>
							<motion.button
								whileHover={{ scale: 1.1 }}
								whileTap={{ scale: 0.9 }}
								className='p-2 bg-gradient-to-br from-blue-200 to-blue-400 text-gray-800 rounded-lg shadow-md hover:from-blue-300 hover:to-blue-500 transition-all'
								onClick={() => setListType('card')}
							>
								<BookCopy size={24} />
							</motion.button>
						</div>
						<div className='md:flex mt-7'>
							<div className='md:w-[25%] md:mr-10'>
								<TaskFilter filter={filter} setFilter={setFilter} companies={companies} />
							</div>
							<div className='md:w-[80%]'>
								{listType === 'card' ? (
									<div className='md:grid md:gap-x-4 md:gap-y-4 md:grid-cols-2'>{taskCard}</div>
								) : (
									taskCard
								)}
							</div>
						</div>
					</div>
				</div>
			</div>
			<Notification notifications={notifications} />
			<Message />
		</>
	)
}
export default TasksListPage

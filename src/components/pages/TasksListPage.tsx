import Header from '@components/Header'
import NavBar from '@components/NavBar'
import TaskCard from '@components/TaskCard'
import TaskFilter from '@components/TaskFilter'
import { useNavigate } from 'react-router-dom'
import {
	getAllTasks,
	getUserByEmail,
	getUserFavorites,
	addTaskToFavorites,
	removeTaskFromFavorite,
	getUniqueCompanies,
} from '@/src/lib/API/supabaseAPI'
import { supabase } from '@/supabaseClient'
import { List, BookCopy, CircleUserRound } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useNotification from '@hooks/useNotification'
import Notification from '@components/UI/Notification/Notification'
import { Button } from '@components/UI/Button/Button'
import { getRole, getUserId } from '@/src/lib/API/supabaseAPI'
import { setPage } from '@/src/data/userData'
import Message from '../Message'

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

const TasksListPage = () => {
	const [listType, setListType] = useState('list')
	const [role, setRole] = useState<'user' | 'employer' | 'admin' | null>(null)
	const [favoriteTasks, setFavoriteTasks] = useState<number[]>([])
	const [tasks, setTasks] = useState<TypeTask[]>([])
	const [employerTaskIds, setEmployerTaskIds] = useState<number[]>([])
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
	const navigate = useNavigate()

	const addToFavorite = async (id: number) => {
		if (!role || !userId) {
			addNotification('warning', '', 'Пользователь не авторизован')
			return
		}
		if (favoriteTasks.includes(id)) {
			return // Не добавляем, если уже в избранном
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
			return // Не удаляем, если не в избранном
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

	useEffect(() => {
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
					localStorage.setItem('userId', finalUserId.toString())
					localStorage.setItem('role', finalRole)
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
			supabase.removeChannel(channel) // Полностью удаляем канал
		}
	}, [])

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
						addToFavorite={addToFavorite} // Передаём addToFavorite
						removeFromFavorite={removeFromFavorite} // Передаём removeFromFavorite
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
		return (
			<div className='flex justify-center items-center h-screen'>
				<div className='text-white'>Загрузка...</div>
			</div>
		)
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
								<Button onClick={openCreateTaskPage}>Разместить задачу</Button>
							)}
							<button
								className='md:ml-7 md:p-1 hover:bg-gray-300'
								onClick={openProfile}
								aria-label='Открыть профиль'
							>
								<CircleUserRound size={30} />
							</button>
						</div>
						<div className='md:flex md:justify-end'>
							<button
								className='md:mr-4 md:p-1 hover:bg-gray-300'
								onClick={() => setListType('list')}
							>
								<List size={30} />
							</button>
							<button className='md:p-1 hover:bg-gray-300' onClick={() => setListType('card')}>
								<BookCopy size={30} />
							</button>
						</div>
						<div className='md:flex mt-7'>
							<div className='md:w-[25%] md:mr-10'>
								<TaskFilter filter={filter} setFilter={setFilter} companies={companies} />
							</div>
							<div className='md:w-[80%]'>
								{listType === 'card' ? (
									<div className='md:grid md:gap-x-18 md:gap-y-4 md:grid-cols-2'>{taskCard}</div>
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

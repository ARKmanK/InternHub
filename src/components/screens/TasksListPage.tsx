import Header from '@components/Header'
import NavBar from '@components/NavBar'
import TaskCard from '@components/TaskCard'
import TaskFilter from '@/src/components/TaskFilter'
import { useNavigate } from 'react-router-dom'
import { getTasks, TypeTasksData } from '@data/tasksData'
import {
	addToFavorite as addToFavoriteJSON,
	getRole,
	removeTaskFromFavorite,
	setPage,
} from '@data/userData'
import { List, BookCopy, CircleUserRound } from 'lucide-react'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useNotification from '@hooks/useNotification'
import Notification from '@components/UI/Notification/Notification'
import { Button } from '@components/UI/Button/Button'

type TypeFilter = {
	companies: string | null
	difficulty: number | null
	tracking: boolean | null
	tags: string[] | null
}

const TasksListPage = () => {
	const [listType, setListType] = useState('list')
	const [role, setRole] = useState('')
	const [favoriteTasks, setFavoriteTasks] = useState<number[]>([])
	const [visibleTasks, setVisibleTasks] = useState<TypeTasksData[]>([])
	const [tasks, setTasks] = useState<TypeTasksData[]>(getTasks())
	const [employerTaskIds, setEmployerTaskIds] = useState<number[]>([])
	const { notifications, addNotification } = useNotification()
	const [filter, setFilter] = useState<TypeFilter>({
		companies: null,
		difficulty: null,
		tracking: null,
		tags: null,
	})

	const addToFavorite = (id: number) => {
		if (favoriteTasks.includes(id)) {
			setFavoriteTasks(favoriteTasks.filter(task => task !== id))
			removeTaskFromFavorite(id)
			addNotification('warning', '', 'Задача убрана из избранного')
		} else {
			setFavoriteTasks([...favoriteTasks, id])
			addToFavoriteJSON(id)
			addNotification('success', 'Успешно', 'Задача добавлена в избранное')
		}
	}

	const loadFavoriteTasks = () => {
		const userData = JSON.parse(localStorage.getItem('userData') || '{}')
		setFavoriteTasks(userData.user?.favoriteTasks?.id || [])
	}

	const loadEmployerTasks = () => {
		const userData = JSON.parse(localStorage.getItem('userData') || '{}')
		setEmployerTaskIds(userData.employer?.tasks || [])
	}

	useEffect(() => {
		setPage('/tasks')
		loadFavoriteTasks()
		loadEmployerTasks()
		setRole(getRole() === 'user' ? 'user' : 'employer')
	}, [])

	useEffect(() => {
		let filteredTasks = [...tasks]
		if (filter.companies !== null)
			filteredTasks = filteredTasks.filter(task => task.companyName === filter.companies)
		if (filter.difficulty !== null)
			filteredTasks = filteredTasks.filter(task => task.difficulty === filter.difficulty)
		if (filter.tracking !== null)
			filteredTasks = filteredTasks.filter(task =>
				filter.tracking ? task.trackingNumber > 0 : task.trackingNumber === 0
			)
		if (filter.tags && filter.tags.length > 0)
			filteredTasks = filteredTasks.filter(task =>
				filter.tags!.some(tag => task.tags.includes(tag))
			)
		setVisibleTasks(filteredTasks)
	}, [filter, listType, tasks])

	const navigate = useNavigate()
	const openProfile = () => navigate('/user')
	const openCreateTaskPage = () => navigate('/create-task')

	const taskCard = visibleTasks.map((task, index) => (
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
					trackingNumber={task.trackingNumber}
					title={task.title}
					description={task.description}
					difficulty={task.difficulty}
					companyName={task.companyName}
					type={listType}
					addToFavorite={addToFavorite}
					isFavorite={favoriteTasks.includes(task.id)}
					deadline={task.deadline}
					tags={task.tags}
					isMine={role === 'employer' && employerTaskIds.includes(task.id)}
				/>
			</motion.div>
		</AnimatePresence>
	))

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
								<TaskFilter filter={filter} setFilter={setFilter} />
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
		</>
	)
}

export default TasksListPage

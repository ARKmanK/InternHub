import Header from '@components/Header'
import NavBar from '@components/NavBar'
import TaskCard from '@components/TaskCard'
import TaskFilter from '@/src/components/TaskFilter'
import { useNavigate } from 'react-router-dom'
import { tasksData } from '@data/tasksData'
import { addToFavorite as addToFavoriteJSON, removeTaskFromFavorite } from '@data/userData'
import { List, BookCopy, CircleUserRound } from 'lucide-react'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useNotification from '@hooks/useNotification'
import Notification from '@components/UI/Notification/Notification'
import { Button } from '@components/UI/Button/Button'

type TypeFilter = {
	companies: string[]
	difficulty: number
	favorites: boolean
}

const TasksListPage = () => {
	const [listType, setListType] = useState('list')
	const [favoriteTasks, setFavoriteTasks] = useState<number[]>([])
	const [openAddTaskForm, setOpenAddTaskForm] = useState(false)
	const [visibleTasks, setVisibleTasks] = useState<any[]>([])
	const { notifications, addNotification } = useNotification()
	const [filter, setFilter] = useState<TypeFilter>({
		companies: [],
		difficulty: 1,
		favorites: false,
	})

	const addToFavorite = (id: number) => {
		if (favoriteTasks.includes(id)) {
			setFavoriteTasks(favoriteTasks.filter(task => task != id))
			removeTaskFromFavorite('admin', id)
			addNotification('warning', '', 'Задача убрана из избранного')
			return
		}
		setFavoriteTasks([...favoriteTasks, id])
		addToFavoriteJSON('admin', id)
		addNotification('success', 'Успешно', 'Задача добавлена в избранное')
	}

	const loadFavoriteTasks = () => {
		const userData = JSON.parse(localStorage.getItem('userData') || '{}')
		const taskIds = userData.users?.['admin']?.favoriteTasks?.id || []
		setFavoriteTasks(taskIds)
	}

	useEffect(() => {
		loadFavoriteTasks()
	}, [])

	const setFilterFavorite = () => {
		setFilter({
			...filter,
			favorites: !filter.favorites,
		})
	}

	const navigate = useNavigate()
	const openProfile = () => {
		navigate('/user')
	}

	const taskCard = visibleTasks.map(task => (
		<AnimatePresence key={task.id}>
			<motion.div
				initial={{ opacity: 0, y: -20 }}
				animate={{ opacity: 1, y: 0 }}
				exit={{ opacity: 0, y: -20 }}
				transition={{ duration: 0.5 }}
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
				/>
			</motion.div>
		</AnimatePresence>
	))

	useEffect(() => {
		setVisibleTasks([])
		tasksData.forEach((task, index) => {
			setTimeout(() => {
				setVisibleTasks(prev => [...prev, task])
			}, index * 200)
		})
	}, [listType])

	return (
		<>
			<Header />
			<NavBar />
			<div className='md:flex md:justify-center md:py-[20px] md:px-[10px] relative'>
				<div className='md:min-h-[1200px] md:w-[980px]'>
					<div className='md:flex md:flex-col'>
						<div className='md:py-4 md:flex md:justify-end items-center'>
							<Button onClick={() => setOpenAddTaskForm(true)} className=''>
								Разместить задачу
							</Button>
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
								<TaskFilter />
							</div>
							<div className='md:w-[80%]'>
								{listType === 'card' ? (
									<div className='md:grid md:gap-4 md:grid-cols-2'>{taskCard}</div>
								) : (
									<>{taskCard}</>
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

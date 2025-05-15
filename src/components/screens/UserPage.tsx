import Header from '@components/Header'
import NavBar from '@components/NavBar'
import TaskCard from '@components/TaskCard'
import { useNavigate } from 'react-router-dom'
import { List, BookCopy, Undo2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { getTasks, TypeTasksData } from '@data/tasksData'
import { motion, AnimatePresence } from 'framer-motion'
import useNotification from '@hooks/useNotification'
import Notification from '@components/UI/Notification/Notification'
import { getRole, removeTaskFromFavorite, setPage } from '@data/userData'
import EmptyCard from '@components/EmptyCard'
import { Button } from '@components/UI/Button/Button'

const UserPage = () => {
	const [role, setRole] = useState('')
	const [listType, setListType] = useState<'list' | 'card'>('list')
	const [visibleTasks, setVisibleTasks] = useState<TypeTasksData[]>([])
	const [favoriteTasks, setFavoriteTasks] = useState<number[]>([])
	const [startedTasks, setStartedTasks] = useState<number[]>([])
	const [finishedTasks, setFinishedTasks] = useState<number[]>([])
	const { notifications, addNotification } = useNotification()
	const [category, setCategory] = useState<'favorite' | 'started' | 'finished'>('favorite')
	const [activeCategory, setActiveCategory] = useState('favorite')

	const navigate = useNavigate()
	const goBack = () => {
		navigate('/tasks')
	}

	const loadTasks = () => {
		setVisibleTasks([])
		const userData = JSON.parse(localStorage.getItem('userData') || '{}')

		if (role === 'employer') {
			const employerTaskIds = userData.employer?.tasks || []
			const tasksData = getTasks().filter(task => employerTaskIds.includes(task.id))
			tasksData.forEach((task, index) => {
				setTimeout(() => {
					setVisibleTasks(prev => [...prev, task])
				}, index * 200)
			})
		} else {
			const favoriteTaskIds = userData.users?.['user']?.favoriteTasks?.id || []
			const startedTaskIds = userData.users?.['user']?.startedTasks?.id || []
			const finishedTaskIds = userData.users?.['user']?.finishedTasks?.id || []

			setFavoriteTasks(favoriteTaskIds)
			setStartedTasks(startedTaskIds)
			setFinishedTasks(finishedTaskIds)

			let taskIds: number[] = []
			switch (category) {
				case 'favorite':
					taskIds = favoriteTaskIds
					break
				case 'started':
					taskIds = startedTaskIds
					break
				case 'finished':
					taskIds = finishedTaskIds
					break
			}
			const tasksData = getTasks().filter(task => taskIds.includes(task.id))
			tasksData.forEach((task, index) => {
				setTimeout(() => {
					setVisibleTasks(prev => [...prev, task])
				}, index * 200)
			})
		}
	}

	useEffect(() => {
		setPage('/user')
		getRole() === 'user' ? setRole('user') : setRole('employer')
	}, [])

	useEffect(() => {
		loadTasks()
	}, [listType, category, role])

	useEffect(() => {
		const handleStorageChange = (e: StorageEvent) => {
			if (e.key === 'tasks' || e.key === 'userData') {
				loadTasks()
			}
		}
		window.addEventListener('storage', handleStorageChange)
		return () => window.removeEventListener('storage', handleStorageChange)
	}, [listType, category, role])

	const removeFromFavorite = (id: number) => {
		if (favoriteTasks.includes(id)) {
			setFavoriteTasks(favoriteTasks.filter(task => task !== id))
			removeTaskFromFavorite(id)
			addNotification('warning', 'Внимание', 'Задача убрана из избранного')
			setVisibleTasks(prev => prev.filter(task => task.id !== id))
		}
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
					addToFavorite={role === 'user' ? removeFromFavorite : undefined}
					isFavorite={favoriteTasks.includes(task.id)}
					deadline={task.deadline}
					tags={task.tags}
					role={role}
					onDelete={loadTasks} // Передаём loadTasks как onDelete
				/>
			</motion.div>
		</AnimatePresence>
	))

	const handleClick = (type: 'favorite' | 'started' | 'finished') => {
		setCategory(type)
		setActiveCategory(type)
	}

	return (
		<>
			<Header />
			<NavBar />
			<div className='md:flex md:justify-center md:py-[20px] md:px-[10px]'>
				<div className='md:min-h-[1200px] md:w-[980px]'>
					<div className='md:flex md:flex-col'>
						<div className='md:py-4 md:flex md:justify-end items-center'>
							<button
								className='md:p-1 hover:bg-gray-300'
								onClick={goBack}
								aria-label='Вернуться к задачам'
							>
								<Undo2 size={30} />
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
							<div className='md:w-[80%]'>
								<h1 className='text-2xl font-bold mb-14'>Страница профиля</h1>
								{role === 'user' && (
									<div className='md:flex md:justify-start md:gap-x-3 md:mb-10'>
										<Button
											className={`focus:bg-amber-700 ${
												activeCategory === 'favorite' ? 'bg-amber-700' : ''
											}`}
											onClick={() => handleClick('favorite')}
										>
											<span>Избранное</span>
										</Button>
										<Button
											className={`focus:bg-amber-700 ${
												activeCategory === 'started' ? 'bg-amber-700' : ''
											}`}
											onClick={() => handleClick('started')}
										>
											<span>Начатые задачи</span>
										</Button>
										<Button
											className={`focus:bg-amber-700 ${
												activeCategory === 'finished' ? 'bg-amber-700' : ''
											}`}
											onClick={() => handleClick('finished')}
										>
											<span>Завершенные задачи</span>
										</Button>
									</div>
								)}
								{role === 'employer' && (
									<div className='md:mb-10'>
										<h2 className='text-xl font-semibold'>Мои задачи</h2>
									</div>
								)}

								{visibleTasks.length === 0 ? (
									<EmptyCard
										role={role}
										listType={
											role === 'employer'
												? 'Мои задачи'
												: category === 'favorite'
												? 'Избранное'
												: category === 'started'
												? 'Начатые задачи'
												: 'Завершенные задачи'
										}
									/>
								) : listType === 'card' ? (
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

export default UserPage

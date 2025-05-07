import Header from '@components/Header'
import NavBar from '@components/NavBar'
import TaskCard from '@components/TaskCard'
import { useNavigate } from 'react-router-dom'
import { List, BookCopy, Undo2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { tasksData as data, TypeTasksData } from '@data/tasksData'
import { motion, AnimatePresence } from 'framer-motion'
import useNotification from '@hooks/useNotification'
import Notification from '@components/UI/Notification/Notification'
import { removeTaskFromFavorite } from '@data/userData'
import EmptyCard from '@components/EmptyCard'

const UserPage = () => {
	const [listType, setListType] = useState<'list' | 'card'>('list')
	const [visibleTasks, setVisibleTasks] = useState<TypeTasksData[]>([])
	const [favoriteTasks, setFavoriteTasks] = useState<number[]>([])
	const { notifications, addNotification } = useNotification()

	const navigate = useNavigate()
	const goBack = () => {
		navigate('/')
	}

	const loadFavoriteTasks = () => {
		setVisibleTasks([])
		const userData = JSON.parse(localStorage.getItem('userData') || '{}')
		const favoriteTasksId = userData.users?.['admin']?.favoriteTasks?.id || []
		setFavoriteTasks(favoriteTasksId)
		const tasksData = data.filter(task => favoriteTasksId.includes(task.id))

		tasksData.forEach((task, index) => {
			setTimeout(() => {
				setVisibleTasks(prev => [...prev, task])
			}, index * 200)
		})
	}

	useEffect(() => {
		loadFavoriteTasks()
	}, [listType])

	const removeFromFavorite = (id: number) => {
		if (favoriteTasks.includes(id)) {
			setFavoriteTasks(favoriteTasks.filter(task => task !== id))
			removeTaskFromFavorite('admin', id)
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
					taskPath={task.taskPath}
					companyName={task.companyName}
					type={listType}
					addToFavorite={removeFromFavorite}
					deadline={task.deadline}
					tags={task.tags}
				/>
			</motion.div>
		</AnimatePresence>
	))

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
								{visibleTasks.length === 0 ? (
									<EmptyCard />
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

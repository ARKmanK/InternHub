import Header from '@components/Header'
import NavBar from '@components/NavBar'
import TaskCard from '@components/TaskCard'
import { useNavigate } from 'react-router-dom'
import { List, BookCopy, Undo2, LogOut } from 'lucide-react'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useNotification from '@hooks/useNotification'
import Notification from '@components/UI/Notification/Notification'
import { supabase } from '@/supabaseClient'
import {
	clearAuthData,
	getAllTasks,
	getUserByEmail,
	getUserFavorites,
	removeTaskFromFavorite,
} from '@/src/lib/API/supabaseAPI'
import EmptyCard from '@components/EmptyCard'
import { Button } from '@components/UI/Button/Button'
import DeleteConfirmation from '@components/DeleteConfirmation'
import { setPage, goBack } from '@data/userData'

type TypeTask = {
	id: number
	tracking_number: number
	title: string
	description: string
	difficulty: number
	company_name: string
	deadline: string
	tags?: string[]
	employer_id: number
}

const UserPage = () => {
	const [role, setRole] = useState<'employer' | 'user' | null>(null)
	const [listType, setListType] = useState<'list' | 'card'>('list')
	const [visibleTasks, setVisibleTasks] = useState<TypeTask[]>([])
	const [favoriteTasks, setFavoriteTasks] = useState<number[]>([])
	const [startedTasks, setStartedTasks] = useState<number[]>([])
	const [finishedTasks, setFinishedTasks] = useState<number[]>([])
	const [taskToDelete, setTaskToDelete] = useState<number | null>(null)
	const [showDeleteForm, setShowDeleteForm] = useState(false)
	const { notifications, addNotification } = useNotification()
	const [category, setCategory] = useState<'favorite' | 'started' | 'finished'>('favorite')
	const [activeCategory, setActiveCategory] = useState('favorite')
	const [userId, setUserId] = useState<number | null>(null)

	const navigate = useNavigate()

	useEffect(() => {
		setPage('/user') // Устанавливаем текущую страницу
		const fetchUser = async () => {
			const {
				data: { session },
			} = await supabase.auth.getSession()
			if (session?.user) {
				const user = await getUserByEmail(session.user.email!)
				if (user) {
					setUserId(user.id)
					setRole(user.role)
					await loadFavoriteTasks(user.id)
					await loadStartedTasks(user.id)
					await loadFinishedTasks(user.id)
					if (user.role === 'employer') {
						await loadEmployerTasks(user.id)
					}
				}
			}
		}
		fetchUser()
	}, [])

	const loadFavoriteTasks = async (userId: number) => {
		try {
			const favorites = await getUserFavorites(userId)
			setFavoriteTasks(favorites)
		} catch (error: any) {
			addNotification('error', 'Ошибка', `Не удалось загрузить избранные задачи: ${error.message}`)
		}
	}

	const loadStartedTasks = async (userId: number) => {
		try {
			const { data, error } = await supabase
				.from('user_tasks')
				.select('task_id')
				.eq('user_id', userId)
				.eq('is_started', true)
			if (error) throw error
			setStartedTasks(data.map(item => item.task_id))
		} catch (error: any) {
			addNotification('error', 'Ошибка', `Не удалось загрузить начатые задачи: ${error.message}`)
		}
	}

	const loadFinishedTasks = async (userId: number) => {
		try {
			const { data, error } = await supabase
				.from('user_tasks')
				.select('task_id')
				.eq('user_id', userId)
				.eq('is_finished', true)
			if (error) throw error
			setFinishedTasks(data.map(item => item.task_id))
		} catch (error: any) {
			addNotification(
				'error',
				'Ошибка',
				`Не удалось загрузить завершенные задачи: ${error.message}`
			)
		}
	}

	const loadEmployerTasks = async (userId: number) => {
		try {
			const { data, error } = await supabase.from('tasks').select('*').eq('employer_id', userId)
			if (error) throw error
			setVisibleTasks(data)
		} catch (error: any) {
			addNotification(
				'error',
				'Ошибка',
				`Не удалось загрузить задачи работодателя: ${error.message}`
			)
		}
	}

	const loadTasks = async () => {
		if (!role || !userId) return

		try {
			const allTasks = await getAllTasks()
			if (role === 'employer') {
				const employerTasks = allTasks.filter(task => task.employer_id === userId)
				setVisibleTasks(employerTasks.map(task => ({ ...task, tags: task.tags ?? [] })))
			} else {
				let taskIds: number[] = []
				switch (category) {
					case 'favorite':
						taskIds = favoriteTasks
						break
					case 'started':
						taskIds = startedTasks
						break
					case 'finished':
						taskIds = finishedTasks
						break
				}
				const filteredTasks = allTasks.filter(task => taskIds.includes(task.id))
				setVisibleTasks(filteredTasks)
			}
		} catch (error: any) {
			addNotification('error', 'Ошибка', `Не удалось загрузить задачи: ${error.message}`)
		}
	}

	useEffect(() => {
		if (role && userId) {
			loadTasks()
		}
	}, [category, role, userId, favoriteTasks, startedTasks, finishedTasks])

	const removeFromFavorite = async (id: number) => {
		if (role === 'user' && favoriteTasks.includes(id)) {
			try {
				await removeTaskFromFavorite(userId!, id)

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
				addNotification('warning', 'Внимание', 'Задача убрана из избранного')
				setVisibleTasks(prev =>
					prev.map(task =>
						task.id === id ? { ...task, tracking_number: newTrackingNumber } : task
					)
				)
			} catch (error: any) {
				addNotification(
					'error',
					'Ошибка',
					`Не удалось убрать задачу из избранного: ${error.message}`
				)
			}
		}
	}

	const addToFavorite = async (id: number) => {
		if (role === 'user' && !favoriteTasks.includes(id)) {
			try {
				const { error: addError } = await supabase
					.from('user_tasks')
					.upsert(
						{ user_id: userId!, task_id: id, is_favorite: true },
						{ onConflict: 'user_id,task_id' }
					)
				if (addError) throw addError

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
				addNotification('success', 'Успешно', 'Задача добавлена в избранное')
				setVisibleTasks(prev =>
					prev.map(task =>
						task.id === id ? { ...task, tracking_number: newTrackingNumber } : task
					)
				)
			} catch (error: any) {
				addNotification(
					'error',
					'Ошибка',
					`Не удалось добавить задачу в избранное: ${error.message}`
				)
			}
		}
	}

	const handleDelete = (id: number) => {
		if (role === 'employer') {
			setTaskToDelete(id)
			setShowDeleteForm(true)
		}
	}

	const confirmDelete = async () => {
		if (taskToDelete !== null && role === 'employer' && userId) {
			try {
				const { error } = await supabase
					.from('tasks')
					.delete()
					.eq('id', taskToDelete)
					.eq('employer_id', userId)
				if (error) throw error
				addNotification('success', 'Успешно', 'Задача удалена')
				await loadTasks()
				setShowDeleteForm(false)
				setTaskToDelete(null)
			} catch (error: any) {
				addNotification('error', 'Ошибка', `Не удалось удалить задачу: ${error.message}`)
			}
		}
	}

	const cancelDelete = () => {
		setShowDeleteForm(false)
		setTaskToDelete(null)
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
					trackingNumber={task.tracking_number}
					title={task.title}
					description={task.description}
					difficulty={task.difficulty}
					companyName={task.company_name}
					type={listType}
					addToFavorite={role === 'user' ? addToFavorite : undefined}
					isFavorite={favoriteTasks.includes(task.id)}
					deadline={task.deadline}
					tags={task.tags ?? []}
					role={role}
					onDelete={role === 'employer' ? () => handleDelete(task.id) : undefined}
					showControls={role === 'employer'}
				/>
			</motion.div>
		</AnimatePresence>
	))

	const handleClick = (type: 'favorite' | 'started' | 'finished') => {
		setCategory(type)
		setActiveCategory(type)
	}

	const handleLogout = async () => {
		await supabase.auth.signOut()
		clearAuthData()
		localStorage.removeItem('pageHistory') // Очищаем историю при выходе
		navigate('/login')
	}

	return (
		<>
			<Header />
			<NavBar />
			<div className='relative'>
				<div className='md:flex md:justify-center md:py-[20px] md:px-[10px]'>
					<div className='md:min-h-[730px] md:w-[980px]'>
						<div className='md:flex md:flex-col'>
							<div className='md:py-4 md:flex md:justify-end items-center'>
								<button
									className='md:p-1 hover:bg-gray-300'
									onClick={() => goBack(navigate)}
									aria-label='Вернуться назад'
								>
									<Undo2 size={30} />
								</button>
								<button
									className='md:flex gap-x-2 border rounded-xl py-1 px-2 ml-4 bg-blue-400 hover:bg-gray-400'
									onClick={handleLogout}
								>
									<LogOut /> <span>Выйти</span>
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
					{showDeleteForm && (
						<DeleteConfirmation
							taskId={taskToDelete || 0}
							onConfirm={confirmDelete}
							onCancel={cancelDelete}
						/>
					)}
				</div>
				<Notification notifications={notifications} />
			</div>
		</>
	)
}

export default UserPage

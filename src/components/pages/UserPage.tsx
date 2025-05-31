import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from '@/supabaseClient'
import {
	clearAuthData,
	getAllTasks,
	getUserByEmail,
	getUserFavorites,
	removeTaskFromFavorite,
} from '@/src/lib/API/supabaseAPI'
import useNotification from '@hooks/useNotification'
import Notification from '@components/UI/Notification/Notification'
import { setPage, goBack } from '@data/userData'
import Header from '@components/Header'
import NavBar from '@components/NavBar'
import UserProfile from '@components/userComponents/UserProfile'
import EmployerProfile from '@components/employerComponents/EmployerProfile'
import AdminProfile from '@components/adminComponents/AdminProfile'
import { Undo2, LogOut } from 'lucide-react'

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
	const [role, setRole] = useState<'employer' | 'user' | 'admin' | null>(null)
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
		setPage('/user')
		const fetchUser = async () => {
			const {
				data: { session },
			} = await supabase.auth.getSession()
			if (session?.user) {
				const user = await getUserByEmail(session.user.email!)
				if (user) {
					setUserId(user.id)
					setRole(user.role)
					if (user.role !== 'admin') {
						await loadFavoriteTasks(user.id)
						await loadStartedTasks(user.id)
						await loadFinishedTasks(user.id)
						if (user.role === 'employer') {
							await loadEmployerTasks(user.id)
						}
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
			addNotification('error', 'Ошибка', `Не удалось загрузить Одобренные задачи: ${error.message}`)
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
		if (!role || !userId || role === 'admin') return

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
		if (role && userId && role !== 'admin') {
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

	const handleLogout = async () => {
		try {
			await supabase.auth.signOut()
			clearAuthData()
			localStorage.removeItem('pageHistory')
			localStorage.removeItem('supabaseSession')
			localStorage.removeItem('sessionExpiry')
			addNotification('success', 'Успешно', 'Вы вышли из системы')
		} catch (error: any) {
			addNotification('error', 'Ошибка', `Не удалось выйти из системы: ${error.message}`)
		} finally {
			navigate('/login')
		}
	}

	const handleCategoryChange = (type: 'favorite' | 'started' | 'finished') => {
		setCategory(type)
		setActiveCategory(type)
	}

	return (
		<>
			<Header />
			<NavBar />
			<div className='relative'>
				{role === 'user' && (
					<UserProfile
						listType={listType}
						setListType={setListType}
						visibleTasks={visibleTasks}
						favoriteTasks={favoriteTasks}
						category={category}
						activeCategory={activeCategory}
						handleCategoryChange={handleCategoryChange}
						addToFavorite={addToFavorite}
						removeFromFavorite={removeFromFavorite} // Передаём в UserProfile
						navigate={navigate}
						handleLogout={handleLogout}
						goBack={goBack}
					/>
				)}
				{role === 'employer' && (
					<EmployerProfile
						listType={listType}
						setListType={setListType}
						visibleTasks={visibleTasks}
						handleDelete={handleDelete}
						showDeleteForm={showDeleteForm}
						taskToDelete={taskToDelete}
						confirmDelete={confirmDelete}
						cancelDelete={cancelDelete}
						navigate={navigate}
						handleLogout={handleLogout}
						goBack={goBack}
					/>
				)}
				{role === 'admin' && (
					<AdminProfile navigate={navigate} handleLogout={handleLogout} goBack={goBack} />
				)}
				<Notification notifications={notifications} />
			</div>
		</>
	)
}

export default UserPage

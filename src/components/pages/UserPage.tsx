import { useNavigate, useLocation } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
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
import StudentProfile from '@/src/components/StudentComponents/StudentProfile'
import EmployerProfile from '@components/employerComponents/EmployerProfile'
import AdminProfile from '@components/adminComponents/AdminProfile'
import Message from '../Message'
import { useQuery, useQueryClient } from '@tanstack/react-query'

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

// ... остальные импорты без изменений

const UserPage = () => {
	const queryClient = useQueryClient()
	const location = useLocation()
	const [role, setRole] = useState<'employer' | 'user' | 'admin' | null>(null)
	const [listType, setListType] = useState<'list' | 'card'>('list')
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
	const handleGoBack = goBack(navigate)

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
				}
			}
		}
		fetchUser()
	}, [])

	// Подписка на изменения в реальном времени для таблицы tasks
	useEffect(() => {
		const tasksChannel = supabase.channel('tasks-changes')
		tasksChannel
			.on(
				'postgres_changes',
				{ event: '*', schema: 'public', table: 'tasks' }, // Убрали фильтр employer_id
				payload => {
					queryClient.invalidateQueries({ queryKey: ['allTasks'] })
				}
			)
			.subscribe(status => {
				if (status === 'SUBSCRIBED') {
				}
			})

		return () => {
			tasksChannel.unsubscribe()
			supabase.removeChannel(tasksChannel)
		}
	}, [queryClient]) // Убрали userId из зависимостей

	// Подписка на изменения в реальном времени для user_tasks
	useEffect(() => {
		if (!userId) return

		const channel = supabase.channel('user-tasks-changes')
		channel
			.on(
				'postgres_changes',
				{ event: 'INSERT', schema: 'public', table: 'user_tasks', filter: `user_id=eq.${userId}` },
				payload => {
					if (payload.new.is_favorite) {
						queryClient.invalidateQueries({ queryKey: ['favorites', userId] })
					}
					if (payload.new.is_started) {
						queryClient.invalidateQueries({ queryKey: ['started', userId] })
					}
					if (payload.new.is_finished) {
						queryClient.invalidateQueries({ queryKey: ['finished', userId] })
					}
				}
			)
			.on(
				'postgres_changes',
				{ event: 'UPDATE', schema: 'public', table: 'user_tasks', filter: `user_id=eq.${userId}` },
				payload => {
					if (payload.new.is_favorite !== payload.old.is_favorite) {
						queryClient.invalidateQueries({ queryKey: ['favorites', userId] })
					}
					if (payload.new.is_started !== payload.old.is_started) {
						queryClient.invalidateQueries({ queryKey: ['started', userId] })
					}
					if (payload.new.is_finished !== payload.old.is_finished) {
						queryClient.invalidateQueries({ queryKey: ['finished', userId] })
					}
				}
			)
			.on(
				'postgres_changes',
				{ event: 'DELETE', schema: 'public', table: 'user_tasks', filter: `user_id=eq.${userId}` },
				payload => {
					if (payload.old.is_favorite) {
						queryClient.invalidateQueries({ queryKey: ['favorites', userId] })
					}
					if (payload.old.is_started) {
						queryClient.invalidateQueries({ queryKey: ['started', userId] })
					}
					if (payload.old.is_finished) {
						queryClient.invalidateQueries({ queryKey: ['finished', userId] })
					}
				}
			)
			.subscribe(status => {})

		return () => {
			channel.unsubscribe()
			supabase.removeChannel(channel)
		}
	}, [userId, queryClient])

	// Обработка favoriteTasks из location.state
	useEffect(() => {
		if (location.state?.favoriteTasks) {
			setFavoriteTasks(prev => {
				const newFavorites = [...new Set([...prev, ...(location.state.favoriteTasks || [])])]
				if (JSON.stringify(newFavorites) !== JSON.stringify(prev)) {
					return newFavorites
				}
				return prev
			})
		}
	}, [location.state?.favoriteTasks])

	// Запрос всех задач
	const { data: allTasks = [], isLoading: isLoadingTasks } = useQuery<TypeTask[], Error>({
		queryKey: ['allTasks'],
		queryFn: getAllTasks,
		staleTime: 0, // Отключаем staleTime для немедленного обновления
		gcTime: 0, // Отключаем gcTime
	})

	// Запрос избранных задач
	const { data: favoriteTaskIds = [], isLoading: isLoadingFavorites } = useQuery<number[], Error>({
		queryKey: ['favorites', userId],
		queryFn: () => {
			return userId ? getUserFavorites(userId) : Promise.resolve([])
		},
		enabled: !!userId,
		staleTime: 0,
		gcTime: 0,
	})

	// Запрос начатых задач
	const { data: startedTaskIds = [], isLoading: isLoadingStarted } = useQuery<number[], Error>({
		queryKey: ['started', userId],
		queryFn: async () => {
			if (!userId) return []

			const { data, error } = await supabase
				.from('user_tasks')
				.select('task_id')
				.eq('user_id', userId)
				.eq('is_started', true)
			if (error) throw error
			return data.map(item => item.task_id)
		},
		enabled: !!userId,
		staleTime: 0,
		gcTime: 0,
	})

	// Запрос завершённых задач
	const { data: finishedTaskIds = [], isLoading: isLoadingFinished } = useQuery<number[], Error>({
		queryKey: ['finished', userId],
		queryFn: async () => {
			if (!userId) return []

			const { data, error } = await supabase
				.from('user_tasks')
				.select('task_id')
				.eq('user_id', userId)
				.eq('is_finished', true)
			if (error) throw error
			return data.map(item => item.task_id)
		},
		enabled: !!userId,
		staleTime: 0,
		gcTime: 0,
	})

	// Общее состояние загрузки
	const isLoading = isLoadingTasks || isLoadingFavorites || isLoadingStarted || isLoadingFinished

	// Обновление состояний
	useEffect(() => {
		setFavoriteTasks(prev => {
			if (JSON.stringify(prev) !== JSON.stringify(favoriteTaskIds)) {
				return favoriteTaskIds
			}
			return prev
		})
	}, [favoriteTaskIds])

	useEffect(() => {
		setStartedTasks(prev => {
			if (JSON.stringify(prev) !== JSON.stringify(startedTaskIds)) {
				return startedTaskIds
			}
			return prev
		})
	}, [startedTaskIds])

	useEffect(() => {
		setFinishedTasks(prev => {
			if (JSON.stringify(prev) !== JSON.stringify(finishedTaskIds)) {
				return finishedTaskIds
			}
			return prev
		})
	}, [finishedTaskIds])

	// Фильтрация visibleTasks
	const visibleTasksMemo = useMemo(() => {
		if (!role || !userId || role === 'admin') return []
		if (role === 'employer') {
			const filtered = allTasks.filter(task => task.employer_id === userId)

			return filtered
		}
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
		return filteredTasks
	}, [allTasks, role, userId, category, favoriteTasks, startedTasks, finishedTasks])

	const removeFromFavorite = async (id: number) => {
		if (role === 'user' && favoriteTasks.includes(id)) {
			try {
				await removeTaskFromFavorite(userId!, id)
				const { data: taskData, error: taskError } = await supabase
					.from('tasks')
					.select('tracking_number')
					.eq('id', id)
					.single()
				if (taskError) throw taskError
				const newTrackingNumber = Math.max(taskData.tracking_number - 1, 0)
				const { error: updateError } = await supabase
					.from('tasks')
					.update({ tracking_number: newTrackingNumber })
					.eq('id', id)
				if (updateError) throw updateError
				setFavoriteTasks(prev => {
					const newFavorites = prev.filter(taskId => taskId !== id)
					return newFavorites
				})
				queryClient.setQueryData(['favorites', userId], (old: number[] | undefined) =>
					old ? old.filter(taskId => taskId !== id) : []
				)
				queryClient.invalidateQueries({ queryKey: ['favorites', userId] })
				addNotification('warning', 'Внимание!', 'Задача убрана из избранного')
			} catch (error: any) {
				addNotification(
					'error',
					'Ошибка!',
					`Не удалось убрать задачу из избранного: ${error.message}`
				)
			}
		}
	}

	const addToFavorite = async (id: number) => {
		if (role === 'user' && !favoriteTasks.includes(id)) {
			try {
				const { error: upsertError } = await supabase
					.from('user_tasks')
					.upsert(
						{ user_id: userId!, task_id: id, is_favorite: true },
						{ onConflict: 'user_id,task_id' }
					)
				if (upsertError) throw upsertError
				const { data: taskData, error: taskError } = await supabase
					.from('tasks')
					.select('tracking_number')
					.eq('id', id)
					.single()
				if (taskError) throw taskError
				const newTrackingNumber = taskData.tracking_number + 1
				const { error: updateError } = await supabase
					.from('tasks')
					.update({ tracking_number: newTrackingNumber })
					.eq('id', id)
				if (updateError) throw updateError
				setFavoriteTasks(prev => {
					const newFavorites = [...prev, id]
					return newFavorites
				})
				queryClient.setQueryData(['favorites', userId], (old: number[] | undefined) =>
					old ? [...old, id] : [id]
				)
				queryClient.invalidateQueries({ queryKey: ['favorites', userId] })
				addNotification('success', 'Успех!', 'Задача добавлена в избранное')
			} catch (error: any) {
				addNotification(
					'error',
					'Ошибка!',
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
				const { error: deleteError } = await supabase
					.from('tasks')
					.delete()
					.eq('id', taskToDelete)
					.eq('employer_id', userId)
				if (deleteError) throw deleteError
				addNotification('success', 'Успех!', 'Задача удалена')
				setShowDeleteForm(false)
				setTaskToDelete(null)
				queryClient.invalidateQueries({ queryKey: ['allTasks'] })
			} catch (error: any) {
				addNotification('error', 'Ошибка!', `Не удалось удалить задачу: ${error.message}`)
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
			localStorage.removeItem('userHistory')
			localStorage.removeItem('userId')
			localStorage.removeItem('sessionExpiry')
			addNotification('success', 'Успех!', 'Вы вышли из системы')
		} catch (error: any) {
			addNotification('error', 'Ошибка!', `Не удалось выйти из системы: ${error.message}`)
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
			<div className='container mx-auto'>
				{role === 'user' && (
					<StudentProfile
						userId={userId}
						listType={listType}
						setListType={setListType}
						visibleTasks={visibleTasksMemo}
						favoriteTasks={favoriteTasks}
						category={category}
						activeCategory={activeCategory}
						handleCategoryChange={handleCategoryChange}
						addToFavorite={addToFavorite}
						removeFromFavorite={removeFromFavorite}
						navigate={navigate}
						handleLogout={handleLogout}
						goBack={handleGoBack}
						isLoading={isLoading}
					/>
				)}
				{role === 'employer' && (
					<EmployerProfile
						listType={listType}
						setListType={setListType}
						tasks={visibleTasksMemo}
						handleDelete={handleDelete}
						taskToDelete={taskToDelete}
						showDeleteForm={showDeleteForm}
						confirmDelete={confirmDelete}
						cancelDelete={cancelDelete}
						navigate={navigate}
						handleLogout={handleLogout}
						goBack={handleGoBack}
						isLoading={isLoading}
					/>
				)}
				{role === 'admin' && (
					<AdminProfile
						navigate={navigate}
						handleLogout={handleLogout}
						goBack={handleGoBack}
						/* isLoading={isLoading} */ // Если нужно добавить для AdminProfile
					/>
				)}
				<Notification notifications={notifications} />
				<Message />
			</div>
		</>
	)
}

export default UserPage

import { useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import useNotification from '@hooks/useNotification'
import Notification from '@components/UI/Notification/Notification'
import Header from '@/src/components/UI/Header'
import NavBar from '@/src/components/UI/NavBar'
import StudentProfile from '@/src/components/Profiles/StudentProfile'
import EmployerProfile from '@/src/components/Profiles/EmployerProfile'
import AdminProfile from '@/src/components/Profiles/AdminProfile'
import Message from '../UI/Message'
import {
	getAllTasks,
	getUserFavorites,
	getStartedTasks,
	getFinishedTasks,
	removeFromFavorite,
	addToFavorite,
} from '@/src/lib/API/supabase/taskAPI'
import {
	setPage,
	goBack,
	getVisibleTasks,
	updateFavoriteTasks,
	updateStartedTasks,
	updateFinishedTasks,
	handleLogout,
	handleCategoryChange,
} from '@data/userData'
import { deleteTask } from '@/src/lib/API/supabase/employerAPI'
import useSupabaseSubscriptions from '@hooks/useSupabaseSubscriptions'
import { TypeTask } from '@/src/types/TypeTask'
import { MouseEventHandler } from 'react'
import { fetchUser } from '@/src/lib/API/supabase/userAPI'

const UserPage = () => {
	const queryClient = useQueryClient()
	const location = useLocation()
	const [role, setRole] = useState<'employer' | 'user' | 'admin' | null>(null)
	const [favoriteTasks, setFavoriteTasks] = useState<number[]>([])
	const [startedTasks, setStartedTasks] = useState<number[]>([])
	const [finishedTasks, setFinishedTasks] = useState<number[]>([])
	const [taskToDelete, setTaskToDelete] = useState<number | null>(null)
	const [showDeleteForm, setShowDeleteForm] = useState(false)
	const [studentListType, setStudentListType] = useState<'list' | 'card'>('list')
	const { notifications, addNotification } = useNotification()
	const [category, setCategory] = useState<'favorite' | 'started' | 'finished'>('favorite')
	const [activeCategory, setActiveCategory] = useState<'favorite' | 'started' | 'finished'>(
		'favorite'
	)
	const [userId, setUserId] = useState<number | null>(null)
	const employerListType = 'list'
	const navigate = useNavigate()
	const handleGoBack: MouseEventHandler<HTMLButtonElement> = goBack(navigate)

	useEffect(() => {
		setPage('/user')
		fetchUser(setUserId, setRole)
	}, [])

	useEffect(() => {
		if (location.state?.favoriteTasks) {
			updateFavoriteTasks(location.state.favoriteTasks, setFavoriteTasks)
		}
	}, [location.state?.favoriteTasks])
	useSupabaseSubscriptions(userId, queryClient)

	const { data: allTasks = [], isLoading: isLoadingTasks } = useQuery<TypeTask[], Error>({
		queryKey: ['allTasks'],
		queryFn: getAllTasks,
		staleTime: 0,
		gcTime: 0,
	})

	const { data: favoriteTaskIds = [], isLoading: isLoadingFavorites } = useQuery<number[], Error>({
		queryKey: ['favorites', userId],
		queryFn: () => getUserFavorites(userId!),
		enabled: !!userId,
		staleTime: 0,
		gcTime: 0,
	})

	const { data: startedTaskIds = [], isLoading: isLoadingStarted } = useQuery<number[], Error>({
		queryKey: ['started', userId],
		queryFn: () => getStartedTasks(userId!),
		enabled: !!userId,
		staleTime: 0,
		gcTime: 0,
	})

	const { data: finishedTaskIds = [], isLoading: isLoadingFinished } = useQuery<number[], Error>({
		queryKey: ['finished', userId],
		queryFn: () => getFinishedTasks(userId!),
		enabled: !!userId,
		staleTime: 0,
		gcTime: 0,
	})

	useEffect(() => {
		updateFavoriteTasks(favoriteTaskIds, setFavoriteTasks)
	}, [favoriteTaskIds])

	useEffect(() => {
		updateStartedTasks(startedTaskIds, setStartedTasks)
	}, [startedTaskIds])

	useEffect(() => {
		updateFinishedTasks(finishedTaskIds, setFinishedTasks)
	}, [finishedTaskIds])

	const visibleTasks = getVisibleTasks(
		allTasks,
		role,
		userId,
		category,
		favoriteTasks,
		startedTasks,
		finishedTasks
	)

	const isLoading = isLoadingTasks || isLoadingFavorites || isLoadingStarted || isLoadingFinished
	const handleDelete = (id: number) => {
		if (role === 'employer') {
			setTaskToDelete(id)
			setShowDeleteForm(true)
		}
	}

	const confirmDelete = async () => {
		if (taskToDelete !== null && role === 'employer' && userId) {
			try {
				await deleteTask(taskToDelete, userId)
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

	return (
		<>
			<Header />
			<NavBar />
			<div className='container mx-auto'>
				{role === 'user' && (
					<StudentProfile
						listType={studentListType}
						visibleTasks={visibleTasks}
						setListType={setStudentListType}
						favoriteTasks={favoriteTasks}
						category={category}
						activeCategory={activeCategory}
						handleCategoryChange={type =>
							handleCategoryChange(type, setCategory, setActiveCategory)
						}
						addToFavorite={id =>
							addToFavorite(
								id,
								userId,
								favoriteTasks,
								setFavoriteTasks,
								queryClient,
								addNotification
							)
						}
						removeFromFavorite={id =>
							removeFromFavorite(
								id,
								userId,
								favoriteTasks,
								setFavoriteTasks,
								queryClient,
								addNotification
							)
						}
						navigate={navigate}
						handleLogout={() => handleLogout(navigate, addNotification)}
						goBack={handleGoBack}
						isLoading={isLoading}
					/>
				)}
				{role === 'employer' && (
					<EmployerProfile
						listType={employerListType}
						tasks={visibleTasks}
						handleDelete={handleDelete}
						taskToDelete={taskToDelete}
						showDeleteForm={showDeleteForm}
						confirmDelete={confirmDelete}
						cancelDelete={cancelDelete}
						navigate={navigate}
						handleLogout={() => handleLogout(navigate, addNotification)}
						goBack={handleGoBack}
						isLoading={isLoading}
					/>
				)}
				{role === 'admin' && (
					<AdminProfile
						navigate={navigate}
						handleLogout={() => handleLogout(navigate, addNotification)}
						goBack={handleGoBack}
					/>
				)}
				<Notification notifications={notifications} />
				<Message />
			</div>
		</>
	)
}

export default UserPage

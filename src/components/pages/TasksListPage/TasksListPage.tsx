import { FC, useState, useEffect, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import Header from '@UI/Header'
import NavBar from '@UI/NavBar'
import TaskFilter from '@components/TaskFilter'
import { supabase } from '@/supabaseClient'
import useNotification from '@hooks/useNotification'
import Notification from '@UI/Notification/Notification'
import { setPage } from '@data/userData'
import Message from '@UI/Message'
import ScreenLoadingAnimation from '@UI/ScreenLoadingAnimation'
import TaskList from './TaskList'
import { TypeTask } from '@/src/types/TypeTask'
import { addTaskToFavorites, removeTaskFromFavorite } from '@lib/API/supabase/taskAPI'
import { fetchUserAndTasks } from '@lib/API/supabase/tasksListAPI'
import CreateTaskButton from '@UI/Buttons/CreateTaskButton'
import ProfileButton from '@UI/Buttons/ProfileButton'
import ListViewButton from '@UI/Buttons/ListViewButton'
import CardViewButton from '@UI/Buttons/CardViewButton'

type TypeFilter = {
	companies: string | null
	difficulty: number | null
	tracking: '0' | '1-5' | '6-10' | '15-20' | '20+' | null
	tags: string[] | null
}

const TasksListPage: FC = () => {
	const [listType, setListType] = useState<'list' | 'card'>('list')
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
	const [hasFetched, setHasFetched] = useState(false)
	const navigate = useNavigate()
	const location = useLocation()

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

	useEffect(() => {
		if (hasFetched) {
			return
		}

		setPage('/tasks')
		fetchUserAndTasks(
			setLoading,
			setUserId,
			setRole,
			setCompanies,
			setTasks,
			setHasFetched,
			navigate,
			addNotification,
			{
				userId,
				role,
				setFavoriteTasks,
				setEmployerTaskIds,
				setSubmissionsCount,
				setSubmissionsLoading,
				addNotification,
			}
		)

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
				filter.tags!.some(tag => (task.tags || []).includes(tag))
			)
		}
		return filteredTasks
	}, [filter, tasks])

	const openProfile = () => navigate('/user')
	const openCreateTaskPage = () => navigate('/create-task')

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
							{role === 'employer' && <CreateTaskButton onClick={openCreateTaskPage} />}
							<ProfileButton
								onClick={openProfile}
								role={role}
								submissionsLoading={submissionsLoading}
								submissionsCount={submissionsCount}
							/>
						</div>
						<div className='md:flex md:justify-end'>
							<ListViewButton onClick={() => setListType('list')} isActive={listType === 'list'} />
							<CardViewButton onClick={() => setListType('card')} isActive={listType === 'card'} />
						</div>
						<div className='md:flex mt-7'>
							<div className='md:w-[25%] md:mr-10'>
								<TaskFilter filter={filter} setFilter={setFilter} companies={companies} />
							</div>
							<div className='md:w-[80%]'>
								<TaskList
									visibleTasks={visibleTasks}
									listType={listType}
									role={role}
									favoriteTasks={favoriteTasks}
									employerTaskIds={employerTaskIds}
									addToFavorite={addToFavorite}
									removeFromFavorite={removeFromFavorite}
								/>
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

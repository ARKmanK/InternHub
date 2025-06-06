import { FC, useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Heart, Undo2 } from 'lucide-react'
import useNotification from '@hooks/useNotification'
import { supabase } from '@/supabaseClient'
import { TypeTaskActivity } from '@/src/types/TypeTaskActivity'
import { getRole, getUserId } from '@lib/API/supabase/userAPI'
import { goBack, setPage } from '@data/userData'
import { getTaskActivity } from '@lib/API/supabase/taskActivityAPI'
import { addMessage } from '@lib/API/supabase/messagesAPI'
import ScreenLoadingAnimation from '@UI/ScreenLoadingAnimation'
import TaskNotFound from '@components/TaskNotFound'
import Header from '@UI/Header'
import NavBar from '@UI/NavBar'
import AddAnswerForm from '@components/Forms/AddAnswerForm/AddAnswerForm'
import Message from '@UI/Message'
import { TypeTask } from '@/src/types/TypeTask'
import TaskInfo from './TaskInfo'
import TaskActivityTable from './TaskActivityTable'
import {
	addTaskToFavorites,
	addTaskToFinished,
	getTaskById,
	getUserFavorites,
	removeTaskFromFavorite,
} from '@/src/lib/API/supabase/taskAPI'

const TaskPage: FC = () => {
	const { taskId } = useParams<{ taskId?: string }>()
	const navigate = useNavigate()
	const { addNotification } = useNotification()
	const [task, setTask] = useState<TypeTask | null>(null)
	const [activityData, setActivityData] = useState<TypeTaskActivity[]>([])
	const [favoriteTasks, setFavoriteTasks] = useState<number[]>([])
	const [showAddForm, setShowAddForm] = useState<boolean>(false)
	const [role] = useState(getRole())
	const [userId, setUserId] = useState<number | null>(getUserId())
	const [isLoading, setIsLoading] = useState<boolean>(true)
	const [selectedActivity, setSelectedActivity] = useState<TypeTaskActivity | null>(null)
	const [isModalOpen, setIsModalOpen] = useState<boolean>(false)

	const handleGoBack = goBack(navigate)

	const loadData = async () => {
		setIsLoading(true)
		try {
			if (!userId) {
				addNotification('warning', 'Ошибка', 'Пользователь не авторизован')
				navigate('/auth/login')
				return
			}
			if (!taskId || isNaN(Number(taskId))) {
				addNotification('error', 'Ошибка', 'Некорректный идентификатор задачи')
				navigate('/tasks')
				return
			}
			const taskIdNum = Number(taskId)
			const foundTask = await getTaskById(taskIdNum)
			if (!foundTask) {
				addNotification('error', 'Ошибка', 'Задача не найдена')
				navigate('/tasks')
				return
			}

			setTask({
				id: foundTask.id,
				tracking_number: foundTask.tracking_number,
				title: foundTask.title,
				description: foundTask.description,
				difficulty: foundTask.difficulty,
				company_name: foundTask.company_name,
				deadline: foundTask.deadline,
				tags: foundTask.tags ?? [],
				employer_id: foundTask.employer_id,
				zip_file_url: foundTask.zip_file_url,
			} as TypeTask)

			const favorites = await getUserFavorites(userId)
			setFavoriteTasks(favorites)
			const taskActivity = await getTaskActivity(taskIdNum)
			setActivityData(taskActivity)
		} catch (error: any) {
			addNotification(
				'error',
				'Ошибка',
				`Не удалось загрузить данные: ${error.message || 'Неизвестная ошибка'}`
			)
		} finally {
			setIsLoading(false)
		}
	}

	useEffect(() => {
		setPage(`/task/${taskId}`)
		loadData()
	}, [taskId, userId])

	useEffect(() => {
		const handleStorageChange = (e: StorageEvent) => {
			if (e.key === 'userData') {
				const userData = JSON.parse(localStorage.getItem('userData') || '{}')
				const newUserId = userData.user?.id || null
				setUserId(newUserId)
				loadData()
			}
		}
		window.addEventListener('storage', handleStorageChange)
		return () => window.removeEventListener('storage', handleStorageChange)
	}, [])

	const handleFavorite = async () => {
		if (!task || !userId) return
		if (favoriteTasks.includes(task.id)) {
			try {
				await removeTaskFromFavorite(userId, task.id)
				const { data: taskData, error: fetchError } = await supabase
					.from('tasks')
					.select('tracking_number')
					.eq('id', task.id)
					.single()
				if (fetchError) throw fetchError
				if (!taskData) throw new Error('Задача не найдена')
				const newTrackingNumber = Math.max(taskData.tracking_number - 1, 0)
				const { error: updateTrackingError } = await supabase
					.from('tasks')
					.update({ tracking_number: newTrackingNumber })
					.eq('id', task.id)
				if (updateTrackingError) throw updateTrackingError
				setFavoriteTasks(favoriteTasks.filter(id => id !== task.id))
				setTask(prev => (prev ? { ...prev, tracking_number: newTrackingNumber } : null))
				addNotification('warning', 'Внимание', 'Задача убрана из избранного')
			} catch (error: any) {
				addNotification(
					'error',
					'Ошибка',
					`Не удалось убрать задачу из избранного: ${error.message}`
				)
			}
		} else {
			try {
				await addTaskToFavorites(userId, task.id)
				const { data: taskData, error: fetchError } = await supabase
					.from('tasks')
					.select('tracking_number')
					.eq('id', task.id)
					.single()
				if (fetchError) throw fetchError
				if (!taskData) throw new Error('Задача не найдена')
				const newTrackingNumber = taskData.tracking_number + 1
				const { error: updateError } = await supabase
					.from('tasks')
					.update({ tracking_number: newTrackingNumber })
					.eq('id', task.id)
				if (updateError) throw updateError
				setFavoriteTasks([...favoriteTasks, task.id])
				setTask(prev => (prev ? { ...prev, tracking_number: newTrackingNumber } : null))
				addNotification('success', 'Успешно', 'Задача добавлена в избранное')
			} catch (error: any) {
				addNotification(
					'error',
					'Ошибка',
					`Не удалось добавить задачу в избранное: ${error.message}`
				)
			}
		}
	}

	const handleClick = () => {
		if (!task) return
		if (role === 'employer') {
			addNotification('warning', 'Роль', 'Ваша роль не соответствует необходимой')
			return
		}
		if (!favoriteTasks.includes(task.id)) {
			addNotification('warning', 'Нет в избранном', 'Добавьте задачу в избранное')
			return
		}
		setShowAddForm(true)
	}

	const handleOpenModal = (activity: TypeTaskActivity) => {
		setSelectedActivity(activity)
		setIsModalOpen(true)
	}

	const handleCloseModal = () => {
		setSelectedActivity(null)
		setIsModalOpen(false)
	}

	const handleApprove = async (activityId: number) => {
		try {
			const currentActivity = activityData?.find(activity => activity.id === activityId)
			if (currentActivity?.status === 'done') {
				addNotification('info', 'Информация', 'Решение уже одобрено')
				return
			}

			const { error } = await supabase
				.from('task_activity')
				.update({ status: 'done' })
				.eq('id', activityId)
			if (error) throw error

			if (currentActivity && task) {
				await addTaskToFinished(currentActivity.user_id, currentActivity.task_id)
				await addMessage(
					currentActivity.user_id,
					`Ваше решение по задаче "${task.title}" было одобрено!`
				)
			}

			setActivityData(prev =>
				prev
					? prev.map(activity =>
							activity.id === activityId ? { ...activity, status: 'done' as const } : activity
					  )
					: []
			)
			addNotification('success', 'Успешно', 'Решение одобрено')
			handleCloseModal()
		} catch (error: any) {
			addNotification('error', 'Ошибка', `Не удалось одобрить решение: ${error.message}`)
		}
	}

	const handleReject = async (activityId: number) => {
		try {
			const currentActivity = activityData?.find(activity => activity.id === activityId)
			const { error } = await supabase.from('task_activity').delete().eq('id', activityId)
			if (error) throw error

			if (currentActivity && task) {
				await addMessage(
					currentActivity.user_id,
					`Ваше решение по задаче "${task.title}" было отклонено.`
				)
			}

			setActivityData(prev => (prev ? prev.filter(activity => activity.id !== activityId) : []))
			addNotification('warning', 'Внимание', 'Решение отклонено и удалено')
			handleCloseModal()
		} catch (error: any) {
			addNotification('error', 'Ошибка', `Не удалось отклонить и удалить решение: ${error.message}`)
		}
	}

	const handleDownloadArchive = () => {
		if (task?.zip_file_url) {
			window.open(task.zip_file_url, '_blank')
		} else {
			addNotification('warning', 'Ошибка', 'Архив не прикреплен к задаче')
		}
	}

	if (!task || isLoading) {
		return isLoading ? <ScreenLoadingAnimation loading={true} /> : <TaskNotFound />
	}

	const isEmployerTaskOwner = role === 'employer' && task.employer_id === userId

	return (
		<>
			<Header />
			<NavBar />
			<div className='md:flex md:justify-center md:py-[20px] md:px-[10px]'>
				<div className='md:min-h-[900px] md:w-[980px]'>
					<div className='md:flex md:flex-col'>
						<div className='md:py-4 md:flex md:justify-end md:items-center md:gap-4'>
							<motion.button
								whileHover={{ scale: 1.1 }}
								whileTap={{ scale: 0.9 }}
								className='p-2 bg-gradient-to-br from-blue-200 to-blue-400 text-gray-800 rounded-lg shadow-md hover:from-blue-300 hover:to-blue-500 transition-all flex items-center space-x-2'
								onClick={handleGoBack}
								aria-label='Вернуться назад'
							>
								<Undo2 size={24} />
								<span className='text-sm font-semibold'>Назад</span>
							</motion.button>
							{role === 'user' && (
								<button className='p-1 rounded-full transition-colors' onClick={handleFavorite}>
									<Heart
										fill={favoriteTasks.includes(task.id) ? 'red' : 'gray'}
										color={favoriteTasks.includes(task.id) ? 'red' : 'red'}
										className={
											favoriteTasks.includes(task.id) ? '' : 'hover:fill-red-500 hover:text-red-500'
										}
										size={32}
									/>
								</button>
							)}
						</div>
						<TaskInfo task={task} handleDownloadArchive={handleDownloadArchive} />
						{role === 'user' && (
							<div className='md:flex md:justify-end md:mb-4'>
								<button
									className='md:py-2 md:px-4 md:rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors shadow-md'
									onClick={handleClick}
								>
									Добавить решение
								</button>
							</div>
						)}
						{showAddForm ? (
							<div className='md:min-w-[300px] md:min-h-[250px] md:rounded-xl md:mb-10'>
								<AddAnswerForm
									taskId={taskId || ''}
									onClose={() => setShowAddForm(false)}
									loadData={loadData}
								/>
							</div>
						) : (
							<TaskActivityTable
								activityData={activityData}
								task={task}
								isEmployerTaskOwner={isEmployerTaskOwner}
								selectedActivity={selectedActivity}
								isModalOpen={isModalOpen}
								handleOpenModal={handleOpenModal}
								handleCloseModal={handleCloseModal}
								handleApprove={handleApprove}
								handleReject={handleReject}
							/>
						)}
					</div>
				</div>
			</div>
			<Message />
		</>
	)
}

export default TaskPage

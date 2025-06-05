import { List, BookCopy, Undo2, LogOut } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import TaskCard from '@components/TaskCard'
import EmptyCard from '@components/EmptyCard'
import DeleteConfirmation from '@components/DeleteConfirmation'
import { setPage } from '@data/userData'
import { NavigateFunction } from 'react-router-dom'
import { useState, useEffect, memo } from 'react'
import { supabase } from '@/supabaseClient'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getAllTasks } from '@/src/lib/API/supabaseAPI'

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

type EmployerProfileProps = {
	listType: 'list' | 'card'
	setListType: (type: 'list' | 'card') => void
	handleDelete: (id: number) => void
	showDeleteForm: boolean
	taskToDelete: number | null
	confirmDelete: () => void
	cancelDelete: () => void
	navigate: NavigateFunction
	handleLogout: () => void
	goBack: () => void
}

// Компонент анимации загрузки
const LoadingSpinner = memo(() => (
	<motion.div
		className='flex justify-center items-center h-[200px] overflow-hidden'
		initial={{ opacity: 0 }}
		animate={{ opacity: 1 }}
		exit={{ opacity: 0, transition: { duration: 0.3 } }}
	>
		<motion.svg
			width='200'
			height='200'
			viewBox='0 0 200 200'
			fill='none'
			xmlns='http://www.w3.org/2000/svg'
			className='max-w-full'
		>
			<motion.circle
				cx='100'
				cy='70'
				r='5'
				fill='#60a5fa'
				animate={{
					y: [70, 100, 70],
					opacity: [0.8, 0, 0.8],
					scale: [1, 1.5, 1],
					transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
				}}
			/>
			<motion.circle
				cx='120'
				cy='80'
				r='5'
				fill='#3b82f6'
				animate={{
					y: [80, 110, 80],
					opacity: [0.8, 0, 0.8],
					scale: [1, 1.5, 1],
					transition: { duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.5 },
				}}
			/>
			<motion.circle
				cx='80'
				cy='120'
				r='5'
				fill='#60a5fa'
				animate={{
					y: [120, 90, 120],
					opacity: [0.8, 0, 0.8],
					scale: [1, 1.5, 1],
					transition: { duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 1 },
				}}
			/>
			<motion.circle
				cx='130'
				cy='130'
				r='5'
				fill='#3b82f6'
				animate={{
					y: [130, 100, 130],
					opacity: [0.8, 0, 0.8],
					scale: [1, 1.5, 1],
					transition: { duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 1.5 },
				}}
			/>
			<motion.circle
				cx='100'
				cy='100'
				r='15'
				fill='none'
				stroke='#60a5fa'
				strokeWidth='2'
				animate={{
					scale: [0.5, 1, 0.5],
					opacity: [0.3, 1, 0.3],
					transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
				}}
			/>
		</motion.svg>
	</motion.div>
))

const EmployerProfile = ({
	listType,
	setListType,
	handleDelete,
	showDeleteForm,
	taskToDelete,
	confirmDelete,
	cancelDelete,
	navigate,
	handleLogout,
	goBack,
}: EmployerProfileProps) => {
	const queryClient = useQueryClient()
	const [visibleTasks, setVisibleTasks] = useState<TypeTask[]>([])
	const [isLoading, setIsLoading] = useState(true) // Состояние загрузки
	const [showContent, setShowContent] = useState(false)

	// Запрос сессии пользователя
	const { data: sessionData, isLoading: isLoadingSession } = useQuery({
		queryKey: ['session'],
		queryFn: async () => {
			const { data } = await supabase.auth.getSession()
			return data
		},
		staleTime: 5 * 60 * 1000,
		gcTime: 30 * 60 * 1000,
	})

	// Запрос userId по email
	const { data: userData, isLoading: isLoadingUser } = useQuery({
		queryKey: ['user', sessionData?.session?.user?.email],
		queryFn: async () => {
			if (!sessionData?.session?.user?.email) return null
			const { data, error } = await supabase
				.from('users')
				.select('id')
				.eq('email', sessionData.session.user.email)
				.single()
			if (error) throw error
			return data
		},
		enabled: !!sessionData?.session?.user?.email,
		staleTime: 5 * 60 * 1000,
		gcTime: 30 * 60 * 1000,
	})

	const userId = userData?.id ?? null

	// Запрос всех задач
	const { data: allTasks = [], isLoading: isLoadingTasks } = useQuery<TypeTask[], Error>({
		queryKey: ['allTasks'],
		queryFn: getAllTasks,
		staleTime: 5 * 60 * 1000,
		gcTime: 30 * 60 * 1000,
	})

	// При монтировании компонента сбрасываем состояние загрузки
	useEffect(() => {
		setIsLoading(true)
		setShowContent(false)
	}, [])

	// Обновление visibleTasks при изменении данных
	useEffect(() => {
		if (userId && allTasks.length >= 0) {
			// Учитываем случай, когда задач нет (length может быть 0)
			const filteredTasks = allTasks.filter(task => task.employer_id === userId)
			setVisibleTasks(filteredTasks)

			// Добавляем минимальную задержку для анимации
			setTimeout(() => {
				setIsLoading(false)
				setShowContent(true)
			}, 1000) // Задержка в 1 секунду
		} else if (!isLoadingTasks && !isLoadingSession && !isLoadingUser) {
			// Если нет задач, но загрузка завершена
			setTimeout(() => {
				setIsLoading(false)
				setShowContent(true)
			}, 1000)
		}
	}, [allTasks, userId, isLoadingTasks, isLoadingSession, isLoadingUser])

	// Логика удаления задачи
	const handleDeleteTask = async (id: number) => {
		setIsLoading(true) // Показываем анимацию загрузки при удалении
		setShowContent(false)
		try {
			const { error } = await supabase.from('tasks').delete().eq('id', id)
			if (error) throw error
			// Обновляем локальное состояние
			setVisibleTasks(prevTasks => prevTasks.filter(task => task.id !== id))
			// Инвалидируем кэш allTasks для перезапроса
			queryClient.invalidateQueries({ queryKey: ['allTasks'] })
		} catch (error: any) {
			console.error('Ошибка удаления задачи:', error.message)
		}
	}

	// Привязка handleDelete к пропсу
	const handleDeleteProxy = (id: number) => {
		handleDelete(id)
	}

	const taskToDeleteData = visibleTasks.find(task => task.id === taskToDelete)
	const taskTitle = taskToDeleteData?.title || ''

	const taskCard = visibleTasks.map(task => (
		<motion.div
			key={task.id}
			initial={{ opacity: 0, y: -20 }}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0, y: -20 }}
			transition={{ duration: 0.7 }}
			className='max-w-full'
		>
			<TaskCard
				id={task.id}
				trackingNumber={task.tracking_number}
				title={task.title}
				description={task.description}
				difficulty={task.difficulty}
				companyName={task.company_name}
				type={listType}
				deadline={task.deadline}
				tags={task.tags ?? []}
				role='employer'
				onDelete={handleDeleteProxy}
				showControls={true}
				onClick={() => {
					setPage(`/task/${task.id}`)
					navigate(`/task/${task.id}`)
				}}
			/>
		</motion.div>
	))

	return (
		<div className='md:flex md:justify-center md:py-[20px] md:px-[10px]'>
			<div className='md:min-h-[730px] md:w-[980px]'>
				<div className='md:flex md:flex-col'>
					<div className='md:py-4 md:flex md:justify-end items-center'>
						<motion.button
							whileHover={{ scale: 1.1 }}
							whileTap={{ scale: 0.9 }}
							className='md:mr-4 p-2 bg-gradient-to-br from-blue-200 to-blue-400 text-gray-800 rounded-lg shadow-md hover:from-blue-300 hover:to-blue-500 transition-all flex items-center space-x-2'
							onClick={goBack}
							aria-label='Вернуться назад'
						>
							<Undo2 size={24} />
							<span className='text-sm font-semibold'>Назад</span>
						</motion.button>
						<motion.button
							whileHover={{ scale: 1.1 }}
							whileTap={{ scale: 0.9 }}
							className='p-2 bg-gradient-to-br from-blue-200 to-blue-400 text-gray-800 rounded-lg shadow-md hover:from-blue-300 hover:to-blue-500 transition-all flex items-center space-x-2'
							onClick={handleLogout}
						>
							<LogOut size={24} />
							<span className='text-sm font-semibold'>Выйти</span>
						</motion.button>
					</div>
					<div className='md:flex md:justify-end'>
						<motion.button
							whileHover={{ scale: 1.1 }}
							whileTap={{ scale: 0.9 }}
							className='md:mr-4 p-2 bg-gradient-to-br from-blue-200 to-blue-400 text-gray-800 rounded-lg shadow-md hover:from-blue-300 hover:to-blue-500 transition-all'
							onClick={() => setListType('list')}
						>
							<List size={24} />
						</motion.button>
						<motion.button
							whileHover={{ scale: 1.1 }}
							whileTap={{ scale: 0.9 }}
							className='p-2 bg-gradient-to-br from-blue-200 to-blue-400 text-gray-800 rounded-lg shadow-md hover:from-blue-300 hover:to-blue-500 transition-all'
							onClick={() => setListType('card')}
						>
							<BookCopy size={24} />
						</motion.button>
					</div>
					<div className='md:flex mt-7'>
						<div className='md:w-[80%]'>
							<h1 className='text-2xl font-bold mb-14'>Страница профиля</h1>
							<div className='md:mb-10'>
								<h2 className='text-xl font-semibold'>Мои задачи</h2>
							</div>
							<div className='overflow-y-auto pr-2'>
								<AnimatePresence mode='wait'>
									{isLoading ? (
										<LoadingSpinner key='spinner' />
									) : visibleTasks.length === 0 ? (
										<motion.div
											key='empty'
											initial={{ opacity: 0 }}
											animate={{ opacity: 1 }}
											exit={{ opacity: 0 }}
											transition={{ duration: 0.7 }}
											className='max-w-full'
										>
											<EmptyCard role='employer' listType='Мои задачи' />
										</motion.div>
									) : listType === 'card' ? (
										<motion.div
											key='cards'
											initial={{ opacity: 0 }}
											animate={{ opacity: 1 }}
											exit={{ opacity: 0 }}
											transition={{ duration: 0.7 }}
											className='md:grid md:gap-4 md:grid-cols-2 max-w-full'
											style={{ gridTemplateColumns: '1fr 1fr' }}
										>
											{taskCard}
										</motion.div>
									) : (
										<motion.div
											key='list'
											initial={{ opacity: 0 }}
											animate={{ opacity: 1 }}
											exit={{ opacity: 0 }}
											transition={{ duration: 0.7 }}
											className='max-w-full'
										>
											{taskCard}
										</motion.div>
									)}
								</AnimatePresence>
							</div>
						</div>
					</div>
				</div>
				{showDeleteForm && (
					<DeleteConfirmation
						taskId={taskToDelete || 0}
						taskTitle={taskTitle}
						onConfirm={confirmDelete}
						onCancel={cancelDelete}
					/>
				)}
			</div>
		</div>
	)
}
export default EmployerProfile

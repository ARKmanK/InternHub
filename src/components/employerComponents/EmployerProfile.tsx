import { List, BookCopy, Undo2, LogOut } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import TaskCard from '@components/TaskCard'
import EmptyCard from '@components/EmptyCard'
import DeleteConfirmation from '@components/DeleteConfirmation'
import { setPage } from '@data/userData'
import { NavigateFunction } from 'react-router-dom'

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
	visibleTasks: TypeTask[]
	handleDelete: (id: number) => void
	showDeleteForm: boolean
	taskToDelete: number | null
	confirmDelete: () => void
	cancelDelete: () => void
	navigate: NavigateFunction
	handleLogout: () => void
	goBack: () => void // Исправляем тип
}

const EmployerProfile = ({
	listType,
	setListType,
	visibleTasks,
	handleDelete,
	showDeleteForm,
	taskToDelete,
	confirmDelete,
	cancelDelete,
	navigate,
	handleLogout,
	goBack,
}: EmployerProfileProps) => {
	const taskToDeleteData = visibleTasks.find(task => task.id === taskToDelete)
	const taskTitle = taskToDeleteData?.title || ''

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
					deadline={task.deadline}
					tags={task.tags ?? []}
					role='employer'
					onDelete={() => handleDelete(task.id)}
					showControls={true}
					onClick={() => {
						setPage(`/task/${task.id}`)
						navigate(`/task/${task.id}`)
					}}
				/>
			</motion.div>
		</AnimatePresence>
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
							{visibleTasks.length === 0 ? (
								<EmptyCard role='employer' listType='Мои задачи' />
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
					taskTitle={taskTitle}
					onConfirm={confirmDelete}
					onCancel={cancelDelete}
				/>
			)}
		</div>
	)
}

export default EmployerProfile

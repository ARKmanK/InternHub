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
	goBack: (navigate: NavigateFunction) => void
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
	// Находим taskTitle для текущей задачи, если она выбрана для удаления
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
					taskTitle={taskTitle} // Передаём taskTitle
					onConfirm={confirmDelete}
					onCancel={cancelDelete}
				/>
			)}
		</div>
	)
}

export default EmployerProfile

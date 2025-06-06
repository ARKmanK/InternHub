import { motion, AnimatePresence } from 'framer-motion'
import TaskCard from '@components/TaskCard'
import EmptyCard from '@components/EmptyCard'
import DeleteConfirmation from '@components/DeleteConfirmation'
import BackButton from '@UI/Buttons/BackButton'
import LogoutButton from '@UI/Buttons/LogoutButton'
import { NavigateFunction } from 'react-router-dom'
import { setPage } from '@data/userData'
import { memo } from 'react'
import { TypeTask } from '@/src/types/TypeTask'
import LoadingSpinner from '@UI/LoadingSpinner'

type EmployerProfileProps = {
	listType: 'list'
	tasks: TypeTask[]
	handleDelete: (id: number) => void
	showDeleteForm: boolean
	taskToDelete: number | null
	confirmDelete: () => void
	cancelDelete: () => void
	navigate: NavigateFunction
	handleLogout: () => void
	goBack: () => void
	isLoading: boolean
}

const EmployerProfile = memo(
	({
		listType,
		tasks,
		handleDelete,
		showDeleteForm,
		taskToDelete,
		confirmDelete,
		cancelDelete,
		navigate,
		handleLogout,
		goBack,
		isLoading,
	}: EmployerProfileProps) => {
		const handleDeleteTask = (id: number) => {
			handleDelete(id)
		}

		const taskToDeleteData = tasks.find(task => task.id === taskToDelete)
		const taskTitle = taskToDeleteData?.title || ''

		const taskCard = tasks.map(task => (
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
					onDelete={handleDeleteTask}
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
							<BackButton goBack={goBack} />
							<LogoutButton handleLogout={handleLogout} />
						</div>
						<div className='md:flex mt-7'>
							<div className='md:w-[80%]'>
								<h1 className='text-2xl font-bold mb-14'>Страница профиля</h1>
								<div className='md:mb-10'>
									<h2 className='text-xl font-semibold'>Мои задачи</h2>
								</div>
								<div className='overflow-y-auto'>
									<AnimatePresence mode='wait'>
										{isLoading ? (
											<LoadingSpinner key='spinner' />
										) : tasks.length === 0 ? (
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
					{showDeleteForm && taskToDelete !== null && (
						<DeleteConfirmation
							taskId={taskToDelete}
							taskTitle={taskTitle}
							onConfirm={confirmDelete}
							onCancel={cancelDelete}
						/>
					)}
				</div>
			</div>
		)
	}
)

export default EmployerProfile

import { AnimatePresence, motion } from 'framer-motion'
import TaskCard from '@components/TaskCard'
import { TypeTask } from '@/src/types/TypeTask'

type TypeTaskListProps = {
	visibleTasks: TypeTask[]
	listType: 'list' | 'card'
	role: 'user' | 'employer' | 'admin' | null
	favoriteTasks: number[]
	employerTaskIds: number[]
	addToFavorite: (id: number) => Promise<void>
	removeFromFavorite: (id: number) => Promise<void>
}

const TaskList = ({
	visibleTasks,
	listType,
	role,
	favoriteTasks,
	employerTaskIds,
	addToFavorite,
	removeFromFavorite,
}: TypeTaskListProps) => {
	const taskCard = visibleTasks.map((task, index) => (
		<AnimatePresence key={task.id.toString()}>
			<motion.div
				layout
				initial={{ opacity: 0, y: -20, scale: 0.9 }}
				animate={{ opacity: 1, y: 0, scale: 1 }}
				exit={{ opacity: 0, y: -20, scale: 0.9 }}
				transition={{
					duration: 0.5,
					type: 'spring',
					stiffness: 100,
					velocity: 4,
					damping: 20,
					delay: index * 0.1,
				}}
			>
				<TaskCard
					id={task.id}
					trackingNumber={task.tracking_number}
					title={task.title}
					description={task.description}
					difficulty={task.difficulty}
					companyName={task.company_name}
					type={listType}
					addToFavorite={addToFavorite}
					removeFromFavorite={removeFromFavorite}
					isFavorite={favoriteTasks.includes(task.id)}
					deadline={task.deadline}
					tags={task.tags || []}
					isMine={role === 'employer' && employerTaskIds.includes(task.id)}
					role={role}
					showControls={false}
				/>
			</motion.div>
		</AnimatePresence>
	))

	return listType === 'card' ? (
		<div className='md:grid md:gap-x-4 md:gap-y-4 md:grid-cols-2'>{taskCard}</div>
	) : (
		<>{taskCard}</>
	)
}

export default TaskList

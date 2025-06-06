import { memo } from 'react'
import TaskCard from '@components/TaskCard'
import { TypeTask } from '@/src/types/TypeTask'
import { motion } from 'framer-motion'

type TypeAddTaskPreviewProps = {
	previewTask: TypeTask | null
	role: string | null
}

const AddTaskPreview: React.FC<TypeAddTaskPreviewProps> = memo(({ previewTask, role }) => {
	return (
		<motion.div
			className='mt-10 max-w-[900px] m-auto bg-gradient-to-br from-blue-50 to-gray-300 rounded-xl shadow-xl p-4'
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0, y: 20 }}
		>
			<p className='font-medium text-lg text-gray-900 my-4'>Что получится</p>
			{previewTask && (
				<TaskCard
					id={previewTask.id}
					trackingNumber={previewTask.tracking_number}
					title={previewTask.title}
					description={previewTask.description}
					difficulty={previewTask.difficulty}
					companyName={previewTask.company_name}
					type='list'
					deadline={previewTask.deadline}
					tags={previewTask.tags ?? []}
					isFavorite={false}
					isMine={role === 'employer'}
				/>
			)}
		</motion.div>
	)
})

export default AddTaskPreview

import { memo, useMemo } from 'react'
import TaskCard from '@components/TaskCard'
import { TypeTask } from '@/src/types/TypeTask'
import { formatDate, truncateDescription } from '@data/formateDate'

type TypeTaskPreviewProps = {
	formData: {
		title: string
		description: string
		difficulty: number
		deadline: Date | null
		tags: string[]
	}
	taskData: TypeTask
	userId: number
	companyName: string
	role: 'user' | 'employer' | 'admin' | null
}

const TaskPreview: React.FC<TypeTaskPreviewProps> = memo(
	({ formData, taskData, userId, companyName, role }) => {
		const previewTask = useMemo(() => {
			const deadlineStr = formatDate(formData.deadline)
			const truncatedDescription = truncateDescription(formData.description)
			return {
				id: taskData.id,
				tracking_number: taskData.tracking_number,
				title: formData.title || 'Пример заголовка',
				description: truncatedDescription,
				difficulty: formData.difficulty || 1,
				company_name: companyName || 'Пример компании',
				deadline: deadlineStr || '2025-01-01',
				tags: formData.tags.length > 0 ? [...formData.tags] : [],
				employer_id: userId,
			}
		}, [formData, taskData, companyName, userId])

		return (
			<div className='mt-10'>
				<p className='font-medium text-lg mb-4 text-gray-700'>Что получится</p>
				<TaskCard
					id={previewTask.id}
					trackingNumber={previewTask.tracking_number}
					title={previewTask.title}
					description={previewTask.description}
					difficulty={previewTask.difficulty}
					companyName={previewTask.company_name}
					type='list'
					deadline={previewTask.deadline}
					tags={previewTask.tags}
					isFavorite={false}
					isMine={role === 'employer'}
					role={role}
					showControls={false}
				/>
			</div>
		)
	}
)

export default TaskPreview

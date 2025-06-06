import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppWindow } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAddTaskForm } from '@hooks/useAddTaskForm'
import AddTaskFormFields from './AddTaskFormFields'
import AddTaskFormTags from './AddTaskFormTags'
import AddTaskFormArchive from './AddTaskFormArchive'
import AddTaskPreview from './AddTaskPreview'
import Notification from '@UI/Notification/Notification'
import { TypeTask } from '@/src/types/TypeTask'
import { formatDate } from '@data/formateDate'

const AddTaskForm = () => {
	const navigate = useNavigate()
	const {
		title,
		description,
		difficulty,
		deadline,
		tags,
		newTag,
		companyName,
		commonTags,
		userTags,
		zipAdded,
		role,
		userId,
		MAX_TITLE_LENGTH,
		MAX_DESCRIPTION_LENGTH,
		MAX_TAG_LENGTH,
		notifications,
		handleTagChange,
		handleNewTagChange,
		addCustomTag,
		removeCustomTag,
		handleTitleChange,
		handleDescriptionChange,
		handleDifficultyChange,
		handleDeadlineChange,
		handleZipChange,
		handleSubmit,
	} = useAddTaskForm(navigate)

	const [previewTask, setPreviewTask] = useState<TypeTask | null>(null)

	useEffect(() => {
		const deadlineStr = formatDate(deadline)
		const tempTask: TypeTask = {
			id: 0,
			tracking_number: 0,
			title: title || 'Пример названия',
			description: description || 'Пример описания...',
			difficulty: difficulty || 1,
			company_name: companyName || 'Пример компании',
			deadline: deadlineStr || '2025-01-01',
			tags: tags.length > 0 ? tags : ['Тег 1', 'Тег 2'],
			employer_id: userId || 0,
		}
		setPreviewTask(tempTask)
	}, [title, description, difficulty, deadline, tags, companyName, userId])

	return (
		<>
			<motion.div
				className='mt-10 p-6 bg-gradient-to-br from-blue-50 to-gray-300 rounded-xl shadow-xl max-w-[800px] m-auto'
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				exit={{ opacity: 0, y: 20 }}
			>
				<div className='flex items-center mb-6'>
					<motion.div
						whileHover={{ scale: 1.1 }}
						className='p-1 bg-gradient-to-br from-blue-300 to-blue-500 rounded-full shadow-md'
					>
						<AppWindow className='w-9 h-6 text-gray-900' />
					</motion.div>
					<h2 className='ml-2 text-xl font-semibold text-gray-900'>Создание задачи</h2>
				</div>
				<form onSubmit={handleSubmit} className='space-y-6'>
					<AddTaskFormFields
						title={title}
						description={description}
						difficulty={difficulty}
						deadline={deadline}
						MAX_TITLE_LENGTH={MAX_TITLE_LENGTH}
						MAX_DESCRIPTION_LENGTH={MAX_DESCRIPTION_LENGTH}
						handleTitleChange={handleTitleChange}
						handleDescriptionChange={handleDescriptionChange}
						handleDifficultyChange={handleDifficultyChange}
						handleDeadlineChange={handleDeadlineChange}
					/>
					<AddTaskFormTags
						tags={tags}
						newTag={newTag}
						commonTags={commonTags}
						userTags={userTags}
						MAX_TAG_LENGTH={MAX_TAG_LENGTH}
						handleTagChange={handleTagChange}
						handleNewTagChange={handleNewTagChange}
						addCustomTag={addCustomTag}
						removeCustomTag={removeCustomTag}
					/>
					<AddTaskFormArchive zipAdded={zipAdded} handleZipChange={handleZipChange} />
					<div className='mt-6'>
						<motion.button
							whileHover={{ scale: 1.1 }}
							whileTap={{ scale: 0.9 }}
							type='submit'
							className='w-full py-2 text-white font-semibold bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg shadow-md hover:from-blue-500 hover:to-blue-700 transition-all'
						>
							Отправить на модерацию
						</motion.button>
					</div>
				</form>
			</motion.div>
			<AddTaskPreview previewTask={previewTask} role={role} />
			<Notification notifications={notifications} />
		</>
	)
}

export default AddTaskForm

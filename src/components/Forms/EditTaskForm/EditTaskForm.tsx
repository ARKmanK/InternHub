import { memo } from 'react'
import { TypeTask } from '@/src/types/TypeTask'
import { NavigateFunction } from 'react-router-dom'
import { QueryClient } from '@tanstack/react-query'
import { useTaskForm } from '@hooks/useEditTaskForm'
import { motion } from 'framer-motion'
import { deleteUserTag } from '@lib/API/supabase/tagsAPI'
import EditTaskFormFields from './EditTaskFormFields'
import EditTaskFormTags from './EditTaskFormTags'
import EditTaskFormArchive from './EditTaskFormArchive'
import TaskPreview from '../../TaskPreview'

type TypeEditTaskFormProps = {
	taskData: TypeTask
	userId: number
	role: 'user' | 'employer' | 'admin' | null
	companyName: string
	commonTags: string[]
	userTags: string[]
	setUserTags: React.Dispatch<React.SetStateAction<string[]>>
	queryClient: QueryClient
	navigate: NavigateFunction
}

const EditTaskForm: React.FC<TypeEditTaskFormProps> = memo(
	({
		taskData,
		userId,
		role,
		companyName,
		commonTags,
		userTags,
		setUserTags,
		queryClient,
		navigate,
	}) => {
		const {
			formData,
			newTag,
			zipAdded,
			MAX_TITLE_LENGTH,
			MAX_DESCRIPTION_LENGTH,
			MAX_TAG_LENGTH,
			textareaRef,
			handleTextChange,
			handleDifficultyChange,
			handleDeadlineChange,
			handleTagChange,
			handleNewTagChange,
			addCustomTag,
			handleZipChange,
			handleSubmit,
		} = useTaskForm({
			taskData,
			userId,
			companyName,
			commonTags,
			userTags,
			setUserTags,
			queryClient,
			navigate,
		})

		const removeCustomTag = async (tagToRemove: string) => {
			if (userTags.includes(tagToRemove)) {
				try {
					await deleteUserTag(userId, tagToRemove)
					handleTagChange(tagToRemove)
					setUserTags(userTags.filter(tag => tag !== tagToRemove))
				} catch (error: unknown) {
					const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка'
					console.error('Ошибка удаления тега:', errorMessage)
				}
			}
		}

		return (
			<>
				<div className='md:bg-gradient-to-br from-blue-100 to-blue-200 md:border-2 md:rounded-2xl md:p-6 shadow-lg'>
					<div className='md:flex md:flex-col'>
						<form className='flex flex-col gap-6' onSubmit={handleSubmit}>
							<EditTaskFormFields
								formData={formData}
								MAX_TITLE_LENGTH={MAX_TITLE_LENGTH}
								MAX_DESCRIPTION_LENGTH={MAX_DESCRIPTION_LENGTH}
								textareaRef={textareaRef}
								handleTextChange={handleTextChange}
								handleDifficultyChange={handleDifficultyChange}
								handleDeadlineChange={handleDeadlineChange}
							/>
							<EditTaskFormTags
								formData={formData}
								newTag={newTag}
								commonTags={commonTags}
								userTags={userTags}
								MAX_TAG_LENGTH={MAX_TAG_LENGTH}
								handleTagChange={handleTagChange}
								handleNewTagChange={handleNewTagChange}
								addCustomTag={addCustomTag}
								removeCustomTag={removeCustomTag}
							/>
							<EditTaskFormArchive zipAdded={zipAdded} handleZipChange={handleZipChange} />
							<div className='md:flex md:justify-center mt-1'>
								<motion.button
									whileHover={{ scale: 1.05 }}
									whileTap={{ scale: 0.95 }}
									type='submit'
									className='px-10 py-3 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg shadow-md hover:from-blue-600 hover:to-blue-700 transition-all text-lg'
								>
									Сохранить
								</motion.button>
							</div>
						</form>
					</div>
				</div>
				<TaskPreview
					formData={formData}
					taskData={taskData}
					userId={userId}
					companyName={companyName}
					role={role}
				/>
			</>
		)
	}
)

export default EditTaskForm

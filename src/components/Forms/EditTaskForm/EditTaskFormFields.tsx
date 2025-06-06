import { memo } from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

type TypeAddTaskFormFieldsProps = {
	formData: {
		title: string
		description: string
		difficulty: number
		deadline: Date | null
	}
	MAX_TITLE_LENGTH: number
	MAX_DESCRIPTION_LENGTH: number
	textareaRef: React.RefObject<HTMLTextAreaElement | null>
	handleTextChange: (field: 'title' | 'description', value: string) => void
	handleDifficultyChange: (value: number) => void
	handleDeadlineChange: (date: Date | null) => void
}

const EditTaskFormFields: React.FC<TypeAddTaskFormFieldsProps> = memo(
	({
		formData,
		MAX_TITLE_LENGTH,
		MAX_DESCRIPTION_LENGTH,
		textareaRef,
		handleTextChange,
		handleDifficultyChange,
		handleDeadlineChange,
	}) => {
		return (
			<>
				<div>
					<p className='text-lg font-medium text-gray-600 mb-2'>
						Заголовок (максимум {MAX_TITLE_LENGTH} символов)
					</p>
					<div className='flex items-center bg-white border border-gray-300 rounded-lg p-2 shadow-sm'>
						<input
							type='text'
							placeholder='Заголовок'
							value={formData.title}
							className='outline-0 w-full text-gray-800'
							onChange={e => handleTextChange('title', e.target.value)}
							autoFocus
							maxLength={MAX_TITLE_LENGTH}
						/>
					</div>
				</div>
				<div>
					<p className='text-lg font-medium text-gray-600 mb-2'>
						Описание задачи (максимум {MAX_DESCRIPTION_LENGTH} символов)
					</p>
					<textarea
						ref={textareaRef}
						className='w-full min-h-[183px] bg-white border border-gray-300 rounded-lg p-3 resize-y shadow-sm text-gray-800 outline-0'
						placeholder='...'
						value={formData.description}
						onChange={e => handleTextChange('description', e.target.value)}
						maxLength={MAX_DESCRIPTION_LENGTH}
					/>
				</div>
				<div>
					<p className='text-lg font-medium text-gray-600 mb-2'>Выберите сложность задачи</p>
					<select
						value={formData.difficulty}
						onChange={e => handleDifficultyChange(Number(e.target.value))}
						className='w-full bg-white border border-gray-300 rounded-lg p-2 shadow-sm text-lg text-gray-800 outline-0'
					>
						<option value={0} disabled>
							Выберите сложность
						</option>
						<option value={1}>1</option>
						<option value={2}>2</option>
						<option value={3}>3</option>
					</select>
				</div>
				<div>
					<p className='text-lg font-medium text-gray-600 mb-2'>Выберите дату сдачи</p>
					<DatePicker
						selected={formData.deadline}
						onChange={handleDeadlineChange}
						dateFormat='dd.MM.yyyy'
						className='w-full bg-white border border-gray-300 rounded-lg p-2 shadow-sm text-lg text-gray-800 pl-3 outline-0'
						placeholderText='Выберите дату'
					/>
				</div>
			</>
		)
	}
)

export default EditTaskFormFields

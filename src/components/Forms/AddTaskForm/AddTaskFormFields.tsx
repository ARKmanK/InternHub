import { memo } from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { AppWindow } from 'lucide-react'

type TypeAddTaskFormFieldsProps = {
	title: string
	description: string
	difficulty: number
	deadline: Date | null
	MAX_TITLE_LENGTH: number
	MAX_DESCRIPTION_LENGTH: number
	handleTitleChange: (e: React.ChangeEvent<HTMLInputElement>) => void
	handleDescriptionChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
	handleDifficultyChange: (value: number) => void
	handleDeadlineChange: (date: Date | null) => void
}

const AddTaskFormFields: React.FC<TypeAddTaskFormFieldsProps> = memo(
	({
		title,
		description,
		difficulty,
		deadline,
		MAX_TITLE_LENGTH,
		MAX_DESCRIPTION_LENGTH,
		handleTitleChange,
		handleDescriptionChange,
		handleDifficultyChange,
		handleDeadlineChange,
	}) => {
		return (
			<>
				<div>
					<label className='block text-sm font-medium text-gray-900'>
						Название (до {MAX_TITLE_LENGTH} символов)
					</label>
					<div className='mt-1 relative rounded-md shadow-sm'>
						<div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
							<AppWindow className='w-5 h-5 text-gray-500' />
						</div>
						<input
							type='text'
							placeholder='Название'
							value={title}
							className='block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-400 transition-all outline-none'
							onChange={handleTitleChange}
							autoFocus
							maxLength={MAX_TITLE_LENGTH}
						/>
					</div>
				</div>
				<div>
					<label className='block text-sm font-medium text-gray-900'>
						Описание (до {MAX_DESCRIPTION_LENGTH} символов)
					</label>
					<div className='mt-1 relative rounded-md shadow-sm'>
						<div className='absolute top-2 left-0 pl-3 flex items-start pointer-events-none'>
							<svg
								className='w-5 h-5 text-gray-500'
								fill='none'
								stroke='currentColor'
								viewBox='0 0 24 24'
							>
								<path
									strokeLinecap='round'
									strokeLinejoin='round'
									strokeWidth='2'
									d='M11 5H6a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z'
								/>
							</svg>
						</div>
						<textarea
							value={description}
							onChange={handleDescriptionChange}
							className='block w-full min-h-[70px] h-[150px] pl-10 pr-3 py-2 border border-gray-300 rounded-md text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-400 transition-all outline-none resize-y'
							placeholder='Опишите задачу...'
							rows={6}
							maxLength={MAX_DESCRIPTION_LENGTH}
						/>
					</div>
				</div>
				<div>
					<label className='block text-sm font-medium text-gray-900'>Сложность задачи</label>
					<div className='mt-1 relative rounded-md shadow-sm'>
						<div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
							<svg
								className='w-5 h-5 text-gray-500'
								fill='none'
								stroke='currentColor'
								viewBox='0 0 24 24'
							>
								<path
									strokeLinecap='round'
									strokeLinejoin='round'
									strokeWidth='2'
									d='M12 2l3.09 6.26L21 9.27l-5 4.87 1.18 6.88L12 17.77l-5.18 3.25L8 14.14 3 9.27l5.91-1.01L12 2z'
								/>
							</svg>
						</div>
						<select
							value={difficulty}
							onChange={e => handleDifficultyChange(Number(e.target.value))}
							className='block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-400 transition-all outline-none'
						>
							<option value={0} disabled>
								Выберите сложность
							</option>
							<option value={1}>1</option>
							<option value={2}>2</option>
							<option value={3}>3</option>
						</select>
					</div>
				</div>
				<div>
					<label className='block text-sm font-medium text-gray-900'>Дата сдачи</label>
					<div className='mt-1 flex items-center'>
						<div className='relative rounded-md shadow-sm'>
							<div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
								<svg
									className='w-5 h-5 text-gray-500'
									fill='none'
									stroke='currentColor'
									viewBox='0 0 24 24'
								>
									<path
										strokeLinecap='round'
										strokeLinejoin='round'
										strokeWidth='2'
										d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
									/>
								</svg>
							</div>
							<DatePicker
								selected={deadline}
								onChange={handleDeadlineChange}
								dateFormat='dd.MM.yyyy'
								className='pl-10 pr-3 py-2 border border-gray-300 rounded-md text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-400 transition-all outline-none'
								placeholderText='Выберите дату'
								wrapperClassName='w-[228px]'
							/>
						</div>
					</div>
				</div>
			</>
		)
	}
)

export default AddTaskFormFields

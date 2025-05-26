import { FormEvent, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppWindow, X } from 'lucide-react' // Добавлен X для кнопки удаления
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import useNotification from '@hooks/useNotification'
import Notification from '@components/UI/Notification/Notification'
import { addTask, TypeTasksData } from '../data/tasksData'
import { availableTags } from '../data/tags'
import { getRole } from '../data/userData'
import TaskCard from '@components/TaskCard'

const AddTaskForm = () => {
	const navigate = useNavigate()
	const [title, setTitle] = useState<string>('')
	const [description, setDescription] = useState<string>('')
	const [difficulty, setDifficulty] = useState<number>(0)
	const [deadline, setDeadline] = useState<Date | null>(null)
	const [tags, setTags] = useState<string[]>([])
	const [newTag, setNewTag] = useState<string>('')
	const { notifications, addNotification } = useNotification()

	const [previewTask, setPreviewTask] = useState<TypeTasksData | null>(null)
	const role = getRole()
	let companyName = ''
	if (role === 'employer') {
		const userData = JSON.parse(localStorage.getItem('userData') || '{}')
		companyName = userData.employer?.companyName
	}

	const MAX_TITLE_LENGTH = 50
	const MAX_DESCRIPTION_LENGTH = 250
	const MAX_TAG_LENGTH = 20
	const MAX_TAGS = 5

	useEffect(() => {
		const deadlineStr = formatDate(deadline)
		const tempTask: TypeTasksData = {
			id: 0,
			trackingNumber: 0,
			title: title || 'Пример названия',
			description: description || 'Пример описания...',
			difficulty: difficulty || 1,
			companyName: companyName || 'Пример компании',
			deadline: deadlineStr || '01.01.2025',
			tags: tags.length > 0 ? tags : ['Тег 1', 'Тег 2'],
		}
		setPreviewTask(tempTask)
	}, [title, description, difficulty, deadline, tags, companyName])

	const handleTagChange = (tag: string) => {
		if (tags.includes(tag)) {
			setTags(tags.filter(t => t !== tag))
		} else {
			if (tags.length >= MAX_TAGS) {
				addNotification('warning', 'Ошибка', `Нельзя выбрать больше ${MAX_TAGS} тегов`)
				return
			}
			setTags([...tags, tag])
		}
	}

	const handleNewTagChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value
		if (value.length <= MAX_TAG_LENGTH) {
			setNewTag(value)
		} else {
			addNotification('warning', 'Ошибка', `Тег не может превышать ${MAX_TAG_LENGTH} символов`)
		}
	}

	const addCustomTag = () => {
		const trimmedTag = newTag.trim()
		if (!trimmedTag) {
			addNotification('warning', 'Ошибка', 'Тег не может быть пустым')
			return
		}
		if (tags.includes(trimmedTag) || availableTags.includes(trimmedTag)) {
			addNotification('warning', 'Ошибка', 'Такой тег уже существует')
			return
		}
		if (tags.length >= MAX_TAGS) {
			addNotification('warning', 'Ошибка', `Нельзя добавить больше ${MAX_TAGS} тегов`)
			return
		}
		setTags([...tags, trimmedTag])
		setNewTag('')
	}

	const removeCustomTag = (tagToRemove: string) => {
		setTags(tags.filter(tag => tag !== tagToRemove))
	}

	const formatDate = (date: Date | null): string => {
		if (!date) return ''
		const day = String(date.getDate()).padStart(2, '0')
		const month = String(date.getMonth() + 1).padStart(2, '0')
		const year = date.getFullYear()
		return `${day}.${month}.${year}`
	}

	const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value
		if (value.length <= MAX_TITLE_LENGTH) {
			setTitle(value)
		} else {
			addNotification(
				'warning',
				'Ошибка',
				`Название не может превышать ${MAX_TITLE_LENGTH} символов`
			)
		}
	}

	const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		const value = e.target.value
		if (value.length <= MAX_DESCRIPTION_LENGTH) {
			setDescription(value)
		} else {
			addNotification(
				'warning',
				'Ошибка',
				`Описание не может превышать ${MAX_DESCRIPTION_LENGTH} символов`
			)
		}
	}

	const handleSubmit = (e: FormEvent) => {
		e.preventDefault()

		if (!title.trim()) {
			addNotification('warning', 'Ошибка', 'Название — обязательное поле')
			return
		}
		if (!description.trim()) {
			addNotification('warning', 'Ошибка', 'Описание — обязательное поле')
			return
		}
		if (!difficulty) {
			addNotification('warning', 'Ошибка', 'Сложность — обязательное поле')
			return
		}
		if (!deadline) {
			addNotification('warning', 'Ошибка', 'Дата — обязательное поле')
			return
		}
		if (!tags.length) {
			addNotification('warning', 'Ошибка', 'Теги — обязательное поле')
			return
		}

		const deadlineStr = formatDate(deadline)
		const newTask: Omit<TypeTasksData, 'id'> = {
			trackingNumber: 0,
			title,
			description,
			difficulty,
			companyName,
			deadline: deadlineStr,
			tags,
		}

		addTask(newTask)
		setTitle('')
		setDescription('')
		setDifficulty(0)
		setDeadline(null)
		setTags([])
		setNewTag('')
		navigate('/tasks')
	}

	return (
		<>
			<div className='md:mt-10 md:p-6 bg-white rounded-lg shadow-md max-w-[800px] m-auto'>
				<div className='flex items-center mb-4'>
					<svg
						className='w-6 h-6 mr-2 text-gray-500'
						fill='none'
						stroke='currentColor'
						viewBox='0 0 24 24'
					>
						<path
							strokeLinecap='round'
							strokeLinejoin='round'
							strokeWidth='2'
							d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h10a2 2 0 012 2v14a2 2 0 01-2 2z'
						/>
					</svg>
					<h2 className='text-xl font-semibold text-gray-700'>Создание задачи</h2>
				</div>
				<form onSubmit={handleSubmit} className='space-y-4'>
					<div>
						<label className='block text-sm font-medium text-gray-600'>
							Название (максимум {MAX_TITLE_LENGTH} символов)
						</label>
						<div className='mt-1 relative rounded-md shadow-sm'>
							<div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
								<AppWindow className='w-5 h-5 text-gray-400' />
							</div>
							<input
								type='text'
								placeholder='Название'
								value={title}
								className='block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
								onChange={handleTitleChange}
								autoFocus
								maxLength={MAX_TITLE_LENGTH}
							/>
						</div>
					</div>
					<div>
						<label className='block text-sm font-medium text-gray-600'>Описание</label>
						<div className='mt-1 relative rounded-md shadow-sm'>
							<div className='absolute top-2 left-0 pl-3 flex items-start pointer-events-none'>
								<svg
									className='w-5 h-5 text-gray-400'
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
								className='block w-full min-h-[70px] h-[150px] pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
								placeholder='Опишите задачу...'
								rows={6}
								maxLength={MAX_DESCRIPTION_LENGTH}
							/>
						</div>
					</div>
					<div>
						<label className='block text-sm font-medium text-gray-600'>Сложность задачи</label>
						<div className='mt-1 relative rounded-md shadow-sm'>
							<div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
								<svg
									className='w-5 h-5 text-gray-400'
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
								onChange={e => setDifficulty(Number(e.target.value))}
								className='block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
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
						<label className='block text-sm font-medium text-gray-600'>Дата сдачи</label>
						<div className='mt-1 relative rounded-md'>
							<div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
								<svg
									className='w-5 h-5 text-gray-400'
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
								onChange={(date: Date | null) => setDeadline(date)}
								dateFormat='dd.MM.yyyy'
								className='block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
								placeholderText='Выберите дату'
							/>
						</div>
					</div>
					<div>
						<label className='block text-sm font-medium text-gray-600'>Ключевые теги</label>
						<div className='mt-1 flex flex-wrap gap-3' style={{ margin: '-4px 0' }}>
							{availableTags.map(tag => (
								<label key={tag} className='inline-flex items-center'>
									<input
										type='checkbox'
										checked={tags.includes(tag)}
										onChange={() => handleTagChange(tag)}
										className='hidden'
									/>
									<span
										className={`px-3 py-1 rounded-full text-sm font-medium cursor-pointer transition-colors ${
											tags.includes(tag)
												? 'bg-blue-500 text-white'
												: 'bg-gray-200 text-gray-700 hover:bg-gray-300'
										}`}
										style={{ margin: '4px 0' }}
									>
										{tag}
									</span>
								</label>
							))}
							{tags
								.filter(tag => !availableTags.includes(tag))
								.map(tag => (
									<div key={tag} className='inline-flex items-center'>
										<span
											className='px-3 py-1 rounded-full text-sm font-medium bg-blue-500 text-white'
											style={{ margin: '4px 0' }}
										>
											{tag}
										</span>
										<button
											type='button'
											onClick={() => removeCustomTag(tag)}
											className='ml-2 text-red-500 hover:text-red-700'
										>
											<X size={16} />
										</button>
									</div>
								))}
						</div>
					</div>
					<div>
						<label className='block text-sm font-medium text-gray-600'>Создать новый тег</label>
						<div className='mt-1 flex items-center gap-2'>
							<input
								type='text'
								placeholder='Введите новый тег'
								value={newTag}
								className='block w-full pl-3 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
								onChange={handleNewTagChange}
								maxLength={MAX_TAG_LENGTH}
							/>
							<button
								type='button'
								onClick={addCustomTag}
								className='bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
							>
								Добавить
							</button>
						</div>
					</div>
					<div className='mt-4'>
						<button
							type='button'
							onClick={handleSubmit}
							className='w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
						>
							Создать
						</button>
					</div>
				</form>
			</div>
			<div className='md:mt-10 max-w-[900px] m-auto'>
				<p className='font-medium text-lg mb-4'>Что получится</p>
				{previewTask && (
					<TaskCard
						id={previewTask.id}
						trackingNumber={previewTask.trackingNumber}
						title={previewTask.title}
						description={previewTask.description}
						difficulty={previewTask.difficulty}
						companyName={previewTask.companyName}
						type='list'
						deadline={previewTask.deadline}
						tags={previewTask.tags}
						isFavorite={false}
						isMine={role === 'employer'}
					/>
				)}
			</div>
			<Notification notifications={notifications} />
		</>
	)
}

export default AddTaskForm

import { FormEvent, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppWindow } from 'lucide-react'
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
	const { notifications, addNotification } = useNotification()

	const [previewTask, setPreviewTask] = useState<TypeTasksData | null>(null)
	const role = getRole()
	let companyName = ''
	if (role === 'employer') {
		const userData = JSON.parse(localStorage.getItem('userData') || '{}')
		companyName = userData.user?.companyName || 'Неизвестная компания'
	}

	const MAX_TITLE_LENGTH = 50
	const MAX_DESCRIPTION_LENGTH = 250

	useEffect(() => {
		const deadlineStr = formatDate(deadline)
		const tempTask: TypeTasksData = {
			id: 0,
			trackingNumber: 0,
			title: title || 'Пример заголовка',
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
			setTags([...tags, tag])
		}
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
				`Заголовок не может превышать ${MAX_TITLE_LENGTH} символов`
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
			addNotification('warning', 'Ошибка', 'Заголовок — обязательное поле')
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
		navigate('/tasks')
	}

	return (
		<>
			<div className='md:bg-[#96bddd] md:border-2 md:rounded-2xl h-[655px] md:flex md:flex-col px-2'>
				<div className='md:flex md:flex-col mt-0.5 h-full'>
					<p className='font-medium text-lg mt-3 ml-2'>Создать карточку</p>
					<form className='px-2 mt-7 flex flex-col justify-between h-full' onSubmit={handleSubmit}>
						<div className='flex flex-col gap-4'>
							<div>
								<p>Заголовок (максимум {MAX_TITLE_LENGTH} символов)</p>
								<div className='md:flex border-1 max-w-[380px] md:rounded-lg'>
									<AppWindow className='m-1' size={26} />
									<input
										type='text'
										placeholder='title'
										value={title}
										className='outline-0 w-full text-lg'
										onChange={handleTitleChange}
										autoFocus
										maxLength={MAX_TITLE_LENGTH}
									/>
								</div>
							</div>
							<div>
								<label className='block text-sm font-medium text-gray-600'>Описание</label>
								<div className='mt-1 relative rounded-md shadow-sm'>
									<textarea
										className='block w-full pl-3 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
										placeholder='Опишите задачу...'
										rows={3}
									/>
								</div>
							</div>
							<div className='md:flex md:flex-col'>
								<span>Выберите сложность задачи</span>
								<select
									value={difficulty}
									onChange={e => setDifficulty(Number(e.target.value))}
									className='outline-0 text-lg w-[380px] border'
								>
									<option value={0} disabled>
										Выберите сложность
									</option>
									<option value={1}>1</option>
									<option value={2}>2</option>
									<option value={3}>3</option>
								</select>
							</div>
							<div className='md:flex md:flex-col'>
								<span>Выберите дату сдачи</span>
								<DatePicker
									selected={deadline}
									onChange={(date: Date | null) => setDeadline(date)}
									dateFormat='dd.MM.yyyy'
									className='outline-0 w-[380px] text-lg border pl-1'
									placeholderText='Выберите дату'
								/>
							</div>
							<div>
								<span>Выберите ключевые теги</span>
								<div className='flex flex-wrap gap-2 mt-2'>
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
											>
												{tag}
											</span>
										</label>
									))}
								</div>
							</div>
						</div>
						<div className='md:flex md:justify-center md:my-3'>
							<button
								type='submit'
								className='mt-4 px-4 py-2 bg-[#0c426f] text-white rounded-lg w-[250px]'
							>
								Создать
							</button>
						</div>
					</form>
				</div>
			</div>
			<div className='mt-10'>
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

import { FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppWindow } from 'lucide-react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import useNotification from '@hooks/useNotification'
import Notification from '@components/UI/Notification/Notification'
import { addTask, TypeTasksData } from '../data/tasksData'
import { availableTags } from '../data/tags'
import { getRole } from '../data/userData'

const AddTaskForm = () => {
	const navigate = useNavigate()
	const [title, setTitle] = useState<string>('')
	const [description, setDescription] = useState<string>('')
	const [difficulty, setDifficulty] = useState<number>(0)
	const [deadline, setDeadline] = useState<Date | null>(null)
	const [tags, setTags] = useState<string[]>([])
	const { notifications, addNotification } = useNotification()

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

		// Получаем companyName из userData, если роль — employer
		const role = getRole()
		let companyName = ''
		if (role === 'employer') {
			const userData = JSON.parse(localStorage.getItem('userData') || '{}')
			companyName = userData.users?.employer?.companyName || 'Неизвестная компания'
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

		// Используем addTask для добавления задачи (это также обновит userData для employer)
		addTask(newTask)

		// Очищаем форму
		setTitle('')
		setDescription('')
		setDifficulty(0)
		setDeadline(null)
		setTags([])

		// Перенаправляем на страницу задач
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
								<p>Заголовок</p>
								<div className='md:flex border-1 max-w-[380px] md:rounded-lg'>
									<AppWindow className='m-1' size={26} />
									<input
										type='text'
										placeholder='title'
										value={title}
										className='outline-0 w-full text-lg'
										onChange={e => setTitle(e.target.value)}
										autoFocus
									/>
								</div>
							</div>
							<div>
								<p>Описание задачи</p>
								<textarea
									className='h-[150px] w-[380px] border rounded-xl p-2 resize-none outline-0'
									placeholder='...'
									value={description}
									onChange={e => setDescription(e.target.value)}
								></textarea>
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
			<Notification notifications={notifications} />
		</>
	)
}

export default AddTaskForm

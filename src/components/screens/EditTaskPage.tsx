import Header from '@components/Header'
import NavBar from '@components/NavBar'
import { useNavigate, useParams } from 'react-router-dom'
import { Undo2, AppWindow } from 'lucide-react'
import { setPage, TypePages } from '@/src/data/userData'
import { useEffect, useState } from 'react'
import { TypeTasksData } from '@data/tasksData'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import useNotification from '@hooks/useNotification'
import Notification from '@components/UI/Notification/Notification'
import TaskCard from '@components/TaskCard'
import { availableTags } from '@/src/data/tags'

const EditTaskPage = () => {
	const { id } = useParams<{ id: string }>()
	const navigate = useNavigate()
	const { notifications, addNotification } = useNotification()
	const [taskData, setTaskData] = useState<TypeTasksData | null>(null)
	const [title, setTitle] = useState<string>('')
	const [description, setDescription] = useState<string>('')
	const [difficulty, setDifficulty] = useState<number>(0)
	const [deadline, setDeadline] = useState<Date | null>(null)
	const [tags, setTags] = useState<string[]>([])
	const [previewTask, setPreviewTask] = useState<TypeTasksData | null>(null)

	// Получаем имя компании из localStorage
	const role = JSON.parse(localStorage.getItem('userData') || '{}').role || 'employer'
	let companyName = ''
	if (role === 'employer') {
		const userData = JSON.parse(localStorage.getItem('userData') || '{}')
		companyName = userData.users?.employer?.companyName || 'Неизвестная'
	}

	// Загружаем данные задачи из localStorage
	useEffect(() => {
		setPage('/edit-task')
		if (id) {
			const tasks = JSON.parse(localStorage.getItem('tasks') || '[]')
			const task = tasks.find((task: TypeTasksData) => task.id === parseInt(id))
			if (task) {
				setTaskData(task)
				setTitle(task.title)
				setDescription(task.description)
				setDifficulty(task.difficulty)
				const [day, month, year] = task.deadline.split('.').map(Number)
				setDeadline(new Date(year, month - 1, day))
				setTags(task.tags)
			} else {
				navigate('/tasks')
			}
		}
	}, [id, navigate])

	// Обновляем предпросмотр задачи
	useEffect(() => {
		const deadlineStr = formatDate(deadline)
		const tempTask: TypeTasksData = {
			id: taskData?.id || 0,
			trackingNumber: taskData?.trackingNumber || 0,
			title: title || 'Пример заголовка',
			description: description || 'Пример описания...',
			difficulty: difficulty || 1,
			companyName: companyName || 'Пример компании',
			deadline: deadlineStr || '01.01.2025',
			tags: tags.length > 0 ? tags : ['Тег 1', 'Тег 2'],
		}
		setPreviewTask(tempTask)
	}, [title, description, difficulty, deadline, tags, companyName, taskData])

	const formatDate = (date: Date | null): string => {
		if (!date) return ''
		const day = String(date.getDate()).padStart(2, '0')
		const month = String(date.getMonth() + 1).padStart(2, '0')
		const year = date.getFullYear()
		return `${day}.${month}.${year}`
	}

	const handleTagChange = (tag: string) => {
		if (tags.includes(tag)) {
			setTags(tags.filter(t => t !== tag))
		} else {
			setTags([...tags, tag])
		}
	}

	const handleSubmit = (e: React.FormEvent) => {
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
		const updatedTask: TypeTasksData = {
			id: taskData?.id || 0,
			trackingNumber: taskData?.trackingNumber || 0,
			title,
			description,
			difficulty,
			companyName,
			deadline: deadlineStr,
			tags,
		}

		// Обновляем задачу в localStorage
		const tasks = JSON.parse(localStorage.getItem('tasks') || '[]')
		const updatedTasks = tasks.map((task: TypeTasksData) =>
			task.id === updatedTask.id ? updatedTask : task
		)
		localStorage.setItem('tasks', JSON.stringify(updatedTasks))

		addNotification('success', 'Успешно', 'Задача обновлена')
		navigate('/tasks')
	}

	const goBack = () => {
		const data = localStorage.getItem('prevPage')
		let prevPage = '/tasks'
		if (data) {
			const parsedData: TypePages = JSON.parse(data)
			prevPage = parsedData.prevPage || '/tasks'
		}
		navigate(prevPage)
	}

	if (!taskData) {
		return <div>Loading...</div>
	}

	return (
		<>
			<Header />
			<NavBar />
			<div className='md:flex md:justify-center md:py-[20px] md:px-[10px]'>
				<div className='md:min-h-[1200px] md:w-[980px]'>
					<div className='md:flex md:flex-col'>
						<div className='md:py-4 md:flex md:justify-end items-center'>
							<button
								className='md:p-1 hover:bg-gray-300'
								onClick={goBack}
								aria-label='Вернуться к задачам'
							>
								<Undo2 size={30} />
							</button>
						</div>
						<div className='md:flex mt-7'>
							<div className='md:w-[80%]'>
								<h1 className='text-2xl font-bold mb-14'>Редактирование задачи</h1>
								<div className='md:bg-[#96bddd] md:border-2 md:rounded-2xl h-[655px] md:flex md:flex-col px-2'>
									<div className='md:flex md:flex-col mt-0.5 h-full'>
										<p className='font-medium text-lg mt-3 ml-2'>Редактировать карточку</p>
										<form
											className='px-2 mt-7 flex flex-col justify-between h-full'
											onSubmit={handleSubmit}
										>
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
														{availableTags.map((tag: string) => (
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
													Сохранить
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
							</div>
						</div>
					</div>
				</div>
			</div>
			<Notification notifications={notifications} />
		</>
	)
}

export default EditTaskPage

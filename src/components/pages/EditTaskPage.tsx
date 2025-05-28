import Header from '@components/Header'
import NavBar from '@components/NavBar'
import { useNavigate, useParams } from 'react-router-dom'
import { Undo2, AppWindow, X } from 'lucide-react'
import { setPage, TypePages } from '@/src/data/userData'
import { useEffect, useState } from 'react'
import { TypeTask } from '@/src/types/TypeTask'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import useNotification from '@hooks/useNotification'
import Notification from '@components/UI/Notification/Notification'
import TaskCard from '@components/TaskCard'
import { supabase } from '@/supabaseClient'
import {
	getTaskById,
	updateTask,
	getUserByEmail,
	getAllTags,
	getUserTags,
} from '@/src/lib/API/supabaseAPI'

const EditTaskPage = () => {
	const { id } = useParams<{ id: string }>()
	const navigate = useNavigate()
	const { notifications, addNotification } = useNotification()
	const [taskData, setTaskData] = useState<TypeTask | null>(null)
	const [title, setTitle] = useState<string>('')
	const [description, setDescription] = useState<string>('')
	const [difficulty, setDifficulty] = useState<number>(0)
	const [deadline, setDeadline] = useState<Date | null>(null)
	const [tags, setTags] = useState<string[]>([])
	const [newTag, setNewTag] = useState<string>('')
	const [previewTask, setPreviewTask] = useState<TypeTask | null>(null)
	const [role, setRole] = useState<'user' | 'employer' | null>(null)
	const [companyName, setCompanyName] = useState<string>('')
	const [userId, setUserId] = useState<number | null>(null)
	const [commonTags, setCommonTags] = useState<string[]>([])
	const [userTags, setUserTags] = useState<string[]>([])

	const MAX_TITLE_LENGTH = 50
	const MAX_DESCRIPTION_LENGTH = 250
	const MAX_TAG_LENGTH = 20
	const MAX_TAGS = 5

	useEffect(() => {
		setPage('/edit-task')
		const fetchData = async () => {
			try {
				const {
					data: { session },
				} = await supabase.auth.getSession()
				if (!session?.user) {
					addNotification('error', 'Ошибка', 'Пользователь не авторизован')
					navigate('/login')
					return
				}

				const user = await getUserByEmail(session.user.email!)
				if (!user) {
					addNotification('error', 'Ошибка', 'Пользователь не найден')
					navigate('/login')
					return
				}
				setRole(user.role)
				setUserId(user.id)
				setCompanyName(user.company_name || 'Неизвестная компания')

				if (id && user.id) {
					const taskId = parseInt(id)
					const task = await getTaskById(taskId)
					if (!task) {
						addNotification('error', 'Ошибка', 'Задача не найдена')
						navigate('/tasks')
						return
					}

					// Проверяем, что задача принадлежит текущему пользователю
					if (task.employer_id !== user.id) {
						addNotification('error', 'Ошибка', 'У вас нет доступа к редактированию этой задачи')
						navigate('/tasks')
						return
					}

					setTaskData(task)
					setTitle(task.title)
					setDescription(task.description)
					setDifficulty(task.difficulty)
					setDeadline(task.deadline ? new Date(task.deadline) : null)
					setTags(task.tags || [])

					// Загружаем общие теги
					const commonTagsData = await getAllTags()
					setCommonTags(commonTagsData.map(tag => tag.name))

					// Загружаем кастомные теги пользователя
					const userTagsData = await getUserTags(user.id)
					setUserTags(userTagsData.map(tag => tag.name))
				}
			} catch (error: any) {
				addNotification('error', 'Ошибка', error.message)
				navigate('/tasks')
			}
		}
		fetchData()
	}, [id, navigate, addNotification])

	useEffect(() => {
		const deadlineStr = formatDate(deadline)
		const tempTask: TypeTask = {
			id: taskData?.id || 0,
			tracking_number: taskData?.tracking_number || 0,
			title: title || 'Пример заголовка',
			description: description || 'Пример описания...',
			difficulty: difficulty || 1,
			company_name: companyName || 'Пример компании',
			deadline: deadlineStr || '2025-01-01',
			tags: tags.length > 0 ? tags : [],
			employer_id: userId || 0,
		}
		setPreviewTask(tempTask)
	}, [title, description, difficulty, deadline, tags, companyName, taskData, userId])

	const formatDate = (date: Date | null): string => {
		if (!date) return ''
		const year = date.getFullYear()
		const month = String(date.getMonth() + 1).padStart(2, '0')
		const day = String(date.getDate()).padStart(2, '0')
		return `${year}-${month}-${day}` // Формат YYYY-MM-DD
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
		if (
			tags.includes(trimmedTag) ||
			commonTags.includes(trimmedTag) ||
			userTags.includes(trimmedTag)
		) {
			addNotification('warning', 'Ошибка', 'Такой тег уже существует')
			return
		}
		if (tags.length >= MAX_TAGS) {
			addNotification('warning', 'Ошибка', `Нельзя добавить больше ${MAX_TAGS} тегов`)
			return
		}
		setTags([...tags, trimmedTag])
		setUserTags([...userTags, trimmedTag])
		setNewTag('')
	}

	const removeCustomTag = (tagToRemove: string) => {
		setTags(tags.filter(tag => tag !== tagToRemove))
		setUserTags(userTags.filter(tag => tag !== tagToRemove))
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()

		if (!title.trim()) {
			addNotification('error', 'Ошибка', 'Заголовок — обязательное поле')
			return
		}
		if (!description.trim()) {
			addNotification('error', 'Ошибка', 'Описание — обязательное поле')
			return
		}
		if (!difficulty) {
			addNotification('error', 'Ошибка', 'Сложность — обязательное поле')
			return
		}
		if (!deadline) {
			addNotification('error', 'Ошибка', 'Дата — обязательное поле')
			return
		}
		if (!tags.length) {
			addNotification('error', 'Ошибка', 'Теги — обязательное поле')
			return
		}
		if (!userId) {
			addNotification('error', 'Ошибка', 'Пользователь не авторизован')
			return
		}

		const deadlineStr = formatDate(deadline)
		const updatedTask: TypeTask = {
			id: taskData?.id || 0,
			tracking_number: taskData?.tracking_number || 0,
			title,
			description,
			difficulty,
			company_name: companyName,
			deadline: deadlineStr,
			tags,
			employer_id: userId,
		}

		try {
			await updateTask(updatedTask, userId)
			addNotification('success', 'Успешно', 'Задача обновлена')
			navigate(`/task/${taskData?.id}`)
		} catch (error: any) {
			addNotification('error', 'Ошибка', error.message)
		}
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
		return <div>Загрузка...</div>
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
								<div className='md:bg-[#96bddd] md:border-2 md:rounded-2xl h-[755px] md:flex md:flex-col px-2'>
									<div className='md:flex md:flex-col mt-0.5 h-full'>
										<p className='font-medium text-lg mt-3 ml-2'>Редактировать карточку</p>
										<form
											className='px-2 mt-7 flex flex-col justify-between h-full'
											onSubmit={handleSubmit}
										>
											<div className='flex flex-col gap-4'>
												<div>
													<p>Заголовок (максимум {MAX_TITLE_LENGTH} символов)</p>
													<div className='md:flex border-1 max-w-[380px] md:rounded-lg'>
														<AppWindow className='m-1' size={26} />
														<input
															type='text'
															placeholder='Заголовок'
															value={title}
															className='outline-0 w-full text-lg'
															onChange={handleTitleChange}
															autoFocus
															maxLength={MAX_TITLE_LENGTH}
														/>
													</div>
												</div>
												<div>
													<p>Описание задачи (максимум {MAX_DESCRIPTION_LENGTH} символов)</p>
													<textarea
														className='h-[150px] w-[380px] border rounded-xl p-2 resize-none outline-0'
														placeholder='...'
														value={description}
														onChange={handleDescriptionChange}
														maxLength={MAX_DESCRIPTION_LENGTH}
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
														{commonTags.map((tag: string) => (
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
														{userTags.map((tag: string) => (
															<div key={tag} className='inline-flex items-center'>
																<label className='inline-flex items-center'>
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
													<span>Создать новый тег</span>
													<div className='mt-1 flex items-center gap-2'>
														<input
															type='text'
															placeholder='Введите новый тег'
															value={newTag}
															className='block w-[380px] pl-3 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
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
											role={role}
											showControls={false}
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

import Header from '@components/Header'
import NavBar from '@components/NavBar'
import { useNavigate, useParams } from 'react-router-dom'
import { Undo2, AppWindow, X, FileArchive, Check } from 'lucide-react'
import { setPage, goBack } from '@/src/data/userData'
import { useEffect, useState, useMemo, useRef } from 'react'
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
	deleteUserTag,
} from '@/src/lib/API/supabaseAPI'
import Message from '../Message'
import { motion } from 'framer-motion'
import LoadingAnimation from '../LoadingAnimation'
import { useQueryClient } from '@tanstack/react-query'

const EditTaskPage = () => {
	const { id } = useParams<{ id: string }>()
	const navigate = useNavigate()
	const queryClient = useQueryClient()
	const { notifications, addNotification } = useNotification()

	const [taskData, setTaskData] = useState<TypeTask | null>(null)
	const [formData, setFormData] = useState<{
		title: string
		description: string
		difficulty: number
		deadline: Date | null
		tags: string[]
	}>({
		title: '',
		description: '',
		difficulty: 0,
		deadline: null,
		tags: [],
	})
	const [newTag, setNewTag] = useState('')
	const [role, setRole] = useState<'user' | 'employer' | 'admin' | null>(null)
	const [companyName, setCompanyName] = useState('')
	const [userId, setUserId] = useState<number | null>(null)
	const [commonTags, setCommonTags] = useState<string[]>([])
	const [userTags, setUserTags] = useState<string[]>([])
	const [zipFile, setZipFile] = useState<File | null>(null)
	const [zipAdded, setZipAdded] = useState<boolean>(false)
	const [isInitialLoad, setIsInitialLoad] = useState(true) // Флаг для контроля первого монтирования

	const MAX_TITLE_LENGTH = 50
	const MAX_DESCRIPTION_LENGTH = 3000
	const MAX_TAG_LENGTH = 20
	const MAX_TAGS = 5

	const textareaRef = useRef<HTMLTextAreaElement>(null)

	const handleGoBack = goBack(navigate)

	useEffect(() => {
		// Вызываем setPage только при первом монтировании, а не при каждом рендере
		if (isInitialLoad && id) {
			setPage(`/edit-task/${id}`)
			setIsInitialLoad(false) // Сбрасываем флаг после первого вызова
		}

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

					if (task.employer_id !== user.id) {
						addNotification('error', 'Ошибка', 'У вас нет доступа к редактированию этой задачи')
						navigate('/tasks')
						return
					}

					setTaskData(task)
					setFormData({
						title: task.title,
						description: task.description,
						difficulty: task.difficulty,
						deadline: task.deadline ? new Date(task.deadline) : null,
						tags: task.tags || [],
					})
					setZipAdded(!!task.zip_file_url)

					const commonTagsData = await getAllTags()
					setCommonTags(commonTagsData.map(tag => tag.name))

					const userTagsData = await getUserTags(user.id)
					setUserTags(userTagsData)
				}
			} catch (error: any) {
				addNotification('error', 'Ошибка', error.message)
				navigate('/tasks')
			}
		}
		fetchData()
	}, [id, navigate, isInitialLoad])

	useEffect(() => {
		const textarea = textareaRef.current
		if (textarea) {
			textarea.style.height = 'auto'
			textarea.style.height = `${textarea.scrollHeight}px`
		}
	}, [formData.description])

	const formatDate = (date: Date | null): string => {
		if (!date) return ''
		const year = date.getFullYear()
		const month = String(date.getMonth() + 1).padStart(2, '0')
		const day = String(date.getDate()).padStart(2, '0')
		return `${year}-${month}-${day}`
	}

	const previewTask = useMemo(() => {
		const deadlineStr = formatDate(formData.deadline)
		const truncatedDescription =
			formData.description.length > 300
				? formData.description.slice(0, 300) + '...'
				: formData.description
		return {
			id: taskData?.id || 0,
			tracking_number: taskData?.tracking_number || 0,
			title: formData.title || 'Пример заголовка',
			description: truncatedDescription,
			difficulty: formData.difficulty || 1,
			company_name: companyName || 'Пример компании',
			deadline: deadlineStr || '2025-01-01',
			tags: formData.tags.length > 0 ? [...formData.tags] : [],
			employer_id: userId || 0,
		}
	}, [formData, companyName, userId, taskData])

	const handleFormChange = (field: keyof typeof formData, value: any) => {
		setFormData(prev => ({ ...prev, [field]: value }))
	}

	const handleTextChange = (field: 'title' | 'description', value: string) => {
		const maxLength = field === 'title' ? MAX_TITLE_LENGTH : MAX_DESCRIPTION_LENGTH
		if (value.length <= maxLength) {
			handleFormChange(field, value)
		} else {
			addNotification('warning', 'Ошибка', `Поле не может превышать ${maxLength} символов`)
		}
	}

	const handleDifficultyChange = (value: number) => {
		handleFormChange('difficulty', value)
	}

	const handleDeadlineChange = (date: Date | null) => {
		handleFormChange('deadline', date)
	}

	const handleTagChange = (tag: string) => {
		const newTags = formData.tags.includes(tag)
			? formData.tags.filter(t => t !== tag)
			: [...formData.tags, tag]
		if (newTags.length <= MAX_TAGS) {
			handleFormChange('tags', newTags)
		} else {
			addNotification('warning', 'Ошибка', `Нельзя выбрать больше ${MAX_TAGS} тегов`)
		}
	}

	const handleNewTagChange = (value: string) => {
		if (value.length <= MAX_TAG_LENGTH) {
			setNewTag(value)
		} else {
			addNotification('warning', 'Ошибка', `Тег не может превышать ${MAX_TAG_LENGTH} символов`)
		}
	}

	const addCustomTag = async () => {
		const trimmedTag = newTag.trim()
		if (!trimmedTag) {
			addNotification('warning', 'Ошибка', 'Тег не может быть пустым')
			return
		}
		if (
			formData.tags.includes(trimmedTag) ||
			commonTags.includes(trimmedTag) ||
			userTags.includes(trimmedTag)
		) {
			addNotification('warning', 'Ошибка', 'Такой тег уже существует')
			return
		}
		if (formData.tags.length >= MAX_TAGS) {
			addNotification('warning', 'Ошибка', `Нельзя добавить больше ${MAX_TAGS} тегов`)
			return
		}

		if (userId) {
			try {
				await supabase.from('user_tags').insert({ user_id: userId, name: trimmedTag })
				handleFormChange('tags', [...formData.tags, trimmedTag])
				setUserTags([...userTags, trimmedTag])
				setNewTag('')
			} catch (error: any) {
				addNotification('error', 'Ошибка', error.message)
			}
		}
	}

	const removeCustomTag = async (tagToRemove: string) => {
		if (userId && userTags.includes(tagToRemove)) {
			try {
				await deleteUserTag(userId, tagToRemove)
				handleFormChange(
					'tags',
					formData.tags.filter(tag => tag !== tagToRemove)
				)
				setUserTags(userTags.filter(tag => tag !== tagToRemove))
			} catch (error: any) {
				addNotification('error', 'Ошибка', error.message)
			}
		}
	}

	const handleZipChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0]
		if (file) {
			const validTypes = ['.zip', '.rar', '.7z', '.tar', '.gz']
			const fileExt = `.${file.name.split('.').pop()?.toLowerCase()}`
			if (!validTypes.includes(fileExt)) {
				addNotification(
					'warning',
					'Ошибка',
					'Поддерживаются только архивы (.zip, .rar, .7z, .tar, .gz)'
				)
				return
			}
			if (file.size > 10 * 1024 * 1024) {
				addNotification('warning', 'Ошибка', 'Размер архива не должен превышать 10MB')
				return
			}
			setZipFile(file)
			setZipAdded(true)
		}
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()

		if (!formData.title.trim()) {
			addNotification('error', 'Ошибка', 'Заголовок — обязательное поле')
			return
		}
		if (!formData.description.trim()) {
			addNotification('error', 'Ошибка', 'Описание — обязательное поле')
			return
		}
		if (!formData.difficulty) {
			addNotification('error', 'Ошибка', 'Сложность — обязательное поле')
			return
		}
		if (!formData.deadline) {
			addNotification('error', 'Ошибка', 'Дата — обязательное поле')
			return
		}
		if (!formData.tags.length) {
			addNotification('error', 'Ошибка', 'Теги — обязательное поле')
			return
		}
		if (!userId) {
			addNotification('error', 'Ошибка', 'Пользователь не авторизован')
			return
		}

		const deadlineStr = formatDate(formData.deadline)
		let zipFileUrl: string | null = taskData?.zip_file_url || null

		if (zipFile) {
			try {
				if (taskData?.zip_file_url) {
					const oldFilePath = taskData.zip_file_url.split('/').pop()
					if (oldFilePath) {
						const { error: deleteError } = await supabase.storage
							.from('task-files')
							.remove([`tasks_files/${oldFilePath}`])
						if (deleteError) {
							addNotification(
								'error',
								'Ошибка',
								`Не удалось удалить старый архив: ${deleteError.message}`
							)
							return
						}
					}
				}

				const fileExt = zipFile.name.split('.').pop()?.toLowerCase() || 'zip'
				const baseName = formData.title
					.toLowerCase()
					.replace(/[^a-z0-9]/g, '-')
					.substring(0, 20)
				const fileName = `${Date.now()}_${userId}_${baseName}.${fileExt}`
				const filePath = `tasks_files/${fileName}`

				const { error: uploadError } = await supabase.storage
					.from('task-files')
					.upload(filePath, zipFile, {
						cacheControl: '3600',
						upsert: false,
					})

				if (uploadError) {
					addNotification('error', 'Ошибка', `Не удалось загрузить архив: ${uploadError.message}`)
					return
				}

				const { data: publicUrlData } = supabase.storage.from('task-files').getPublicUrl(filePath)
				zipFileUrl = publicUrlData.publicUrl
			} catch (error: any) {
				addNotification('error', 'Ошибка', `Не удалось загрузить архив: ${error.message}`)
				return
			}
		}

		const updatedTask: TypeTask = {
			id: taskData?.id || 0,
			tracking_number: taskData?.tracking_number || 0,
			title: formData.title,
			description: formData.description,
			difficulty: formData.difficulty,
			company_name: companyName,
			deadline: deadlineStr,
			tags: formData.tags,
			employer_id: userId,
			zip_file_url: zipFileUrl,
		}

		try {
			await updateTask(updatedTask, userId)
			queryClient.invalidateQueries({ queryKey: ['allTasks'] })
			addNotification('success', 'Успешно', 'Задача обновлена')
			// Не вызываем setPage при программном переходе
			navigate('/user')
		} catch (error: any) {
			addNotification('error', 'Ошибка', error.message)
		}
	}

	if (!taskData) return <LoadingAnimation loading={true} />

	return (
		<>
			<Header />
			<NavBar />
			<div className='md:flex md:justify-center md:py-[20px] md:px-[10px]'>
				<div className='md:min-h-[900px] md:w-[980px]'>
					<div className='md:flex md:flex-col'>
						<div className='md:py-4 md:flex md:justify-end items-center'>
							<motion.button
								whileHover={{ scale: 1.1 }}
								whileTap={{ scale: 0.9 }}
								className='p-2 bg-gradient-to-br from-blue-200 to-blue-400 text-gray-800 rounded-lg shadow-md hover:from-blue-300 hover:to-blue-500 transition-all flex items-center space-x-2'
								onClick={handleGoBack}
								aria-label='Вернуться назад'
							>
								<Undo2 size={24} />
								<span className='text-sm font-semibold'>Назад</span>
							</motion.button>
						</div>
						<div className='md:flex mt-7'>
							<div className='md:w-[80%]'>
								<h1 className='text-2xl font-bold mb-14 text-gray-800'>Редактирование задачи</h1>
								<div className='md:bg-gradient-to-br from-blue-100 to-blue-200 md:border-2 md:rounded-2xl md:p-6 shadow-lg'>
									<div className='md:flex md:flex-col'>
										<form className='flex flex-col gap-6' onSubmit={handleSubmit}>
											<div>
												<p className='text-lg font-medium text-gray-600 mb-2'>
													Заголовок (максимум {MAX_TITLE_LENGTH} символов)
												</p>
												<div className='flex items-center bg-white border border-gray-300 rounded-lg p-2 shadow-sm'>
													<AppWindow className='text-gray-500 mr-2' size={20} />
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
													className='w-full min-h-[150px] bg-white border border-gray-300 rounded-lg p-3 resize-y shadow-sm text-gray-800 outline-0'
													placeholder='...'
													value={formData.description}
													onChange={e => handleTextChange('description', e.target.value)}
													maxLength={MAX_DESCRIPTION_LENGTH}
												/>
											</div>
											<div>
												<p className='text-lg font-medium text-gray-600 mb-2'>
													Выберите сложность задачи
												</p>
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
												<p className='text-lg font-medium text-gray-600 mb-2'>
													Выберите дату сдачи
												</p>
												<DatePicker
													selected={formData.deadline}
													onChange={handleDeadlineChange}
													dateFormat='dd.MM.yyyy'
													className='w-full bg-white border border-gray-300 rounded-lg p-2 shadow-sm text-lg text-gray-800 pl-3 outline-0'
													placeholderText='Выберите дату'
												/>
											</div>
											<div>
												<p className='text-lg font-medium text-gray-600 mb-2'>
													Выберите ключевые теги
												</p>
												<div className='flex flex-wrap gap-2'>
													{commonTags.map(tag => (
														<label key={tag} className='inline-flex items-center'>
															<input
																type='checkbox'
																checked={formData.tags.includes(tag)}
																onChange={() => handleTagChange(tag)}
																className='hidden'
															/>
															<span
																className={`px-3.5 py-1.5 rounded-full text-sm font-medium cursor-pointer transition-colors ${
																	formData.tags.includes(tag)
																		? 'bg-blue-500 text-white'
																		: 'bg-gray-200 text-gray-700 hover:bg-gray-300'
																}`}
															>
																{tag}
															</span>
														</label>
													))}
													{userTags.map(tag => (
														<div key={tag} className='inline-flex items-center'>
															<label className='inline-flex items-center'>
																<input
																	type='checkbox'
																	checked={formData.tags.includes(tag)}
																	onChange={() => handleTagChange(tag)}
																	className='hidden'
																/>
																<span
																	className={`px-3.5 py-1.5 rounded-full text-sm font-medium cursor-pointer transition-colors ${
																		formData.tags.includes(tag)
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
												<p className='text-lg font-medium text-gray-600 mb-2'>Создать новый тег</p>
												<div className='flex items-center gap-2'>
													<input
														type='text'
														placeholder='Введите новый теg'
														value={newTag}
														className='block w-full pl-3 pr-3 py-2 border border-gray-300 rounded-lg shadow-sm text-gray-800 leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
														onChange={e => handleNewTagChange(e.target.value)}
														maxLength={MAX_TAG_LENGTH}
													/>
													<motion.button
														whileHover={{ scale: 1.05 }}
														whileTap={{ scale: 0.95 }}
														type='button'
														onClick={addCustomTag}
														className='bg-gradient-to-br from-blue-500 to-blue-600 text-white py-2 px-4 rounded-lg shadow-md hover:from-blue-600 hover:to-blue-700 transition-all'
													>
														Добавить
													</motion.button>
												</div>
											</div>
											<div className='flex flex-col'>
												<p className='mt-4 text-lg font-medium text-gray-600'>
													Дополнительные материалы (архив) (опционально)
												</p>
												<div className='flex items-center'>
													{zipAdded ? (
														<div className='flex items-center justify-between w-[250px] mt-3'>
															<span className='py-2 px-3 text-gray-900 flex items-center'>
																<FileArchive className='mr-2' size={35} />
																<span className='text-sm font-medium'>Архив загружен</span>
																<motion.div
																	whileHover={{ scale: 1.1 }}
																	className='flex items-center ml-3'
																>
																	<Check size={24} className='text-green-600' />
																</motion.div>
															</span>
															<motion.label
																whileHover={{ scale: 1.05 }}
																whileTap={{ scale: 0.95 }}
																className='py-2 px-3 border border-gray-400 rounded-md bg-gradient-to-br from-blue-300 to-blue-500 text-gray-900 cursor-pointer flex items-center hover:from-blue-400 hover:to-blue-600 transition-all shadow-md'
															>
																<span className='text-sm font-medium'>Заменить</span>
																<input
																	type='file'
																	accept='.zip,.rar,.7z,.tar,.gz'
																	className='hidden'
																	onChange={handleZipChange}
																/>
															</motion.label>
														</div>
													) : (
														<motion.label
															whileHover={{ scale: 1.05 }}
															whileTap={{ scale: 0.95 }}
															className='py-2 px-3 border border-gray-400 rounded-md bg-gradient-to-br from-blue-300 to-blue-500 text-gray-900 cursor-pointer flex items-center w-[180px] hover:from-blue-400 hover:to-blue-600 transition-all shadow-md'
														>
															<FileArchive className='mr-2' size={20} />
															<span className='text-sm font-medium'>Выбрать архив</span>
															<input
																type='file'
																accept='.zip,.rar,.7z,.tar,.gz'
																className='hidden'
																onChange={handleZipChange}
															/>
														</motion.label>
													)}
												</div>
											</div>
											<div className='md:flex md:justify-center mt-6'>
												<motion.button
													whileHover={{ scale: 1.05 }}
													whileTap={{ scale: 0.95 }}
													type='submit'
													className='px-6 py-3 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg shadow-md hover:from-blue-600 hover:to-blue-700 transition-all text-lg'
												>
													Сохранить
												</motion.button>
											</div>
										</form>
									</div>
								</div>
								<div className='mt-10'>
									<p className='font-medium text-lg mb-4 text-gray-700'>Что получится</p>
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
											tags={previewTask.tags}
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
			<Message />
		</>
	)
}

export default EditTaskPage

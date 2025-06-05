import { FormEvent, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppWindow, X, FileArchive, Check } from 'lucide-react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import useNotification from '@hooks/useNotification'
import Notification from '@components/UI/Notification/Notification'
import { deleteUserTag, getAllTags, getUserTags } from '@/src/lib/API/supabaseAPI'
import { getRole, getUserId } from '@/src/lib/API/supabaseAPI'
import { supabase } from '@/supabaseClient'
import TaskCard from '@components/TaskCard'
import { TypeTask } from '@/src/types/TypeTask'
import { motion } from 'framer-motion'
import getRandomNumber from '../data/getRandomNumber'

const AddTaskForm = () => {
	const navigate = useNavigate()
	const [title, setTitle] = useState<string>('')
	const [description, setDescription] = useState<string>('')
	const [difficulty, setDifficulty] = useState<number>(0)
	const [deadline, setDeadline] = useState<Date | null>(null)
	const [tags, setTags] = useState<string[]>([])
	const [newTag, setNewTag] = useState<string>('')
	const { notifications, addNotification } = useNotification()
	const [previewTask, setPreviewTask] = useState<TypeTask | null>(null)
	const [companyName, setCompanyName] = useState<string>('')
	const [commonTags, setCommonTags] = useState<string[]>([])
	const [userTags, setUserTags] = useState<string[]>([])
	const [zipFile, setZipFile] = useState<File | null>(null)
	const [zipAdded, setZipAdded] = useState<boolean>(false)
	const [role, setRole] = useState<string | null>(null)
	const [userId, setUserId] = useState<number | null>(null)
	const [hasFetched, setHasFetched] = useState(false)

	const MAX_TITLE_LENGTH = 50
	const MIN_TITLE_LENGTH = 10 // Минимальная длина названия
	const MAX_DESCRIPTION_LENGTH = 3000
	const MIN_DESCRIPTION_LENGTH = 30 // Минимальная длина описания
	const MAX_TAG_LENGTH = 20
	const MAX_TAGS = 5

	useEffect(() => {
		const initialRole = getRole()
		const initialUserId = getUserId()
		setRole(initialRole)
		setUserId(initialUserId)
	}, [])

	useEffect(() => {
		if (hasFetched || role === null || userId === null) {
			return
		}

		const fetchData = async () => {
			if (role !== 'employer') {
				addNotification('warning', 'Ошибка', 'Только работодатели могут создавать задачи')
				navigate('/tasks')
				setHasFetched(true)
				return
			}

			try {
				const { data: user, error: userError } = await supabase
					.from('users')
					.select('company_name')
					.eq('id', userId)
					.single()

				if (userError) {
					throw new Error(`Не удалось получить данные компании: ${userError.message}`)
				}

				setCompanyName(user.company_name || 'Неизвестная компания')

				const commonTagsData = await getAllTags()
				setCommonTags(commonTagsData.map(tag => tag.name))

				const userTagsData = await getUserTags(userId!)
				setUserTags(userTagsData)

				setHasFetched(true)
			} catch (error: any) {
				addNotification('error', 'Ошибка', error.message)
				navigate('/tasks')
				setHasFetched(true)
			}
		}

		fetchData()
	}, [role, userId, navigate, addNotification])

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

	const addCustomTag = async () => {
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

		try {
			if (userId) {
				await supabase.from('user_tags').insert({ user_id: userId, name: trimmedTag })
			} else {
				throw new Error('Пользователь не авторизован')
			}

			setTags([...tags, trimmedTag])
			setUserTags([...userTags, trimmedTag])
			setNewTag('')
		} catch (error: any) {
			addNotification('error', 'Ошибка', error.message)
		}
	}

	const removeCustomTag = async (tagToRemove: string) => {
		try {
			if (userId) {
				await deleteUserTag(userId, tagToRemove)
			}
			setTags(tags.filter(tag => tag !== tagToRemove))
			setUserTags(userTags.filter(tag => tag !== tagToRemove))
		} catch (error: any) {
			addNotification('error', 'Ошибка', error.message)
		}
	}

	const formatDate = (date: Date | null): string => {
		if (!date) return ''
		const year = date.getFullYear()
		const month = String(date.getMonth() + 1).padStart(2, '0')
		const day = String(date.getDate()).padStart(2, '0')
		return `${year}-${month}-${day}`
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
			if (file.size > 30 * 1024 * 1024) {
				addNotification('warning', 'Ошибка', 'Размер архива не должен превышать 30MB')
				return
			}
			setZipFile(file)
			setZipAdded(true)
		}
	}

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault()

		// Проверка минимальной длины названия
		if (title.trim().length < MIN_TITLE_LENGTH) {
			addNotification(
				'warning',
				'Ошибка',
				`Название должно содержать минимум ${MIN_TITLE_LENGTH} символов`
			)
			return
		}

		// Проверка минимальной длины описания
		if (description.trim().length < MIN_DESCRIPTION_LENGTH) {
			addNotification(
				'warning',
				'Ошибка',
				`Описание должно содержать минимум ${MIN_DESCRIPTION_LENGTH} символов`
			)
			return
		}

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
		if (!userId) {
			addNotification('warning', 'Ошибка', 'Пользователь не авторизован')
			navigate('/login')
			return
		}

		const deadlineStr = formatDate(deadline)
		let zipFileUrl: string | null = null

		if (zipFile) {
			try {
				const fileExt = zipFile.name.split('.').pop()?.toLowerCase() || 'zip'
				const randomNumber = getRandomNumber(1, 10000)
				const fileName = `task${randomNumber}.${fileExt}`
				const filePath = `tasks_files/${fileName}`

				const { error: uploadError } = await supabase.storage
					.from('task-files')
					.upload(filePath, zipFile, {
						cacheControl: '3600',
						upsert: false,
					})

				if (uploadError) {
					throw new Error(`Не удалось загрузить архив: ${uploadError.message}`)
				}

				const { data: publicUrlData } = supabase.storage.from('task-files').getPublicUrl(filePath)
				zipFileUrl = publicUrlData.publicUrl
			} catch (error: any) {
				addNotification('error', 'Ошибка', `Не удалось загрузить архив: ${error.message}`)
				return
			}
		}

		const submissionData = {
			user_id: userId,
			submission_url: null,
			zip_file_url: zipFileUrl,
			comment: null,
			photos: null,
			title,
			description,
			difficulty,
			company_name: companyName,
			deadline: deadlineStr,
			employer_id: userId,
			tags: tags.length > 0 ? tags : null,
		}

		try {
			const { error } = await supabase.from('task_submissions').insert(submissionData)
			if (error) {
				throw new Error(`Не удалось создать задачу: ${error.message}`)
			}

			setTitle('')
			setDescription('')
			setDifficulty(0)
			setDeadline(null)
			setTags([])
			setNewTag('')
			setZipFile(null)
			setZipAdded(false)
			navigate('/tasks', { state: { showSuccessNotification: true } })
		} catch (error: any) {
			addNotification('error', 'Ошибка', `Не удалось создать задачу: ${error.message}`)
		}
	}

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
								onChange={e => setDifficulty(Number(e.target.value))}
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
									onChange={(date: Date | null) => setDeadline(date)}
									dateFormat='dd.MM.yyyy'
									className='pl-10 pr-3 py-2 border border-gray-300 rounded-md text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-400 transition-all outline-none'
									placeholderText='Выберите дату'
									wrapperClassName='w-[228px]'
								/>
							</div>
						</div>
					</div>
					<div>
						<label className='block text-sm font-medium text-gray-900'>Ключевые теги</label>
						<div className='mt-1 flex flex-wrap gap-2'>
							{commonTags.map(tag => (
								<motion.label
									key={tag}
									whileHover={{ scale: 1.05 }}
									className='inline-flex items-center'
								>
									<input
										type='checkbox'
										checked={tags.includes(tag)}
										onChange={() => handleTagChange(tag)}
										className='hidden'
									/>
									<span
										className={`px-3 py-1 rounded-xl text-sm font-medium cursor-pointer transition-colors ${
											tags.includes(tag)
												? 'bg-gradient-to-br from-blue-400 to-blue-600 text-white'
												: 'bg-gradient-to-br from-gray-300 to-gray-400 text-gray-800 hover:from-gray-400 hover:to-gray-500'
										}`}
									>
										{tag}
									</span>
								</motion.label>
							))}
							{userTags.map(tag => (
								<div key={tag} className='inline-flex items-center'>
									<motion.label whileHover={{ scale: 1.05 }} className='inline-flex items-center'>
										<input
											type='checkbox'
											checked={tags.includes(tag)}
											onChange={() => handleTagChange(tag)}
											className='hidden'
										/>
										<span
											className={`px-3 py-1 rounded-full text-sm font-medium cursor-pointer transition-colors ${
												tags.includes(tag)
													? 'bg-gradient-to-br from-blue-400 to-blue-600 text-white'
													: 'bg-gradient-to-br from-gray-300 to-gray-400 text-gray-800 hover:from-gray-400 hover:to-gray-500'
											}`}
										>
											{tag}
										</span>
									</motion.label>
									<motion.button
										whileHover={{ scale: 1.1 }}
										whileTap={{ scale: 0.9 }}
										type='button'
										onClick={() => removeCustomTag(tag)}
										className='ml-2 text-red-600 hover:text-red-800 transition-colors'
									>
										<X size={16} />
									</motion.button>
								</div>
							))}
						</div>
					</div>
					<div>
						<label className='block text-sm font-medium text-gray-900'>Создать новый тег</label>
						<div className='mt-1 flex items-center gap-2'>
							<input
								type='text'
								placeholder='Введите новый тег'
								value={newTag}
								className='block w-full pl-3 pr-3 py-2 border border-gray-300 rounded-md text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-400 transition-all outline-none'
								onChange={handleNewTagChange}
								maxLength={MAX_TAG_LENGTH}
							/>
							<motion.button
								whileHover={{ scale: 1.1 }}
								whileTap={{ scale: 0.9 }}
								type='button'
								onClick={addCustomTag}
								className='px-4 py-2 bg-gradient-to-br from-blue-300 to-blue-500 text-gray-900 rounded-lg shadow-md hover:from-blue-400 hover:to-blue-600 transition-all'
							>
								Добавить
							</motion.button>
						</div>
					</div>
					<div className='flex flex-col'>
						<p className='mt-4 text-sm font-medium text-gray-900'>
							Дополнительные материалы (архив) (опционально)
						</p>
						<div className='flex items-center'>
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
							{zipAdded && (
								<motion.div whileHover={{ scale: 1.1 }} className='flex items-center ml-3'>
									<Check size={24} className='text-green-600' />
								</motion.div>
							)}
						</div>
					</div>
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
			<motion.div
				className='mt-10 max-w-[900px] m-auto bg-gradient-to-br from-blue-50 to-gray-300 rounded-xl shadow-xl p-4'
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				exit={{ opacity: 0, y: 20 }}
			>
				<p className='font-medium text-lg text-gray-900 my-4'>Что получится</p>
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
					/>
				)}
			</motion.div>
			<Notification notifications={notifications} />
		</>
	)
}

export default AddTaskForm

import { CircleX, FileArchive, Link, SendHorizontal, FileImage, Check } from 'lucide-react'
import { FC, MouseEventHandler, useState } from 'react'
import { motion } from 'framer-motion'
import useNotification from '@hooks/useNotification'
import Notification from '@components/UI/Notification/Notification'
import { getUserId, uploadFileAndCreateRecord } from '@/src/lib/API/supabaseAPI'
import { addToStarted } from '@data/userData'
import { useNavigate } from 'react-router-dom'
import { TypeTaskActivity } from '@/src/types/TypeTaskActivity'
import { supabase } from '@/supabaseClient'

type TypeAddAnswerForm = {
	onClose: MouseEventHandler<HTMLButtonElement>
	taskId: string
	loadData: () => Promise<void>
}

const AddAnswerForm: FC<TypeAddAnswerForm> = ({ onClose, taskId, loadData }) => {
	const [url, setUrl] = useState('')
	const [comment, setComment] = useState('')
	const [zip, setZip] = useState<File[]>([])
	const [zipAdded, setZipAdded] = useState(false)
	const [images, setImages] = useState<File[]>([])
	const [imagesAdded, setImagesAdded] = useState(false)
	const { notifications, addNotification } = useNotification()
	const navigate = useNavigate()
	const currentUserId = getUserId()

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()

		// Проверка, что URL не пустой
		if (!url) {
			addNotification('error', 'Ошибка', 'Поле URL обязательно для заполнения')
			return
		}

		// Проверка, что URL начинается с github.com/
		const normalizedUrl = url.trim().toLowerCase()
		if (!normalizedUrl.includes('github.com/')) {
			addNotification('error', 'Ошибка', 'URL должен содержать "github.com/"')
			return
		}

		if (!currentUserId) {
			addNotification('error', 'Ошибка', 'Пользователь не авторизован')
			return
		}

		try {
			const firstName = localStorage.getItem('first_name') || 'User'
			const lastNameInitial = localStorage.getItem('last_name')?.charAt(0) || ''
			const username = `${firstName} ${lastNameInitial}.`

			// Создаем новую запись активности
			const activityData: Omit<TypeTaskActivity, 'id' | 'created_at'> = {
				task_id: Number(taskId),
				user_id: currentUserId,
				status: 'verifying',
				username: username,
				activity_date: new Date().toISOString().split('T')[0],
				url: url,
				comment: comment || null,
				archive_url: null,
				photo_urls: [],
			}

			const { data: activityDataResult, error: activityError } = await supabase
				.from('task_activity')
				.insert(activityData)
				.select()
				.single()
			if (activityError) {
				console.error('Error adding activity:', activityError)
				addNotification('error', 'Ошибка', `Не удалось отправить решение: ${activityError.message}`)
				return
			}

			const taskActivityId = activityDataResult.id

			// Загрузка архива, если есть
			let archiveUrl: string | null = null
			if (zip.length > 0) {
				archiveUrl = await uploadFileAndCreateRecord(taskActivityId, zip[0], 'archive')
			}

			// Загрузка изображений, если есть
			const photoUrls: string[] = []
			if (images.length > 0) {
				for (const image of images) {
					const photoUrl = await uploadFileAndCreateRecord(taskActivityId, image, 'image')
					photoUrls.push(photoUrl)
				}
			}

			// Обновляем запись активности с URL-адресами файлов
			const { error: updateError } = await supabase
				.from('task_activity')
				.update({
					archive_url: archiveUrl,
					photo_urls: photoUrls,
				})
				.eq('id', taskActivityId)

			if (updateError) {
				console.error('Error updating activity with file URLs:', updateError)
				addNotification('error', 'Ошибка', `Не удалось обновить запись: ${updateError.message}`)
				return
			}

			// Обновление user_tasks
			const { data: existing, error: fetchError } = await supabase
				.from('user_tasks')
				.select('is_favorite')
				.eq('user_id', currentUserId)
				.eq('task_id', Number(taskId))
				.single()

			const isFavorite = existing ? existing.is_favorite : false

			const { error: userTaskError } = await supabase.from('user_tasks').upsert(
				{
					user_id: currentUserId,
					task_id: Number(taskId),
					is_favorite: isFavorite,
					is_started: true,
				},
				{
					onConflict: 'user_id,task_id',
				}
			)

			if (userTaskError) {
				console.error('Error upserting to user_tasks:', userTaskError)
				addNotification(
					'error',
					'Ошибка',
					`Не удалось отметить задачу как начатую: ${userTaskError.message}`
				)
				return
			}

			addToStarted(Number(taskId))
			addNotification('success', 'Успешно', 'Решение отправлено на модерацию')
			await loadData() // Обновляем таблицу активности
			onClose(e as any) // Закрываем форму после успешной отправки
		} catch (error: any) {
			addNotification(
				'error',
				'Ошибка',
				`Не удалось отправить решение: ${error.message || 'Неизвестная ошибка'}`
			)
		} finally {
			setUrl('')
			setComment('')
			setZip([])
			setImages([])
			setZipAdded(false)
			setImagesAdded(false)
		}
	}

	return (
		<>
			<motion.div
				className='p-6 bg-gradient-to-br from-blue-50 to-gray-300 rounded-xl shadow-xl flex flex-col w-[650px] mx-auto'
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				exit={{ opacity: 0, y: 20 }}
			>
				<div className='h-[45px] flex justify-between items-center mb-6'>
					<p className='font-medium text-lg text-gray-900 mt-3 ml-2'>Добавить решение</p>
					<motion.button
						whileHover={{ scale: 1.1 }}
						whileTap={{ scale: 0.9 }}
						onClick={onClose}
						className='p-1 bg-gradient-to-br from-red-300 to-red-500 text-white rounded-lg shadow-md hover:from-red-400 hover:to-red-600 transition-all flex items-center gap-1'
					>
						<CircleX size={20} />
						<span className='text-sm'>Закрыть</span>
					</motion.button>
				</div>
				<form className='mt-3 ml-2 space-y-6' onSubmit={handleSubmit}>
					<div className='flex flex-col'>
						<p className='mt-4 text-sm font-medium text-gray-900'>Ссылка на репозиторий GitHub *</p>
						<div className='flex items-center border border-gray-400 rounded-md max-w-[380px] shadow-sm bg-white'>
							<Link className='m-2 text-gray-500' size={24} />
							<input
								type='text'
								placeholder='url'
								value={url}
								className='w-full px-3 py-2 text-lg text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 transition-all'
								onChange={e => setUrl(e.target.value)}
								autoFocus
								required
							/>
						</div>
					</div>
					<div className='flex flex-col'>
						<p className='mt-4 text-sm font-medium text-gray-900'>Комментарий (опционально)</p>
						<textarea
							className='w-[480px] h-[150px] px-3 py-2 border border-gray-400 rounded-md text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 outline-none resize-y bg-white shadow-sm'
							placeholder='Введите комментарий...'
							value={comment}
							onChange={e => setComment(e.target.value)}
						/>
					</div>
					<div className='flex flex-col'>
						<p className='mt-4 text-sm font-medium text-gray-900'>Архив проекта (опционально)</p>
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
									onChange={e => {
										const file = e.target.files?.[0]
										if (file) {
											setZipAdded(true)
											setZip([file])
										}
									}}
								/>
							</motion.label>
							{zipAdded && (
								<motion.div whileHover={{ scale: 1.1 }} className='flex items-center ml-3'>
									<Check size={24} className='text-green-600' />
								</motion.div>
							)}
						</div>
					</div>
					<div className='flex flex-col'>
						<p className='mt-4 text-sm font-medium text-gray-900'>Фото (опционально)</p>
						<div className='flex items-center'>
							<motion.label
								whileHover={{ scale: 1.05 }}
								whileTap={{ scale: 0.95 }}
								className='py-2 px-3 border border-gray-400 rounded-md bg-gradient-to-br from-blue-300 to-blue-500 text-gray-900 cursor-pointer flex items-center w-[180px] hover:from-blue-400 hover:to-blue-600 transition-all shadow-md'
							>
								<FileImage className='mr-2' size={20} />
								<span className='text-sm font-medium'>Выбрать фото</span>
								<input
									type='file'
									accept='image/*'
									multiple
									className='hidden'
									onChange={e => {
										const files = e.target.files
										if (files && files.length > 0) {
											setImagesAdded(true)
											setImages(Array.from(files))
										}
									}}
								/>
							</motion.label>
							{imagesAdded && (
								<motion.div whileHover={{ scale: 1.1 }} className='flex items-center ml-3'>
									<Check size={24} className='text-green-600' />
								</motion.div>
							)}
						</div>
					</div>
					<div className='mt-6 flex justify-center'>
						<motion.button
							whileHover={{ scale: 1.1 }}
							whileTap={{ scale: 0.9 }}
							type='submit'
							className='w-1/2 py-2 text-white font-semibold bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg shadow-md hover:from-blue-500 hover:to-blue-700 transition-all flex items-center justify-center gap-2'
						>
							<span className='text-sm'>Отправить</span>
							<SendHorizontal size={18} />
						</motion.button>
					</div>
				</form>
			</motion.div>
			<Notification notifications={notifications} />
		</>
	)
}

export default AddAnswerForm

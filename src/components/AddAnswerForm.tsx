import { CircleX, FileArchive, Link, SendHorizontal, FileImage, Check } from 'lucide-react'
import { FC, MouseEventHandler, useState } from 'react'
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
}

const AddAnswerForm: FC<TypeAddAnswerForm> = ({ onClose, taskId }) => {
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

		if (!url) {
			addNotification('error', 'Ошибка', 'Поле URL обязательно для заполнения')
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
			window.location.reload()
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
			onClose(e as any)
		}
	}

	return (
		<>
			<div className='md:bg-[#96bddd] md:border-2 md:rounded-2xl h-[565px] md:flex md:flex-col px-2'>
				<div className='h-[45px] md:flex md:justify-between mt-0.5'>
					<p className='font-medium text-lg mt-3 ml-2'>Добавить решение</p>
					<button onClick={onClose}>
						<CircleX size={33} />
					</button>
				</div>
				<form className='mt-3 ml-2' onSubmit={handleSubmit}>
					<div className='flex flex-col'>
						<p className='mt-4'>Ссылка на репозиторий GitHub *</p>
						<div className='md:flex border-1 max-w-[380px] md:rounded-lg'>
							<Link className='m-1' size={28} />
							<input
								type='text'
								placeholder='url'
								value={url}
								className='outline-0 w-full text-lg'
								onChange={e => setUrl(e.target.value)}
								autoFocus
								required
							/>
						</div>
					</div>
					<div className='flex flex-col'>
						<p className='mt-4'>Комментарий (опционально)</p>
						<textarea
							className='h-[150px] w-[480px] border rounded-xl p-2 resize-none outline-0'
							placeholder='Введите комментарий...'
							value={comment}
							onChange={e => setComment(e.target.value)}
						></textarea>
					</div>
					<div className='flex flex-col'>
						<p className='mt-4'>Архив проекта (опционально)</p>
						<div className='md:flex'>
							<label className='py-2 px-3 border-1 rounded-lg md:bg-[#69859c] cursor-pointer flex items-center w-[180px]'>
								<FileArchive className='mr-2' />
								<span>Выбрать архив</span>
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
							</label>
							{zipAdded && (
								<div className='md:flex md:items-center md:ml-3'>
									<Check size={29} />
								</div>
							)}
						</div>
					</div>
					<div className='flex flex-col'>
						<p className='mt-4'>Фото (опционально)</p>
						<div className='md:flex'>
							<label className='mt-1 py-2 px-3 border-1 rounded-lg md:bg-[#69859c] cursor-pointer flex items-center w-[180px]'>
								<FileImage className='mr-2' />
								<span>Выбрать фото</span>
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
							</label>
							{imagesAdded && (
								<div className='md:flex md:items-center md:ml-3'>
									<Check size={29} />
								</div>
							)}
						</div>
					</div>
					<div className='md:flex md:items-end mt-4'>
						<button
							className='p-1 cursor-pointer hover:bg-amber-300 md:flex border-2 rounded-xl py-1 px-2'
							type='submit'
						>
							<span className='mr-2'>Отправить</span>
							<SendHorizontal />
						</button>
					</div>
				</form>
			</div>
			<Notification notifications={notifications} />
		</>
	)
}

export default AddAnswerForm

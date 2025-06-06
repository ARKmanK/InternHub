import { FC, MouseEventHandler, useState } from 'react'
import { motion } from 'framer-motion'
import { FileArchive, FileImage, Check, SendHorizontal } from 'lucide-react'
import useNotification from '@hooks/useNotification'
import Notification from '@UI/Notification/Notification'
import { submitTaskActivity } from '@/src/lib/API/supabase/taskActivityAPI'
import BackButton from '../../UI/Buttons/BackButton'
import AddAnswerFields from './AddAnswerFields'

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

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()

		if (!url) {
			addNotification('error', 'Ошибка', 'Поле URL обязательно для заполнения')
			return
		}

		const normalizedUrl = url.trim().toLowerCase()
		if (!normalizedUrl.includes('github.com/')) {
			addNotification('error', 'Ошибка', 'URL должен содержать "github.com/"')
			return
		}

		try {
			await submitTaskActivity(taskId, url, comment || null, zip, images, addNotification, loadData)
			onClose({} as React.MouseEvent<HTMLButtonElement>)
		} catch (error) {
			// Error handling is managed within submitTaskActivity
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
		<motion.div
			className='p-6 bg-gradient-to-br from-blue-50 to-gray-300 rounded-xl shadow-xl flex flex-col w-[650px] mx-auto'
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0, y: 20 }}
		>
			<div className='h-[45px] flex justify-between items-center mb-6'>
				<p className='font-medium text-lg text-gray-900 mt-3 ml-2'>Добавить решение</p>
				<BackButton goBack={() => onClose({} as React.MouseEvent<HTMLButtonElement>)} />
			</div>
			<form className='mt-3 ml-2 space-y-6' onSubmit={handleSubmit}>
				<AddAnswerFields url={url} setUrl={setUrl} />
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
			<Notification notifications={notifications} />
		</motion.div>
	)
}

export default AddAnswerForm

import { CircleX, FileArchive, Link, SendHorizontal, FileImage, Check } from 'lucide-react'
import { FC, MouseEventHandler, useState } from 'react'
import useNotification from '@hooks/useNotification'
import Notification from '@components/UI/Notification/Notification'
import { saveAnswerData } from '../data/companyData'

type TypeAddAnswerForm = {
	onClose: MouseEventHandler<HTMLButtonElement>
}

const AddAnswerForm: FC<TypeAddAnswerForm> = ({ onClose }) => {
	const [url, setUrl] = useState('')
	const [zip, setZip] = useState<File[]>([])
	const [zipAdded, setZipAdded] = useState(false)
	const [images, setImages] = useState<File[]>([])
	const [imagesAdded, setImagesAdded] = useState(false)
	const [comment, setComment] = useState('')

	const { notifications, addNotification } = useNotification()

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()

		if (!url.trim()) {
			addNotification('warning', 'Ошибка', 'url-обязательное поле')
			return
		}

		saveAnswerData({ zip, url, images, comment })
		setUrl('')
		setZip([])
		setImages([])
		setComment('')
		setZipAdded(false)
		setImagesAdded(false)
		addNotification('success', 'Успешно', 'Решение отправлено')
	}

	return (
		<>
			<div className='md:bg-[#96bddd] md:border-2 md:rounded-2xl h-[505px] md:flex md:flex-col px-2'>
				<div className='h-[45px] md:flex md:justify-between mt-0.5'>
					<p className='font-medium text-lg mt-3 ml-2'>Добавить решение</p>
					<button onClick={onClose}>
						<CircleX size={33} />
					</button>
				</div>
				<form className='mt-3 ml-2' onSubmit={handleSubmit}>
					<div className='flex flex-col'>
						<p className='mt-4'>Архив проекта</p>
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
					<p className='mt-4'>Ссылка на репозиторий GitHub</p>
					<div className='md:flex border-1 max-w-[380px] md:rounded-lg'>
						<Link className='m-1' size={28} />
						<input
							type='text'
							placeholder='url'
							value={url}
							className='outline-0 w-full text-lg'
							onChange={e => setUrl(e.target.value)}
							autoFocus
						/>
					</div>
					<div className='flex flex-col'>
						<p className='mt-3'>Фото</p>
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
											setImages(Array.from(files))
											setImagesAdded(true)
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
					<div className='flex gap-2 justify-between'>
						<div>
							<p className='mt-3'>Комментарий</p>
							<textarea
								className='h-[150px] w-[480px] border rounded-xl p-2 resize-none outline-0'
								placeholder='Введите комментарий...'
								value={comment}
								onChange={e => setComment(e.target.value)}
							></textarea>
						</div>
						<div className='md:flex md:items-end'>
							<button
								className='p-1 cursor-pointer hover:bg-amber-300 md:flex border-2 rounded-xl py-1 px-2'
								type='submit'
							>
								<span className='mr-2'>Отправить</span>
								<SendHorizontal />
							</button>
						</div>
					</div>
				</form>
			</div>
			<Notification notifications={notifications} />
		</>
	)
}

export default AddAnswerForm

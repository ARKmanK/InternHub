import { FC, useEffect } from 'react'
import { X, FileDown, Eye, Github, Download, Image } from 'lucide-react'
import { TypeTaskActivity } from '@/src/types/TypeTaskActivity'

interface ActivityModalProps {
	activity: TypeTaskActivity
	isOpen: boolean
	onClose: () => void
	onApprove: (activityId: number) => void
	onReject: (activityId: number) => void
}

const AnswerVerifyWindow: FC<ActivityModalProps> = ({
	activity,
	isOpen,
	onClose,
	onApprove,
	onReject,
}) => {
	useEffect(() => {
		const handleClickOutside = (e: MouseEvent) => {
			const modal = document.querySelector('.modal-content')
			if (modal && !modal.contains(e.target as Node)) {
				onClose()
			}
		}

		if (isOpen) {
			document.addEventListener('mousedown', handleClickOutside)
		}

		return () => {
			document.removeEventListener('mousedown', handleClickOutside)
		}
	}, [isOpen, onClose])

	if (!isOpen) return null

	return (
		<div className='absolute z-20 top-1/2 -translate-y-1/2 right-0 mr-[-420px]'>
			<div className='modal-content bg-gradient-to-br from-white to-blue-50 border border-blue-200 rounded-2xl shadow-xl p-6 w-[400px] transform transition-all duration-300 ease-in-out'>
				<button
					className='absolute top-4 right-4 text-blue-500 hover:text-blue-700 transition-colors bg-blue-100 rounded-full p-1'
					onClick={onClose}
				>
					<X size={20} />
				</button>
				<div className='mb-6'>
					<p className='font-bold text-xl text-blue-900 mb-4 border-b border-blue-100 pb-2'>
						Решение
					</p>
					<div className='flex items-center mb-3'>
						<div className='flex items-center bg-blue-100 text-blue-700 font-semibold text-sm px-3 py-1 rounded-lg mr-3 text-nowrap'>
							<Github size={16} className='mr-1' /> GitHub URL:
						</div>
						{activity.url ? (
							<a
								href={activity.url}
								target='_blank'
								rel='noopener noreferrer'
								className='text-blue-600 hover:underline truncate text-sm'
							>
								{activity.url}
							</a>
						) : (
							<p className='text-gray-400 text-sm italic'>Ссылка отсутствует</p>
						)}
					</div>
				</div>
				{activity.archive_url && (
					<div className='mb-6'>
						<div className='flex items-center mb-3'>
							<div className='flex items-center bg-blue-100 text-blue-700 font-semibold text-sm px-3 py-1 rounded-lg mr-3 text-nowrap'>
								<Download size={16} className='mr-1' /> Архивный файл (zip):
							</div>
							<a
								href={activity.archive_url}
								download
								className='text-blue-600 hover:underline flex items-center text-sm'
							>
								<FileDown size={16} className='mr-1' />
								Скачать файл
							</a>
						</div>
					</div>
				)}
				{activity.photo_urls && activity.photo_urls.length > 0 && (
					<div className='mb-6'>
						<div className='flex items-center mb-3'>
							<div className='flex items-center bg-blue-100 text-blue-700 font-semibold text-sm px-3 py-1 rounded-lg mr-3'>
								<Image size={16} className='mr-1' /> Фото:
							</div>
						</div>
						<div className='flex flex-col gap-2 ml-1'>
							{activity.photo_urls.map((photoUrl, idx) => (
								<a
									key={idx}
									href={photoUrl}
									target='_blank'
									rel='noopener noreferrer'
									className='text-blue-600 hover:underline flex items-center text-sm'
								>
									<Eye size={16} className='mr-1' />
									Фото {idx + 1}
								</a>
							))}
						</div>
					</div>
				)}
				{activity.comment && (
					<div className='mb-6'>
						<div className='flex items-center mb-3'>
							<div className='flex items-center bg-blue-100 text-blue-700 font-semibold text-sm px-3 py-1 rounded-lg mr-3'>
								Комментарий:
							</div>
						</div>
						<p className='text-sm text-gray-800 bg-blue-50 p-4 rounded-lg shadow-inner'>
							{activity.comment}
						</p>
					</div>
				)}
				<div className='flex justify-between gap-4'>
					<button
						className='flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-md'
						onClick={() => onApprove(activity.id)}
					>
						Одобрить
					</button>
					<button
						className='flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-md'
						onClick={() => onReject(activity.id)}
					>
						Отклонить
					</button>
				</div>
			</div>
		</div>
	)
}

export default AnswerVerifyWindow

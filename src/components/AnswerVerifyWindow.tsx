import { FC, useEffect } from 'react'
import { X, FileDown, Eye } from 'lucide-react'
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
		<div className='absolute z-10 top-0 left-full ml-2'>
			<div className='modal-content bg-white border border-gray-300 rounded-lg shadow-lg p-4 w-[300px] relative'>
				<button
					className='absolute top-2 right-2 text-gray-500 hover:text-gray-700'
					onClick={onClose}
				>
					<X size={20} />
				</button>
				<div className='mb-4'>
					<p className='font-semibold'>Решение:</p>
					<div className='flex items-center mt-2'>
						<span className='mr-2'>GitHub URL:</span>
						{activity.url ? (
							<a
								href={activity.url}
								target='_blank'
								rel='noopener noreferrer'
								className='text-blue-600 hover:underline truncate'
							>
								{activity.url}
							</a>
						) : (
							<p className='text-gray-500'>Ссылка отсутствует</p>
						)}
					</div>
				</div>
				{activity.archive_url && (
					<div className='mb-4 flex items-center'>
						<p className='text-sm mr-2'>Архивный файл (zip):</p>
						<a
							href={activity.archive_url}
							download
							className='text-blue-600 hover:underline flex items-center'
						>
							<FileDown size={16} className='mr-1' />
							Скачать файл
						</a>
					</div>
				)}
				{activity.photo_urls && activity.photo_urls.length > 0 && (
					<div className='mb-4'>
						<p className='text-sm font-semibold'>Фото:</p>
						<div className='flex gap-2 mt-1'>
							{activity.photo_urls.map((photoUrl, idx) => (
								<a
									key={idx}
									href={photoUrl}
									target='_blank'
									rel='noopener noreferrer'
									className='text-blue-600 hover:underline flex items-center'
								>
									<Eye size={16} className='mr-1' />
									Фото {idx + 1}
								</a>
							))}
						</div>
					</div>
				)}
				{activity.comment && (
					<div className='mb-4'>
						<p className='text-sm font-semibold'>Комментарий:</p>
						<p className='text-sm'>{activity.comment}</p>
					</div>
				)}
				<div className='flex justify-between mt-4'>
					<button
						className='bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600'
						onClick={() => onApprove(activity.id)}
					>
						Одобрить
					</button>
					<button
						className='bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600'
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

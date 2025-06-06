import { FC, useRef } from 'react'
import { TypeTaskActivity } from '@/src/types/TypeTaskActivity'
import AnswerVerifyWindow from '@components/AnswerVerifyWindow'
import { CircleCheckBig, Hourglass } from 'lucide-react'
import { TypeTask } from '@/src/types/TypeTask'

type TypeTaskActivityTableProps = {
	activityData: TypeTaskActivity[] | null
	task: TypeTask
	isEmployerTaskOwner: boolean
	selectedActivity: TypeTaskActivity | null
	isModalOpen: boolean
	handleOpenModal: (activity: TypeTaskActivity) => void
	handleCloseModal: () => void
	handleApprove: (activityId: number) => void
	handleReject: (activityId: number) => void
}

const TaskActivityTable: FC<TypeTaskActivityTableProps> = ({
	activityData,
	isEmployerTaskOwner,
	selectedActivity,
	isModalOpen,
	handleOpenModal,
	handleCloseModal,
	handleApprove,
	handleReject,
}) => {
	const modalRefs = useRef<Map<number, HTMLDivElement>>(new Map())

	return (
		<div className='md:min-w-[300px] md:min-h-[250px] md:rounded-xl md:mb-10 bg-white'>
			<div className='bg-gradient-to-r from-blue-500 to-blue-600 md:rounded-t-xl'>
				<div
					className={`grid ${
						isEmployerTaskOwner ? 'grid-cols-4' : 'grid-cols-3'
					} md:items-center md:w-full md:rounded-t-xl`}
				>
					<div className='border-r border-blue-400 md:py-3 md:flex md:justify-center'>
						<span className='text-white font-semibold'>Статус</span>
					</div>
					<div className='border-r border-blue-400 md:py-3 md:flex md:justify-center'>
						<span className='text-white font-semibold'>Пользователь</span>
					</div>
					<div
						className={`${
							isEmployerTaskOwner ? 'border-r' : ''
						} border-blue-400 md:py-3 md:flex md:justify-center`}
					>
						<span className='text-white font-semibold'>Дата</span>
					</div>
					{isEmployerTaskOwner && (
						<div className='md:py-3 md:flex md:justify-center'>
							<span className='text-white font-semibold'>Действие</span>
						</div>
					)}
				</div>
			</div>
			<div className='md:min-h-[150px]'>
				{activityData && activityData.length > 0 ? (
					activityData.map((activity, index) => (
						<div
							key={index}
							className={`relative grid ${
								isEmployerTaskOwner ? 'grid-cols-4' : 'grid-cols-3'
							} md:mb-2 md:border-b border-gray-200 last:border-b-0 last:mb-0 md:w-full items-center md:py-4 hover:bg-gray-50 transition-colors`}
							style={{ minHeight: '60px' }}
							ref={el => {
								if (el) modalRefs.current.set(activity.id, el)
							}}
						>
							<div className='flex items-center md:justify-center'>
								<div className='mr-3'>
									{activity.status === 'done' ? (
										<CircleCheckBig size={20} className='text-green-500' />
									) : activity.status === 'rejected' ? (
										<span className='text-red-500'>✗</span>
									) : (
										<Hourglass size={20} className='text-yellow-500' />
									)}
								</div>
								<span className='text-sm text-gray-700'>
									{activity.status === 'verifying'
										? 'Верифицируется'
										: activity.status === 'done'
										? 'Готово'
										: 'Отклонено'}
								</span>
							</div>
							<div className='md:text-center text-sm text-gray-700 truncate'>
								{activity.username || 'Неизвестно'}
							</div>
							<div className='md:text-center text-sm text-gray-700'>
								<span>
									{activity.activity_date || new Date(activity.created_at).toLocaleDateString()}
								</span>
							</div>
							{isEmployerTaskOwner && (
								<div className='md:flex md:justify-center'>
									<button
										className='text-blue-600 hover:underline text-sm font-medium'
										onClick={() => handleOpenModal(activity)}
									>
										Просмотреть
									</button>
								</div>
							)}
							{isEmployerTaskOwner && (
								<AnswerVerifyWindow
									activity={selectedActivity || activity}
									isOpen={isModalOpen && selectedActivity?.id === activity.id}
									onClose={handleCloseModal}
									onApprove={handleApprove}
									onReject={handleReject}
								/>
							)}
						</div>
					))
				) : (
					<div className='flex items-center justify-center h-[150px]'>
						<span className='text-3xl text-gray-400 opacity-70 font-semibold'>Нет данных</span>
					</div>
				)}
			</div>
		</div>
	)
}

export default TaskActivityTable

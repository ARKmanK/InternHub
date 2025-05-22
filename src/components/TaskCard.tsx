import { FC } from 'react'
import { useNavigate } from 'react-router-dom'
import { Heart, BadgeCheck, Star, Delete, BookCheck, Settings } from 'lucide-react'
import { TypeTasksData } from '@data/tasksData'
import { motion } from 'framer-motion'
import { Button } from '@components/UI/Button/Button'
import useNotification from '@hooks/useNotification'
import Notification from '@components/UI/Notification/Notification'

type TypeTasksDataProps = TypeTasksData & {
	type: string
	addToFavorite?: (id: number) => void
	isFavorite?: boolean
	role?: string
	isMine?: boolean
	onDelete?: () => void
	showControls?: boolean
}

const TaskCard: FC<TypeTasksDataProps> = ({
	id,
	trackingNumber,
	title,
	description,
	difficulty,
	companyName,
	type,
	addToFavorite,
	isFavorite = false,
	deadline,
	tags,
	role,
	isMine,
	onDelete,
	showControls = false,
}) => {
	const { notifications, addNotification } = useNotification()
	const navigate = useNavigate()

	const handleClick = (id: string) => {
		navigate(`/task/${id}`)
	}

	const handleEdit = () => {
		navigate(`/edit-task/${id}`)
	}

	const renderDifficultyStars = (difficulty: number) => {
		const starsCount = difficulty >= 1 && difficulty <= 3 ? difficulty : 1
		const starColorClass =
			{
				1: 'fill-green-500 stroke-green-500',
				2: 'fill-orange-500 stroke-orange-500',
				3: 'fill-red-500 stroke-red-500',
			}[difficulty] || 'fill-green-500 stroke-green-500'

		return (
			<div className='flex gap-1'>
				{Array.from({ length: starsCount }).map((_, index) => (
					<motion.div
						key={index}
						initial={{ opacity: 0, scale: 0.5 }}
						animate={{ opacity: 1, scale: 1 }}
						transition={{ duration: 0.3, delay: index * 0.4 }}
					>
						<Star size={20} className={starColorClass} />
					</motion.div>
				))}
			</div>
		)
	}

	// Обрезаем описание для типа card до 150 символов
	const truncatedDescription =
		type === 'card' && description.length > 150 ? description.slice(0, 150) + '...' : description

	return (
		<>
			{type === 'list' && (
				<div className='w-[700px] min-h-[250px] rounded-xl mb-10 border-2 border-gray-[#dce3eb] bg-[#96bddd] overflow-hidden relative'>
					<div className='py-2 px-3 flex flex-col justify-between'>
						<div className='flex justify-between text-gray-500 text-sm'>
							<p>Сейчас отслеживают {trackingNumber}</p>
							{role === 'user' && (
								<button
									className='p-1 rounded transition-colors'
									onClick={() => addToFavorite && addToFavorite(id)}
								>
									<Heart
										fill={isFavorite ? 'red' : 'gray'}
										color={isFavorite ? 'red' : 'red'}
										className={isFavorite ? '' : 'hover:fill-red-500 hover:text-red-500'}
										size={32}
									/>
								</button>
							)}
							{role === 'employer' && showControls && (
								<div className='flex'>
									<div className='text-xs text-black border-2 border-t-0 border-r-0 rounded-bl-lg rounded-tr-lg p-1 top-0 right-30 absolute'>
										<button className='flex' onClick={handleEdit}>
											Редактировать
											<Settings className='ml-1' size={20} />
										</button>
									</div>
									<div className='text-xs text-black border-2 border-t-0 border-r-0 rounded-tr-lg p-1 top-0 right-0 absolute'>
										<button className='flex' onClick={onDelete}>
											Удалить задачу
											<Delete className='ml-1' size={20} />
										</button>
									</div>
								</div>
							)}
							{role === 'employer' && isMine && !showControls && (
								<div className='flex text-black border-2 border-t-0 border-r-0 rounded-bl-lg rounded-tr-lg p-1 top-0 right-0 absolute'>
									<span>Моя задача</span>
									<BookCheck fill='#0e8083' size={20} />
								</div>
							)}
						</div>
						<h3
							className={`font-semibold pt-4 text-ellipsis line-clamp-1 ${
								title.length > 40 ? 'text-lg' : 'text-xl'
							}`}
						>
							{title}
						</h3>
						<div className='pt-4 break-words'>{truncatedDescription}</div>
						<div className='flex py-2 mt-4 flex-wrap'>
							<p className='text-nowrap'>{`Срок до: ${deadline}`}</p>
							<div className='ml-4 flex flex-wrap'>
								{tags.map(tag => (
									<div
										key={tag}
										className='bg-[#6092bb] mx-1.5 min-w-[40px] h-[28px] rounded-md text-center px-2 py-0.5 flex items-center justify-center'
									>
										{tag}
									</div>
								))}
							</div>
						</div>
						<div className='flex flex-col mb-4'>
							<p className='mb-2'>Сложность</p>
							{renderDifficultyStars(difficulty)}
						</div>
						<div className='flex justify-between'>
							<Button onClick={() => handleClick(id.toString())}>На страницу задачи</Button>
							<div className='flex items-center'>
								{companyName}
								<BadgeCheck className='ml-2' fill='green' />
							</div>
						</div>
					</div>
				</div>
			)}
			{type === 'card' && (
				<div className='w-[380px] min-h-[350px] bg-[#96bddd] rounded-xl border-2 border-gray-[#dce3eb] overflow-hidden'>
					<div className='py-2 px-3 flex flex-col justify-between'>
						<div>
							<div className='flex justify-between text-gray-500 text-sm'>
								<p>Сейчас отслеживают {trackingNumber}</p>
								{role === 'user' && (
									<button
										className='p-1 rounded transition-colors'
										onClick={() => addToFavorite && addToFavorite(id)}
									>
										<Heart
											fill={isFavorite ? 'red' : 'gray'}
											color={isFavorite ? 'red' : 'red'}
											className={isFavorite ? '' : 'hover:fill-red-500 hover:text-red-500'}
											size={32}
										/>
									</button>
								)}
							</div>
							<h3
								className={`font-semibold pt-4 text-ellipsis line-clamp-1 ${
									title.length > 40 ? 'text-lg' : 'text-xl'
								}`}
							>
								{title}
							</h3>
							<div className='pt-4 overflow-hidden text-ellipsis line-clamp-4 break-words'>
								{truncatedDescription}
							</div>
							<div className='flex-1 mt-6'>
								<div className='flex flex-col'>
									<p>{`Срок до: ${deadline}`}</p>
									<div className='flex flex-wrap mt-1'>
										{tags.map(tag => (
											<div className='mt-2 flex' key={tag}>
												<div className='bg-[#6092bb] mr-2.5 min-w-[40px] rounded-md text-center px-2 py-0.5 flex items-center justify-center'>
													{tag}
												</div>
											</div>
										))}
									</div>
								</div>
								<div className='mt-3'>
									<p className='mb-2'>Сложность</p>
									{renderDifficultyStars(difficulty)}
								</div>
							</div>
						</div>
						<div className='flex flex-col items-start gap-1 md:mt-3.5'>
							<Button onClick={() => handleClick(id.toString())} className='text-sm px-2 py-1'>
								На страницу задачи
							</Button>
							<div className='flex items-center md:my-2 md:ml-0.5'>
								{companyName}
								<BadgeCheck className='ml-2' fill='green' />
							</div>
						</div>
					</div>
				</div>
			)}
			<Notification notifications={notifications} />
		</>
	)
}

export default TaskCard

import { FC, MouseEvent, memo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Heart, BadgeCheck, Star, Delete, Settings, BookmarkCheck } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@UI/Buttons/Button'
import { setPage } from '@data/userData'

type TaskCardProps = {
	id: number
	trackingNumber: number
	title: string
	description: string
	difficulty: number
	companyName: string
	type: string
	addToFavorite?: (id: number) => void
	removeFromFavorite?: (id: number) => void
	isFavorite?: boolean
	deadline: string
	tags: string[]
	role?: 'user' | 'employer' | 'admin' | null
	isMine?: boolean
	onDelete?: (id: number) => void
	showControls?: boolean
	onClick?: () => void
	showFavoriteButton?: boolean
}

const TaskCard: FC<TaskCardProps> = ({
	id,
	trackingNumber,
	title,
	description,
	difficulty,
	companyName,
	type,
	addToFavorite,
	removeFromFavorite,
	isFavorite = false,
	deadline,
	tags,
	role,
	isMine,
	onDelete,
	showControls = false,
	onClick,
	showFavoriteButton = true,
}) => {
	const navigate = useNavigate()

	const handleClick = (id: string) => {
		navigate(`/task/${id}`)
	}

	const handleEdit = () => {
		setPage(`/edit-task/${id}`)
		navigate(`/edit-task/${id}`)
	}

	const handleNavigate = (e: MouseEvent<HTMLButtonElement>) => {
		e.preventDefault()
		if (onClick) {
			onClick()
		} else {
			handleClick(id.toString())
		}
	}

	const handleFavoriteClick = () => {
		if (isFavorite && removeFromFavorite) {
			removeFromFavorite(id)
		} else if (!isFavorite && addToFavorite) {
			addToFavorite(id)
		}
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

	const truncatedDescription =
		type === 'card'
			? description.length > 150
				? description.slice(0, 150) + '...'
				: description
			: description.length > 300
			? description.slice(0, 300) + '...'
			: description

	return (
		<>
			{type === 'list' && (
				<div className='w-full max-w-[700px] min-h-[250px] rounded-xl mb-10 border-2 border-gray-200 bg-gradient-to-br from-blue-100 to-blue-200 shadow-lg overflow-hidden relative'>
					<div className='py-3 px-4 flex flex-col justify-between'>
						<div className='flex justify-between text-gray-600 text-sm font-medium'>
							<p>Сейчас отслеживают {trackingNumber}</p>
							{role === 'user' && showFavoriteButton && (addToFavorite || removeFromFavorite) && (
								<button className='p-1 rounded transition-colors' onClick={handleFavoriteClick}>
									<Heart
										fill={isFavorite ? 'red' : 'gray'}
										color={isFavorite ? 'red' : 'red'}
										className={isFavorite ? '' : 'hover:fill-red-500 hover:text-red-500'}
										size={32}
									/>
								</button>
							)}
							{role === 'employer' && showControls && (
								<div className='flex space-x-2'>
									<button
										onClick={handleEdit}
										className='text-xs text-white bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg p-1 px-2 shadow-md hover:from-blue-500 hover:to-blue-700 transition-all flex items-center'
									>
										Редактировать
										<Settings className='ml-1' size={16} />
									</button>
									<button
										onClick={() => onDelete && onDelete(id)}
										className='text-xs text-white bg-gradient-to-br from-red-400 to-red-600 rounded-lg p-1 px-2 shadow-md hover:from-red-500 hover:to-red-700 transition-all flex items-center'
									>
										Удалить задачу
										<Delete className='ml-1' size={16} />
									</button>
								</div>
							)}
							{role === 'employer' && isMine && !showControls && (
								<div className='flex items-center text-blue-900 text-xs font-medium bg-blue-300 rounded-lg p-1 px-2 top-1 right-1 absolute'>
									<span>Моя задача</span>
									<BookmarkCheck className='ml-1' color='green' size={18} />
								</div>
							)}
						</div>
						<h3
							className={`font-bold pt-4 text-ellipsis line-clamp-1 ${
								title.length > 40 ? 'text-lg' : 'text-xl'
							} text-gray-800`}
						>
							{title}
						</h3>
						<div className='pt-4 text-gray-700 break-words'>{truncatedDescription}</div>
						<div className='py-2 mt-4'>
							<p className='text-gray-600 font-medium mb-2'>{`Срок до: ${deadline}`}</p>
							<div className='flex flex-wrap gap-2'>
								{tags.map(tag => (
									<span
										key={tag}
										className='bg-blue-400 text-white text-sm font-medium px-2 py-1 rounded-full'
									>
										{tag}
									</span>
								))}
							</div>
						</div>
						<div className='flex flex-col mb-4'>
							<p className='text-gray-600 font-medium mb-2'>Сложность</p>
							{renderDifficultyStars(difficulty)}
						</div>
						<div className='flex justify-between'>
							<button
								className='py-2 px-3 text-sm text-white font-semibold bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg shadow-md hover:from-blue-500 hover:to-blue-700 transition-all'
								onClick={handleNavigate}
							>
								На страницу задачи
							</button>
							<div className='flex items-center text-gray-700 font-medium'>
								{companyName}
								<BadgeCheck className='ml-1' fill='green' size={20} />
							</div>
						</div>
					</div>
				</div>
			)}
			{type === 'card' && (
				<div className='w-full max-w-[380px] h-[460px] rounded-xl border-2 border-gray-200 bg-gradient-to-br from-blue-100 to-blue-200 shadow-lg overflow-hidden relative'>
					<div className='p-4 flex flex-col h-full'>
						<div className='flex justify-between text-gray-600 text-sm font-medium'>
							<p>Сейчас отслеживают {trackingNumber}</p>
							{role === 'user' && showFavoriteButton && (addToFavorite || removeFromFavorite) && (
								<button className='p-1 rounded transition-colors' onClick={handleFavoriteClick}>
									<Heart
										fill={isFavorite ? 'red' : 'gray'}
										color={isFavorite ? 'red' : 'red'}
										className={isFavorite ? '' : 'hover:fill-red-500 hover:text-red-500'}
										size={32}
									/>
								</button>
							)}
							{role === 'employer' && showControls && (
								<div className='flex space-x-2'>
									<button
										onClick={handleEdit}
										className='text-xs text-white bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg p-1 px-2 shadow-md hover:from-blue-500 hover:to-blue-700 transition-all flex items-center'
									>
										Редактировать
										<Settings className='ml-1' size={16} />
									</button>
									<button
										onClick={() => onDelete && onDelete(id)}
										className='text-xs text-white bg-gradient-to-br from-red-400 to-red-600 rounded-lg p-1 px-2 shadow-md hover:from-red-500 hover:to-red-700 transition-all flex items-center'
									>
										Удалить задачу
										<Delete className='ml-1' size={28} />
									</button>
								</div>
							)}
							{role === 'employer' && isMine && !showControls && (
								<div className='flex items-center text-blue-900 text-xs font-medium bg-blue-300 rounded-lg p-1 px-2 top-2 right-2 absolute'>
									<span>Моя задача</span>
									<BookmarkCheck className='ml-1' color='green' size={16} />
								</div>
							)}
						</div>
						<div className='flex flex-col flex-1'>
							<h3
								className={`font-bold pt-4 text-ellipsis line-clamp-1 ${
									title.length > 40 ? 'text-lg' : 'text-xl'
								} text-gray-800`}
							>
								{title}
							</h3>
							<div className='pt-4 flex-1 text-gray-700 text-ellipsis line-clamp-4 break-words'>
								{truncatedDescription}
							</div>
							<div className='mt-4 flex flex-col'>
								<p className='text-gray-600 font-medium mb-2'>{`Срок до: ${deadline}`}</p>
								<div className='flex flex-wrap gap-2 mb-3'>
									{tags.map(tag => (
										<span
											key={tag}
											className='bg-blue-400 text-white text-sm font-medium px-2 py-1 rounded-full'
										>
											{tag}
										</span>
									))}
								</div>
								<div>
									<p className='text-gray-600 font-medium mb-2'>Сложность</p>
									{renderDifficultyStars(difficulty)}
								</div>
							</div>
						</div>
						<div className='mt-4'>
							<Button
								onClick={handleNavigate}
								className='py-2 px-3 w-full text-sm text-white font-semibold bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg shadow-md hover:from-blue-500 hover:to-blue-700 transition-all'
							>
								На страницу задачи
							</Button>
							<div className='flex items-center text-gray-700 font-medium mb-1.5 mt-1.5'>
								{companyName}
								<BadgeCheck className='ml-2' fill='green' size={16} />
							</div>
						</div>
					</div>
				</div>
			)}
		</>
	)
}

export default memo(TaskCard)

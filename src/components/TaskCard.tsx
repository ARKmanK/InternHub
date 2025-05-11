import { FC } from 'react'
import { useNavigate } from 'react-router-dom'
import { Heart, BadgeCheck, Star } from 'lucide-react'
import { TypeTasksData } from '@data/tasksData'
import { motion } from 'framer-motion'
import { Button } from '@components/UI/Button/Button'

type TypeTasksDataProps = TypeTasksData & {
	type: string
	addToFavorite?: (id: number) => void
	isFavorite?: boolean
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
}) => {
	const navigate = useNavigate()

	const handleClick = (id: string) => {
		navigate(`/task/${id}`)
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

	return (
		<>
			{type === 'list' && (
				<div className='md:min-w-[300px] md:min-h-[250px] rounded-xl md:mb-10 border-2 border-gray-[#dce3eb] bg-[#96bddd]'>
					<div className='md:py-2 md:px-3'>
						<div className='md:flex md:justify-between text-gray-500 text-sm'>
							<p>Сейчас отслеживают {trackingNumber}</p>
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
						</div>
						<h3 className='text-xl font-semibold md:pt-4'>{title}</h3>
						<div className='w-[70%] md:pt-4'>{description}</div>
						<div className='md:flex md:py-2 md:mt-4'>
							<p>{`Срок до: ${deadline}`}</p>
							<div className='md:ml-4 md:flex'>
								{tags.map(tag => (
									<div
										key={tag}
										className='bg-[#6092bb] md:mx-3 md:min-w-[40px] rounded-md md:text-center md:px-2 md:py-0.5'
									>
										{tag}
									</div>
								))}
							</div>
						</div>
						<div className='md:flex md:flex-col md:mb-4'>
							<p className='md:mb-2'>Сложность</p>
							{renderDifficultyStars(difficulty)}
						</div>
						<div className='md:flex md:justify-between'>
							<Button onClick={() => handleClick(id.toString())}>Привести решение</Button>
							<div className='md:flex'>
								{companyName}
								<BadgeCheck className='ml-2' fill='green' />
							</div>
						</div>
					</div>
				</div>
			)}
			{type === 'card' && (
				<div className='md:min-w-[310px] md:min-h-[350px] bg-[#96bddd] rounded-xl border-2 border-gray-[#dce3eb]'>
					<div className='md:py-2 md:px-3'>
						<div className='md:flex md:justify-between text-gray-500 text-sm'>
							<p>Сейчас отслеживают {trackingNumber}</p>
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
						</div>
						<h3 className='text-xl font-semibold md:pt-4'>{title}</h3>
						<div className='md:pt-4'>{description}</div>
						<div className='md:flex-col md:mt-6'>
							<div className='md:flex md:mb-0.5'>
								<p>{`Срок до: ${deadline}`}</p>
								<div className='md:ml-4 md:flex'>
									{tags.map(tag => (
										<div
											key={tag}
											className='bg-[#6092bb] md:mr-3 md:min-w-[40px] rounded-md md:text-center md:px-2 md:py-0.5'
										>
											{tag}
										</div>
									))}
								</div>
							</div>
							<div className='md:mb-3'>
								<p className='md:mb-2'>Сложность</p>
								{renderDifficultyStars(difficulty)}
							</div>
						</div>
						<div className='md:flex md:justify-between'>
							<Button onClick={() => handleClick(id.toString())}>Привести решение</Button>
							<div className='md:flex'>
								{companyName}
								<BadgeCheck className='ml-2' fill='green' />
							</div>
						</div>
					</div>
				</div>
			)}
		</>
	)
}

export default TaskCard

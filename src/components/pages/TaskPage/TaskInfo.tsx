import { FC } from 'react'
import { motion } from 'framer-motion'
import { Star, BadgeCheck, FileArchive } from 'lucide-react'
import { TypeTask } from '@/src/types/TypeTask'

type TypeTaskInfoProps = {
	task: TypeTask
	handleDownloadArchive: () => void
}

const TaskInfo: FC<TypeTaskInfoProps> = ({ task, handleDownloadArchive }) => {
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
					<Star key={index} size={20} className={starColorClass} />
				))}
			</div>
		)
	}

	return (
		<div className='md:min-w-[300px] md:min-h-[250px] rounded-xl md:mb-11 border-2 border-gray-200 bg-gradient-to-br from-blue-100 to-blue-200 shadow-lg'>
			<div className='md:py-4 md:px-6'>
				<div className='md:flex md:justify-between text-gray-600 text-sm font-medium'>
					<p>Сейчас отслеживают {task.tracking_number}</p>
				</div>
				<h3 className='text-2xl font-bold md:pt-4 text-gray-800'>{task.title}</h3>
				<div className='w-[93%] md:pt-4 text-gray-700 break-words'>{task.description}</div>
				<div className='md:flex md:py-3 md:mt-4'>
					<p className='text-gray-600'>{`Срок до: ${task.deadline}`}</p>
					<div className='md:ml-4 md:flex'>
						{task.tags && task.tags.length > 0 ? (
							task.tags.map(tag => (
								<div
									key={tag}
									className='bg-blue-400 text-white md:mx-3 md:min-w-[40px] rounded-full md:text-center md:px-3 md:py-1 text-sm'
								>
									{tag}
								</div>
							))
						) : (
							<div className='text-gray-600 text-sm md:mx-3'>Теги отсутствуют</div>
						)}
					</div>
				</div>
				<div className='md:flex md:flex-col md:mb-4'>
					<p className='md:mb-2 text-gray-600 font-medium'>Сложность</p>
					{renderDifficultyStars(task.difficulty)}
				</div>
				<div className='md:flex md:justify-between md:items-center'>
					<div className='md:flex items-center text-gray-700 font-medium'>
						{task.company_name}
						<BadgeCheck className='ml-2' fill='green' />
					</div>
					{task.zip_file_url && (
						<div className='border-2 border-blue-300 rounded-lg p-2 bg-white shadow-md flex flex-col items-center'>
							<span className='text-gray-800 text-sm font-semibold mb-2 whitespace-nowrap'>
								Доп. материалы
							</span>
							<motion.button
								whileTap={{ scale: 0.95 }}
								className='w-full md:w-auto md:py-2 md:px-4 border border-gray-400 rounded-md bg-gradient-to-br from-blue-300 to-blue-500 text-gray-900 cursor-pointer flex items-center justify-center hover:from-blue-400 hover:to-blue-600 transition-all shadow-md'
								onClick={handleDownloadArchive}
							>
								<FileArchive className='mr-2' size={20} />
								<span className='text-sm font-medium'>Скачать архив</span>
							</motion.button>
						</div>
					)}
				</div>
			</div>
		</div>
	)
}

export default TaskInfo

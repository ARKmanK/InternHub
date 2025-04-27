import { FC } from 'react'
import { useNavigate } from 'react-router-dom'
import { Heart, BadgeCheck } from 'lucide-react'
import { TypeTasksData } from '@data/tasksData'

const TaskCard: FC<TypeTasksData> = ({
	id,
	trackingNumber,
	title,
	description,
	difficulty,
	taskPath,
	companyName,
}) => {
	const handleClick = (taskPath: string) => {
		const navigate = useNavigate()
		navigate(`${taskPath}#${id}`)
	}

	return (
		<>
			<div className='md:min-w-[300px] md:min-h-[250px] rounded-xl md:mb-10 border-2 border-gray-[#dce3eb] bg-[#96bddd]'>
				<div className='md:py-2 md:px-3'>
					<div className='md:flex md:justify-between text-gray-500 text-sm'>
						<p>Сейчас отслеживают {trackingNumber}</p>
						<button className='hover:bg-gray-400 text-white'>
							<Heart fill='red' size={32} />
						</button>
					</div>
					<h3 className='text-xl font-semibold md:pt-4'>{title}</h3>
					<div className='w-[70%] md:pt-4'>{description}</div>
					<div className='md:flex md:flex-col md:mt-4'>
						<p className='md:mb-2'>Сложность</p>
						<img className='md:mb-4' src={`../../public/${difficulty}`} alt='' />
					</div>
					<div className='md:flex md:justify-between'>
						<button
							className='md:py-1.5 md:px-2 md:rounded-lg bg-[#0c426f] text-white font-semibold'
							onClick={() => handleClick(taskPath)}
						>
							Привести решение
						</button>
						<div className='md:flex'>
							{companyName}
							<BadgeCheck className='ml-2' fill='green' />
						</div>
					</div>
				</div>
			</div>
		</>
	)
}

export default TaskCard

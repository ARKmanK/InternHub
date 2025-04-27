import Header from '@components/Header'
import NavBar from '@components/NavBar'
import TaskCard from '@components/TaskCard'
import TaskFilter from '@/src/components/TaskFilter'
import { tasksData } from '@data/tasksData'
import { List, BookCopy } from 'lucide-react'

function Home() {
	const handleClick = () => {
		alert('Разместить задачу')
	}
	return (
		<>
			<Header />
			<NavBar />
			<div className='md:flex md:justify-center md:py-[20px] md:px-[10px]'>
				<div className='md:min-h-[1200px] md:w-[980px]'>
					<div className='md:flex md:flex-col'>
						<div className='md:py-4 md:flex md:justify-end'>
							<button
								className='md:py-1.5 md:px-2 md:rounded-lg bg-[#0c426f] text-white font-semibold'
								onClick={handleClick}
							>
								Разместить задачу
							</button>
						</div>
						<div className='md:flex md:justify-end'>
							<button className='mr-4 p-1 hover:bg-gray-300'>
								<List size={30} />
							</button>
							<button className='p-1 hover:bg-gray-300'>
								<BookCopy size={30} />
							</button>
						</div>

						<div className='md:flex mt-7'>
							<div className='md:w-[25%] md:mr-10'>
								<TaskFilter />
							</div>
							<div className='md:w-[80%]'>
								{tasksData.map(task => (
									<TaskCard
										key={task.id}
										id={task.id}
										trackingNumber={task.trackingNumber}
										title={task.title}
										description={task.description}
										difficulty={task.difficulty}
										taskPath={task.taskPath}
										companyName={task.companyName}
									/>
								))}
							</div>
						</div>
					</div>
				</div>
			</div>
		</>
	)
}

export default Home

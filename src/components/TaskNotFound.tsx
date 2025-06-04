import { FC } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Undo2 } from 'lucide-react'
import { goBack } from '@data/userData'
import { NavigateFunction } from 'react-router-dom'

const TaskNotFound: FC = () => {
	const navigate = useNavigate()
	const handleGoBack = goBack(navigate as NavigateFunction)

	return (
		<div className='md:flex md:justify-center md:py-[20px] md:px-[10px]'>
			<div className='md:min-h-[900px] md:w-[980px]'>
				<div className='md:flex md:flex-col'>
					<div className='md:py-4 md:flex md:justify-end md:items-center'>
						<motion.button
							whileHover={{ scale: 1.1 }}
							whileTap={{ scale: 0.9 }}
							className='p-2 bg-gradient-to-br from-blue-200 to-blue-400 text-gray-800 rounded-lg shadow-md hover:from-blue-300 hover:to-blue-500 transition-all flex items-center space-x-2'
							onClick={handleGoBack}
							aria-label='Вернуться назад'
						>
							<Undo2 size={24} />
							<span className='text-sm font-semibold'>Назад</span>
						</motion.button>
					</div>
					<div className='flex items-center justify-center h-[calc(100vh-200px)]'>
						<span className='text-3xl text-gray-400 opacity-70 font-semibold'>
							Задача не найдена
						</span>
					</div>
				</div>
			</div>
		</div>
	)
}

export default TaskNotFound

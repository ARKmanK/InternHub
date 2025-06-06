import { Plus } from 'lucide-react'
import { motion } from 'framer-motion'

type TypeCreateTaskButtonProps = {
	onClick: () => void
}

const CreateTaskButton = ({ onClick }: TypeCreateTaskButtonProps) => (
	<motion.button
		whileHover={{ scale: 1.1 }}
		whileTap={{ scale: 0.9 }}
		className='mr-4 p-2 bg-gradient-to-br from-blue-200 to-blue-400 text-gray-800 rounded-lg shadow-md hover:from-blue-300 hover:to-blue-500 transition-all flex items-center space-x-2'
		onClick={onClick}
	>
		<Plus size={24} />
		<span className='text-sm font-semibold'>Разместить задачу</span>
	</motion.button>
)

export default CreateTaskButton

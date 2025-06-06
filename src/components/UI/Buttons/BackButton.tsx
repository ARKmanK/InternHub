import { Undo2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { MouseEventHandler } from 'react'

type TypeBackButtonProps = {
	goBack: MouseEventHandler<HTMLButtonElement>
}

const BackButton = ({ goBack }: TypeBackButtonProps) => (
	<motion.button
		whileHover={{ scale: 1.1 }}
		whileTap={{ scale: 0.9 }}
		className='md:mr-4 p-2 bg-gradient-to-br from-blue-200 to-blue-400 text-gray-800 rounded-lg shadow-md hover:from-blue-300 hover:to-blue-500 transition-all flex items-center space-x-2'
		onClick={goBack}
		aria-label='Вернуться назад'
	>
		<Undo2 size={24} />
		<span className='text-sm font-semibold'>Назад</span>
	</motion.button>
)

export default BackButton

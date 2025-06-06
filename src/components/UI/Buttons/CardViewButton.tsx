import { BookCopy } from 'lucide-react'
import { motion } from 'framer-motion'

type TypeCardViewButtonProps = {
	onClick: () => void
	isActive: boolean
}

const CardViewButton = ({ onClick, isActive }: TypeCardViewButtonProps) => (
	<motion.button
		whileHover={{ scale: 1.1 }}
		whileTap={{ scale: 0.9 }}
		className={`p-2 bg-gradient-to-br text-gray-800 rounded-lg shadow-md transition-all ${
			isActive
				? 'from-blue-300 to-blue-500'
				: 'from-blue-200 to-blue-400 hover:from-blue-300 hover:to-blue-500'
		}`}
		onClick={onClick}
		aria-label='Отображение карточками'
	>
		<BookCopy size={24} />
	</motion.button>
)

export default CardViewButton

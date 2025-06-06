import { List } from 'lucide-react'
import { motion } from 'framer-motion'

type TypeListViewButtonProps = {
	onClick: () => void
	isActive: boolean
}

const ListViewButton = ({ onClick, isActive }: TypeListViewButtonProps) => (
	<motion.button
		whileHover={{ scale: 1.1 }}
		whileTap={{ scale: 0.9 }}
		className={`md:mr-4 p-2 bg-gradient-to-br text-gray-800 rounded-lg shadow-md transition-all ${
			isActive
				? 'from-blue-300 to-blue-500'
				: 'from-blue-200 to-blue-400 hover:from-blue-300 hover:to-blue-500'
		}`}
		onClick={onClick}
		aria-label='Отображение списком'
	>
		<List size={24} />
	</motion.button>
)

export default ListViewButton

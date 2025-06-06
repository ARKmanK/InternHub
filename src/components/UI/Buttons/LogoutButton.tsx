import { LogOut } from 'lucide-react'
import { motion } from 'framer-motion'

type LogoutButtonProps = {
	handleLogout: () => void
}

const LogoutButton = ({ handleLogout }: LogoutButtonProps) => (
	<motion.button
		whileHover={{ scale: 1.1 }}
		whileTap={{ scale: 0.9 }}
		className='p-2 bg-gradient-to-br from-blue-200 to-blue-400 text-gray-800 rounded-lg shadow-md hover:from-blue-300 hover:to-blue-500 transition-all flex items-center space-x-2'
		onClick={handleLogout}
	>
		<LogOut size={24} />
		<span className='text-sm font-semibold'>Выйти</span>
	</motion.button>
)

export default LogoutButton

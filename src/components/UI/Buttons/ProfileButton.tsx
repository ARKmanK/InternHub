import { CircleUserRound } from 'lucide-react'
import { motion } from 'framer-motion'

type TypeProfileButtonProps = {
	onClick: () => void
	role: 'user' | 'employer' | 'admin' | null
	submissionsLoading: boolean
	submissionsCount: number
}

const ProfileButton = ({
	onClick,
	role,
	submissionsLoading,
	submissionsCount,
}: TypeProfileButtonProps) => (
	<motion.button
		whileHover={{ scale: 1.1 }}
		whileTap={{ scale: 0.9 }}
		className='md:ml-4 p-2 bg-gradient-to-br from-blue-200 to-blue-400 text-gray-800 rounded-lg shadow-md hover:from-blue-300 hover:to-blue-500 transition-all flex items-center space-x-2 relative'
		onClick={onClick}
		aria-label='Открыть профиль'
	>
		<CircleUserRound size={24} />
		<span className='text-sm font-semibold'>Профиль</span>
		{role === 'admin' &&
			(submissionsLoading ? (
				<span className='absolute top-[-10px] right-[-10px] bg-gradient-to-br from-gray-300 to-gray-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center'>
					...
				</span>
			) : (
				submissionsCount > 0 && (
					<span className='absolute top-[-10px] right-[-10px] bg-gradient-to-br from-red-300 to-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center'>
						{submissionsCount}
					</span>
				)
			))}
	</motion.button>
)

export default ProfileButton

import { motion } from 'framer-motion'
import { memo } from 'react'

const LoadingSpinner = memo(() => (
	<motion.div
		className='flex justify-center items-center h-[200px] overflow-hidden'
		initial={{ opacity: 0 }}
		animate={{ opacity: 1 }}
		exit={{ opacity: 0, transition: { duration: 0.3 } }}
	>
		<motion.svg
			width='200'
			height='200'
			viewBox='0 0 200 200'
			fill='none'
			xmlns='http://www.w3.org/2000/svg'
			className='max-w-full'
		>
			<motion.circle
				cx='100'
				cy='70'
				r='5'
				fill='#60a5fa'
				animate={{
					y: [70, 100, 70],
					opacity: [0.8, 0, 0.8],
					scale: [1, 1.5, 1],
					transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
				}}
			/>
			<motion.circle
				cx='120'
				cy='80'
				r='5'
				fill='#3b82f6'
				animate={{
					y: [80, 110, 80],
					opacity: [0.8, 0, 0.8],
					scale: [1, 1.5, 1],
					transition: { duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.5 },
				}}
			/>
			<motion.circle
				cx='80'
				cy='120'
				r='5'
				fill='#60a5fa'
				animate={{
					y: [120, 90, 120],
					opacity: [0.8, 0, 0.8],
					scale: [1, 1.5, 1],
					transition: { duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 1 },
				}}
			/>
			<motion.circle
				cx='130'
				cy='130'
				r='5'
				fill='#3b82f6'
				animate={{
					y: [130, 100, 130],
					opacity: [0.8, 0, 0.8],
					scale: [1, 1.5, 1],
					transition: { duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 1.5 },
				}}
			/>
			<motion.circle
				cx='100'
				cy='100'
				r='15'
				fill='none'
				stroke='#60a5fa'
				strokeWidth='2'
				animate={{
					scale: [0.5, 1, 0.5],
					opacity: [0.3, 1, 0.3],
					transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
				}}
			/>
		</motion.svg>
	</motion.div>
))

export default LoadingSpinner

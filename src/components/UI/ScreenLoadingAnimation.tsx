import { FC, useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

type TypeLoadingSpinnerProps = {
	loading: boolean
}

const ScreenLoadingAnimation: FC<TypeLoadingSpinnerProps> = ({ loading }) => {
	const [isVisible, setIsVisible] = useState(false)
	const [animationComplete, setAnimationComplete] = useState(false)

	useEffect(() => {
		let timeoutId: NodeJS.Timeout
		if (loading) {
			setIsVisible(true)
			setAnimationComplete(false)
			timeoutId = setTimeout(() => {
				if (!loading) {
					setAnimationComplete(true)
				}
			}, 2000)
		} else if (isVisible && !animationComplete) {
			const totalDuration = Math.max(2000, 3000)
			timeoutId = setTimeout(() => {
				setIsVisible(false)
			}, totalDuration - (Date.now() % 3000))
		}
		return () => clearTimeout(timeoutId)
	}, [loading, isVisible, animationComplete])

	return (
		<AnimatePresence>
			{isVisible && (
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0, transition: { duration: 0.5 } }}
					className='fixed inset-0 flex justify-center items-center bg-gray-900 bg-opacity-50 z-50'
				>
					<motion.svg
						width='300'
						height='300'
						viewBox='0 0 300 300'
						fill='none'
						xmlns='http://www.w3.org/2000/svg'
						animate={{
							y: [0, -20, 0],
							transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
						}}
					>
						<motion.polygon
							points='150,70 200,110 200,190 150,230 100,190 100,110'
							fill='url(#crystalGradient)'
							stroke='#8b5cf6'
							strokeWidth='5'
							animate={{
								scale: [1, 1.1, 1],
								transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
							}}
						/>
						<motion.polygon
							points='150,90 180,110 180,190 150,210 120,190 120,110'
							fill='none'
							stroke='#ffffff'
							strokeWidth='3'
							opacity='0.5'
							animate={{
								opacity: [0.5, 0.8, 0.5],
								transition: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' },
							}}
						/>
						<motion.path
							d='M 190 80 Q 220 60 250 80'
							stroke='#8b5cf6'
							strokeWidth='3'
							fill='none'
							animate={{
								opacity: [0, 1, 0],
								pathLength: [0, 1, 0],
								transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
							}}
						/>
						<motion.path
							d='M 110 220 Q 80 240 50 220'
							stroke='#8b5cf6'
							strokeWidth='3'
							fill='none'
							animate={{
								opacity: [0, 1, 0],
								pathLength: [0, 1, 0],
								transition: { duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.5 },
							}}
						/>
						<motion.path
							d='M 220 150 Q 240 120 260 150'
							stroke='#8b5cf6'
							strokeWidth='3'
							fill='none'
							animate={{
								opacity: [0, 1, 0],
								pathLength: [0, 1, 0],
								transition: { duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 1 },
							}}
						/>
						<defs>
							<linearGradient id='crystalGradient' x1='0' x2='1' y1='0' y2='1'>
								<stop offset='0%' style={{ stopColor: '#a78bfa' }} />
								<stop offset='50%' style={{ stopColor: '#8b5cf6' }} />
								<stop offset='100%' style={{ stopColor: '#d8b4fe' }} />
							</linearGradient>
						</defs>
					</motion.svg>
				</motion.div>
			)}
		</AnimatePresence>
	)
}

export default ScreenLoadingAnimation

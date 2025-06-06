import { FC } from 'react'
import { Inbox } from 'lucide-react'
import { motion } from 'framer-motion'

type TypeEmptyCardProps = {
	listType: string
	role: string | null
}

const EmptyCard: FC<TypeEmptyCardProps> = ({ listType, role }) => {
	return (
		<div className='md:min-w-[300px] md:h-[250px] rounded-xl md:mb-10 border-2 border-gray-200 bg-gradient-to-br from-blue-100 to-blue-200 shadow-lg'>
			<div className='flex flex-col items-center justify-center h-full'>
				{/* Иконка с анимацией */}
				<motion.div
					initial={{ scale: 0, opacity: 0 }}
					animate={{ scale: 1, opacity: 1 }}
					transition={{ duration: 0.5, ease: 'easeOut' }}
				>
					<Inbox size={48} className='text-gray-500 mb-4' />
				</motion.div>

				{/* Заголовок с анимацией */}
				<motion.p
					initial={{ y: 20, opacity: 0 }}
					animate={{ y: 0, opacity: 1 }}
					transition={{ duration: 0.5, delay: 0.2 }}
					className='md:mb-4 text-2xl text-gray-700 font-semibold'
				>
					{role === 'user' ? listType : 'Ваши задачи'}
				</motion.p>

				{/* Текст "Список пуст" с анимацией */}
				<motion.p
					initial={{ y: 20, opacity: 0 }}
					animate={{ y: 0, opacity: 1 }}
					transition={{ duration: 0.5, delay: 0.4 }}
					className='text-3xl text-gray-600'
				>
					Список пуст
				</motion.p>
			</div>
		</div>
	)
}

export default EmptyCard

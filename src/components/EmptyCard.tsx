import { FC } from 'react'

type TypeEmptyCardProps = {
	listType: string
	role: string | null
}

const EmptyCard: FC<TypeEmptyCardProps> = ({ listType, role }) => {
	return (
		<>
			<div className='md:min-w-[300px] md:h-[250px] rounded-xl md:mb-10 border-2 border-gray-[#dce3eb] bg-[#96bddd]'>
				<div className='md:flex md:flex-col md:items-center md:justify-start h-full'>
					{role === 'user' ? (
						<p className='md:mt-3 md:mb-9 text-2xl text-gray-900 opacity-30'>{listType}</p>
					) : (
						<p className='md:mt-3 md:mb-9 text-2xl text-gray-900 opacity-30'>Ваши задачи</p>
					)}
					<p className='text-4xl text-gray-900 opacity-30'>Список пуст</p>
				</div>
			</div>
		</>
	)
}

export default EmptyCard

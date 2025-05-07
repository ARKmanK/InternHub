import { FC } from 'react'

const EmptyCard: FC = () => {
	return (
		<>
			<div className='md:min-w-[300px] md:min-h-[250px] rounded-xl md:mb-10 border-2 border-gray-[#dce3eb] bg-[#96bddd]'>
				<div className='md:py-2 md:px-3'>
					<div className='md:w-full md:flex md:justify-center'>
						<p className='md:mt-4 text-2xl '>Список ваших задач пуст</p>
					</div>
				</div>
			</div>
		</>
	)
}

export default EmptyCard

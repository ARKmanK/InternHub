import { FC, useState } from 'react'
import { ChevronDown } from 'lucide-react'

const TaskFilter: FC = () => {
	const [openSection, setOpenSection] = useState({
		companies: false,
		difficulty: false,
		tracking: false,
	})

	const toggleSection = (section: keyof typeof openSection) => {
		setOpenSection(prev => ({
			...prev,
			[section]: !prev[section],
		}))
	}

	return (
		<>
			<div className='w-full max-w-md mx-auto bg-[#96bddd] rounded-lg mr-10'>
				{/* Блок "Компании" */}
				<div className='border-b border-gray-300'>
					<button
						className='flex items-center justify-between w-full py-3 px-4 text-left text-gray-800 focus:outline-none'
						onClick={() => toggleSection('companies')}
					>
						<span>Компании</span>
						<ChevronDown
							className={`w-5 h-5 transition-transform duration-300 ${
								openSection.companies ? 'rotate-180' : ''
							}`}
						/>
					</button>
					<div
						className={`overflow-hidden transition-all duration-300 ${
							openSection.companies ? 'max-h-screen py-2 px-4' : 'max-h-0'
						}`}
					>
						<ul className='space-y-2'>
							<li className='flex items-center space-x-2'>
								<span className='w-3 h-3 bg-gray-400 rounded-full'></span>
								<span>Section 3</span>
							</li>
							<li className='flex items-center space-x-2'>
								<span className='w-3 h-3 bg-gray-400 rounded-full'></span>
								<span>Section 4</span>
							</li>
						</ul>
					</div>
				</div>

				{/* Блок "Сложности" */}
				<div className='border-b border-gray-300'>
					<button
						className='flex items-center justify-between w-full py-3 px-4 text-left text-gray-800 focus:outline-none'
						onClick={() => toggleSection('difficulty')}
					>
						<span>Сложности</span>
						<ChevronDown
							className={`w-5 h-5 transition-transform duration-300 ${
								openSection.difficulty ? 'rotate-180' : ''
							}`}
						/>
					</button>
					<div
						className={`overflow-hidden transition-all duration-300 ${
							openSection.difficulty ? 'max-h-screen py-2 px-4' : 'max-h-0'
						}`}
					>
						<ul className='space-y-2'>
							<li className='flex items-center space-x-2'>
								<span className='w-3 h-3 bg-gray-400 rounded-full'></span>
								<span>Легкая</span>
							</li>
							<li className='flex items-center space-x-2'>
								<span className='w-3 h-3 bg-gray-400 rounded-full'></span>
								<span>Средняя</span>
							</li>
							<li className='flex items-center space-x-2'>
								<span className='w-3 h-3 bg-gray-400 rounded-full'></span>
								<span>Сложная</span>
							</li>
						</ul>
					</div>
				</div>

				{/* Блок "Отслеживать" */}
				<div className='border-b border-gray-300'>
					<button
						className='flex items-center justify-between w-full py-3 px-4 text-left text-gray-800 focus:outline-none'
						onClick={() => toggleSection('tracking')}
					>
						<span>Отслеживать</span>
						<ChevronDown
							className={`w-5 h-5 transition-transform duration-300 ${
								openSection.tracking ? 'rotate-180' : ''
							}`}
						/>
					</button>
					<div
						className={`overflow-hidden transition-all duration-300 ${
							openSection.tracking ? 'max-h-screen py-2 px-4' : 'max-h-0'
						}`}
					>
						<ul className='space-y-2'>
							<li className='flex items-center space-x-2'>
								<span className='w-3 h-3 bg-gray-400 rounded-full'></span>
								<span>Да</span>
							</li>
							<li className='flex items-center space-x-2'>
								<span className='w-3 h-3 bg-gray-400 rounded-full'></span>
								<span>Нет</span>
							</li>
						</ul>
					</div>
				</div>
			</div>
		</>
	)
}

export default TaskFilter

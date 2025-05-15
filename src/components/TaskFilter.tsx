import { FC, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { companyNames } from '../data/companyNames'

type TypeFilter = {
	companies: string | null
	difficulty: number | null
	tracking: boolean | null
}

interface TaskFilterProps {
	filter: TypeFilter
	setFilter: (filter: TypeFilter) => void
}

const TaskFilter: FC<TaskFilterProps> = ({ filter, setFilter }) => {
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

	// Функция для сброса всех фильтров
	const resetFilters = () => {
		setFilter({
			companies: null,
			difficulty: null,
			tracking: null,
		})
	}

	// Обработчики изменения фильтров
	const handleCompanyChange = (company: string | null) => {
		setFilter({
			...filter,
			companies: filter.companies === company ? null : company,
		})
	}

	const handleDifficultyChange = (difficulty: number | null) => {
		setFilter({
			...filter,
			difficulty: filter.difficulty === difficulty ? null : difficulty,
		})
	}

	const handleTrackingChange = (value: boolean | null) => {
		setFilter({
			...filter,
			tracking: filter.tracking === value ? null : value,
		})
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
						<span>Компания</span>
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
							{companyNames.map(company => (
								<li key={company} className='flex items-center space-x-2'>
									<input
										type='radio'
										name='company'
										checked={filter.companies === company}
										onChange={() => handleCompanyChange(company)}
										className='w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500'
									/>
									<span>{company}</span>
								</li>
							))}
						</ul>
					</div>
				</div>

				{/* Блок "Сложности" */}
				<div className='border-b border-gray-300'>
					<button
						className='flex items-center justify-between w-full py-3 px-4 text-left text-gray-800 focus:outline-none'
						onClick={() => toggleSection('difficulty')}
					>
						<span>Сложность</span>
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
							{[1, 2, 3].map(diff => (
								<li key={diff} className='flex items-center space-x-2'>
									<input
										type='radio'
										name='difficulty'
										checked={filter.difficulty === diff}
										onChange={() => handleDifficultyChange(diff)}
										className='w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500'
									/>
									<span>{diff === 1 ? 'Легкая' : diff === 2 ? 'Средняя' : 'Сложная'}</span>
								</li>
							))}
						</ul>
					</div>
				</div>

				{/* Блок "Отслеживают" */}
				<div className='border-b border-gray-300'>
					<button
						className='flex items-center justify-between w-full py-3 px-4 text-left text-gray-800 focus:outline-none'
						onClick={() => toggleSection('tracking')}
					>
						<span>Отслеживают</span>
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
								<input
									type='radio'
									name='tracking'
									checked={filter.tracking === true}
									onChange={() => handleTrackingChange(true)}
									className='w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500'
								/>
								<span>Да</span>
							</li>
							<li className='flex items-center space-x-2'>
								<input
									type='radio'
									name='tracking'
									checked={filter.tracking === false}
									onChange={() => handleTrackingChange(false)}
									className='w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500'
								/>
								<span>Нет</span>
							</li>
						</ul>
					</div>
				</div>

				{/* Кнопка "Сбросить фильтры" */}
				<div className='p-4'>
					<button
						onClick={resetFilters}
						className='w-full py-2 text-white font-medium bg-[#0c426f] rounded-lg hover:bg-blue-600 transition-colors'
					>
						Сбросить фильтры
					</button>
				</div>
			</div>
		</>
	)
}

export default TaskFilter

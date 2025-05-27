import { FC, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { availableTags } from '../data/tags'

type TypeFilter = {
	companies: string | null
	difficulty: number | null
	tracking: '0' | '1-5' | '6-10' | '15-20' | '20+' | null
	tags: string[] | null
}

interface TaskFilterProps {
	filter: TypeFilter
	setFilter: React.Dispatch<React.SetStateAction<TypeFilter>>
	companies: string[] // Новый пропс для динамических компаний
}

const TaskFilter: FC<TaskFilterProps> = ({ filter, setFilter, companies }) => {
	const [openSection, setOpenSection] = useState({
		companies: false,
		difficulty: false,
		tracking: false,
		tags: false,
	})

	const toggleSection = (section: keyof typeof openSection) => {
		setOpenSection(prev => ({
			...prev,
			[section]: !prev[section],
		}))
	}

	const resetFilters = () => {
		setFilter({
			companies: null,
			difficulty: null,
			tracking: null,
			tags: null,
		})
	}

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

	const handleTrackingChange = (value: '0' | '1-5' | '6-10' | '15-20' | '20+' | null) => {
		setFilter({
			...filter,
			tracking: filter.tracking === value ? null : value,
		})
	}

	const handleTagChange = (tag: string) => {
		setFilter((prev: TypeFilter): TypeFilter => {
			const newTags = prev.tags ? [...prev.tags] : []
			if (newTags.includes(tag)) {
				const updatedTags = newTags.filter(t => t !== tag)
				return {
					...prev,
					tags: updatedTags.length > 0 ? updatedTags : null,
				}
			} else {
				return {
					...prev,
					tags: [...newTags, tag],
				}
			}
		})
	}

	return (
		<div className='w-full max-w-md mx-auto bg-[#96bddd] rounded-lg mr-10'>
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
						{companies.map(company => (
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
						{(['0', '1-5', '6-10', '15-20', '20+'] as const).map(range => (
							<li key={range} className='flex items-center space-x-2'>
								<input
									type='radio'
									name='tracking'
									checked={filter.tracking === range}
									onChange={() => handleTrackingChange(range)}
									className='w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500'
								/>
								<span>{range}</span>
							</li>
						))}
					</ul>
				</div>
			</div>

			<div className='border-b border-gray-300'>
				<button
					className='flex items-center justify-between w-full py-3 px-4 text-left text-gray-800 focus:outline-none'
					onClick={() => toggleSection('tags')}
				>
					<span>Теги</span>
					<ChevronDown
						className={`w-5 h-5 transition-transform duration-300 ${
							openSection.tags ? 'rotate-180' : ''
						}`}
					/>
				</button>
				<div
					className={`overflow-hidden transition-all duration-300 ${
						openSection.tags ? 'max-h-screen py-2 px-4' : 'max-h-0'
					}`}
				>
					<ul className='space-y-2'>
						{availableTags.map(tag => (
							<li key={tag} className='flex items-center space-x-2'>
								<input
									type='checkbox'
									checked={filter.tags?.includes(tag) || false}
									onChange={() => handleTagChange(tag)}
									className='w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500'
								/>
								<span>{tag}</span>
							</li>
						))}
					</ul>
				</div>
			</div>
			<div className='p-4'>
				<button
					onClick={resetFilters}
					className='w-full py-2 text-white font-medium bg-[#0c426f] rounded-lg hover:bg-blue-600 transition-colors'
				>
					Сбросить фильтры
				</button>
			</div>
		</div>
	)
}

export default TaskFilter

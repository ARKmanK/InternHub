import { FC, useState, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'
import { supabase } from '@/supabaseClient'
import { getAllTags, getUserTags } from '../lib/API/supabaseAPI'
import useNotification from '@hooks/useNotification'
import { motion, AnimatePresence } from 'framer-motion'

type TypeFilter = {
	companies: string | null
	difficulty: number | null
	tracking: '0' | '1-5' | '6-10' | '15-20' | '20+' | null
	tags: string[] | null
}

interface TaskFilterProps {
	filter: TypeFilter
	setFilter: React.Dispatch<React.SetStateAction<TypeFilter>>
	companies: string[]
}

const TaskFilter: FC<TaskFilterProps> = ({ filter, setFilter, companies }) => {
	const [openSection, setOpenSection] = useState({
		companies: false,
		difficulty: false,
		tracking: false,
		tags: false,
	})
	const [allTags, setAllTags] = useState<string[]>([])
	const { addNotification } = useNotification()

	useEffect(() => {
		const fetchTags = async () => {
			try {
				const commonTags = await getAllTags()
				const commonTagNames = commonTags.map(tag => tag.name)

				const {
					data: { session },
				} = await supabase.auth.getSession()
				if (!session?.user) {
					addNotification('warning', 'Внимание', 'Авторизуйтесь, чтобы увидеть кастомные теги')
					setAllTags([...new Set(commonTagNames)])
					return
				}

				const { data: userData, error: userError } = await supabase
					.from('users')
					.select('id')
					.eq('email', session.user.email)
					.single()

				if (userError || !userData) {
					addNotification('error', 'Ошибка', 'Не удалось загрузить данные пользователя')
					setAllTags([...new Set(commonTagNames)])
					return
				}

				const userId = userData.id
				const userTags = await getUserTags(userId)
				const uniqueTags = [...new Set([...commonTagNames, ...userTags])]
				setAllTags(uniqueTags)
			} catch (error: any) {
				addNotification('error', 'Ошибка', `Не удалось загрузить теги: ${error.message}`)
				setAllTags([])
			}
		}

		fetchTags()
	}, [addNotification])

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
		<div className='w-full max-w-md mx-auto bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg shadow-lg p-4 mr-10'>
			{/* Секция "Компания" */}
			<div className='border-b border-gray-300 mb-2'>
				<button
					className='flex items-center justify-between w-full py-3 px-4 text-left text-gray-800 font-semibold hover:bg-blue-300 rounded-lg transition-colors'
					onClick={() => toggleSection('companies')}
				>
					<span>Компания</span>
					<motion.div
						animate={{ rotate: openSection.companies ? 180 : 0 }}
						transition={{ duration: 0.3 }}
					>
						<ChevronDown className='w-5 h-5 text-gray-600' />
					</motion.div>
				</button>
				<AnimatePresence>
					{openSection.companies && (
						<motion.div
							initial={{ height: 0, opacity: 0 }}
							animate={{ height: 'auto', opacity: 1 }}
							exit={{ height: 0, opacity: 0 }}
							transition={{ duration: 0.3 }}
							className='px-4 pb-2'
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
										<span className='text-gray-700'>{company}</span>
									</li>
								))}
							</ul>
						</motion.div>
					)}
				</AnimatePresence>
			</div>

			{/* Секция "Сложность" */}
			<div className='border-b border-gray-300 mb-2'>
				<button
					className='flex items-center justify-between w-full py-3 px-4 text-left text-gray-800 font-semibold hover:bg-blue-300 rounded-lg transition-colors'
					onClick={() => toggleSection('difficulty')}
				>
					<span>Сложность</span>
					<motion.div
						animate={{ rotate: openSection.difficulty ? 180 : 0 }}
						transition={{ duration: 0.3 }}
					>
						<ChevronDown className='w-5 h-5 text-gray-600' />
					</motion.div>
				</button>
				<AnimatePresence>
					{openSection.difficulty && (
						<motion.div
							initial={{ height: 0, opacity: 0 }}
							animate={{ height: 'auto', opacity: 1 }}
							exit={{ height: 0, opacity: 0 }}
							transition={{ duration: 0.3 }}
							className='px-4 pb-2'
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
										<span className='text-gray-700'>
											{diff === 1 ? 'Легкая' : diff === 2 ? 'Средняя' : 'Сложная'}
										</span>
									</li>
								))}
							</ul>
						</motion.div>
					)}
				</AnimatePresence>
			</div>

			{/* Секция "Отслеживают" */}
			<div className='border-b border-gray-300 mb-2'>
				<button
					className='flex items-center justify-between w-full py-3 px-4 text-left text-gray-800 font-semibold hover:bg-blue-300 rounded-lg transition-colors'
					onClick={() => toggleSection('tracking')}
				>
					<span>Отслеживают</span>
					<motion.div
						animate={{ rotate: openSection.tracking ? 180 : 0 }}
						transition={{ duration: 0.3 }}
					>
						<ChevronDown className='w-5 h-5 text-gray-600' />
					</motion.div>
				</button>
				<AnimatePresence>
					{openSection.tracking && (
						<motion.div
							initial={{ height: 0, opacity: 0 }}
							animate={{ height: 'auto', opacity: 1 }}
							exit={{ height: 0, opacity: 0 }}
							transition={{ duration: 0.3 }}
							className='px-4 pb-2'
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
										<span className='text-gray-700'>{range}</span>
									</li>
								))}
							</ul>
						</motion.div>
					)}
				</AnimatePresence>
			</div>

			{/* Секция "Теги" */}
			<div className='border-b border-gray-300 mb-2'>
				<button
					className='flex items-center justify-between w-full py-3 px-4 text-left text-gray-800 font-semibold hover:bg-blue-300 rounded-lg transition-colors'
					onClick={() => toggleSection('tags')}
				>
					<span>Теги</span>
					<motion.div
						animate={{ rotate: openSection.tags ? 180 : 0 }}
						transition={{ duration: 0.3 }}
					>
						<ChevronDown className='w-5 h-5 text-gray-600' />
					</motion.div>
				</button>
				<AnimatePresence>
					{openSection.tags && (
						<motion.div
							initial={{ height: 0, opacity: 0 }}
							animate={{ height: 'auto', opacity: 1 }}
							exit={{ height: 0, opacity: 0 }}
							transition={{ duration: 0.3 }}
							className='px-4 pb-2'
						>
							<ul className='space-y-2 max-h-48 overflow-y-auto'>
								{allTags.map(tag => (
									<li key={tag} className='flex items-center space-x-2'>
										<input
											type='checkbox'
											checked={filter.tags?.includes(tag) || false}
											onChange={() => handleTagChange(tag)}
											className='w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500'
										/>
										<span className='text-gray-700'>{tag}</span>
									</li>
								))}
							</ul>
						</motion.div>
					)}
				</AnimatePresence>
			</div>

			<div className='p-4'>
				<button
					onClick={resetFilters}
					className='w-full py-2 text-white font-semibold bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg shadow-md hover:from-blue-500 hover:to-blue-700 transition-all'
				>
					Сбросить фильтры
				</button>
			</div>
		</div>
	)
}

export default TaskFilter

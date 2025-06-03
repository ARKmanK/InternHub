import { List, BookCopy, Undo2, LogOut } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import TaskCard from '@components/TaskCard'
import EmptyCard from '@components/EmptyCard'
import { Button } from '@components/UI/Button/Button'
import { setPage } from '@data/userData'
import { NavigateFunction } from 'react-router-dom'
import { useState, useEffect, memo } from 'react'

// Типы для задач
type TypeTask = {
	id: number
	tracking_number: number
	title: string
	description: string
	difficulty: number
	company_name: string
	deadline: string
	tags?: string[]
	employer_id: number
}

type UserProfileProps = {
	listType: 'list' | 'card'
	setListType: (type: 'list' | 'card') => void
	visibleTasks: TypeTask[]
	favoriteTasks: number[]
	category: 'favorite' | 'started' | 'finished'
	activeCategory: string
	handleCategoryChange: (type: 'favorite' | 'started' | 'finished') => void
	addToFavorite: (id: number) => void
	removeFromFavorite: (id: number) => void
	navigate: NavigateFunction
	handleLogout: () => void
	goBack: () => void
}

// Компонент анимации загрузки (светящиеся частицы)
const LoadingSpinner = memo(() => (
	<motion.div
		className='flex justify-center items-center h-64'
		initial={{ opacity: 0 }}
		animate={{ opacity: 1 }}
		exit={{ opacity: 0, transition: { duration: 0.5 } }}
	>
		<motion.svg
			width='300'
			height='300'
			viewBox='0 0 300 300'
			fill='none'
			xmlns='http://www.w3.org/2000/svg'
		>
			{/* Парящие частицы */}
			<motion.circle
				cx='150'
				cy='100'
				r='5'
				fill='#60a5fa'
				animate={{
					y: [100, 150, 100],
					opacity: [0.8, 0, 0.8],
					scale: [1, 1.5, 1],
					transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
				}}
			/>
			<motion.circle
				cx='180'
				cy='120'
				r='5'
				fill='#3b82f6'
				animate={{
					y: [120, 170, 120],
					opacity: [0.8, 0, 0.8],
					scale: [1, 1.5, 1],
					transition: { duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.5 },
				}}
			/>
			<motion.circle
				cx='120'
				cy='180'
				r='5'
				fill='#60a5fa'
				animate={{
					y: [180, 130, 180],
					opacity: [0.8, 0, 0.8],
					scale: [1, 1.5, 1],
					transition: { duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 1 },
				}}
			/>
			<motion.circle
				cx='200'
				cy='200'
				r='5'
				fill='#3b82f6'
				animate={{
					y: [200, 150, 200],
					opacity: [0.8, 0, 0.8],
					scale: [1, 1.5, 1],
					transition: { duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 1.5 },
				}}
			/>
			{/* Центральный узел (сбор частиц) */}
			<motion.circle
				cx='150'
				cy='150'
				r='20'
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

const UserProfile = ({
	listType,
	setListType,
	visibleTasks,
	favoriteTasks,
	category,
	activeCategory,
	handleCategoryChange,
	addToFavorite,
	removeFromFavorite,
	navigate,
	handleLogout,
	goBack,
}: UserProfileProps) => {
	const [isLoading, setIsLoading] = useState(true)
	const [showContent, setShowContent] = useState(false)

	useEffect(() => {
		setIsLoading(true)
		setShowContent(false)

		const timer = setTimeout(() => {
			setIsLoading(false)
			setTimeout(() => {
				setShowContent(true)
			}, 500) // Задержка перед отображением контента
		}, 2000) // Загрузка длится минимум 2 секунды

		return () => clearTimeout(timer)
	}, [category])

	const taskCard = visibleTasks.map(task => (
		<AnimatePresence key={task.id}>
			<motion.div
				initial={{ opacity: 0, y: -20 }}
				animate={{ opacity: 1, y: 0 }}
				exit={{ opacity: 0, y: -20 }}
				transition={{ duration: 0.5 }}
			>
				<TaskCard
					id={task.id}
					trackingNumber={task.tracking_number}
					title={task.title}
					description={task.description}
					difficulty={task.difficulty}
					companyName={task.company_name}
					type={listType}
					addToFavorite={addToFavorite}
					removeFromFavorite={removeFromFavorite}
					isFavorite={favoriteTasks.includes(task.id)}
					showFavoriteButton={category === 'favorite'}
					deadline={task.deadline}
					tags={task.tags ?? []}
					role='user'
					onClick={() => {
						setPage(`/task/${task.id}`)
						navigate(`/task/${task.id}`)
					}}
				/>
			</motion.div>
		</AnimatePresence>
	))

	return (
		<div className='md:flex md:justify-center md:py-[20px] md:px-[10px]'>
			<div className='md:min-h-[730px] md:w-[980px]'>
				<div className='md:flex md:flex-col'>
					<div className='md:py-4 md:flex md:justify-end items-center'>
						<motion.button
							whileHover={{ scale: 1.1 }}
							whileTap={{ scale: 0.9 }}
							className='md:mr-4 p-2 bg-gradient-to-br from-blue-200 to-blue-400 text-gray-800 rounded-lg shadow-md hover:from-blue-300 hover:to-blue-500 transition-all flex items-center space-x-2'
							onClick={goBack}
							aria-label='Вернуться назад'
						>
							<Undo2 size={24} />
							<span className='text-sm font-semibold'>Назад</span>
						</motion.button>
						<motion.button
							whileHover={{ scale: 1.1 }}
							whileTap={{ scale: 0.9 }}
							className='p-2 bg-gradient-to-br from-blue-200 to-blue-400 text-gray-800 rounded-lg shadow-md hover:from-blue-300 hover:to-blue-500 transition-all flex items-center space-x-2'
							onClick={handleLogout}
						>
							<LogOut size={24} />
							<span className='text-sm font-semibold'>Выйти</span>
						</motion.button>
					</div>
					<div className='md:flex md:justify-end'>
						<motion.button
							whileHover={{ scale: 1.1 }}
							whileTap={{ scale: 0.9 }}
							className='md:mr-4 p-2 bg-gradient-to-br from-blue-200 to-blue-400 text-gray-800 rounded-lg shadow-md hover:from-blue-300 hover:to-blue-500 transition-all'
							onClick={() => setListType('list')}
						>
							<List size={24} />
						</motion.button>
						<motion.button
							whileHover={{ scale: 1.1 }}
							whileTap={{ scale: 0.9 }}
							className='p-2 bg-gradient-to-br from-blue-200 to-blue-400 text-gray-800 rounded-lg shadow-md hover:from-blue-300 hover:to-blue-500 transition-all'
							onClick={() => setListType('card')}
						>
							<BookCopy size={24} />
						</motion.button>
					</div>
					<div className='md:flex mt-7'>
						<div className='md:w-[80%]'>
							<h1 className='text-2xl font-bold mb-14'>Страница профиля</h1>
							<div className='md:flex md:justify-start md:gap-x-3 md:mb-10'>
								<motion.button
									whileHover={{ scale: 1.1 }}
									whileTap={{ scale: 0.9 }}
									className={`p-2 rounded-lg shadow-md transition-all flex items-center justify-center min-w-[120px] h-[40px] ${
										activeCategory === 'favorite'
											? 'bg-gradient-to-br from-blue-300 to-blue-500 text-white'
											: 'bg-gradient-to-br from-blue-200 to-blue-400 text-gray-800 hover:from-blue-300 hover:to-blue-500'
									}`}
									onClick={() => handleCategoryChange('favorite')}
								>
									<span className='text-sm font-semibold'>Избранное</span>
								</motion.button>
								<motion.button
									whileHover={{ scale: 1.1 }}
									whileTap={{ scale: 0.9 }}
									className={`p-2 rounded-lg shadow-md transition-all flex items-center justify-center min-w-[120px] h-[40px] ${
										activeCategory === 'started'
											? 'bg-gradient-to-br from-blue-300 to-blue-500 text-white'
											: 'bg-gradient-to-br from-blue-200 to-blue-400 text-gray-800 hover:from-blue-300 hover:to-blue-500'
									}`}
									onClick={() => handleCategoryChange('started')}
								>
									<span className='text-sm font-semibold'>Начатые задачи</span>
								</motion.button>
								<motion.button
									whileHover={{ scale: 1.1 }}
									whileTap={{ scale: 0.9 }}
									className={`p-2 rounded-lg shadow-md transition-all flex items-center justify-center min-w-[120px] h-[40px] ${
										activeCategory === 'finished'
											? 'bg-gradient-to-br from-blue-300 to-blue-500 text-white'
											: 'bg-gradient-to-br from-blue-200 to-blue-400 text-gray-800 hover:from-blue-300 hover:to-blue-500'
									}`}
									onClick={() => handleCategoryChange('finished')}
								>
									<span className='text-sm font-semibold'>Одобренные задачи</span>
								</motion.button>
							</div>
							<AnimatePresence>
								{isLoading ? (
									<LoadingSpinner key={`spinner-${category}`} />
								) : showContent ? (
									visibleTasks.length === 0 ? (
										<motion.div
											key={`empty-${category}`}
											initial={{ opacity: 0 }}
											animate={{ opacity: 1 }}
											exit={{ opacity: 0 }}
											transition={{ duration: 0.5 }}
										>
											<EmptyCard
												role='user'
												listType={
													category === 'favorite'
														? 'Избранное'
														: category === 'started'
														? 'Начатые задачи'
														: 'Одобренные задачи'
												}
											/>
										</motion.div>
									) : listType === 'card' ? (
										<motion.div
											key={`cards-${category}`}
											initial={{ opacity: 0 }}
											animate={{ opacity: 1 }}
											exit={{ opacity: 0 }}
											transition={{ duration: 0.5 }}
											className='md:grid md:gap-4 md:grid-cols-2'
										>
											{taskCard}
										</motion.div>
									) : (
										<motion.div
											key={`list-${category}`}
											initial={{ opacity: 0 }}
											animate={{ opacity: 1 }}
											exit={{ opacity: 0 }}
											transition={{ duration: 0.5 }}
										>
											{taskCard}
										</motion.div>
									)
								) : null}
							</AnimatePresence>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

export default UserProfile

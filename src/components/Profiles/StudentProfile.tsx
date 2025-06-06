import { motion, AnimatePresence } from 'framer-motion'
import BackButton from '@UI/Buttons/BackButton'
import LogoutButton from '@UI/Buttons/LogoutButton'
import ListViewButton from '@UI/Buttons/ListViewButton'
import CardViewButton from '@UI/Buttons/CardViewButton'
import TaskCard from '@components/TaskCard'
import EmptyCard from '@components/EmptyCard'
import LoadingSpinner from '@UI/LoadingSpinner'
import { NavigateFunction } from 'react-router-dom'
import { TypeTask } from '@/src/types/TypeTask'
import { setPage } from '@data/userData'
import { MouseEventHandler } from 'react'

type TypeUserProfileProps = {
	listType: 'list' | 'card'
	setListType: (type: 'list' | 'card') => void
	visibleTasks: TypeTask[]
	favoriteTasks: number[]
	category: 'favorite' | 'started' | 'finished'
	activeCategory: 'favorite' | 'started' | 'finished'
	handleCategoryChange: (category: 'favorite' | 'started' | 'finished') => void
	addToFavorite: (id: number) => void
	removeFromFavorite: (id: number) => void
	navigate: NavigateFunction
	handleLogout: () => void
	goBack: MouseEventHandler<HTMLButtonElement>
	isLoading: boolean
}

const StudentProfile = ({
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
	isLoading,
}: TypeUserProfileProps) => {
	const taskCards = visibleTasks.map(task => (
		<motion.div
			key={task.id}
			initial={{ opacity: 0, y: -20 }}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0 }}
			transition={{ duration: 0.5 }}
			className='max-w-full'
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
					navigate(`/task/${task.id}`, { state: { fromBack: false } })
				}}
			/>
		</motion.div>
	))

	return (
		<div className='md:flex md:justify-center md:py-[20px] md:px-[10px]'>
			<div className='md:min-h-[1130px] md:w-[980px]'>
				<div className='md:flex md:flex-col'>
					<div className='md:py-4 md:flex md:justify-end items-center'>
						<BackButton goBack={goBack} />
						<LogoutButton handleLogout={handleLogout} />
					</div>

					<div className='md:flex md:justify-end'>
						<ListViewButton onClick={() => setListType('list')} isActive={listType === 'list'} />
						<CardViewButton onClick={() => setListType('card')} isActive={listType === 'card'} />
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

							<div className='overflow-y-auto pr-2'>
								<AnimatePresence mode='wait'>
									{isLoading ? (
										<LoadingSpinner key={`spinner-${category}`} />
									) : visibleTasks.length === 0 ? (
										<motion.div
											key={`empty-${category}`}
											initial={{ opacity: 0 }}
											animate={{ opacity: 1 }}
											exit={{ opacity: 0 }}
											transition={{ duration: 0.5 }}
											className='max-w-full'
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
									) : (
										<motion.div
											key={`tasks-${category}`}
											initial={{ opacity: 0 }}
											animate={{ opacity: 1 }}
											exit={{ opacity: 0 }}
											transition={{ duration: 0.5 }}
											className={
												listType === 'card'
													? 'md:grid md:grid-cols-2 md:gap-4 max-w-full'
													: 'max-w-full'
											}
											style={listType === 'card' ? { gridTemplateColumns: '1fr 1fr' } : undefined}
										>
											<AnimatePresence>{taskCards}</AnimatePresence>
										</motion.div>
									)}
								</AnimatePresence>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

export default StudentProfile

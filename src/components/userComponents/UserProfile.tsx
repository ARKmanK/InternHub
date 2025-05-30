// components/userComponents/UserProfile.tsx
import { List, BookCopy, Undo2, LogOut } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import TaskCard from '@components/TaskCard'
import EmptyCard from '@components/EmptyCard'
import { Button } from '@components/UI/Button/Button'
import { setPage } from '@data/userData'
import { NavigateFunction } from 'react-router-dom'

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
	removeFromFavorite: (id: number) => void // Добавляем новый пропс
	navigate: NavigateFunction
	handleLogout: () => void
	goBack: (navigate: NavigateFunction) => void
}

const UserProfile = ({
	listType,
	setListType,
	visibleTasks,
	favoriteTasks,
	category,
	activeCategory,
	handleCategoryChange,
	addToFavorite,
	removeFromFavorite, // Добавляем в параметры
	navigate,
	handleLogout,
	goBack,
}: UserProfileProps) => {
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
					removeFromFavorite={removeFromFavorite} // Передаём в TaskCard
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
						<button
							className='md:p-1 hover:bg-gray-300'
							onClick={() => goBack(navigate)}
							aria-label='Вернуться назад'
						>
							<Undo2 size={30} />
						</button>
						<button
							className='md:flex gap-x-2 border rounded-xl py-1 px-2 ml-4 bg-blue-400 hover:bg-gray-400'
							onClick={handleLogout}
						>
							<LogOut /> <span>Выйти</span>
						</button>
					</div>
					<div className='md:flex md:justify-end'>
						<button
							className='md:mr-4 md:p-1 hover:bg-gray-300'
							onClick={() => setListType('list')}
						>
							<List size={30} />
						</button>
						<button className='md:p-1 hover:bg-gray-300' onClick={() => setListType('card')}>
							<BookCopy size={30} />
						</button>
					</div>
					<div className='md:flex mt-7'>
						<div className='md:w-[80%]'>
							<h1 className='text-2xl font-bold mb-14'>Страница профиля</h1>
							<div className='md:flex md:justify-start md:gap-x-3 md:mb-10'>
								<Button
									className={`focus:bg-amber-700 ${
										activeCategory === 'favorite' ? 'bg-amber-700' : ''
									}`}
									onClick={() => handleCategoryChange('favorite')}
								>
									<span>Избранное</span>
								</Button>
								<Button
									className={`focus:bg-amber-700 ${
										activeCategory === 'started' ? 'bg-amber-700' : ''
									}`}
									onClick={() => handleCategoryChange('started')}
								>
									<span>Начатые задачи</span>
								</Button>
								<Button
									className={`focus:bg-amber-700 ${
										activeCategory === 'finished' ? 'bg-amber-700' : ''
									}`}
									onClick={() => handleCategoryChange('finished')}
								>
									<span>Одобренные задачи</span>
								</Button>
							</div>
							{visibleTasks.length === 0 ? (
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
							) : listType === 'card' ? (
								<div className='md:grid md:gap-4 md:grid-cols-2'>{taskCard}</div>
							) : (
								<>{taskCard}</>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

export default UserProfile

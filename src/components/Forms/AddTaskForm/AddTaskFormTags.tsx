import { memo } from 'react'
import { X } from 'lucide-react'
import { motion } from 'framer-motion'

type TypeAddTaskFormTagsProps = {
	tags: string[]
	newTag: string
	commonTags: string[]
	userTags: string[]
	MAX_TAG_LENGTH: number
	handleTagChange: (tag: string) => void
	handleNewTagChange: (e: React.ChangeEvent<HTMLInputElement>) => void
	addCustomTag: () => Promise<void>
	removeCustomTag: (tag: string) => Promise<void>
}

const AddTaskFormTags: React.FC<TypeAddTaskFormTagsProps> = memo(
	({
		tags,
		newTag,
		commonTags,
		userTags,
		MAX_TAG_LENGTH,
		handleTagChange,
		handleNewTagChange,
		addCustomTag,
		removeCustomTag,
	}) => {
		return (
			<>
				<div>
					<label className='block text-sm font-medium text-gray-900'>Ключевые теги</label>
					<div className='mt-1 flex flex-wrap gap-2'>
						{commonTags.map(tag => (
							<motion.label
								key={tag}
								whileHover={{ scale: 1.05 }}
								className='inline-flex items-center'
							>
								<input
									type='checkbox'
									checked={tags.includes(tag)}
									onChange={() => handleTagChange(tag)}
									className='hidden'
								/>
								<span
									className={`px-3 py-1 rounded-xl text-sm font-medium cursor-pointer transition-colors ${
										tags.includes(tag)
											? 'bg-gradient-to-br from-blue-400 to-blue-600 text-white'
											: 'bg-gradient-to-br from-gray-300 to-gray-400 text-gray-800 hover:from-gray-400 hover:to-gray-500'
									}`}
								>
									{tag}
								</span>
							</motion.label>
						))}
						{userTags.map(tag => (
							<div key={tag} className='inline-flex items-center'>
								<motion.label whileHover={{ scale: 1.05 }} className='inline-flex items-center'>
									<input
										type='checkbox'
										checked={tags.includes(tag)}
										onChange={() => handleTagChange(tag)}
										className='hidden'
									/>
									<span
										className={`px-3 py-1 rounded-full text-sm font-medium cursor-pointer transition-colors ${
											tags.includes(tag)
												? 'bg-gradient-to-br from-blue-400 to-blue-600 text-white'
												: 'bg-gradient-to-br from-gray-300 to-gray-400 text-gray-800 hover:from-gray-400 hover:to-gray-500'
										}`}
									>
										{tag}
									</span>
								</motion.label>
								<motion.button
									whileHover={{ scale: 1.1 }}
									whileTap={{ scale: 0.9 }}
									type='button'
									onClick={() => removeCustomTag(tag)}
									className='ml-2 text-red-600 hover:text-red-800 transition-colors'
								>
									<X size={16} />
								</motion.button>
							</div>
						))}
					</div>
				</div>
				<div>
					<label className='block text-sm font-medium text-gray-900'>Создать новый тег</label>
					<div className='mt-1 flex items-center gap-2'>
						<input
							type='text'
							placeholder='Введите новый тег'
							value={newTag}
							className='block w-full pl-3 pr-3 py-2 border border-gray-300 rounded-md text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-400 transition-all outline-none'
							onChange={handleNewTagChange}
							maxLength={MAX_TAG_LENGTH}
						/>
						<motion.button
							whileHover={{ scale: 1.1 }}
							whileTap={{ scale: 0.9 }}
							type='button'
							onClick={addCustomTag}
							className='px-4 py-2 bg-gradient-to-br from-blue-300 to-blue-500 text-gray-900 rounded-lg shadow-md hover:from-blue-400 hover:to-blue-600 transition-all'
						>
							Добавить
						</motion.button>
					</div>
				</div>
			</>
		)
	}
)

export default AddTaskFormTags

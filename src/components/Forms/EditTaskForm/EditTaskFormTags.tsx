import { memo } from 'react'
import { X } from 'lucide-react'
import { motion } from 'framer-motion'

type TypeAddTaskFormTagsProps = {
	formData: { tags: string[] }
	newTag: string
	commonTags: string[]
	userTags: string[]
	MAX_TAG_LENGTH: number
	handleTagChange: (tag: string) => void
	handleNewTagChange: (value: string) => void
	addCustomTag: () => Promise<void>
	removeCustomTag: (tag: string) => Promise<void>
}

const EditTaskFormTags: React.FC<TypeAddTaskFormTagsProps> = memo(
	({
		formData,
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
					<p className='text-lg font-medium text-gray-600 mb-2'>Выберите ключевые теги</p>
					<div className='flex flex-wrap gap-2'>
						{commonTags.map(tag => (
							<label key={tag} className='inline-flex items-center'>
								<input
									type='checkbox'
									checked={formData.tags.includes(tag)}
									onChange={() => handleTagChange(tag)}
									className='hidden'
								/>
								<span
									className={`px-3.5 py-1.5 rounded-full text-sm font-medium cursor-pointer transition-colors ${
										formData.tags.includes(tag)
											? 'bg-blue-500 text-white'
											: 'bg-gray-200 text-gray-700 hover:bg-gray-300'
									}`}
								>
									{tag}
								</span>
							</label>
						))}
						{userTags.map(tag => (
							<div key={tag} className='inline-flex items-center'>
								<label className='inline-flex items-center'>
									<input
										type='checkbox'
										checked={formData.tags.includes(tag)}
										onChange={() => handleTagChange(tag)}
										className='hidden'
									/>
									<span
										className={`px-3.5 py-1.5 rounded-full text-sm font-medium cursor-pointer transition-colors ${
											formData.tags.includes(tag)
												? 'bg-blue-500 text-white'
												: 'bg-gray-200 text-gray-700 hover:bg-gray-300'
										}`}
									>
										{tag}
									</span>
								</label>
								<button
									type='button'
									onClick={() => removeCustomTag(tag)}
									className='ml-2 text-red-500 hover:text-red-700'
								>
									<X size={16} />
								</button>
							</div>
						))}
					</div>
				</div>
				<div>
					<p className='text-lg font-medium text-gray-600 mb-2'>Создать новый тег</p>
					<div className='flex items-center gap-2'>
						<input
							type='text'
							placeholder='Введите новый тег'
							value={newTag}
							className='block w-full pl-3 pr-3 py-2 border border-gray-300 rounded-lg shadow-sm text-gray-800 leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
							onChange={e => handleNewTagChange(e.target.value)}
							maxLength={MAX_TAG_LENGTH}
						/>
						<motion.button
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
							type='button'
							onClick={addCustomTag}
							className='bg-gradient-to-br from-blue-500 to-blue-600 text-white py-2 px-4 rounded-lg shadow-md hover:from-blue-600 hover:to-blue-700 transition-all'
						>
							Добавить
						</motion.button>
					</div>
				</div>
			</>
		)
	}
)

export default EditTaskFormTags

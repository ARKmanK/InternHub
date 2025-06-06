import { memo } from 'react'
import { motion } from 'framer-motion'
import { FileArchive, Check } from 'lucide-react'

type TypeAddTaskFormArchiveProps = {
	zipAdded: boolean
	handleZipChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

const AddTaskFormArchive: React.FC<TypeAddTaskFormArchiveProps> = memo(
	({ zipAdded, handleZipChange }) => {
		return (
			<div className='flex flex-col'>
				<p className='mt-4 text-sm font-medium text-gray-900'>
					Дополнительные материалы (архив) (опционально)
				</p>
				<div className='flex items-center'>
					<motion.label
						whileHover={{ scale: 1.05 }}
						whileTap={{ scale: 0.95 }}
						className='py-2 px-3 border border-gray-400 rounded-md bg-gradient-to-br from-blue-300 to-blue-500 text-gray-900 cursor-pointer flex items-center w-[180px] hover:from-blue-400 hover:to-blue-600 transition-all shadow-md'
					>
						<FileArchive className='mr-2' size={20} />
						<span className='text-sm font-medium'>Выбрать архив</span>
						<input
							type='file'
							accept='.zip,.rar,.7z,.tar,.gz'
							className='hidden'
							onChange={handleZipChange}
						/>
					</motion.label>
					{zipAdded && (
						<motion.div whileHover={{ scale: 1.1 }} className='flex items-center ml-3'>
							<Check size={24} className='text-green-600' />
						</motion.div>
					)}
				</div>
			</div>
		)
	}
)

export default AddTaskFormArchive

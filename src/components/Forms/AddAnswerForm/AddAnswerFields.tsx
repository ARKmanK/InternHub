import { FC } from 'react'
import { Link } from 'lucide-react'

type TypeAddAnswerFieldsProps = {
	url: string
	setUrl: (value: string) => void
}

const AddAnswerFields: FC<TypeAddAnswerFieldsProps> = ({ url, setUrl }) => (
	<div className='flex flex-col'>
		<p className='mt-4 text-sm font-medium text-gray-900'>Ссылка на репозиторий GitHub *</p>
		<div className='flex items-center border border-gray-400 rounded-md max-w-[380px] shadow-sm bg-white'>
			<Link className='m-2 text-gray-500' size={24} />
			<input
				type='text'
				placeholder='url'
				value={url}
				className='w-full px-3 py-2 text-lg text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 transition-all'
				onChange={e => setUrl(e.target.value)}
				autoFocus
				required
			/>
		</div>
	</div>
)

export default AddAnswerFields

import { FC, FormEvent } from 'react'

type TypeEmployerRegisterFormProps = {
	onSubmit: (data: any) => void
	onBack: () => void
	addNotification: (type: string, title: string, message: string) => void
}

const EmployerRegisterForm: FC<TypeEmployerRegisterFormProps> = ({ onBack, addNotification }) => {
	const verifyEmployerInputs = (data: {
		company_name: FormDataEntryValue | null
		email: FormDataEntryValue | null
		password: FormDataEntryValue | null
	}) => {
		if (!data.email || !data.email.toString().trim()) {
			addNotification('warning', 'Ошибка', 'Почта — обязательное поле')
			return false
		}
		if (!data.password || !data.password.toString().trim()) {
			addNotification('warning', 'Ошибка', 'Пароль — обязательное поле')
			return false
		}
		if (!data.company_name || !data.company_name.toString().trim()) {
			addNotification('warning', 'Ошибка', 'Наименование компании — обязательное поле')
			return false
		}
		return true
	}

	const handleSubmitEmployer = (e: FormEvent) => {
		e.preventDefault()
		const formData = new FormData(e.target as HTMLFormElement)
		const data = {
			email: formData.get('email'),
			password: formData.get('password'),
			company_name: formData.get('company_name'),
		}

		if (!verifyEmployerInputs(data)) {
			return
		}

		console.log('Employer data:', data)
	}

	return (
		<div>
			<div className='flex items-center mb-4'>
				<button
					type='button'
					onClick={onBack}
					className='mr-2 text-gray-400 hover:text-gray-300 focus:outline-none'
				>
					<svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
						<path
							strokeLinecap='round'
							strokeLinejoin='round'
							strokeWidth='2'
							d='M15 19l-7-7 7-7'
						/>
					</svg>
				</button>
				<h2 className='text-lg font-semibold text-white'>Регистрация работодателя</h2>
			</div>
			<form onSubmit={handleSubmitEmployer} className='space-y-4'>
				<div>
					<label className='block text-sm font-medium text-white'>Почта</label>
					<input
						type='email'
						name='email'
						className='mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
						placeholder='Введите почту'
						defaultValue=''
					/>
				</div>
				<div>
					<label className='block text-sm font-medium text-white'>Пароль</label>
					<input
						type='password'
						name='password'
						className='mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
						placeholder='Введите пароль'
						defaultValue=''
					/>
				</div>
				<div>
					<label className='block text-sm font-medium text-white'>Наименование компании</label>
					<input
						type='text'
						name='company_name'
						className='mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
						placeholder='Введите наименование компании'
						defaultValue=''
					/>
				</div>
				<button
					type='submit'
					className='w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
				>
					Зарегистрироваться
				</button>
			</form>
		</div>
	)
}

export default EmployerRegisterForm

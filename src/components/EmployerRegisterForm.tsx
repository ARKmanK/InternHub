import { FC, FormEvent } from 'react'

interface EmployerRegisterFormProps {
	onSubmit: (data: any) => void
	onBack: () => void
	addNotification: (type: string, title: string, message: string) => void
}

const EmployerRegisterForm: FC<EmployerRegisterFormProps> = ({
	onSubmit,
	onBack,
	addNotification,
}) => {
	const verifyEmployerInputs = (data: {
		companyName: FormDataEntryValue | null
		email: FormDataEntryValue | null
		password: FormDataEntryValue | null
	}) => {
		if (!data.email || !data.email.toString().trim()) {
			addNotification('warning', 'Ошибка', 'Email — обязательное поле')
			return false
		}
		if (!data.password || !data.password.toString().trim()) {
			addNotification('warning', 'Ошибка', 'Пароль — обязательное поле')
			return false
		}
		if (!data.companyName || !data.companyName.toString().trim()) {
			addNotification('warning', 'Ошибка', 'Наименование — обязательное поле')
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
			companyName: formData.get('companyName'),
		}

		if (!verifyEmployerInputs(data)) {
			return
		}

		onSubmit(data)
	}

	return (
		<div className='md:mt-10 md:p-6 bg-[#96bddd] rounded-xl border-2 border-gray-[#dce3eb] max-w-[700px] m-auto'>
			<h2 className='text-2xl font-semibold text-gray-900 mb-6'>Регистрация работодателя</h2>
			<form onSubmit={handleSubmitEmployer} className='space-y-4'>
				<div>
					<label className='block text-sm font-medium text-gray-900'>Email</label>
					<div className='mt-1 relative rounded-md shadow-sm'>
						<div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
							<svg
								className='w-5 h-5 text-gray-400'
								fill='none'
								stroke='currentColor'
								viewBox='0 0 24 24'
							>
								<path
									strokeLinecap='round'
									strokeLinejoin='round'
									strokeWidth='2'
									d='M16 12H8m4-4v8m-7 4h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
								/>
							</svg>
						</div>
						<input
							type='email'
							name='email'
							className='block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
							placeholder='Введите email'
							defaultValue=''
						/>
					</div>
				</div>
				<div>
					<label className='block text-sm font-medium text-gray-900'>Пароль</label>
					<div className='mt-1 relative rounded-md shadow-sm'>
						<div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
							<svg
								className='w-5 h-5 text-gray-400'
								fill='none'
								stroke='currentColor'
								viewBox='0 0 24 24'
							>
								<path
									strokeLinecap='round'
									strokeLinejoin='round'
									strokeWidth='2'
									d='M12 11c0-1.1-.9-2-2-2s-2 .9-2 2c0 .7.4 1.3.9 1.7-.5.4-.9 1-.9 1.8v1h4v-1c0-.8-.4-1.4-.9-1.8.5-.4.9-1 .9-1.7zm-2-5a5 5 0 00-5 5v1h2v-1a3 3 0 016 0v1h2v-1a5 5 0 00-5-5z'
								/>
							</svg>
						</div>
						<input
							type='password'
							name='password'
							className='block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
							placeholder='Введите пароль'
							defaultValue=''
						/>
					</div>
				</div>
				<div>
					<label className='block text-sm font-medium text-gray-900'>Наименование</label>
					<div className='mt-1 relative rounded-md shadow-sm'>
						<div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
							<svg
								className='w-5 h-5 text-gray-400'
								fill='none'
								stroke='currentColor'
								viewBox='0 0 24 24'
							>
								<path
									strokeLinecap='round'
									strokeLinejoin='round'
									strokeWidth='2'
									d='M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6'
								/>
							</svg>
						</div>
						<input
							type='text'
							name='companyName'
							className='block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
							placeholder='Введите наименование'
							defaultValue=''
						/>
					</div>
				</div>
				<div className='mt-6 space-y-3'>
					<button
						type='submit'
						className='w-full bg-amber-700 text-white py-2 px-4 rounded-md hover:bg-amber-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500'
					>
						Зарегистрироваться
					</button>
					<button
						type='button'
						onClick={onBack}
						className='w-full bg-gray-200 text-gray-900 py-2 px-4 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500'
					>
						Вернуться
					</button>
				</div>
			</form>
		</div>
	)
}

export default EmployerRegisterForm

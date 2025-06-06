import { FC, FormEvent, useState } from 'react'

type TypeRegisterFormProps = {
	onSubmit: (data: any) => void
}

const RegisterForm: FC<TypeRegisterFormProps> = ({ onSubmit }) => {
	const [selectedRole, setSelectedRole] = useState<'user' | 'employer' | null>(null)

	const handleSubmit = (e: FormEvent) => {
		e.preventDefault()
		const formData = new FormData(e.target as HTMLFormElement)
		const data = {
			role: selectedRole,
			email: formData.get('email'),
			password: formData.get('password'),
			first_name: formData.get('first_name'),
			last_name: formData.get('last_name'),
			student_group: formData.get('student_group'),
			course: formData.get('course'),
			company_name: formData.get('company_name'),
		}

		if (!data.email || !data.password) {
			alert('Почта и Пароль обязательны')
			return
		}
		if (selectedRole === 'user') {
			if (!data.first_name || !data.last_name || !data.student_group || !data.course) {
				alert('Все поля обязательны для регистрации пользователя')
				return
			}
		} else if (selectedRole === 'employer') {
			if (!data.company_name) {
				alert('Наименование компании обязательно для регистрации работодателя')
				return
			}
		}
		onSubmit(data)
	}

	const handleBack = () => {
		setSelectedRole(null)
	}

	return (
		<div>
			{!selectedRole ? (
				<div className='space-y-4'>
					<div>
						<button
							type='button'
							onClick={() => setSelectedRole('user')}
							className='w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
						>
							Пользователь
						</button>
					</div>
					<div>
						<button
							type='button'
							onClick={() => setSelectedRole('employer')}
							className='w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
						>
							Работодатель
						</button>
					</div>
				</div>
			) : (
				<div>
					<div className='flex items-center mb-4'>
						<button
							type='button'
							onClick={handleBack}
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
						<h2 className='text-lg font-semibold'>
							{selectedRole === 'user' ? 'Регистрация пользователя' : 'Регистрация работодателя'}
						</h2>
					</div>
					<form onSubmit={handleSubmit} className='space-y-4'>
						<div>
							<label className='block text-sm font-medium'>Почта</label>
							<input
								type='email'
								name='email'
								className='mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
								placeholder='Введите почту'
								defaultValue=''
							/>
						</div>
						<div>
							<label className='block text-sm font-medium'>Пароль</label>
							<input
								type='password'
								name='password'
								className='mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
								placeholder='Введите пароль'
								defaultValue=''
							/>
						</div>
						{selectedRole === 'user' && (
							<>
								<div>
									<label className='block text-sm font-medium'>Имя</label>
									<input
										type='text'
										name='first_name'
										className='mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
										placeholder='Введите имя'
										defaultValue=''
									/>
								</div>
								<div>
									<label className='block text-sm font-medium'>Фамилия</label>
									<input
										type='text'
										name='last_name'
										className='mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
										placeholder='Введите фамилию'
										defaultValue=''
									/>
								</div>
								<div>
									<label className='block text-sm font-medium'>Группа</label>
									<input
										type='text'
										name='student_group'
										className='mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
										placeholder='Введите группу'
										defaultValue=''
									/>
								</div>
								<div>
									<label className='block text-sm font-medium'>Курс</label>
									<select
										name='course'
										className='mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
										defaultValue=''
									>
										<option value='' disabled>
											Выберите курс
										</option>
										{[1, 2, 3, 4].map(course => (
											<option key={course} value={course}>
												{course}
											</option>
										))}
									</select>
								</div>
							</>
						)}
						{selectedRole === 'employer' && (
							<div>
								<label className='block text-sm font-medium'>Наименование компании</label>
								<input
									type='text'
									name='company_name'
									className='mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
									placeholder='Введите наименование компании'
									defaultValue=''
								/>
							</div>
						)}
						<button
							type='submit'
							className='w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
						>
							Зарегистрироваться
						</button>
					</form>
				</div>
			)}
		</div>
	)
}

export default RegisterForm

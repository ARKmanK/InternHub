import Header from '@components/Header'
import NavBar from '@components/NavBar'
import { FC, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { setRole } from '@data/userData'

const RegistryPage: FC = () => {
	const navigate = useNavigate()
	const [selectedRole, setSelectedRole] = useState<'user' | 'employer' | null>(null)

	const handleRole = (role: 'employer' | 'user') => {
		setRole(role)
		setSelectedRole(role)
	}

	const saveUserData = (data: any) => {
		const userData = JSON.parse(localStorage.getItem('userData') || '{}')
		if (selectedRole === 'user') {
			userData.user = {
				...userData.user,
				favoriteTasks: { id: userData.user?.favoriteTasks?.id || [] },
				startedTasks: { id: userData.user?.startedTasks?.id || [] },
				finishedTasks: { id: userData.user?.finishedTasks?.id || [] },
				...data,
			}
		} else if (selectedRole === 'employer') {
			userData.employer = {
				...userData.employer,
				tasks: userData.employer?.tasks || [],
				...data,
			}
		}
		localStorage.setItem('userData', JSON.stringify(userData))
		navigate('/tasks')
	}

	const handleSubmitUser = (e: React.FormEvent) => {
		e.preventDefault()
		const formData = new FormData(e.target as HTMLFormElement)
		const data = {
			firstName: formData.get('firstName'),
			lastName: formData.get('lastName'),
			group: formData.get('group'),
			course: formData.get('course'),
		}
		saveUserData(data)
	}

	const handleSubmitEmployer = (e: React.FormEvent) => {
		e.preventDefault()
		const formData = new FormData(e.target as HTMLFormElement)
		const data = {
			companyName: formData.get('companyName'),
		}
		saveUserData(data)
	}

	const handleBack = () => {
		setSelectedRole(null)
	}

	return (
		<>
			<Header />
			<NavBar />
			<div
				className='md:flex md:justify-center md:py-[20px] md:px-[10px] mt-20'
				style={{ maxHeight: '660px' }}
			>
				<div className='md:w-[980px] flex-grow' style={{ maxHeight: '540px', overflowY: 'auto' }}>
					{!selectedRole ? (
						<div className='md:mt-10 md:p-4 bg-white rounded-lg shadow-md max-w-[300px] m-auto'>
							<div className='flex items-center mb-4'>
								<svg
									className='w-6 h-6 mr-2 text-gray-500'
									fill='none'
									stroke='currentColor'
									viewBox='0 0 24 24'
								>
									<path
										strokeLinecap='round'
										strokeLinejoin='round'
										strokeWidth='2'
										d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h10a2 2 0 012 2v14a2 2 0 01-2 2z'
									/>
								</svg>
								<h2 className='text-xl font-semibold text-gray-700'>Выбор роли</h2>
							</div>
							<div className='space-y-2'>
								<button
									type='button'
									onClick={() => handleRole('user')}
									className='w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
								>
									Пользователь
								</button>
								<button
									type='button'
									onClick={() => handleRole('employer')}
									className='w-full bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500'
								>
									Работодатель
								</button>
							</div>
						</div>
					) : selectedRole === 'user' ? (
						<div className='md:mt-10 md:p-6 bg-white rounded-lg shadow-md max-w-[700px] m-auto'>
							<div className='flex items-center mb-4'>
								<svg
									className='w-6 h-6 mr-2 text-gray-500'
									fill='none'
									stroke='currentColor'
									viewBox='0 0 24 24'
								>
									<path
										strokeLinecap='round'
										strokeLinejoin='round'
										strokeWidth='2'
										d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h10a2 2 0 012 2v14a2 2 0 01-2 2z'
									/>
								</svg>
								<h2 className='text-xl font-semibold text-gray-700'>Регистрация пользователя</h2>
							</div>
							<form onSubmit={handleSubmitUser} className='space-y-4'>
								<div>
									<label className='block text-sm font-medium text-gray-600'>Имя</label>
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
													d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
												/>
											</svg>
										</div>
										<input
											type='text'
											name='firstName'
											className='block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
											placeholder='Введите имя'
											required
										/>
									</div>
								</div>
								<div>
									<label className='block text-sm font-medium text-gray-600'>Фамилия</label>
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
													d='M9 5l7 7-7 7'
												/>
											</svg>
										</div>
										<input
											type='text'
											name='lastName'
											className='block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
											placeholder='Введите фамилию'
											required
										/>
									</div>
								</div>
								<div>
									<label className='block text-sm font-medium text-gray-600'>Группа</label>
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
													d='M12 6v6m0 0v6m0-6h6m-6 0H6'
												/>
											</svg>
										</div>
										<input
											type='text'
											name='group'
											className='block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
											placeholder='Введите группу'
											required
										/>
									</div>
								</div>
								<div>
									<label className='block text-sm font-medium text-gray-600'>Курс</label>
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
													d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
												/>
											</svg>
										</div>
										<select
											name='course'
											className='block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
											required
										>
											<option value='' disabled selected>
												Выберите курс
											</option>
											{[1, 2, 3, 4].map(course => (
												<option key={course} value={course}>
													{course}
												</option>
											))}
										</select>
									</div>
								</div>
								<div className='mt-4 space-y-2'>
									<button
										type='submit'
										className='w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
									>
										Зарегистрироваться
									</button>
									<button
										type='button'
										onClick={handleBack}
										className='w-full bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500'
									>
										Вернуться
									</button>
								</div>
							</form>
						</div>
					) : (
						<div className='md:mt-10 md:p-6 bg-white rounded-lg shadow-md max-w-[700px] m-auto'>
							<div className='flex items-center mb-4'>
								<svg
									className='w-6 h-6 mr-2 text-gray-500'
									fill='none'
									stroke='currentColor'
									viewBox='0 0 24 24'
								>
									<path
										strokeLinecap='round'
										strokeLinejoin='round'
										strokeWidth='2'
										d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h10a2 2 0 012 2v14a2 2 0 01-2 2z'
									/>
								</svg>
								<h2 className='text-xl font-semibold text-gray-700'>Регистрация работодателя</h2>
							</div>
							<form onSubmit={handleSubmitEmployer} className='space-y-4'>
								<div>
									<label className='block text-sm font-medium text-gray-600'>Наименование</label>
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
											className='block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
											placeholder='Введите наименование'
											required
										/>
									</div>
								</div>
								<div className='mt-4 space-y-2'>
									<button
										type='submit'
										className='w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
									>
										Зарегистрироваться
									</button>
									<button
										type='button'
										onClick={handleBack}
										className='w-full bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500'
									>
										Вернуться
									</button>
								</div>
							</form>
						</div>
					)}
				</div>
			</div>
		</>
	)
}

export default RegistryPage

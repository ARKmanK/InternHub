import { FC } from 'react'

const StudentRegisterFormFields: FC = () => (
	<>
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
			<label className='block text-sm font-medium text-gray-900'>Имя</label>
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
					className='block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
					placeholder='Введите имя'
					defaultValue=''
				/>
			</div>
		</div>
		<div>
			<label className='block text-sm font-medium text-gray-900'>Фамилия</label>
			<div className='mt-1 relative rounded-md shadow-sm'>
				<div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
					<svg
						className='w-5 h-5 text-gray-400'
						fill='none'
						stroke='currentColor'
						viewBox='0 0 24 24'
					>
						<path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M9 5l7 7-7 7' />
					</svg>
				</div>
				<input
					type='text'
					name='lastName'
					className='block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
					placeholder='Введите фамилию'
					defaultValue=''
				/>
			</div>
		</div>
		<div>
			<label className='block text-sm font-medium text-gray-900'>Группа</label>
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
					className='block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
					placeholder='Введите группу'
					defaultValue=''
				/>
			</div>
		</div>
		<div>
			<label className='block text-sm font-medium text-gray-900'>Курс</label>
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
					className='block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
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
		</div>
	</>
)

export default StudentRegisterFormFields

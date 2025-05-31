import { FC, FormEvent } from 'react'
import { motion } from 'framer-motion'

interface LoginFormProps {
	onSubmit: (e: FormEvent) => void
	rememberMe: boolean
	setRememberMe: (value: boolean) => void
	savedEmail: string
}

const LoginForm: FC<LoginFormProps> = ({ onSubmit, rememberMe, setRememberMe, savedEmail }) => {
	return (
		<form onSubmit={onSubmit} className='space-y-4'>
			<div>
				<label className='block text-sm font-medium'>Почта</label>
				<input
					type='email'
					name='email'
					className='mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
					placeholder='Введите почту'
					defaultValue={savedEmail}
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
			<div className='flex items-center justify-between'>
				<div className='flex items-center'>
					<label className='relative inline-flex items-center cursor-pointer'>
						<input
							type='checkbox'
							checked={rememberMe}
							onChange={() => setRememberMe(!rememberMe)}
							className='sr-only peer'
						/>
						<motion.div
							className='w-10 h-5 bg-gray-600 rounded-full peer peer-checked:bg-blue-600'
							animate={{ backgroundColor: rememberMe ? '#2563eb' : '#4b5563' }}
							transition={{ duration: 0.3 }}
						>
							<motion.div
								className='w-5 h-5 bg-white rounded-full shadow-md'
								animate={{ x: rememberMe ? 20 : 0 }}
								transition={{ type: 'spring', stiffness: 300, damping: 20 }}
							/>
						</motion.div>
						<span className='ml-2 text-sm'>Запомнить меня</span>
					</label>
				</div>
			</div>
			<button
				type='submit'
				className='w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
			>
				Войти
			</button>
		</form>
	)
}

export default LoginForm

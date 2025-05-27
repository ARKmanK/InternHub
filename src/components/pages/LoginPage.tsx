import Header from '@components/Header'
import NavBar from '@components/NavBar'
import { FC, FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useNotification from '@hooks/useNotification'
import Notification from '@components/UI/Notification/Notification'
import LoginForm from '@components/LoginForm'
import RegisterForm from '@components/RegisterForm'
import { supabase } from '@/supabaseClient'
import { createUser, getUserByEmail } from '@/src/lib/API/supabaseAPI'
import { debounce } from 'lodash'

const LoginPage: FC = () => {
	const navigate = useNavigate()
	const { notifications, addNotification } = useNotification()
	const [isLogin, setIsLogin] = useState(true)
	const [rememberMe, setRememberMe] = useState(false)

	const handleLogin = async (e: FormEvent) => {
		e.preventDefault()
		const formData = new FormData(e.target as HTMLFormElement)
		const email = formData.get('email')?.toString()
		const password = formData.get('password')?.toString()

		if (!email || !password) {
			addNotification('warning', 'Ошибка', 'Заполните все поля')
			return
		}

		try {
			const {
				data: { user },
				error,
			} = await supabase.auth.signInWithPassword({
				email,
				password,
			})
			if (error) throw error
			if (!user) {
				addNotification('error', 'Ошибка', 'Не удалось войти')
				return
			}

			// Получаем данные пользователя из таблицы users
			const userFromDb = await getUserByEmail(email)
			if (!userFromDb) {
				addNotification('error', 'Ошибка', 'Пользователь не найден в базе данных')
				return
			}

			// Сохраняем userId и role в localStorage
			localStorage.setItem('userId', userFromDb.id.toString())
			localStorage.setItem('role', userFromDb.role)

			// Сохранение состояния "Запомнить меня" в localStorage
			if (rememberMe) {
				localStorage.setItem('rememberMe', 'true')
				localStorage.setItem('email', email)
			} else {
				localStorage.removeItem('rememberMe')
				localStorage.removeItem('email')
			}

			addNotification('success', 'Успешно', 'Вход выполнен')
			navigate('/tasks')
		} catch (error: any) {
			addNotification('error', 'Ошибка', `Не удалось войти: ${error.message}`)
		}
	}

	const handleRegister = debounce(async (data: any) => {
		try {
			const {
				data: { user },
				error,
			} = await supabase.auth.signUp({
				email: data.email,
				password: data.password,
			})
			if (error) throw error
			if (!user) {
				addNotification('error', 'Ошибка', 'Не удалось зарегистрировать пользователя')
				return
			}

			const userData = {
				email: data.email,
				role: data.role,
				first_name: data.first_name,
				last_name: data.last_name,
				student_group: data.student_group,
				course: data.course,
				company_name: data.company_name,
				password: data.password,
			}

			// Создаем запись в таблице users
			await createUser(userData)

			// Получаем данные пользователя из таблицы users
			const userFromDb = await getUserByEmail(data.email)
			if (!userFromDb) {
				addNotification(
					'error',
					'Ошибка',
					'Не удалось получить данные пользователя после регистрации'
				)
				return
			}

			// Сохраняем userId и role в localStorage
			localStorage.setItem('userId', userFromDb.id.toString())
			localStorage.setItem('role', userFromDb.role)

			addNotification('success', 'Успешно', 'Регистрация завершена')
			navigate('/tasks')
		} catch (error: any) {
			addNotification('error', 'Ошибка', `Не удалось зарегистрироваться: ${error.message}`)
		}
	}, 2000)

	const toggleForm = (targetForm: 'login' | 'register') => {
		setIsLogin(targetForm === 'login')
	}

	return (
		<>
			<Header />
			<NavBar />
			<div className='flex justify-center items-center bg-white bg-opacity-75'>
				<div className='mt-20 bg-gradient-to-b from-[#565a78] to-[#212b50] p-8 rounded-lg shadow-lg text-white w-full max-w-md'>
					<div className='flex justify-between mb-6 text-sm'>
						<button
							onClick={() => toggleForm('login')}
							className={`${
								isLogin ? 'text-blue-400' : 'text-gray-400 hover:text-gray-300'
							} focus:outline-none`}
						>
							Вход
						</button>
						<button
							onClick={() => toggleForm('register')}
							className={`${
								!isLogin ? 'text-blue-400' : 'text-gray-400 hover:text-gray-300'
							} focus:outline-none`}
						>
							Регистрация
						</button>
					</div>
					{isLogin ? (
						<LoginForm
							onSubmit={handleLogin}
							rememberMe={rememberMe}
							setRememberMe={setRememberMe}
						/>
					) : (
						<RegisterForm onSubmit={handleRegister} />
					)}
				</div>
			</div>
			<Notification notifications={notifications} />
		</>
	)
}

export default LoginPage

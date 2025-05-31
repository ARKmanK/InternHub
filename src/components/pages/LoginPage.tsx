import Header from '@components/Header'
import NavBar from '@components/NavBar'
import { FC, FormEvent, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import useNotification from '@hooks/useNotification'
import Notification from '@components/UI/Notification/Notification'
import LoginForm from '@components/LoginForm'
import RegisterForm from '@components/RegisterForm'
import { supabase } from '@/supabaseClient'
import { createUser, getUserByEmail } from '@/src/lib/API/supabaseAPI'
import { debounce } from 'lodash'
import { setPage } from '@data/userData'

const LoginPage: FC = () => {
	const navigate = useNavigate()
	const { notifications, addNotification } = useNotification()
	const [isLogin, setIsLogin] = useState(true)
	const [rememberMe, setRememberMe] = useState(false)
	const [savedEmail, setSavedEmail] = useState<string>('')

	// Проверяем сохраненную сессию при загрузке страницы
	useEffect(() => {
		const checkSavedSession = async () => {
			const savedSession = localStorage.getItem('supabaseSession')
			const sessionExpiry = localStorage.getItem('sessionExpiry')
			const savedRememberMe = localStorage.getItem('rememberMe')
			const savedEmail = localStorage.getItem('email')

			if (savedSession && sessionExpiry && savedRememberMe === 'true') {
				const expiryTime = parseInt(sessionExpiry, 10)
				const currentTime = Date.now()

				if (currentTime < expiryTime) {
					// Сессия еще действительна, восстанавливаем её
					try {
						const session = JSON.parse(savedSession)
						const { error } = await supabase.auth.setSession({
							access_token: session.access_token,
							refresh_token: session.refresh_token,
						})
						if (error) throw error

						// Получаем данные пользователя
						const {
							data: { user },
						} = await supabase.auth.getUser()
						if (user) {
							const userFromDb = await getUserByEmail(user.email!)
							if (userFromDb) {
								localStorage.setItem('userId', userFromDb.id.toString())
								localStorage.setItem('role', userFromDb.role)
								setPage('/tasks')
								navigate('/tasks')
							}
						}
					} catch (error: any) {
						console.error('Ошибка восстановления сессии:', error.message)
						clearSessionData()
					}
				} else {
					// Сессия истекла, очищаем данные
					clearSessionData()
				}
			}

			// Устанавливаем сохраненный email, если он есть
			if (savedEmail && savedRememberMe === 'true') {
				setSavedEmail(savedEmail)
				setRememberMe(true)
			}
		}

		checkSavedSession()
	}, [navigate])

	const clearSessionData = () => {
		localStorage.removeItem('supabaseSession')
		localStorage.removeItem('sessionExpiry')
		localStorage.removeItem('rememberMe')
		localStorage.removeItem('email')
		localStorage.removeItem('userId')
		localStorage.removeItem('role')
	}

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
				data: { user, session },
				error,
			} = await supabase.auth.signInWithPassword({
				email,
				password,
			})
			if (error) throw error
			if (!user || !session) {
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

			// Сохранение сессии и данных "Запомнить меня"
			if (rememberMe) {
				// Сохраняем сессию и время истечения (6 часов = 6 * 60 * 60 * 1000 мс)
				const expiryTime = Date.now() + 6 * 60 * 60 * 1000
				localStorage.setItem('supabaseSession', JSON.stringify(session))
				localStorage.setItem('sessionExpiry', expiryTime.toString())
				localStorage.setItem('rememberMe', 'true')
				localStorage.setItem('email', email)
			} else {
				clearSessionData()
				// Сохраняем только userId и role, так как они нужны для работы приложения
				localStorage.setItem('userId', userFromDb.id.toString())
				localStorage.setItem('role', userFromDb.role)
			}

			addNotification('success', 'Успешно', 'Вход выполнен')
			setPage('/tasks')
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

			// Сохранение сессии, если rememberMe включено
			if (rememberMe) {
				const {
					data: { session },
				} = await supabase.auth.getSession()
				if (session) {
					const expiryTime = Date.now() + 6 * 60 * 60 * 1000
					localStorage.setItem('supabaseSession', JSON.stringify(session))
					localStorage.setItem('sessionExpiry', expiryTime.toString())
					localStorage.setItem('rememberMe', 'true')
					localStorage.setItem('email', data.email)
				}
			}

			addNotification('success', 'Успешно', 'Регистрация завершена')
			setPage('/tasks')
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
							savedEmail={savedEmail}
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

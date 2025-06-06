import Header from '@UI/Header'
import NavBar from '@UI/NavBar'
import { FC, FormEvent, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import useNotification from '@hooks/useNotification'
import Notification from '@UI/Notification/Notification'
import LoginForm from '@components/Forms/LoginForm/LoginForm'
import RegisterForm from '@components/Forms/LoginForm/RegisterForm'
import { debounce } from 'lodash'
import { clearSessionData, setPage } from '@data/userData'
import {
	signInWithPassword,
	setSession,
	getCurrentUser,
	getCurrentSession,
	createUser,
	getUserByEmail,
	TypeUserData,
} from '@lib/API/supabase/userAPI'

type TypeRegisterFormData = TypeUserData & {
	password: string
}

const LoginPage: FC = () => {
	const navigate = useNavigate()
	const { notifications, addNotification } = useNotification()
	const [isLogin, setIsLogin] = useState(true)
	const [rememberMe, setRememberMe] = useState(false)
	const [savedEmail, setSavedEmail] = useState<string>('')

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
					try {
						const session = JSON.parse(savedSession)
						await setSession(session.access_token, session.refresh_token)
						const user = await getCurrentUser()
						if (user && user.email) {
							const userFromDb = await getUserByEmail(user.email)
							if (userFromDb) {
								localStorage.setItem('userId', userFromDb.id.toString())
								localStorage.setItem('role', userFromDb.role)
								setPage('/tasks')
								navigate('/tasks')
							}
						}
					} catch (error: unknown) {
						const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка'
						console.error('Ошибка восстановления сессии:', errorMessage)
						clearSessionData()
					}
				} else {
					clearSessionData()
				}
			}
			if (savedEmail && savedRememberMe === 'true') {
				setSavedEmail(savedEmail)
				setRememberMe(true)
			}
		}
		checkSavedSession()
	}, [navigate])

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
			const { session } = await signInWithPassword(email, password)
			const userFromDb = await getUserByEmail(email)

			if (!userFromDb) {
				addNotification('error', 'Ошибка', 'Пользователь не найден в базе данных')
				return
			}
			localStorage.setItem('userId', userFromDb.id.toString())
			localStorage.setItem('role', userFromDb.role)

			if (rememberMe) {
				const expiryTime = Date.now() + 6 * 60 * 60 * 1000
				localStorage.setItem('supabaseSession', JSON.stringify(session))
				localStorage.setItem('sessionExpiry', expiryTime.toString())
				localStorage.setItem('rememberMe', 'true')
				localStorage.setItem('email', email)
			} else {
				clearSessionData()
				localStorage.setItem('userId', userFromDb.id.toString())
				localStorage.setItem('role', userFromDb.role)
			}
			addNotification('success', 'Успешно', 'Вход выполнен')
			setPage('/tasks')
			navigate('/tasks')
		} catch (error: unknown) {
			const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка'
			addNotification('error', 'Ошибка', `Не удалось войти: ${errorMessage}`)
		}
	}

	const handleRegister = debounce(async (data: TypeRegisterFormData) => {
		try {
			const userData: TypeUserData = {
				email: data.email,
				role: data.role,
				first_name: data.first_name,
				last_name: data.last_name,
				student_group: data.student_group,
				course: data.course,
				company_name: data.company_name,
			}
			await createUser(userData)
			const userFromDb = await getUserByEmail(data.email)
			if (!userFromDb) {
				addNotification(
					'error',
					'Ошибка',
					'Не удалось получить данные пользователя после регистрации'
				)
				return
			}
			localStorage.setItem('userId', userFromDb.id.toString())
			localStorage.setItem('role', userFromDb.role)
			if (rememberMe) {
				const session = await getCurrentSession()
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
		} catch (error: unknown) {
			const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка'
			addNotification('error', 'Ошибка', `Не удалось зарегистрироваться: ${errorMessage}`)
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

import Header from '@components/Header'
import NavBar from '@components/NavBar'
import { setRole } from '@data/userData'
import { FC } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@components/UI/Button/Button'

const RegistryPage: FC = () => {
	const navigate = useNavigate()
	const handleRole = (role: 'admin' | 'user') => {
		setRole(role)
		navigate('/tasks')
	}

	return (
		<>
			<Header />
			<NavBar />
			<div className='md:flex md:justify-center md:py-[20px] md:px-[10px]'>
				<div className='md:min-h-[1200px] md:w-[980px]'>
					<div className='md:w-full md:h-full md:flex md:justify-center md:mt-40'>
						<div className='md:min-w-[650px] md:h-[200px] md:border-2 md:rounded-2xl bg-[#96bddd] md:flex md:flex-col md:items-center'>
							<p className='md:my-5 md:text-2xl'>Выберите роль</p>
							<div className='md:flex md:flex-col md:gap-y-3 md:w-[200px]'>
								<Button onClick={() => handleRole('admin')}>Админ</Button>
								<Button onClick={() => handleRole('admin')}>Пользователь</Button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</>
	)
}

export default RegistryPage

import { setPage, TypePages } from '@data/userData'
import Header from '@UI/Header'
import NavBar from '@UI/NavBar'
import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import AddTaskForm from '@components/Forms/AddTaskForm/AddTaskForm'
import Message from '@UI/Message'
import BackButton from '@UI/Buttons/BackButton'

const CreateTaskPage = () => {
	const navigate = useNavigate()
	const goBack = () => {
		const data = localStorage.getItem('prevPage')
		let prevPage = '/tasks'
		if (data) {
			const parsedData: TypePages = JSON.parse(data)
			prevPage = parsedData.prevPage || '/tasks'
		}
		navigate(prevPage)
	}

	useEffect(() => {
		setPage('/create-task')
		return () => {}
	}, [])

	return (
		<>
			<Header />
			<NavBar />
			<div className='md:flex md:justify-center md:py-[20px] md:px-[10px]'>
				<div className='md:min-h-[1200px] md:w-[980px]'>
					<div className='md:flex md:flex-col'>
						<div className='md:py-4 md:flex md:justify-end items-center'>
							<BackButton goBack={goBack} />
						</div>
						<div className='md:flex mt-7'>
							<div className='md:w-[80%]'>
								<h1 className='text-2xl font-bold mb-14'>Страница создания задачи</h1>
								<div>
									<AddTaskForm />
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
			<Message />
		</>
	)
}

export default CreateTaskPage

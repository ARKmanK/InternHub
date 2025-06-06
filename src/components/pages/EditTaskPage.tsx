import Header from '@UI/Header'
import NavBar from '@UI/NavBar'
import { useNavigate, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { TypeTask } from '@/src/types/TypeTask'
import useNotification from '@hooks/useNotification'
import Notification from '@UI/Notification/Notification'
import Message from '@UI/Message'
import LoadingAnimation from '@UI/ScreenLoadingAnimation'
import { useQueryClient } from '@tanstack/react-query'
import { getCurrentSession, getUserByEmail } from '@lib/API/supabase/userAPI'
import { getTaskById } from '@lib/API/supabase/taskAPI'
import { getAllTags, getUserTags } from '@lib/API/supabase/tagsAPI'
import { setPage, goBack } from '@data/userData'
import BackButton from '@UI/Buttons/BackButton'
import EditTaskForm from '../Forms/EditTaskForm/EditTaskForm'

const EditTaskPage = () => {
	const { id } = useParams<{ id: string }>()
	const navigate = useNavigate()
	const queryClient = useQueryClient()
	const { notifications, addNotification } = useNotification()
	const [taskData, setTaskData] = useState<TypeTask | null>(null)
	const [role, setRole] = useState<'user' | 'employer' | 'admin' | null>(null)
	const [companyName, setCompanyName] = useState('')
	const [userId, setUserId] = useState<number | null>(null)
	const [commonTags, setCommonTags] = useState<string[]>([])
	const [userTags, setUserTags] = useState<string[]>([])
	const [isInitialLoad, setIsInitialLoad] = useState(true)
	const handleGoBack = goBack(navigate)

	useEffect(() => {
		if (isInitialLoad && id) {
			setPage(`/edit-task/${id}`)
			setIsInitialLoad(false)
		}

		const fetchData = async () => {
			try {
				const session = await getCurrentSession()
				if (!session?.user) {
					addNotification('error', 'Ошибка', 'Пользователь не авторизован')
					navigate('/login')
					return
				}

				const user = await getUserByEmail(session.user.email!)
				if (!user) {
					addNotification('error', 'Ошибка', 'Пользователь не найден')
					navigate('/login')
					return
				}
				setRole(user.role)
				setUserId(user.id)
				setCompanyName(user.company_name || 'Неизвестная компания')

				if (id && user.id) {
					const taskId = parseInt(id)
					const task = await getTaskById(taskId)
					if (!task) {
						addNotification('error', 'Ошибка', 'Задача не найдена')
						navigate('/tasks')
						return
					}
					if (task.employer_id !== user.id) {
						addNotification('error', 'Ошибка', 'У вас нет доступа к редактированию этой задачи')
						navigate('/tasks')
						return
					}
					setTaskData(task)
					const commonTagsData = await getAllTags()
					setCommonTags(commonTagsData.map(tag => tag.name))
					const userTagsData = await getUserTags(user.id)
					setUserTags(userTagsData)
				}
			} catch (error: unknown) {
				const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка'
				addNotification('error', 'Ошибка', errorMessage)
				navigate('/tasks')
			}
		}
		fetchData()
	}, [id, navigate, isInitialLoad])

	if (!taskData || !userId) return <LoadingAnimation loading={true} />

	return (
		<>
			<Header />
			<NavBar />
			<div className='md:flex md:justify-center md:py-[20px] md:px-[10px]'>
				<div className='md:min-h-[900px] md:w-[980px]'>
					<div className='md:flex md:flex-col'>
						<div className='md:py-4 md:flex md:justify-end items-center'>
							<BackButton goBack={handleGoBack} />
						</div>
						<div className='md:flex mt-7'>
							<div className='md:w-[80%]'>
								<h1 className='text-2xl font-bold mb-14 text-gray-800'>Редактирование задачи</h1>
								<EditTaskForm
									taskData={taskData}
									userId={userId}
									role={role}
									companyName={companyName}
									commonTags={commonTags}
									userTags={userTags}
									setUserTags={setUserTags}
									queryClient={queryClient}
									navigate={navigate}
								/>
							</div>
						</div>
					</div>
				</div>
			</div>
			<Notification notifications={notifications} />
			<Message />
		</>
	)
}

export default EditTaskPage

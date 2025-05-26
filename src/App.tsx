import { FC, useEffect } from 'react'
import { createBrowserRouter, RouterProvider, useNavigate } from 'react-router-dom'
import TasksListPage from '@screens/TasksListPage'
import TaskPage from '@screens/TaskPage'
import UserPage from '@screens/UserPage'
import { MantineProvider } from '@mantine/core'
import RegisterPage from '@/src/components/screens/RegisterPage'
import CreateTaskPage from '@screens/CreateTaskPage'
import EditTaskPage from './components/screens/EditTaskPage'

const RootRedirect = () => {
	const navigate = useNavigate()
	useEffect(() => {
		const userData = JSON.parse(localStorage.getItem('userData') || '{}')
		const hasRole =
			userData.users &&
			Object.keys(userData.users).some(key => key === 'employer' || key === 'user')
		if (hasRole) {
			navigate('/tasks')
		} else {
			navigate('/login')
		}
	}, [navigate])
	return null
}

const App: FC = () => {
	const router = createBrowserRouter(
		[
			{
				path: '/',
				element: <RootRedirect />,
				errorElement: <>404</>,
			},
			{
				path: '/login',
				element: <RegisterPage />,
				errorElement: <>404</>,
			},
			{
				path: '/tasks',
				element: <TasksListPage />,
				errorElement: <>404</>,
			},
			{
				path: '/task/:taskId',
				element: <TaskPage />,
				errorElement: <>404</>,
			},
			{
				path: '/user',
				element: <UserPage />,
				errorElement: <>404</>,
			},
			{
				path: '/create-task',
				element: <CreateTaskPage />,
				errorElement: <>404</>,
			},
			{
				path: '/edit-task/:id',
				element: <EditTaskPage />,
				errorElement: <>404</>,
			},
		],
		{
			future: {
				/* v7_startTransition: true, */
				/* v7_relativeSplatPath: true, */
			},
		}
	)
	return (
		<>
			<MantineProvider>
				<RouterProvider router={router}></RouterProvider>
			</MantineProvider>
		</>
	)
}

export default App

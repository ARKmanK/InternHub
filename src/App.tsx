import { FC, useEffect } from 'react'
import { createBrowserRouter, RouterProvider, useNavigate } from 'react-router-dom'
import TasksListPage from '@/src/components/pages/TasksListPage'
import TaskPage from '@/src/components/pages/TaskPage'
import UserPage from '@/src/components/pages/UserPage'
import { MantineProvider } from '@mantine/core'
import CreateTaskPage from '@/src/components/pages/CreateTaskPage'
import LoginPage from '@/src/components/pages/LoginPage'
import EditTaskPage from './components/pages/EditTaskPage'

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
				element: <LoginPage />,
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
		<MantineProvider>
			<RouterProvider router={router}></RouterProvider>
		</MantineProvider>
	)
}

export default App

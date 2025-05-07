import { FC } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import TasksPage from '@screens/TasksPage'
import UserPage from '@screens/UserPage'

const App: FC = () => {
	const router = createBrowserRouter(
		[
			/* {
				path: '/',
				element: <MainPage />,
				errorElement: <>404</>,
			}, */
			{
				path: '/',
				element: <TasksPage />,
				errorElement: <>404</>,
			},
			{
				path: '/user',
				element: <UserPage />,
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
			<RouterProvider router={router}></RouterProvider>
		</>
	)
}

export default App

import { FC } from 'react'

import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Home from '@components/screens/home/Home'

const Router: FC = () => {
	const router = createBrowserRouter(
		[
			{
				path: '/',
				element: <Home />,
				errorElement: <>404</>,
			},
		]
		/* {
			future: {
				v7_startTransition: true,
				v7_relativeSplatPath: true,
			},
		} */
	)

	return <RouterProvider router={router}></RouterProvider>
}

export default Router

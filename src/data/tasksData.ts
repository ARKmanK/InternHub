export type TypeTasksData = {
	id: number
	trackingNumber: number
	title: string
	description: string
	difficulty: string
	companyName: string
	taskPath: string
}

export const tasksData: TypeTasksData[] = [
	{
		id: 1,
		trackingNumber: 10,
		title: 'Админ-панель',
		description:
			'Разработать админ-панель для сайта компании с использованием современных технологий (фреймворк React + TypeScript с использованием WebPack',
		difficulty: '3',
		companyName: 'Ростелеком',
		taskPath: '/',
	},
	{
		id: 2,
		trackingNumber: 4,
		title: 'Сайт-визитка',
		description:
			'Разработать админ-панель для сайта компании с использованием современных технологий (фреймворк React + TypeScript с использованием WebPack',
		difficulty: '3',
		companyName: 'Ростелеком',
		taskPath: '/',
	},
]

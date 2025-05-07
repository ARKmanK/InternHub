export type TypeTasksData = {
	id: number
	trackingNumber: number
	title: string
	description: string
	difficulty: number
	companyName: string
	taskPath: string
	deadline: string
	tags: string[]
}

export const tasksData: TypeTasksData[] = [
	{
		id: 1,
		trackingNumber: 10,
		title: 'Админ-панель',
		description:
			'Разработать админ-панель для сайта компании с использованием современных технологий (фреймворк React + TypeScript с использованием WebPack',
		difficulty: 1,
		companyName: 'Ростелеком',
		taskPath: '/',
		deadline: '15 March',
		tags: ['IT', 'Network'],
	},
	{
		id: 2,
		trackingNumber: 4,
		title: 'Сайт-визитка',
		description:
			'Разработать админ-панель для сайта компании с использованием современных технологий (фреймворк React + TypeScript с использованием WebPack',
		difficulty: 3,
		companyName: 'Ростелеком',
		taskPath: '/',
		deadline: '15 March',
		tags: ['IT', 'Network'],
	},
	{
		id: 3,
		trackingNumber: 10,
		title: 'Админ-панель',
		description:
			'Разработать админ-панель для сайта компании с использованием современных технологий (фреймворк React + TypeScript с использованием WebPack',
		difficulty: 2,
		companyName: 'Ростелеком',
		taskPath: '/',
		deadline: '15 March',
		tags: ['IT', 'Network'],
	},
	{
		id: 4,
		trackingNumber: 4,
		title: 'Сайт-визитка',
		description:
			'Разработать админ-панель для сайта компании с использованием современных технологий (фреймворк React + TypeScript с использованием WebPack',
		difficulty: 1,
		companyName: 'Ростелеком',
		taskPath: '/',
		deadline: '15 March',
		tags: ['IT', 'Network'],
	},
]

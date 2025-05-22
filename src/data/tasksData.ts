// tasksData.ts
export type TypeTasksData = {
	id: number
	trackingNumber: number
	title: string
	description: string
	difficulty: number
	companyName: string
	deadline: string
	tags: string[]
}

type AddTaskInput = Omit<TypeTasksData, 'id'>

const initializeTasks = (): TypeTasksData[] => {
	const storedTasks = localStorage.getItem('tasks')
	if (!storedTasks) {
		const initialTasks: TypeTasksData[] = [
			{
				id: 1,
				trackingNumber: 10,
				title: 'Админ-панель',
				description:
					'Разработать админ-панель для сайта компании с использованием современных технологий (фреймворк React + TypeScript с использованием WebPack',
				difficulty: 1,
				companyName: 'Ростелеком',
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
				deadline: '15 March',
				tags: ['IT', 'Network'],
			},
		]
		localStorage.setItem('tasks', JSON.stringify(initialTasks))
		return initialTasks
	}
	return JSON.parse(storedTasks) as TypeTasksData[]
}

export const getTasks = (): TypeTasksData[] => {
	const tasks = initializeTasks()
	return tasks
}

export const addTask = (task: AddTaskInput): TypeTasksData => {
	const tasks = getTasks()
	const newId = tasks.length > 0 ? Math.max(...tasks.map(t => t.id)) + 1 : 1
	const newTask: TypeTasksData = {
		...task,
		id: newId,
		tags: task.tags || [],
	}
	const updatedTasks = [...tasks, newTask]
	localStorage.setItem('tasks', JSON.stringify(updatedTasks))

	// Обновляем userData для employer
	const userData = JSON.parse(localStorage.getItem('userData') || '{}')
	if (!userData.employer) {
		userData.employer = { tasks: [] }
	}
	if (!userData.employer.tasks.includes(newId)) {
		userData.employer.tasks.push(newId)
	}
	localStorage.setItem('userData', JSON.stringify(userData))

	return newTask
}

export const deleteTask = (id: number): void => {
	const tasks = getTasks()
	const updatedTasks = tasks.filter(task => task.id !== id)
	localStorage.setItem('tasks', JSON.stringify(updatedTasks))

	const userData = JSON.parse(localStorage.getItem('userData') || '{}')
	if (userData.employer && userData.employer.tasks) {
		userData.employer.tasks = userData.employer.tasks.filter((taskId: number) => taskId !== id)
		localStorage.setItem('userData', JSON.stringify(userData))
	}
}

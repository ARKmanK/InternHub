import data from './userData.json'

type TypeJSON = {
	favoriteTasks?: { id: number[] }
	startedTasks?: { id: number[] }
	finishedTasks?: { id: number[] }
}

type TypeUsers = {
	users: {
		[key: string]: TypeJSON
	}
}

// Инициализация данных из JSON и localStorage (если есть)
const jsonData: TypeUsers = {
	...data,
	users: {
		...data.users,
		...(JSON.parse(localStorage.getItem('userData') || '{}')?.users || {}),
	},
}

export const addToFavorite = (userId: string, id: number) => {
	if (!jsonData.users[userId].favoriteTasks!.id.includes(id)) {
		jsonData.users[userId].favoriteTasks!.id.push(id)
		localStorage.setItem('userData', JSON.stringify(jsonData))
	}
}

export const removeTaskFromFavorite = (userId: string, id: number) => {
	jsonData.users[userId].favoriteTasks!.id = jsonData.users[userId].favoriteTasks!.id.filter(
		taskId => taskId !== id
	)
	localStorage.setItem('userData', JSON.stringify(jsonData))
}

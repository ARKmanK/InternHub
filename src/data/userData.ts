type TaskList = { id: number[] }

type TypeTasks = {
	favoriteTasks?: TaskList
	startedTasks?: TaskList
	finishedTasks?: TaskList
}

type TypeUsers = {
	users: { [key: string]: TypeTasks }
}

const initUserData = (): TypeUsers => {
	const storedData = localStorage.getItem('userData')
	if (storedData) {
		return JSON.parse(storedData)
	}
	return { users: {} }
}

let jsonData: TypeUsers = initUserData()

const syncWithLocalStorage = (newData: TypeUsers) => {
	jsonData = newData
	localStorage.setItem('userData', JSON.stringify(newData))
}

// Инициализация пользователя
const initializeUser = (userId: string) => {
	if (!jsonData.users[userId]) {
		jsonData.users[userId] = {
			favoriteTasks: { id: [] },
			startedTasks: { id: [] },
			finishedTasks: { id: [] },
		}
	}
}

export const setRole = (role: 'admin' | 'user') => {
	const userId = role === 'admin' ? 'admin' : 'user'
	const newData = { ...jsonData }
	if (!newData.users[userId]) {
		newData.users[userId] = {
			favoriteTasks: { id: [] },
			startedTasks: { id: [] },
			finishedTasks: { id: [] },
		}
	}
	syncWithLocalStorage(newData)
}

export const addToFavorite = (userId: string, id: number) => {
	initializeUser(userId)
	if (!jsonData.users[userId].favoriteTasks!.id.includes(id)) {
		jsonData.users[userId].favoriteTasks!.id.push(id)
		syncWithLocalStorage(jsonData)
	}
}

export const removeTaskFromFavorite = (userId: string, id: number) => {
	initializeUser(userId)
	jsonData.users[userId].favoriteTasks!.id = jsonData.users[userId].favoriteTasks!.id.filter(
		taskId => taskId !== id
	)
	syncWithLocalStorage(jsonData)
}

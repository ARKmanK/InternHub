type TypeUserTasks = {
	favoriteTasks: { id: number[] }
	startedTasks: { id: number[] }
	finishedTasks: { id: number[] }
}

type EmployerData = {
	tasks: number[]
}

type UserData = {
	user?: TypeUserTasks
	employer?: EmployerData
}

const initUserData = (): UserData => {
	const storedData = localStorage.getItem('userData')
	if (storedData) {
		try {
			const parsedData: UserData = JSON.parse(storedData)
			return parsedData
		} catch (error) {
			console.error('Ошибка парсинга данных из localStorage:', error)
		}
	}
	return {
		user: { favoriteTasks: { id: [] }, startedTasks: { id: [] }, finishedTasks: { id: [] } },
	}
}

let jsonData: UserData = initUserData()

const syncWithLocalStorage = (newData: UserData) => {
	jsonData = newData
	localStorage.setItem('userData', JSON.stringify(newData))
}

export type TypePages = {
	prevPage: string
	currentPage: string
}

export const setPage = (page: string): void => {
	const data = localStorage.getItem('prevPage')
	let pageData: TypePages

	if (!data) {
		pageData = {
			prevPage: '',
			currentPage: page,
		}
	} else {
		try {
			const parsedData: TypePages = JSON.parse(data)
			pageData = {
				prevPage: parsedData.currentPage,
				currentPage: page,
			}
		} catch (error) {
			console.error('Ошибка парсинга данных из localStorage:', error)
			pageData = {
				prevPage: '',
				currentPage: page,
			}
		}
	}
	localStorage.setItem('prevPage', JSON.stringify(pageData))
}

export const setRole = (role: 'employer' | 'user') => {
	const newData: UserData = {}
	if (role === 'user') {
		newData.user = {
			favoriteTasks: { id: [] },
			startedTasks: { id: [] },
			finishedTasks: { id: [] },
		}
	} else if (role === 'employer') {
		newData.employer = {
			tasks: [],
		}
	}
	syncWithLocalStorage(newData)
}

export const getRole = (): 'employer' | 'user' | '' => {
	const jsonData = initUserData()
	if (jsonData.user) {
		return 'user'
	} else if (jsonData.employer) {
		return 'employer'
	}
	console.warn('No user or employer found in userData:', jsonData)
	return ''
}

// USER
export const addToFavorite = (id: number) => {
	if (!jsonData.user) {
		jsonData.user = {
			favoriteTasks: { id: [] },
			startedTasks: { id: [] },
			finishedTasks: { id: [] },
		}
	}
	if (!jsonData.user.favoriteTasks.id.includes(id)) {
		jsonData.user.favoriteTasks.id.push(id)
		syncWithLocalStorage(jsonData)
	}
}

export const removeTaskFromFavorite = (id: number) => {
	if (!jsonData.user) {
		return
	}
	jsonData.user.favoriteTasks.id = jsonData.user.favoriteTasks.id.filter(taskId => taskId !== id)
	syncWithLocalStorage(jsonData)
}

export const addToStarted = (id: number) => {
	if (!jsonData.user) {
		jsonData.user = {
			favoriteTasks: { id: [] },
			startedTasks: { id: [] },
			finishedTasks: { id: [] },
		}
	}
	if (!jsonData.user.startedTasks.id.includes(id)) {
		jsonData.user.startedTasks.id.push(id)
		syncWithLocalStorage(jsonData)
	}
}

export const removeTaskFromStarted = (id: number) => {
	if (!jsonData.user) {
		return
	}
	jsonData.user.startedTasks.id = jsonData.user.startedTasks.id.filter(taskId => taskId !== id)
	syncWithLocalStorage(jsonData)
}

export const addToFinished = (id: number) => {
	if (!jsonData.user) {
		jsonData.user = {
			favoriteTasks: { id: [] },
			startedTasks: { id: [] },
			finishedTasks: { id: [] },
		}
	}
	if (!jsonData.user.finishedTasks.id.includes(id)) {
		jsonData.user.finishedTasks.id.push(id)
		syncWithLocalStorage(jsonData)
	}
}

export const removeTaskFromFinished = (id: number) => {
	if (!jsonData.user) {
		return
	}
	jsonData.user.finishedTasks.id = jsonData.user.finishedTasks.id.filter(taskId => taskId !== id)
	syncWithLocalStorage(jsonData)
}

// EMPLOYER
export const addTaskToEmployer = (taskId: number) => {
	if (!jsonData.employer) {
		jsonData.employer = { tasks: [] }
	}
	if (!jsonData.employer.tasks.includes(taskId)) {
		jsonData.employer.tasks.push(taskId)
		syncWithLocalStorage(jsonData)
	}
}

export const removeTaskFromEmployer = (taskId: number) => {
	if (!jsonData.employer) {
		return
	}
	jsonData.employer.tasks = jsonData.employer.tasks.filter(id => id !== taskId)
	syncWithLocalStorage(jsonData)
}

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

/*
export const setPage = (page: string): void => {
	// Получаем текущие данные из localStorage
	const data = localStorage.getItem('pageHistory')
	let pageData: TypePages

	if (!data) {
		// Если истории нет, инициализируем с пустой prevPage
		pageData = {
			prevPage: '',
			currentPage: page,
		}
	} else {
		try {
			const parsedData: TypePages = JSON.parse(data)
			// Обновляем pageData: текущая страница становится prevPage, новая — currentPage
			pageData = {
				prevPage: parsedData.currentPage || '',
				currentPage: page,
			}
		} catch (error) {
			console.error('Ошибка при разборе pageHistory из localStorage:', error)
			// В случае ошибки используем значения по умолчанию
			pageData = {
				prevPage: '',
				currentPage: page,
			}
		}
	}

	// Сохраняем обновленные данные в localStorage
	localStorage.setItem('pageHistory', JSON.stringify(pageData))
} */

/* export const setRole = (role: 'employer' | 'user') => {
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
} */

/* export const getRole = (): 'employer' | 'user' | '' => {
	const jsonData = initUserData()
	if (jsonData.user) {
		return 'user'
	} else if (jsonData.employer) {
		return 'employer'
	}
	console.warn('No user or employer found in userData:', jsonData)
	return ''
} */

// USER
/* export const addToFavorite = (id: number) => {
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
} */

/* export const removeTaskFromFavorite = (id: number) => {
	if (!jsonData.user) {
		return
	}
	jsonData.user.favoriteTasks.id = jsonData.user.favoriteTasks.id.filter(taskId => taskId !== id)
	syncWithLocalStorage(jsonData)
} */

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

/* export const removeTaskFromStarted = (id: number) => {
	if (!jsonData.user) {
		return
	}
	jsonData.user.startedTasks.id = jsonData.user.startedTasks.id.filter(taskId => taskId !== id)
	syncWithLocalStorage(jsonData)
} */

/* export const addToFinished = (id: number) => {
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
} */
/* 
export const removeTaskFromFinished = (id: number) => {
	if (!jsonData.user) {
		return
	}
	jsonData.user.finishedTasks.id = jsonData.user.finishedTasks.id.filter(taskId => taskId !== id)
	syncWithLocalStorage(jsonData)
} */

// EMPLOYER
/* export const addTaskToEmployer = (taskId: number) => {
	if (!jsonData.employer) {
		jsonData.employer = { tasks: [] }
	}
	if (!jsonData.employer.tasks.includes(taskId)) {
		jsonData.employer.tasks.push(taskId)
		syncWithLocalStorage(jsonData)
	}
} */

/* export const removeTaskFromEmployer = (taskId: number) => {
	if (!jsonData.employer) {
		return
	}
	jsonData.employer.tasks = jsonData.employer.tasks.filter(id => id !== taskId)
	syncWithLocalStorage(jsonData)
} */

export type PageHistory = string[]

export const setPage = (page: string): void => {
	// Получаем текущую историю из localStorage
	const data = localStorage.getItem('pageHistory')
	let pageHistory: PageHistory = []

	if (data) {
		try {
			pageHistory = JSON.parse(data)
			// Проверяем, что это массив строк
			if (!Array.isArray(pageHistory) || !pageHistory.every(item => typeof item === 'string')) {
				console.error('Некорректный формат pageHistory, сбрасываем историю')
				pageHistory = []
			}
		} catch (error) {
			console.error('Ошибка при разборе pageHistory из localStorage:', error)
			pageHistory = []
		}
	}

	// Если текущая страница уже последняя в истории, не добавляем её повторно
	if (pageHistory[pageHistory.length - 1] !== page) {
		pageHistory.push(page)
	}

	// Ограничиваем длину стека, чтобы избежать бесконечного роста (например, до 10 страниц)
	if (pageHistory.length > 10) {
		pageHistory = pageHistory.slice(-10)
	}

	// Сохраняем обновленную историю
	localStorage.setItem('pageHistory', JSON.stringify(pageHistory))
}

export const goBack = (navigate: (path: string) => void): void => {
	// Получаем текущую историю
	const data = localStorage.getItem('pageHistory')
	let pageHistory: PageHistory = []

	if (data) {
		try {
			pageHistory = JSON.parse(data)
			if (!Array.isArray(pageHistory) || !pageHistory.every(item => typeof item === 'string')) {
				console.error('Некорректный формат pageHistory')
				pageHistory = []
			}
		} catch (error) {
			console.error('Ошибка при разборе pageHistory:', error)
			pageHistory = []
		}
	}

	// Удаляем текущую страницу из стека
	pageHistory.pop()

	// Если после удаления стека осталась хотя бы одна страница, переходим на неё
	const prevPage = pageHistory.length > 0 ? pageHistory[pageHistory.length - 1] : '/tasks'

	// Сохраняем обновленный стек
	localStorage.setItem('pageHistory', JSON.stringify(pageHistory))

	// Переходим на предыдущую страницу
	navigate(prevPage)
}

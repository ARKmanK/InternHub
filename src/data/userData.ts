import { NavigateFunction } from 'react-router-dom'

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
		} catch (error) {}
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

export type PageHistory = string[]

export const setPage = (page: string): void => {
	const data = localStorage.getItem('pageHistory')
	let pageHistory: string[] = []

	if (data) {
		try {
			pageHistory = JSON.parse(data)
			if (!Array.isArray(pageHistory) || !pageHistory.every(item => typeof item === 'string')) {
				pageHistory = []
			}
		} catch (error) {
			pageHistory = []
		}
	}

	// Добавляем страницу, только если она отличается от последней
	if (pageHistory[pageHistory.length - 1] !== page) {
		pageHistory.push(page)
	}

	if (pageHistory.length > 10) {
		pageHistory = pageHistory.slice(-10)
	}

	localStorage.setItem('pageHistory', JSON.stringify(pageHistory))
}

export const goBack = (navigate: NavigateFunction): (() => void) => {
	return () => {
		const data = localStorage.getItem('pageHistory')
		let pageHistory: string[] = []

		if (data) {
			try {
				pageHistory = JSON.parse(data)
				if (!Array.isArray(pageHistory) || !pageHistory.every(item => typeof item === 'string')) {
					pageHistory = []
				}
			} catch (error) {
				pageHistory = []
			}
		}

		const prevPage = pageHistory.length > 1 ? pageHistory[pageHistory.length - 2] : '/user'

		if (pageHistory.length > 0) {
			pageHistory.pop()
			localStorage.setItem('pageHistory', JSON.stringify(pageHistory))
		}

		// Проверяем, чтобы не возвращаться на страницу редактирования после сохранения
		if (prevPage.startsWith('/edit-task/') && pageHistory.length > 1) {
			pageHistory.pop()
			localStorage.setItem('pageHistory', JSON.stringify(pageHistory))
			navigate(pageHistory.length > 1 ? pageHistory[pageHistory.length - 2] : '/user')
		} else {
			navigate(prevPage)
		}
	}
}

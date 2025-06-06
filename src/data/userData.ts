import { Dispatch, SetStateAction } from 'react'
import { NavigateFunction } from 'react-router-dom'
import { TypeTask } from '../types/TypeTask'
import { supabase } from '@/supabaseClient'

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

export const clearSessionData = () => {
	localStorage.removeItem('supabaseSession')
	localStorage.removeItem('sessionExpiry')
	localStorage.removeItem('rememberMe')
	localStorage.removeItem('email')
	localStorage.removeItem('userId')
	localStorage.removeItem('role')
}

export const updateFavoriteTasks = (
  newFavorites: number[],
  setFavoriteTasks: Dispatch<SetStateAction<number[]>>
): void => {
  setFavoriteTasks(prev => {
    if (JSON.stringify(prev) !== JSON.stringify(newFavorites)) {
      return newFavorites;
    }
    return prev;
  });
};


export const updateStartedTasks = (
  newStarted: number[],
  setStartedTasks: Dispatch<SetStateAction<number[]>>
): void => {
  setStartedTasks(prev => {
    if (JSON.stringify(prev) !== JSON.stringify(newStarted)) {
      return newStarted;
    }
    return prev;
  });
};

export const updateFinishedTasks = (
  newFinished: number[],
  setFinishedTasks: Dispatch<SetStateAction<number[]>>
): void => {
  setFinishedTasks(prev => {
    if (JSON.stringify(prev) !== JSON.stringify(newFinished)) {
      return newFinished;
    }
    return prev;
  });
};

export const getVisibleTasks = (
  allTasks: TypeTask[],
  role: 'employer' | 'user' | 'admin' | null,
  userId: number | null,
  category: 'favorite' | 'started' | 'finished',
  favoriteTasks: number[],
  startedTasks: number[],
  finishedTasks: number[]
): TypeTask[] => {
  if (!role || !userId || role === 'admin') return [];
  if (role === 'employer') {
    return allTasks.filter(task => task.employer_id === userId);
  }
  let taskIds: number[] = [];
  switch (category) {
    case 'favorite':
      taskIds = favoriteTasks;
      break;
    case 'started':
      taskIds = startedTasks;
      break;
    case 'finished':
      taskIds = finishedTasks;
      break;
  }
  return allTasks.filter(task => taskIds.includes(task.id));
};

export const handleLogout = async (
  navigate: NavigateFunction,
  addNotification: (type: string, title: string, message: string) => void
): Promise<void> => {
  try {
    await supabase.auth.signOut();
    localStorage.removeItem('userHistory');
    localStorage.removeItem('userId');
    localStorage.removeItem('sessionExpiry');
    addNotification('success', 'Успех!', 'Вы вышли из системы');
  } catch (error: any) {
    addNotification('error', 'Ошибка!', `Не удалось выйти из системы: ${error.message}`);
  } finally {
    navigate('/login');
  }
};

export const handleCategoryChange = (
  type: 'favorite' | 'started' | 'finished',
  setCategory: Dispatch<SetStateAction<'favorite' | 'started' | 'finished'>>,
  setActiveCategory: Dispatch<SetStateAction<'favorite' | 'started' | 'finished'>>
): void => {
  setCategory(type);
  setActiveCategory(type);
};
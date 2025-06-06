import { supabase } from '@/supabaseClient'
import {
  getAllTasks,
  getUniqueCompanies,
  getUserFavorites,
} from '@lib/API/supabase/taskAPI'
import { getRole, getUserId, getUserByEmail } from '@lib/API/supabase/userAPI'
import { getTaskSubmissionsCount } from '@lib/API/supabase/adminAPI'
import { TypeTask } from '@/src/types/TypeTask'

type LoadDataParams = {
  userId: number | null
  role: 'user' | 'employer' | 'admin' | null
  setFavoriteTasks: (favorites: number[]) => void
  setEmployerTaskIds: (ids: number[]) => void
  setSubmissionsCount: (count: number) => void
  setSubmissionsLoading: (loading: boolean) => void
  addNotification: (type: string, title: string, message: string) => void
}

export const loadFavoriteTasks = async (userId: number, setFavoriteTasks: (favorites: number[]) => void, addNotification: (type: string, title: string, message: string) => void) => {
  try {
    const favorites = await getUserFavorites(userId)
    setFavoriteTasks(favorites)
  } catch (error: any) {
    addNotification('error', 'Ошибка', `Не удалось загрузить избранные задачи: ${error.message}`)
  }
}

export const loadEmployerTasks = async (userId: number, setEmployerTaskIds: (ids: number[]) => void, addNotification: (type: string, title: string, message: string) => void) => {
  try {
    const { data, error } = await supabase.from('tasks').select('id').eq('employer_id', userId)
    if (error) throw error
    setEmployerTaskIds(data.map(task => task.id))
  } catch (error: any) {
    addNotification('error', 'Ошибка', `Не удалось загрузить задачи работодателя: ${error.message}`)
  }
}

export const loadSubmissionsCount = async (setSubmissionsCount: (count: number) => void, setSubmissionsLoading: (loading: boolean) => void, addNotification: (type: string, title: string, message: string) => void) => {
  try {
    setSubmissionsLoading(true)
    const count = await getTaskSubmissionsCount()
    setSubmissionsCount(count)
  } catch (error: any) {
    addNotification('error', 'Ошибка', `Не удалось загрузить количество заявок: ${error.message}`)
  } finally {
    setSubmissionsLoading(false)
  }
}

export const fetchTasksData = async (setTasks: (data: TypeTask[]) => void, addNotification: (type: string, title: string, message: string) => void) => {
  try {
    const tasksData = await getAllTasks()
    const normalizedTasks = tasksData.map(task => ({
      ...task,
      tags: task.tags ?? [],
    }))
    setTasks(normalizedTasks)
  } catch (error: any) {
    addNotification('error', 'Ошибка', `Не удалось загрузить данные: ${error.message}`)
    throw error
  }
}

export const fetchUserAndTasks = async (
  setLoading: (loading: boolean) => void,
  setUserId: (id: number | null) => void,
  setRole: (role: 'user' | 'employer' | 'admin' | null) => void,
  setCompanies: (companies: string[]) => void,
  setTasks: (tasks: TypeTask[]) => void,
  setHasFetched: (bool: boolean) => void,
  navigate: (path: string) => void,
  addNotification: (type: string, title: string, message: string) => void,
  loadData: LoadDataParams
) => {
  setLoading(true)
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session?.user) {
      addNotification('warning', 'Ошибка', 'Пользователь не авторизован')
      navigate('/login')
      return
    }

    const storedUserId = getUserId()
    const storedRole = getRole()

    let finalUserId = storedUserId
    let finalRole: 'user' | 'employer' | 'admin' | null = storedRole

    if (!storedUserId || !storedRole) {
      const user = await getUserByEmail(session.user.email!)
      if (!user) {
        addNotification('error', 'Ошибка', 'Пользователь не найден в базе данных')
        navigate('/login')
        return
      }
      finalUserId = user.id
      finalRole = user.role
    }

    setUserId(finalUserId)
    setRole(finalRole)

    const uniqueCompanies = await getUniqueCompanies()
    setCompanies(uniqueCompanies)

    if (finalUserId) {
      await loadFavoriteTasks(finalUserId, loadData.setFavoriteTasks, addNotification)
    }

    if (finalRole === 'employer' && finalUserId) {
      await loadEmployerTasks(finalUserId, loadData.setEmployerTaskIds, addNotification)
    } else if (finalRole === 'admin' && finalUserId) {
      loadData.setEmployerTaskIds([])
      await loadSubmissionsCount(loadData.setSubmissionsCount, loadData.setSubmissionsLoading, addNotification)
    }

    await fetchTasksData(setTasks, addNotification)
  } catch (error: any) {
    addNotification('error', 'Ошибка', `Не удалось загрузить данные: ${error.message}`)
  } finally {
    setHasFetched(true)
    setLoading(false)
  }
}
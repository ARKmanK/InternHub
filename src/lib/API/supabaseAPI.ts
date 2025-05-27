import { supabase } from '@/supabaseClient'
import { TypeUser } from '@/src/types/TypeUser'
import { TypeTask } from '@/src/types/TypeTask'
import { TypeTaskActivity } from '@/src/types/TypeTaskActivity'
import { TypeTaskSubmission } from '@/src/types/TypeTaskSubmission'
import { TypeTag } from '@/src/types/TypeTag'

// Функции для работы с таблицей users
type TypeUserData = {
	email: string
	role: 'user' | 'employer'
	first_name?: string
	last_name?: string
	student_group?: string
	course?: number | string
	company_name?: string | null
}

export const createUser = async (userData: TypeUserData) => {
	const { email, role, first_name, last_name, student_group, course, company_name } = userData

	const dataToInsert: TypeUserData = {
		email,
		role,
		first_name,
		last_name,
		student_group,
		course,
		company_name: role === 'employer' ? company_name : null,
	}

	// Удаляем undefined значения
	;(Object.keys(dataToInsert) as (keyof TypeUserData)[]).forEach(key => {
		if (dataToInsert[key] === undefined) {
			delete dataToInsert[key]
		}
	})

	console.log('Data to insert into users:', dataToInsert) // Отладочный вывод
	const { error } = await supabase.from('users').insert(dataToInsert)

	if (error) {
		throw new Error(`Failed to create user: ${error.message}`)
	}
	localStorage.setItem('first_name', first_name || '')
	localStorage.setItem('last_name', last_name || '')
	localStorage.setItem('userId', (await getUserByEmail(email))?.id?.toString() || '')
	localStorage.setItem('role', role)
}

export const getUserByEmail = async (email: string): Promise<TypeUser | null> => {
	const { data, error } = await supabase.from('users').select('*').eq('email', email).single()

	if (error) {
		throw new Error(`Failed to fetch user: ${error.message}`)
	}

	return data
}

// Функции для работы с таблицей tasks
export const getAllTasks = async (): Promise<TypeTask[]> => {
	const { data, error } = await supabase.from('tasks').select(`
			*,
			task_tags (
				tag_id,
				tags (name)
			)
		`)

	if (error) {
		throw new Error(`Failed to fetch tasks: ${error.message}`)
	}

	// Форматируем данные, извлекая теги
	return data.map(task => ({
		...task,
		tags: task.task_tags.map((tt: any) => tt.tags.name),
	}))
}

export const getTaskById = async (taskId: number): Promise<TypeTask | null> => {
	const { data, error } = await supabase
		.from('tasks')
		.select(
			`
			*,
			task_tags (
				tag_id,
				tags (name)
			)
		`
		)
		.eq('id', taskId)
		.single()

	if (error) {
		throw new Error(`Failed to fetch task: ${error.message}`)
	}

	return {
		...data,
		tags: data.task_tags.map((tt: any) => tt.tags.name),
	}
}

// Функции для работы с таблицей user_tasks
export const addTaskToFavorites = async (userId: number, taskId: number): Promise<void> => {
	const { error } = await supabase
		.from('user_tasks')
		.upsert({ user_id: userId, task_id: taskId, is_favorite: true })

	if (error) {
		throw new Error(`Failed to add task to favorites: ${error.message}`)
	}
}

export const getUserFavorites = async (userId: number): Promise<number[]> => {
	const { data, error } = await supabase
		.from('user_tasks')
		.select('task_id')
		.eq('user_id', userId)
		.eq('is_favorite', true)

	if (error) {
		throw new Error(`Failed to fetch user favorites: ${error.message}`)
	}

	return data.map(item => item.task_id)
}

// Функции для работы с таблицей task_activity

export const addTaskActivity = async (
	activity: Omit<TypeTaskActivity, 'id' | 'created_at'>
): Promise<{ error: Error | null }> => {
	const { error } = await supabase.from('task_activity').insert([activity])
	return { error: error || null }
}

// ... (остальные функции остаются без изменений)

export const getTaskActivity = async (taskId: number): Promise<TypeTaskActivity[]> => {
	const { data, error } = await supabase.from('task_activity').select('*').eq('task_id', taskId)

	if (error) {
		throw new Error(`Failed to fetch task activity: ${error.message}`)
	}

	return data || []
}

// Функции для работы с таблицей task_submissions
export const submitTaskSolution = async (
	submission: Omit<TypeTaskSubmission, 'id' | 'submitted_at'>
): Promise<void> => {
	const { error } = await supabase.from('task_submissions').insert([submission])

	if (error) {
		throw new Error(`Failed to submit task solution: ${error.message}`)
	}
}

export const getTaskSubmissions = async (
	taskId: number,
	userId: number
): Promise<TypeTaskSubmission[]> => {
	const { data, error } = await supabase
		.from('task_submissions')
		.select('*')
		.eq('task_id', taskId)
		.eq('user_id', userId)

	if (error) {
		throw new Error(`Failed to fetch task submissions: ${error.message}`)
	}

	return data
}

// Функции для работы с таблицей tags
export const getAllTags = async (): Promise<TypeTag[]> => {
	const { data, error } = await supabase.from('tags').select('*')

	if (error) {
		throw new Error(`Failed to fetch tags: ${error.message}`)
	}

	return data
}

// supabaseApi.ts
export const removeTaskFromFavorite = async (userId: number, taskId: number): Promise<void> => {
	const { error } = await supabase
		.from('user_tasks')
		.delete()
		.eq('user_id', userId)
		.eq('task_id', taskId)
		.eq('is_favorite', true)
	if (error) throw new Error(`Failed to remove task from favorites: ${error.message}`)
}

// Добавьте функции для started и finished, если еще нет
export const addTaskToStarted = async (userId: number, taskId: number): Promise<void> => {
	const { error } = await supabase
		.from('user_tasks')
		.upsert({ user_id: userId, task_id: taskId, is_started: true })
	if (error) throw new Error(`Failed to add task to started: ${error.message}`)
}

export const removeTaskFromStarted = async (userId: number, taskId: number): Promise<void> => {
	const { error } = await supabase
		.from('user_tasks')
		.delete()
		.eq('user_id', userId)
		.eq('task_id', taskId)
		.eq('is_started', true)
	if (error) throw new Error(`Failed to remove task from started: ${error.message}`)
}

export const addTaskToFinished = async (userId: number, taskId: number): Promise<void> => {
	const { error } = await supabase
		.from('user_tasks')
		.upsert({ user_id: userId, task_id: taskId, is_finished: true })
	if (error) throw new Error(`Failed to add task to finished: ${error.message}`)
}

export const removeTaskFromFinished = async (userId: number, taskId: number): Promise<void> => {
	const { error } = await supabase
		.from('user_tasks')
		.delete()
		.eq('user_id', userId)
		.eq('task_id', taskId)
		.eq('is_finished', true)
	if (error) throw new Error(`Failed to remove task from finished: ${error.message}`)
}

export const getRole = (): 'user' | 'employer' | null => {
	const role = localStorage.getItem('role')
	if (role === 'user' || role === 'employer') {
		return role
	}
	return null
}

export const getUserId = (): number | null => {
	const userId = localStorage.getItem('userId')
	return userId ? parseInt(userId, 10) : null
}

export const clearAuthData = () => {
	localStorage.removeItem('userId')
	localStorage.removeItem('role')
	localStorage.removeItem('rememberMe')
	localStorage.removeItem('email')
}

// Функция для создания задачи
export const createTask = async (
	taskData: Omit<TypeTask, 'id'> & { employer_id: number },
	tags: string[]
): Promise<void> => {
	// 1. Добавляем задачу в таблицу tasks
	const { data, error } = await supabase
		.from('tasks')
		.insert([
			{
				tracking_number: taskData.tracking_number,
				title: taskData.title,
				description: taskData.description,
				difficulty: taskData.difficulty,
				company_name: taskData.company_name,
				deadline: taskData.deadline,
				employer_id: taskData.employer_id,
			},
		])
		.select()
		.single()

	if (error) {
		throw new Error(`Failed to create task: ${error.message}`)
	}

	const taskId = data.id

	// 2. Обрабатываем теги: добавляем новые теги в таблицу tags, если их там нет
	const existingTags = await supabase.from('tags').select('id, name').in('name', tags)
	if (existingTags.error) {
		throw new Error(`Failed to fetch tags: ${existingTags.error.message}`)
	}

	const existingTagNames = existingTags.data.map(tag => tag.name)
	const newTags = tags.filter(tag => !existingTagNames.includes(tag))

	// Добавляем новые теги в таблицу tags
	if (newTags.length > 0) {
		const { error: insertTagsError } = await supabase
			.from('tags')
			.insert(newTags.map(tag => ({ name: tag })))
		if (insertTagsError) {
			throw new Error(`Failed to insert new tags: ${insertTagsError.message}`)
		}
	}

	// 3. Получаем ID всех тегов (существующих и новых)
	const allTags = await supabase.from('tags').select('id, name').in('name', tags)
	if (allTags.error) {
		throw new Error(`Failed to fetch all tags: ${allTags.error.message}`)
	}

	// 4. Связываем теги с задачей через таблицу task_tags
	const tagIds = allTags.data.map(tag => tag.id)
	const taskTags = tagIds.map(tagId => ({
		task_id: taskId,
		tag_id: tagId,
	}))

	const { error: taskTagsError } = await supabase.from('task_tags').insert(taskTags)
	if (taskTagsError) {
		throw new Error(`Failed to link tags to task: ${taskTagsError.message}`)
	}
}

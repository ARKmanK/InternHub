import { supabase } from '@/supabaseClient'
import { TypeUser } from '@/src/types/TypeUser'
import { TypeTask } from '@/src/types/TypeTask'
import { TypeTaskActivity } from '@/src/types/TypeTaskActivity'
import { TypeTaskSubmission } from '@/src/types/TypeTaskSubmission'
import { TypeTag } from '@/src/types/TypeTag'
/* import { TypeTasksData } from '@/src/data/tasksData' */

// Функции для работы с таблицей users
export type TypeUserData = {
	email: string
	role: 'user' | 'employer' | 'admin'
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

	console.log('Data to insert into users:', dataToInsert)
	const { data, error } = await supabase.from('users').insert(dataToInsert).select()

	if (error) {
		throw new Error(`Failed to create user: ${error.message}`)
	}

	// Сохраняем только существующие данные
	if (first_name) localStorage.setItem('first_name', first_name)
	if (last_name) localStorage.setItem('last_name', last_name)
	if (data && data[0]?.id) localStorage.setItem('userId', data[0].id.toString())
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
        tag_type
      )
    `)

	if (error) {
		throw new Error(`Failed to fetch tasks: ${error.message}`)
	}

	// Обработка тегов
	const tasksWithTags = await Promise.all(
		data.map(async task => {
			const taskTags = task.task_tags || []
			const tags: string[] = []

			// Получаем общие теги
			const commonTagIds = taskTags
				.filter((tt: any) => tt.tag_type === 'common')
				.map((tt: any) => tt.tag_id)
			if (commonTagIds.length > 0) {
				const { data: commonTags, error: commonTagsError } = await supabase
					.from('tags')
					.select('name')
					.in('id', commonTagIds)
				if (commonTagsError) {
					throw new Error(`Failed to fetch common tags: ${commonTagsError.message}`)
				}
				tags.push(...commonTags.map((tag: any) => tag.name))
			}

			// Получаем кастомные теги
			const userTagIds = taskTags
				.filter((tt: any) => tt.tag_type === 'user')
				.map((tt: any) => tt.tag_id)
			if (userTagIds.length > 0) {
				const { data: userTags, error: userTagsError } = await supabase
					.from('user_tags')
					.select('name')
					.in('id', userTagIds)
				if (userTagsError) {
					throw new Error(`Failed to fetch user tags: ${userTagsError.message}`)
				}
				tags.push(...userTags.map((tag: any) => tag.name))
			}

			return {
				...task,
				tags,
			}
		})
	)

	return tasksWithTags
}

export const getTaskById = async (taskId: number): Promise<TypeTask | null> => {
	try {
		// Получаем задачу
		const { data: taskData, error: taskError } = await supabase
			.from('tasks')
			.select('*')
			.eq('id', taskId)
			.single()

		if (taskError) {
			throw new Error(`Не удалось загрузить задачу: ${taskError.message}`)
		}

		if (!taskData) return null

		// Получаем связи тегов из task_tags
		const { data: taskTags, error: taskTagsError } = await supabase
			.from('task_tags')
			.select('tag_id, tag_type')
			.eq('task_id', taskId)

		if (taskTagsError) {
			throw new Error(`Не удалось загрузить связи тегов: ${taskTagsError.message}`)
		}

		const tags: string[] = []

		// Получаем общие теги
		const commonTagIds = taskTags.filter(tt => tt.tag_type === 'common').map(tt => tt.tag_id)

		if (commonTagIds.length > 0) {
			const { data: commonTags, error: commonTagsError } = await supabase
				.from('tags')
				.select('name')
				.in('id', commonTagIds)

			if (commonTagsError) {
				throw new Error(`Не удалось загрузить общие теги: ${commonTagsError.message}`)
			}

			tags.push(...commonTags.map(tag => tag.name))
		}

		// Получаем кастомные теги
		const userTagIds = taskTags.filter(tt => tt.tag_type === 'user').map(tt => tt.tag_id)

		if (userTagIds.length > 0) {
			const { data: userTags, error: userTagsError } = await supabase
				.from('user_tags')
				.select('name')
				.in('id', userTagIds)

			if (userTagsError) {
				throw new Error(`Не удалось загрузить кастомные теги: ${userTagsError.message}`)
			}

			tags.push(...userTags.map(tag => tag.name))
		}

		return {
			...taskData,
			tags,
		}
	} catch (error: any) {
		throw new Error(`Не удалось загрузить задачу: ${error.message}`)
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

export const getTaskActivity = async (taskId: number): Promise<TypeTaskActivity[]> => {
	const { data, error } = await supabase
		.from('task_activity')
		.select(
			'id, task_id, user_id, status, username, activity_date, created_at, url, archive_url, photo_urls, comment'
		)
		.eq('task_id', taskId)
	if (error) {
		throw new Error(`Failed to fetch task activity: ${error.message}`)
	}
	return data.map(item => ({
		id: item.id,
		task_id: item.task_id,
		user_id: item.user_id,
		status: item.status,
		username: item.username || 'Неизвестно',
		activity_date: item.activity_date,
		created_at: item.created_at,
		url: item.url,
		archive_url: item.archive_url || null,
		photo_urls: item.photo_urls || [],
		comment: item.comment || null,
	}))
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
	const { data, error } = await supabase.from('tags').select('id, name')
	if (error) {
		throw new Error(`Не удалось загрузить общие теги: ${error.message}`)
	}
	return data || []
}

export const removeTaskFromFavorite = async (userId: number, taskId: number) => {
	const { error } = await supabase
		.from('user_tasks')
		.update({ is_favorite: false })
		.eq('user_id', userId)
		.eq('task_id', taskId)
	if (error) throw error
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
	taskData: Omit<TypeTask, 'id' | 'tags'>,
	tags: string[],
	userId: number
): Promise<number> => {
	try {
		// 1. Добавляем задачу в таблицу tasks
		const { data, error } = await supabase
			.from('tasks')
			.insert({
				tracking_number: taskData.tracking_number,
				title: taskData.title,
				description: taskData.description,
				difficulty: taskData.difficulty,
				company_name: taskData.company_name,
				deadline: taskData.deadline,
				employer_id: taskData.employer_id,
			})
			.select('id')
			.single()

		if (error) {
			throw new Error(`Не удалось создать задачу: ${error.message}`)
		}

		if (!data) {
			throw new Error('Задача не была создана')
		}

		const taskId = data.id

		// 2. Получаем существующие общие теги
		const { data: existingCommonTags, error: fetchCommonTagsError } = await supabase
			.from('tags')
			.select('id, name')
			.in('name', tags)

		if (fetchCommonTagsError) {
			throw new Error(`Не удалось получить общие теги: ${fetchCommonTagsError.message}`)
		}

		const commonTagNames = existingCommonTags.map(tag => tag.name)
		const commonTagsMap = new Map(existingCommonTags.map(tag => [tag.name, tag.id]))

		// 3. Получаем существующие кастомные теги пользователя
		const { data: existingUserTags, error: fetchUserTagsError } = await supabase
			.from('user_tags')
			.select('id, name')
			.eq('user_id', userId)
			.in('name', tags)

		if (fetchUserTagsError) {
			throw new Error(`Не удалось получить кастомные теги: ${fetchUserTagsError.message}`)
		}

		const userTagNames = existingUserTags.map(tag => tag.name)
		const userTagsMap = new Map(existingUserTags.map(tag => [tag.name, tag.id]))

		// 4. Создаем новые кастомные теги, если их нет
		const newTags = tags.filter(tag => !commonTagNames.includes(tag) && !userTagNames.includes(tag))
		for (const tag of newTags) {
			const userTagId = await createUserTag(userId, tag)
			userTagsMap.set(tag, userTagId)
		}

		// 5. Связываем теги с задачей через task_tags
		const taskTags = tags.map(tag => {
			if (commonTagNames.includes(tag)) {
				return {
					task_id: taskId,
					tag_id: commonTagsMap.get(tag),
					tag_type: 'common',
				}
			} else {
				return {
					task_id: taskId,
					tag_id: userTagsMap.get(tag),
					tag_type: 'user',
				}
			}
		})

		const { error: taskTagsError } = await supabase.from('task_tags').insert(taskTags)
		if (taskTagsError) {
			throw new Error(`Не удалось связать теги с задачей: ${taskTagsError.message}`)
		}

		return taskId
	} catch (error: any) {
		throw new Error(`Ошибка при создании задачи: ${error.message}`)
	}
}

export const getUniqueCompanies = async (): Promise<string[]> => {
	try {
		const { data, error } = await supabase
			.from('tasks')
			.select('company_name')
			.order('company_name', { ascending: true })

		if (error) throw error

		// Извлекаем уникальные company_name
		const uniqueCompanies = [...new Set(data.map(item => item.company_name))]
		return uniqueCompanies
	} catch (error: any) {
		throw new Error(`Не удалось загрузить компании: ${error.message}`)
	}
}

export const updateTask = async (task: TypeTask, userId: number): Promise<void> => {
	try {
		// 1. Обновляем основную информацию задачи
		const { error: taskError } = await supabase
			.from('tasks')
			.update({
				title: task.title,
				description: task.description,
				difficulty: task.difficulty,
				company_name: task.company_name,
				deadline: task.deadline,
			})
			.eq('id', task.id)
			.eq('employer_id', userId)

		if (taskError) throw taskError

		// 2. Удаляем старые связи тегов
		const { error: deleteTagsError } = await supabase
			.from('task_tags')
			.delete()
			.eq('task_id', task.id)

		if (deleteTagsError) throw deleteTagsError

		// 3. Получаем существующие общие теги
		const { data: existingCommonTags, error: fetchCommonTagsError } = await supabase
			.from('tags')
			.select('id, name')
			.in('name', task.tags || [])

		if (fetchCommonTagsError) throw fetchCommonTagsError

		const commonTagNames = existingCommonTags.map(tag => tag.name)
		const commonTagsMap = new Map(existingCommonTags.map(tag => [tag.name, tag.id]))

		// 4. Получаем существующие кастомные теги пользователя
		const { data: existingUserTags, error: fetchUserTagsError } = await supabase
			.from('user_tags')
			.select('id, name')
			.eq('user_id', userId)
			.in('name', task.tags || [])

		if (fetchUserTagsError) throw fetchUserTagsError

		const userTagNames = existingUserTags.map(tag => tag.name)
		const userTagsMap = new Map(existingUserTags.map(tag => [tag.name, tag.id]))

		// 5. Создаем новые кастомные теги, если их нет
		const newTags = (task.tags || []).filter(
			tag => !commonTagNames.includes(tag) && !userTagNames.includes(tag)
		)
		for (const tag of newTags) {
			const userTagId = await createUserTag(userId, tag)
			userTagsMap.set(tag, userTagId)
		}

		// 6. Связываем теги с задачей через task_tags
		const taskTags = (task.tags || []).map(tag => {
			if (commonTagNames.includes(tag)) {
				return {
					task_id: task.id,
					tag_id: commonTagsMap.get(tag),
					tag_type: 'common',
				}
			} else {
				return {
					task_id: task.id,
					tag_id: userTagsMap.get(tag),
					tag_type: 'user',
				}
			}
		})

		const { error: taskTagsError } = await supabase.from('task_tags').insert(taskTags)
		if (taskTagsError) throw taskTagsError
	} catch (error: any) {
		throw new Error(`Не удалось обновить задачу: ${error.message}`)
	}
}

// Получение кастомных тегов пользователя
export const getUserTags = async (userId: number): Promise<string[]> => {
	const { data, error } = await supabase.from('user_tags').select('name').eq('user_id', userId)

	if (error) {
		throw new Error(`Не удалось загрузить пользовательские теги: ${error.message}`)
	}

	return data.map(item => item.name).filter((name): name is string => name !== null) || []
}

export const createUserTag = async (userId: number, tagName: string): Promise<number> => {
	const { data, error } = await supabase
		.from('user_tags')
		.insert({ user_id: userId, name: tagName })
		.select('id')
		.single()

	if (error) {
		throw new Error(`Failed to create user tag: ${error.message}`)
	}

	return data.id
}

export const deleteTask = async (taskId: number, userId: number): Promise<void> => {
	try {
		const { error } = await supabase
			.from('tasks')
			.delete()
			.eq('id', taskId)
			.eq('employer_id', userId) // Проверка, что задача принадлежит пользователю

		if (error) {
			throw new Error(`Не удалось удалить задачу: ${error.message}`)
		}
	} catch (error: any) {
		throw new Error(`Ошибка при удалении задачи: ${error.message}`)
	}
}

// Получение задач из task_submissions (для верификации)
export const getPendingTaskSubmissions = async (): Promise<TypeTaskSubmission[]> => {
	const { data: submissions, error: submissionError } = await supabase
		.from('task_submissions')
		.select('*')

	if (submissionError) {
		throw new Error(`Failed to fetch pending task submissions: ${submissionError.message}`)
	}

	if (!submissions || submissions.length === 0) {
		return []
	}

	return submissions.map(submission => ({
		id: submission.id,
		user_id: submission.user_id,
		submission_url: submission.submission_url,
		zip_file_url: submission.zip_file_url,
		comment: submission.comment,
		photos: submission.photos,
		submitted_at: submission.submitted_at,
		title: submission.title,
		description: submission.description,
		difficulty: submission.difficulty,
		company_name: submission.company_name,
		deadline: submission.deadline,
		employer_id: submission.employer_id,
		tags: submission.tags,
	}))
}

// Одобрение задачи (перенос из task_submissions в tasks)
export const approveTaskSubmission = async (submissionId: number): Promise<void> => {
	const { data: submission, error: fetchError } = await supabase
		.from('task_submissions')
		.select('*')
		.eq('id', submissionId)
		.single()

	if (fetchError) {
		throw new Error(`Failed to fetch submission: ${fetchError.message}`)
	}

	if (!submission) {
		throw new Error('Submission not found')
	}

	const newTask = {
		tracking_number: 0,
		title: submission.title,
		description: submission.description,
		difficulty: submission.difficulty,
		company_name: submission.company_name,
		deadline: submission.deadline,
		employer_id: submission.employer_id,
		created_at: new Date().toISOString(),
	}

	const { data: taskData, error: taskError } = await supabase
		.from('tasks')
		.insert(newTask)
		.select()
		.single()

	if (taskError) {
		throw new Error(`Failed to create task: ${taskError.message}`)
	}

	const taskId = taskData.id

	if (submission.tags && submission.tags.length > 0) {
		for (const tagName of submission.tags) {
			// Проверяем, существует ли тег в tags
			let { data: existingTag, error: tagError } = await supabase
				.from('tags')
				.select('id')
				.eq('name', tagName)
				.single()

			if (tagError && tagError.code !== 'PGRST116') {
				throw new Error(`Failed to fetch tag: ${tagError.message}`)
			}

			let tagId: number
			if (!existingTag) {
				// Создаем новый тег в tags
				const { data: newTag, error: createTagError } = await supabase
					.from('tags')
					.insert({ name: tagName })
					.select()
					.single()

				if (createTagError) {
					throw new Error(`Failed to create tag: ${createTagError.message}`)
				}
				tagId = newTag.id
			} else {
				tagId = existingTag.id
			}

			// Связываем тег с задачей в task_tags, используем tag_type вместо type
			const { error: taskTagError } = await supabase
				.from('task_tags')
				.insert({ task_id: taskId, tag_id: tagId, tag_type: 'common' }) // Заменили type на tag_type

			if (taskTagError) {
				throw new Error(`Failed to link tag to task: ${taskTagError.message}`)
			}
		}
	}

	const { error: deleteError } = await supabase
		.from('task_submissions')
		.delete()
		.eq('id', submissionId)

	if (deleteError) {
		throw new Error(`Failed to delete submission: ${deleteError.message}`)
	}
}

export const rejectTaskSubmission = async (submissionId: number): Promise<void> => {
	const { error } = await supabase.from('task_submissions').delete().eq('id', submissionId)

	if (error) {
		throw new Error(`Failed to delete submission: ${error.message}`)
	}
}

export const addMessage = async (userId: string, text: string) => {
	const { data, error } = await supabase.from('messages').insert({ user_id: userId, text }).select()

	if (error) throw error
	return data
}

// Получение сообщений по user_id
export const getMessagesByUserId = async (userId: string) => {
	const { data, error } = await supabase
		.from('messages')
		.select('*')
		.eq('user_id', userId)
		.order('timestamp', { ascending: false })

	if (error) throw error
	return data
}

// Пометка сообщения как прочитанного
export const markMessageAsRead = async (messageId: number) => {
	const { data, error } = await supabase
		.from('messages')
		.update({ is_read: true })
		.eq('id', messageId)
		.select()

	if (error) throw error
	return data
}

export const uploadFileAndCreateRecord = async (
	taskActivityId: number,
	file: File,
	fileType: 'archive' | 'image'
): Promise<string> => {
	const fileExt = file.name.split('.').pop()
	const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt || 'dat'}` // Добавляем защиту от отсутствия расширения
	const filePath = `${fileType}s/${fileName}` // Используем подпапки (archives/ и images/)

	// Загружаем файл в хранилище
	const { data, error: uploadError } = await supabase.storage
		.from('task-files')
		.upload(filePath, file, {
			cacheControl: '3600',
			upsert: false,
			contentType: file.type, // Указываем MIME-тип файла
		})

	if (uploadError) {
		console.error('Upload error details:', uploadError)
		throw new Error(`Failed to upload file: ${uploadError.message}`)
	}

	// Получаем публичный URL файла
	const { data: urlData } = supabase.storage.from('task-files').getPublicUrl(filePath)
	const fileUrl = urlData.publicUrl

	// Создаем запись в таблице task_files
	const { error: dbError } = await supabase.from('task_files').insert({
		task_activity_id: taskActivityId,
		file_name: fileName,
		file_url: fileUrl,
		file_type: fileType,
		created_at: new Date().toISOString(),
	})

	if (dbError) {
		console.error('Database error details:', dbError)
		throw new Error(`Failed to create file record: ${dbError.message}`)
	}

	return fileUrl
}

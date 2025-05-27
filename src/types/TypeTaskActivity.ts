export type TypeTaskActivity = {
	id: number
	task_id: number
	user_id: number
	status: string | null // varchar, может быть null
	username: string | null // varchar, может быть null
	activity_date: string | null // date, преобразуем в строку для отображения
	created_at: string // timestamp, не null благодаря DEFAULT
}

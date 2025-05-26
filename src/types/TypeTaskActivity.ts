export type TypeTaskActivity = {
	id: number
	task_id: number
	user_id: number
	status: 'done' | 'undone'
	username: string
	activity_date: string
}

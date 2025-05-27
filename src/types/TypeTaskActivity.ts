export type TypeTaskActivity = {
	id: number
	task_id: number
	user_id: number
	status: 'verifying' | 'done'
	username: string
	activity_date: string
	created_at: string
	url: string | null
	comment: string | null
}

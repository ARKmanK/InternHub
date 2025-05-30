export type TypeTaskActivity = {
	id: number
	task_id: number
	user_id: number
	status: 'verifying' | 'done' | 'rejected'
	username: string
	activity_date: string
	created_at: string
	url: string | null
	archive_url: string | null
	photo_urls: string[] | null
	comment: string | null
}

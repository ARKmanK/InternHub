export type TypeTaskSubmission = {
	id: number
	task_id: number
	user_id: number
	submission_url: string
	zip_file_url?: string
	comment?: string
	photos?: string[]
}

export type TypeTaskSubmission = {
	id: number
	user_id: number
	submission_url?: string
	zip_file_url?: string
	comment?: string
	photos?: string[]
	submitted_at: string
	title: string
	description: string
	difficulty: number
	company_name: string
	deadline: string
	employer_id: number
	tags: string[] | null
}

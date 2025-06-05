export type TypeTaskSubmission = {
	id: number
	user_id: number
	submission_url?: string // Опционально, так как может быть null
	zip_file_url?: string // Опционально
	comment?: string // Опционально
	photos?: string[] // Массив URL-ов фотографий
	submitted_at: string
	title: string
	description: string
	difficulty: number
	company_name: string
	deadline: string
	employer_id: number
	tags: string[] | null
}

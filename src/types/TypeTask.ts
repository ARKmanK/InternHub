export type TypeTask = {
	id: number
	tracking_number: number
	title: string
	description: string
	difficulty: number
	company_name: string
	deadline: string
	employer_id: number
	tags?: string[]
	zip_file_url?: string | null
}

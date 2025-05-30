export type TypeTaskSubmission = {
	id: number
	tracking_number: number
	title: string
	description: string
	difficulty: number
	company_name: string
	deadline: string
	tags?: string[]
	employer_id: number
	status: 'pending' | 'approved' | 'rejected'
	submitted_at: string
}

export type TypeUser = {
	id: number
	email: string
	role: 'user' | 'employer'
	first_name?: string
	last_name?: string
	student_group?: string
	course?: number
	company_name?: string
	created_at?: string
}

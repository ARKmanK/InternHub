export type TypeUser = {
	id: number
	role: 'user' | 'employer'
	email: string
	password_hash: string
	first_name?: string
	last_name?: string
	student_group?: string
	course?: number
	company_name?: string
}

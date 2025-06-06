import { FC, FormEvent, MouseEventHandler } from 'react'
import StudentRegisterFormFields from './StudentRegisterFormFields'

type TypeUserRegisterFormProps = {
	onSubmit: (data: any) => void
	onBack: MouseEventHandler<HTMLButtonElement>
	addNotification: (type: string, title: string, message: string) => void
}

const StudentRegisterForm: FC<TypeUserRegisterFormProps> = ({
	onSubmit,
	onBack,
	addNotification,
}) => {
	const verifyUserInputs = (data: {
		firstName: FormDataEntryValue | null
		lastName: FormDataEntryValue | null
		group: FormDataEntryValue | null
		course: FormDataEntryValue | null
		email: FormDataEntryValue | null
		password: FormDataEntryValue | null
	}) => {
		if (!data.email || !data.email.toString().trim()) {
			addNotification('warning', 'Ошибка', 'Email — обязательное поле')
			return false
		}
		if (!data.password || !data.password.toString().trim()) {
			addNotification('warning', 'Ошибка', 'Пароль — обязательное поле')
			return false
		}
		if (!data.firstName || !data.firstName.toString().trim()) {
			addNotification('warning', 'Ошибка', 'Имя — обязательное поле')
			return false
		}
		if (!data.lastName || !data.lastName.toString().trim()) {
			addNotification('warning', 'Ошибка', 'Фамилия — обязательное поле')
			return false
		}
		if (!data.group || !data.group.toString().trim()) {
			addNotification('warning', 'Ошибка', 'Группа — обязательное поле')
			return false
		}
		if (!data.course || !data.course.toString().trim()) {
			addNotification('warning', 'Ошибка', 'Курс — обязательное поле')
			return false
		}
		return true
	}

	const handleSubmitUser = (e: FormEvent) => {
		e.preventDefault()
		const formData = new FormData(e.target as HTMLFormElement)
		const data = {
			email: formData.get('email'),
			password: formData.get('password'),
			firstName: formData.get('firstName'),
			lastName: formData.get('lastName'),
			group: formData.get('group'),
			course: formData.get('course'),
		}

		if (!verifyUserInputs(data)) {
			return
		}

		onSubmit(data)
	}

	return (
		<div className='md:mt-10 md:p-6 bg-[#96bddd] rounded-xl border-2 border-gray-[#dce3eb] max-w-[700px] m-auto'>
			<h2 className='text-2xl font-semibold text-gray-900 mb-6'>Регистрация студента</h2>
			<form onSubmit={handleSubmitUser} className='space-y-4'>
				<StudentRegisterFormFields />
				<div className='mt-6 space-y-3'>
					<button
						type='submit'
						className='w-full bg-amber-700 text-white py-2 px-4 rounded-md hover:bg-amber-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500'
					>
						Зарегистрироваться
					</button>
					<button
						type='button'
						onClick={onBack}
						className='w-full bg-gray-200 text-gray-900 py-2 px-4 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500'
					>
						Вернуться
					</button>
				</div>
			</form>
		</div>
	)
}

export default StudentRegisterForm

import { FC, useState } from 'react'
import { Button } from '@components/UI/Button/Button'
import { deleteTask } from '@/src/lib/API/supabaseAPI'
import { getUserId } from '@/src/lib/API/supabaseAPI'
import useNotification from '@hooks/useNotification'

type DeleteConfirmationProps = {
	taskId: number
	taskTitle: string // Передаём taskTitle через пропсы
	onConfirm: () => void
	onCancel: () => void
}

const DeleteConfirmation: FC<DeleteConfirmationProps> = ({
	taskId,
	taskTitle,
	onConfirm,
	onCancel,
}) => {
	const [inputText, setInputText] = useState('')
	const { addNotification } = useNotification()
	const userId = getUserId()

	const handleConfirm = async () => {
		if (!userId) {
			addNotification('error', 'Ошибка', 'Пользователь не авторизован')
			return
		}

		if (inputText.trim() === taskTitle.trim()) {
			try {
				await deleteTask(taskId, userId)
				addNotification('success', 'Успешно', 'Задача удалена')
				onConfirm()
			} catch (error: any) {
				addNotification('error', 'Ошибка', `Не удалось удалить задачу: ${error.message}`)
			}
		} else {
			addNotification(
				'warning',
				'Ошибка',
				`Пожалуйста, введите точное название задачи: "${taskTitle}" для подтверждения.`
			)
		}
	}

	return (
		<div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center'>
			<div className='bg-white p-6 rounded-lg shadow-lg w-[400px]'>
				<h2 className='text-lg font-semibold mb-4'>Подтверждение удаления</h2>
				<p className='mb-4'>
					Введите название задачи "{taskTitle}" для подтверждения удаления из БД.
				</p>
				<input
					type='text'
					value={inputText}
					onChange={e => setInputText(e.target.value)}
					className='w-full p-2 mb-4 border rounded'
					placeholder={`Введите "${taskTitle}"`}
					disabled={!taskTitle}
				/>
				<div className='flex justify-end gap-4'>
					<Button onClick={onCancel} className='bg-gray-300 text-black'>
						Отмена
					</Button>
					<Button onClick={handleConfirm} className='bg-red-500 text-white' disabled={!taskTitle}>
						Удалить
					</Button>
				</div>
			</div>
		</div>
	)
}

export default DeleteConfirmation

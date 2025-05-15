import { FC, useState } from 'react'
import { Button } from '@components/UI/Button/Button'

type DeleteConfirmationProps = {
	taskId: number
	onConfirm: () => void
	onCancel: () => void
}

const DeleteConfirmation: FC<DeleteConfirmationProps> = ({ taskId, onConfirm, onCancel }) => {
	const [inputText, setInputText] = useState('')

	const getTaskTitle = () => {
		const tasksData = JSON.parse(localStorage.getItem('tasks') || '[]')
		const task = tasksData.find((task: { id: number; title: string }) => task.id === taskId)
		return task ? task.title : ''
	}

	const taskTitle = getTaskTitle()

	const handleConfirm = () => {
		if (inputText.trim() === taskTitle.trim()) {
			onConfirm()
		} else {
			alert(`Пожалуйста, введите точное название задачи: "${taskTitle}" для подтверждения.`)
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
				/>
				<div className='flex justify-end gap-4'>
					<Button onClick={onCancel} className='bg-gray-300 text-black'>
						Отмена
					</Button>
					<Button onClick={handleConfirm} className='bg-red-500 text-white'>
						Удалить
					</Button>
				</div>
			</div>
		</div>
	)
}

export default DeleteConfirmation

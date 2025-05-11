import { FC } from 'react'
import './Notification.css'

export type TypeNotification = {
	type: string
	title: string
	message: string
}

type TypeNotificationProps = {
	notifications: TypeNotification[]
}

const Notification: FC<TypeNotificationProps> = ({ notifications }) => {
	return (
		<>
			<div className='notification-container'>
				{notifications.map((notification, index) => (
					<div
						key={index}
						className={`notification ${notification.type}`}
						style={{ bottom: `${index * 70}px` }}
					>
						<h5>{notification.title}</h5>
						<p>{notification.message}</p>
					</div>
				))}
			</div>
		</>
	)
}

export default Notification

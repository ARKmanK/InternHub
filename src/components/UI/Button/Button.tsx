import { FC, MouseEvent } from 'react'

type TypeButtonProps = {
	onClick: (event: MouseEvent<HTMLButtonElement>) => void
	children?: React.ReactNode
	className?: string
}

export const Button: FC<TypeButtonProps> = ({ onClick, children, className = '' }) => {
	function handleClick(event: MouseEvent<HTMLButtonElement>) {
		onClick(event)
	}

	return (
		<>
			<button
				className={`md:px-2 md:py-1.5 md:rounded-lg font-medium text-white bg-[#0c426f] ${className}`}
				onClick={handleClick}
			>
				{children}
			</button>
		</>
	)
}

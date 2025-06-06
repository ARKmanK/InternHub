import { FC, MouseEvent } from 'react'

type TypeButtonProps = {
	onClick?: (event: MouseEvent<HTMLButtonElement>) => void // Made optional with ?
	children?: React.ReactNode
	className?: string
	disabled?: boolean
	variant?: 'primary' | 'outline' | 'default'
	size?: 'sm' | 'md'
}

export const Button: FC<TypeButtonProps> = ({
	onClick,
	children,
	className = '',
	disabled = false,
	variant = 'default',
	size = 'md',
}) => {
	function handleClick(event: MouseEvent<HTMLButtonElement>) {
		if (!disabled && onClick) {
			onClick(event)
		}
	}

	const getVariantStyles = () => {
		switch (variant) {
			case 'primary':
				return 'bg-[#0c426f] text-white hover:bg-[#0a3559] active:bg-[#082b47]'
			case 'outline':
				return 'bg-transparent border border-[#0c426f] text-[#0c426f] hover:bg-gray-100 active:bg-gray-200'
			case 'default':
			default:
				return 'bg-[#0c426f] text-white hover:bg-[#0a3559] active:bg-[#082b47]'
		}
	}

	const getSizeStyles = () => {
		switch (size) {
			case 'sm':
				return 'px-2 py-1 text-sm'
			case 'md':
			default:
				return 'px-4 py-2 text-base'
		}
	}

	return (
		<button
			className={`rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${getVariantStyles()} ${getSizeStyles()} ${className}`}
			onClick={handleClick}
			disabled={disabled}
		>
			{children}
		</button>
	)
}

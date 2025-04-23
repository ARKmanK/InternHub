import { FC, useState } from 'react'
import { MainPages, ExtraPagesCol1 } from '@data/pages'
import arrow from '@public/arrow-down.png'

const NavBar: FC = () => {
	const [openDropDown, setOpenDropDown] = useState<string | null>(null)

	const toggleDropDown = (category: string) => {
		setOpenDropDown(openDropDown === category ? null : category)
	}

	return (
		<>
			<nav className='bg-[#0c426f] w-full h-[52px] border-t-1 border-[#09355a]'>
				<div className='border-t-1 border-[#1f537e] h-full'>
					<div className='md:flex md:justify-center h-full md:pr-2'>
						{MainPages.map((page, index) => (
							<div
								className='md:flex md:items-center'
								onMouseEnter={() => toggleDropDown(page)}
								key={index}
							>
								<button className='md:px-3 md:py-2 border-r-1 border-[#1f537e] font-bold text-[#EAF1F7] text-xs uppercase focus:border-t-3 focus:border-t-amber-500 focus:bg-[#1b5280] cursor-pointer md:flex md:items-center h-full'>
									{page}
									<img src={arrow} alt='' className='md:w-2.5 md:h-2.5 md:ml-1 md:mb-0.5' />
								</button>
							</div>
						))}

						{openDropDown != null ? <></> : <></>}
					</div>
				</div>
			</nav>
		</>
	)
}

export default NavBar

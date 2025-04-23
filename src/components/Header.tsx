import { FC } from 'react'
/* import { Link } from 'react-router-dom'  */

import Logo from '@public/logo.png'
import Logo_mobile from '@public/logo-mobile.png'
import Eye from '@public/eye2.png'
import Flag from '@public/gb_en.png'
import { Search } from 'lucide-react'
import getDate from '@data/getDate'

const Header: FC = () => {
	const [dateString, weekday, weekText] = getDate()

	return (
		<>
			<header className='w-full md:min-h-[101px] bg-[#0c426f]'>
				<div className='md:pb-3 md:pt-2.5 md:mx-59 flex'>
					<div className='md:h-full w-full  flex md:justify-end md:items-center md:pb-3'>
						<img className='hidden md:block' src={Logo} alt='БрГУ' />
						<img className='block md:hidden' src={Logo_mobile} alt='БрГУ' />
					</div>
					<div className='md:h-full w-[70%] md:pl-18 md:ml-4 md:flex'>
						<div className='md:mt-5 mr-3 ml-0.5'>
							<div className='md:flex'>
								<button className='cursor-pointer'>
									<img
										className='h-[21px] md:flex md:mr-[5px]'
										src={Eye}
										alt='Версия для слабовидящих'
									/>
								</button>
								<button className='cursor-pointer'>
									<img src={Flag} alt='English version' />
								</button>
							</div>
						</div>
						<div className='md:flex md:flex-col md:pt-5'>
							<div className='md:flex md:ml-1'>
								<input
									className='bg-[#215281] text-sm md:pt-[5px] md:pb-[5px] md:mt-[1px] md:pr-3 md:pl-2.5 md:w-[190px] text-[#99908f] placeholder-[#99908f]'
									type='text'
									placeholder='Введите текст для поиска'
								/>
								<button className='bg-black md:p-1'>
									<Search color='white' size={18} />
								</button>
							</div>
							<div className='md:flex text-white text-[13px]'>
								<p>{dateString}</p>
								<p>&nbsp;{weekday}</p>
								<p>{weekText}</p>
							</div>
						</div>
					</div>
				</div>
			</header>
		</>
	)
}

export default Header

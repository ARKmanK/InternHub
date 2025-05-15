import { FC } from 'react'
import Logo from '/logo.png'
import Logo_mobile from '/logo-mobile.png'
import Eye from '/eye2.png'
import Flag from '/gb_en.png'
import { Search } from 'lucide-react'
import getDate from '@data/getDate'

const Header: FC = () => {
	const [dateString, weekday, weekText] = getDate()

	return (
		<>
			<header className='md:w-full md:min-h-[101px] bg-[#0c426f]'>
				<div className='md:pb-3 md:pt-2.5 md:mx-59 md:flex'>
					<div className='md:h-full md:w-full md:flex md:justify-end md:items-center md:pb-3 md:mr-[10px]'>
						<button>
							<img className='hidden md:block' src={Logo} alt='БрГУ' />
						</button>
						<button>
							<img className='block md:hidden' src={Logo_mobile} alt='БрГУ' />
						</button>
					</div>
					<div className='md:h-full w-[70%] md:pl-12 md:ml-4 md:flex'>
						<div className='md:mt-5 md:mr-3 md:ml-[16px]'>
							<div className='md:flex'>
								<button className='outline-none'>
									<img
										className='md:h-[21px] md:flex md:mr-[5px] outline-none border-none'
										src={Eye}
										alt='Версия для слабовидящих'
									/>
								</button>
								<button className='outline-none'>
									<img src={Flag} alt='English version' />
								</button>
							</div>
						</div>
						<div className='md:flex md:flex-col md:pt-5'>
							<div className='md:flex md:mt-[1px]'>
								<input
									className='bg-[#215281] text-xs md:pt-[7px] md:pb-[7px] md:ml-[5px] md:pr-3 md:pl-2.5 md:w-[167px] text-[#9DBBD5] placeholder-[#999999] focus:outline-0'
									type='text'
									placeholder='Введите текст для поиска'
								/>
								<button className='bg-black md:px-[11px] hover:bg-[#e09b0f]'>
									<Search color='white' size={13} strokeWidth={4} />
								</button>
							</div>
							<div
								className='md:flex text-white text-[13px]'
								style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}
							>
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

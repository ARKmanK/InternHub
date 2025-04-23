import { FC, useState } from 'react'
import { ExtraPages, MainPages } from '@data/pages'
import arrow from '/arrow-down.png'

const NavBar: FC = () => {
	const [openDropDown, setOpenDropDown] = useState<string | null>(null)

	const toggleDropDown = (category: string) => {
		setOpenDropDown(openDropDown === category ? null : category)
	}

	return (
		<nav className='bg-[#0c426f] md:w-full md:h-[52px] md:border-t-1 border-[#09355a]'>
			<div className='md:border-t-1 border-[#1f537e] md:h-full'>
				<div className='md:flex md:justify-center md:h-full md:pr-2'>
					{Object.entries(MainPages).map(([page, { url, width }]) => (
						<div
							className='md:flex md:items-center hover:bg-[#1b5280] md:relative'
							onMouseEnter={() => toggleDropDown(page)}
							onMouseLeave={() => setOpenDropDown(null)}
							key={page}
						>
							<a
								href={url}
								className='md:px-3 md:py-2 md:border-r-1 border-[#1f537e] font-bold text-white text-xs uppercase focus:border-t-3 focus:border-t-amber-500 focus:bg-[#1b5280] cursor-pointer md:flex md:items-center md:h-full'
							>
								{page}
								<img src={arrow} alt='' className='md:w-2.5 md:h-2.5 md:ml-1 md:mb-0.5' />
							</a>

							{openDropDown === page && (
								<div
									className='md:absolute md:top-[50px] md:left-0 bg-[#1b5280] z-10 md:py-[5px]'
									style={{ minWidth: `${width}px` }}
								>
									<div className='md:px-[10px]'>
										<div className='md:p-[10px] md:flex md:flex-col'>
											{page === 'Университет' ? (
												<div className='md:flex md:flex-row md:space-x-4'>
													{Object.entries(
														ExtraPages[page] as {
															[key: string]: Array<{
																label: string
																url: string
																isDisabled?: boolean
															}>
														}
													).map(([column, blocks]) => (
														<div
															key={column}
															className='md:flex md:flex-col md:max-w-[250px] md:min-w-[230px]'
														>
															{blocks[0].isDisabled ? (
																<span className='uppercase text-[#A7C3D8] text-xs md:border-b-[#2a6392] md:border-b md:pb-[8px] font-bold'>
																	{column}
																</span>
															) : (
																<a
																	href={blocks[0].url}
																	className='uppercase text-[#A7C3D8] text-xs md:border-b-[#2a6392] md:border-b md:pb-[8px] font-bold hover:text-[#d9e3ea]'
																>
																	{column}
																</a>
															)}
															<div className='md:my-[10px] md:flex md:flex-col md:max-w-[250px]'>
																{blocks.map(block =>
																	block.isDisabled ? (
																		<span
																			key={block.label}
																			className='md:py-[10px] md:leading-4.5 text-[#A7C3D8] text-xs md:border-b-[#2a6392] md:border-b last:border-0'
																		>
																			{block.label}
																		</span>
																	) : (
																		<a
																			key={block.label}
																			href={block.url}
																			className='md:py-[10px] md:leading-4.5 text-[#A7C3D8] text-xs md:border-b-[#2a6392] md:border-b last:border-0 hover:text-[#e7edf2]'
																		>
																			{block.label}
																		</a>
																	)
																)}
															</div>
														</div>
													))}
												</div>
											) : (
												(
													ExtraPages[page] as Array<{
														label: string
														url: string
														isDisabled?: boolean
													}>
												).map(block =>
													block.isDisabled ? (
														<span
															key={block.label}
															className='md:py-[10px] md:leading-4.5 text-[#A7C3D8] text-xs md:border-b-[#2a6392] md:border-b last:border-0'
														>
															{block.label}
														</span>
													) : (
														<a
															key={block.label}
															href={block.url}
															className='md:py-[10px] md:leading-4.5 text-[#A7C3D8] text-xs md:border-b-[#2a6392] md:border-b last:border-0 hover:text-[#e7edf2]'
														>
															{block.label}
														</a>
													)
												)
											)}
										</div>
									</div>
								</div>
							)}
						</div>
					))}
				</div>
			</div>
		</nav>
	)
}

export default NavBar

import React, { useEffect, useRef, useState } from 'react'
import { MdOutlineHome } from "react-icons/md";
import { GoChevronDown } from "react-icons/go";
import { GoArrowUpRight } from "react-icons/go";
import { Link } from 'react-router-dom';
import { IoMdShare } from "react-icons/io";
import Modal from './NotesComponents/Modal';
import { FaTasks } from "react-icons/fa";
import { IoIosPeople } from "react-icons/io";
import { useTheme } from '../Context/Theme';
import { CgDarkMode } from "react-icons/cg";

const BottomNav = (props) => {
	const [isNotesHover, setIsNotesHover] = useState(false)
	const [isTasksHover, setIsTasksHover] = useState(false)
	const [isFeaturesHover, setIsFeaturesHover] = useState(false)
	const [isHomeHover, setIsHomeHover] = useState(false)
	const [isShareModalOpen, setIsShareModalOpen] = useState(false)
	const { toggleTheme } = useTheme()
 
	const closeModal = () => {
		setIsShareModalOpen(false)
	}

	if (props.notepage && isShareModalOpen) {
		return <Modal handleclose={closeModal} collaborators={true} />
	}

	if (props.notepage) {
		const [activeModal, setActiveModal] = useState(null);
		const closeModal = () => setActiveModal(null);
		return (
			<>
				{activeModal === "share" && (
					<Modal handleclose={closeModal} share={true} />
				)}
				{activeModal === "participants" && (
					<Modal handleclose={closeModal} collaborators={true} />
				)}
				{activeModal === "taskEmbed" && (
					<Modal handleclose={closeModal} taskEmbed={true} />
				)}

				<div
					className={`fixed z-[999] rotate-90 -left-[60px] top-1/2 -translate-y-1/2 bg-red-400 rounded-3xl text-white overflow-hidden transition-all duration-500 ease-in-out`}>
					<div className="grid grid-cols-5 w-full h-9">

						<Link
							to={'/'}
							className="cursor-pointer flex items-center justify-center h-full w-10 overflow-hidden col-start-1 rounded-full bg-red-600"
							title='Home'
						>
							<MdOutlineHome className="w-7 h-7 cursor-pointer transition-all duration-200 rotate-270" />
						</Link>

						<div
							className="flex justify-center items-center col-start-2 h-full w-10 hover:bg-red-500 rounded-4xl transition-colors duration-200 cursor-pointer text-md shadow-2xl"
							title={`Theme`}
							onClick={() => toggleTheme()}
						>
							<CgDarkMode className='rotate-270 w-6 h-6' />
						</div>

						{/* Share icon */}
						<div
							className="flex justify-center items-center col-start-3 h-full w-10 hover:bg-red-500 rounded-4xl transition-colors duration-200 cursor-pointer text-md shadow-2xl"
							title='Share'
							onClick={() => setActiveModal(activeModal === "share" ? null : "share")}
						>
							<IoMdShare className='rotate-270 w-6 h-6' />
						</div>

						{/* Participants icon */}
						<div
							className="flex justify-center items-center col-start-4 h-full w-10 hover:bg-red-500 rounded-4xl transition-colors duration-200 cursor-pointer text-md shadow-2xl"
							title='Collaborators'
							onClick={() => setActiveModal(activeModal === "participants" ? null : "participants")}
						>
							<IoIosPeople className="rotate-270 w-6 h-6" />
						</div>

						<div
							className="flex justify-center items-center col-start-5 h-full w-10 hover:bg-red-500 rounded-4xl transition-colors duration-200 cursor-pointer text-md shadow-2xl"
							title={`Tasks`}
							onClick={() => setActiveModal(activeModal === "taskEmbed" ? null : "taskEmbed")}
						>
							<FaTasks className="rotate-270 w-4 h-4" />
						</div>

					</div>
				</div>
			</>
		);
	}

	return (
		<div className='z-[999]'>
			<div className="BOTTOM_MINI_NAVBAR z-[999] grid grid-cols-3 h-auto">
				<div className="flex col-start-2 justify-center">
					<div
						className={`fixed w-[386.812px] bg-[#AA1A06] text-[14px] font-[500] rounded-3xl text-white bottom-8 overflow-hidden transition-all duration-500 ease-in-out ${isNotesHover ? 'h-36' : 'h-12'}`}
						onMouseEnter={() => setIsNotesHover(true)}
						onMouseLeave={() => setIsNotesHover(false)}
					>

						<div
							className={`absolute top-0 left-0 w-full transition-opacity duration-300 ease-in-out ${isNotesHover ? 'opacity-100' : 'opacity-0 pointer-events-none'
								}`}
							onMouseEnter={() => setIsNotesHover(true)}
						>
							<div className="flex flex-col pt-6 pb-4 px-4"
							>
								<div
									className="cursor-pointer hover:translate-x-2 transition-all duration-300 text-white/65 hover:text-white"
								>
									<Link to={'/create-note'}>Create a Note</Link>
								</div>
								<div
									className="cursor-pointer hover:translate-x-2 transition-all duration-300 text-white/65 hover:text-white"
								>
									<Link to={'/notes'}>My Notes</Link>
								</div>

							</div>
						</div>

						<div className="absolute bottom-1 left-0 grid grid-cols-14 w-full h-max items-center z-50">
							<Link className="flex items-center justify-center h-10 w-full overflow-hidden col-span-2 rounded-full bg-[#9B1A08]"
								to={'/'}
							>
								<MdOutlineHome className="h-8 w-8 p-1 cursor-pointer transition-all duration-200" />
							</Link>

							<div
								className={`flex justify-center items-center col-span-4 h-10 w-full hover:bg-[#9B1A08] rounded-4xl transition-colors duration-200 cursor-pointer text-md shadow-2xl`}
								onMouseEnter={() => setIsNotesHover(true)}
							>
								Notes
								<GoChevronDown
									className={`${isNotesHover ? 'rotate-180' : ''} transition-transform duration-300 w-4 h-4`}
								/>
							</div>

							<Link to={'/tasks'}
								className={`flex justify-center items-center col-span-4 h-10 w-full hover:bg-[#9B1A08] rounded-4xl transition-colors duration-200 cursor-pointer text-md shadow-2xl`}
								onMouseEnter={() => {
									setIsTasksHover(true)
									setIsNotesHover(false)
								}}
								onMouseLeave={() => setIsTasksHover(false)}

							>
								Tasks
								<GoArrowUpRight className={`transition-transform duration-300 w-4 h-4 ${isTasksHover ? 'translate-x-0.5 -translate-y-0.5' : ''}`} />
							</Link>

							<div
								className={`flex justify-center items-center col-span-4 h-10 w-full hover:bg-[#9B1A08] rounded-4xl transition-colors duration-200 cursor-pointer text-md shadow-2xl`}
								onMouseEnter={() => {
									setIsFeaturesHover(true)
									setIsNotesHover(false)
								}}
								onMouseLeave={() => setIsFeaturesHover(false)}
							>
								Features
								<GoArrowUpRight className={`transition-transform duration-300 w-4 h-4 ${isFeaturesHover ? 'translate-x-0.5 -translate-y-0.5' : ''}`} />
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

export default BottomNav
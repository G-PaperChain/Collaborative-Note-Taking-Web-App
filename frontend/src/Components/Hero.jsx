import React, { useEffect, useRef, useState } from 'react'
import bgvid from '/background.mp4'
import Navbar from './Navbar'
import { useTheme } from '../Context/Theme'
import { MdOutlineHome } from "react-icons/md";
import { GoChevronDown } from "react-icons/go";
import { GoArrowUpRight } from "react-icons/go";
import { FaNoteSticky } from "react-icons/fa6";
import { GrNotes } from "react-icons/gr";
import { Link } from 'react-router-dom';
import { motion } from "motion/react"
import { TiPin } from "react-icons/ti";
import purpleDev from '/purple.png'
import { IoGitNetwork } from 'react-icons/io5';
import SecondPage from './SecondPage'
import BottomNav from './BottomNav'


const MyNotesPage = () => {
    const { isDark, toggleTheme } = useTheme()
    const [isNotesHover, setIsNotesHover] = useState(false)
    const [isTemplatesHover, setIsTemplatesHover] = useState(false)
    const [isRoomsHover, setIsRoomsHover] = useState(false)
    const [onTextHover, setOnTextHover] = useState(false)
    const bgVideoRef = useRef(null)
    const notesVideoRef = useRef(null)

    useEffect(() => {
        const tryPlay = async (videoEl) => {
            if (!videoEl) return
            try {
                const playPromise = videoEl.play()
                if (playPromise !== undefined) {
                    await playPromise
                    console.debug('video playback started')
                }
            } catch (err) {
                console.warn('video play() failed:', err)
            }
        }

        tryPlay(bgVideoRef.current)
        tryPlay(notesVideoRef.current)
    }, [])

    return (
        <main>
            <section>
                <div className={`relative min-h-screen w-full overflow-hidden ${isDark ? "dark" : "light"} grid grid-cols-1 grid-rows-2`}>

                    {/* <video
                        ref={bgVideoRef}
                        src={bgvid}
                        autoPlay
                        loop
                        muted
                        playsInline
                        preload="auto"
                        onCanPlay={() => console.debug('background video can play')}
                        onLoadedData={() => console.debug('background video loaded data')}
                        className={`absolute inset-0 w-full h-full object-cover ${isDark ? "opacity-25 invert" : "opacity-75"} transition-all duration-500 ease-linear`}
                    ></video> */}

                    <div className="relative z-20">
                        <Navbar />
                    </div>

                    <div className=" text-white z-10 relative grid grid-cols-3">
                        <div className='headline flex flex-col justify- ml-12 col-span-2 leading-29'>
                            <div className='text-[110px] font-[700] tracking-tighter '>One Place</div>
                            <div className='text-[110px] font-[700] tracking-tighter '>For shared ideas</div>
                        </div>
                    </div>

                    <BottomNav />
                    

                    {/* <div className="BOTTOM_MINI_NAVBAR z-10 grid grid-cols-3 h-auto">
                        <div className="flex col-start-2 justify-center">
                            <div
                                className={`fixed w-[386.812px] bg-red-600 text-[15px] font-[500] rounded-3xl text-white bottom-8 overflow-hidden transition-all duration-500 ease-in-out
        ${isNotesHover || isRoomsHover ? 'h-36' : 'h-10'}`}
                                onMouseLeave={() => {
                                    setIsNotesHover(false)
                                    setIsRoomsHover(false)
                                }}
                            >

                                <div
                                    className={`absolute top-0 left-0 w-full transition-opacity duration-300 ease-in-out ${isNotesHover ? 'opacity-100' : 'opacity-0 pointer-events-none'
                                        }`}
                                    onMouseEnter={() => setIsNotesHover(true)}
                                >
                                    <div className="flex flex-col pt-6 pb-4 px-4">
                                        <div
                                            className="cursor-pointer hover:translate-x-2 transition-all duration-300 text-white/65 hover:text-white">
                                            <Link  to={'/create-note'}>Create a Note</Link>
                                        </div>
                                        <div
                                            className="cursor-pointer hover:translate-x-2 transition-all duration-300 text-white/65 hover:text-white">
                                            <Link>My Notes</Link>
                                        </div>

                                    </div>
                                </div>

                                <div
                                    className={`absolute top-0 left-0 w-full transition-opacity duration-300 ease-in-out ${isRoomsHover ? 'opacity-100' : 'opacity-0 pointer-events-none'
                                        }`}
                                    onMouseEnter={() => setIsRoomsHover(true)}
                                >
                                    <div className="flex flex-col pt-6 pb-4 px-4">
                                        <div className="cursor-pointer hover:translate-x-2 transition-all duration-300">Create a Room</div>
                                        <div className="cursor-pointer hover:translate-x-2 transition-all duration-300">My Rooms</div>
                                    </div>
                                </div>

                                <div className="absolute bottom-0 left-0 grid grid-cols-14 w-full h-max items-center z-50">
                                    <div className="flex items-center justify-center h-10 w-full overflow-hidden col-span-2 rounded-full bg-red-700">
                                        <MdOutlineHome className="h-8 w-8 p-1 cursor-pointer transition-all duration-200" />
                                    </div>

                                    <div
                                        className={`flex justify-center items-center col-span-4 h-10 w-full hover:bg-red-500 rounded-4xl transition-colors duration-200 cursor-pointer text-md shadow-2xl`}
                                        onMouseEnter={() => {
                                            setIsNotesHover(true)
                                            setIsRoomsHover(false)
                                        }}
                                    >
                                        Notes
                                        <GoChevronDown
                                            className={`${isNotesHover ? 'rotate-180' : ''} transition-transform duration-300 w-4 h-4`}
                                        />
                                    </div>

                                    <div
                                        className={`flex justify-center items-center col-span-4 h-10 w-full hover:bg-red-500 rounded-4xl transition-colors duration-200 cursor-pointer text-md shadow-2xl`}
                                    >
                                        Templates
                                        <GoArrowUpRight className="transition-transform duration-300 w-4 h-4" />
                                    </div>

                                    <div
                                        className={`flex justify-center items-center col-span-4 h-10 w-full hover:bg-red-500 rounded-4xl transition-colors duration-200 cursor-pointer text-md shadow-2xl`}
                                        onMouseEnter={() => {
                                            setIsRoomsHover(true)
                                            setIsNotesHover(false)
                                        }}
                                    >
                                        Rooms
                                        <GoChevronDown
                                            className={`${isRoomsHover ? 'rotate-180' : ''} transition-transform duration-300 w-4 h-4`}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div> */}
                </div>
            </section>

            <section>
                <SecondPage />
            </section>


            <script src="https://cdn.tailwindcss.com"></script>
        </main>
    )
}

export default MyNotesPage
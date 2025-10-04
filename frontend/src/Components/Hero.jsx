import React, { useEffect } from 'react'
import bgvid from '/background.mp4'
import Navbar from './Navbar'
import { useTheme } from '../Context/Theme'
import { useUser } from '../Context/User'
import { MdOutlineHome } from "react-icons/md";
import { useSearchParams } from 'react-router-dom';

const Hero = () => {
    const { isDark, toggleTheme } = useTheme()
    const { user, loading, checkAuth } = useUser()
    const [searchParams] = useSearchParams();

    useEffect(() => {
        // Check if redirected from OAuth
        if (searchParams.get('login') === 'success') {
            checkAuth();
        }
    }, [searchParams]);

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center text-white">
            Loading...
        </div>
    }

    return (
        <div className={`relative min-h-screen w-full overflow-hidden ${isDark ? "dark" : "light"} grid grid-cols-1 grid-rows-2`}>

            <video
                src={bgvid}
                autoPlay
                loop
                muted
                className={`absolute inset-0 w-full h-full object-cover ${isDark ? "opacity-25 invert" : "opacity-75"} transition-all duration-500 ease-linear`}
            ></video>

            <div className="relative z-10">
                <Navbar />
            </div>

            <div className=" text-white z-10 relative grid grid-cols-2">
                <div className='headline flex flex-col justify-center ml-12'>
                    <div className='text-8xl font-[600] tracking-tighter'>One Place</div>
                    <div className='text-8xl font-[600] tracking-tighter'>For Shared ideas</div>
                    
                    {user && (
                        <div className='mt-8 text-2xl'>
                            Welcome back, {user.name}! 👋
                        </div>
                    )}
                </div>
            </div>

            <div className='z-10 grid grid-cols-3 pb-5'>
                <div className="flex col-start-2 justify-center">

                    <div className={`${isDark ? "bg-blue-600/55 text-white" : "bg-red-500/75 text-white"} w-90 h-10 text-[15px] font-[500] rounded-4xl z-10 items-center transition-colors duration-600 ease-linear grid grid-cols-14 gap-1`}>
                        <div className='flex justify-center h-full w-full overflow-hidden col-span-2 rounded-full'>
                            <MdOutlineHome className={`${isDark ? "bg-blue-600/50" : "bg-red-600/50"} w-full h-full p-1 ${isDark ? "hover:bg-blue-600" : "hover:bg-red-600"} cursor-pointer transition-all duration-200`} />
                        </div>
                        <div className={`flex justify-center items-center col-span-4 h-full w-full ${isDark ? "hover:bg-blue-600/50" : "hover:bg-red-600/50"} rounded-4xl transition-colors duration-200 cursor-pointer`}>
                            Notes
                        </div>
                        <div className={`flex justify-center items-center col-span-4 h-full w-full ${isDark ? "hover:bg-blue-600/50" : "hover:bg-red-600/50"} rounded-4xl transition-colors duration-200 cursor-pointer`}>
                            lorem123
                        </div>
                        <div className={`flex justify-center items-center col-span-4 h-full w-full ${isDark ? "hover:bg-blue-600/50" : "hover:bg-red-600/50"} rounded-4xl transition-colors duration-200 cursor-pointer`}>
                            Notes
                        </div>
                    </div>

                </div>
            </div>

            <script src="https://cdn.tailwindcss.com"></script>
        </div>
    )
}

export default Hero
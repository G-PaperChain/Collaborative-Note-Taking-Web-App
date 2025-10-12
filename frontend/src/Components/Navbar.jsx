import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTheme } from '../Context/Theme'
import Button from './Button.jsx'
import { useApi } from '../Context/Api.jsx'
import { useAuth } from '../Context/AuthContext.jsx'
import { GoChevronDown, GoDeviceMobile } from "react-icons/go";
import { GoChevronUp } from "react-icons/go";
import Toast from '../uiComponents/toast.jsx'

const Navbar = () => {
    const { user, isLoggedin, loading, logout, isInitialized } = useAuth();
    const { isDark, toggleTheme } = useTheme();
    const { api } = useApi();
    const [selected, setSelected] = useState();
    const [isAuthSettingsOpen, setisAuthSettingsOpen] = useState(false);
    const [flipChevron, setFlipChevron] = useState(false)

    useEffect(() => {
        setisAuthSettingsOpen(flipChevron);
    }, [flipChevron]);

    const renderAuthSection = () => {

        if (loading || !isInitialized) {
            return (
                <div className="flex items-center justify-center w-full">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                    <span className="ml-2 text-white text-2xl">Loading...</span>
                </div>
            );
        }

        

        if (user) {
            return (
                <div className="flex items-center space-x-4 col-start-3 w-full justify-center">

                    <div className={`select absolute top-9 right-25 bg-white shadow-2xl py-2.5 px-2 rounded-2xl ${isAuthSettingsOpen ? 'h-38' : 'h-max'}`}>
                        <div className="w-50 selected-option grid grid-cols-13 justify-center items-center">

                            <div className="image col-span-2 justify-center items-center">
                                <img src={user?.picture} className={`w-full h-full rounded-full select-none`} />
                            </div>

                            <div className="text-black/55 col-span-8 col-start-4 justify-center items-center">
                                {user?.name || "User"}
                            </div>

                            <div className='flex justify-center items-center col-span-2'>
                                {
                                    flipChevron ?
                                        <GoChevronDown className='text-xl cursor-pointer select-none' onClick={() => setFlipChevron(!flipChevron)} />
                                        : <GoChevronUp className='text-xl cursor-pointer select-none' onClick={() => setFlipChevron(!flipChevron)} />
                                }
                            </div>

                            <div className={`options flex flex-col h-max gap-0.5 ${isAuthSettingsOpen ? 'py-2' : ''}`}>
                                {
                                    flipChevron ?
                                        <div className='min-w-50'>
                                            <Button manage={true} text='Manage Account'></Button>
                                            <Button logout={true} text='Log out'></Button>
                                        </div>
                                        : ''
                                }
                            </div>
                        </div>
                    </div>

                </div>
            );
        }

        return (
            <div className="navbar-right flex gap-4 justify-center col-start-3 max-sm:col-start-2 w-full h-full items-center max-[770px]:col-start-2 ">
                <Button login={true} text="Log in" />
                <Button signup={true} text="Sign up" />
            </div>
        );
    }

    return (
        <div className="font-semibold flex justify-between items-center transition-all duration-300 ease-linear mx-16 my-8">
            <Link to={'/'} className="text-5xl text-white transition-colors duration-300 font-[600] font-mono tracking-tighter">
                Jotes
            </Link>

            <div className='flex items-center justify-center gap-2.5'>

                {renderAuthSection()}

            </div>
        </div>
    )
}

export default Navbar
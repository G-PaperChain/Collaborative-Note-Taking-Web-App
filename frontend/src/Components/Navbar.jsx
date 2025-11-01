import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTheme } from '../Context/Theme'
import Button from './Button.jsx'
import { useApi } from '../Context/Api.jsx'
import { useAuth } from '../Context/AuthContext.jsx'
import { GoChevronDown } from "react-icons/go";
import { GoChevronUp } from "react-icons/go";

const Navbar = () => {
    const { user, isLoggedin, loading, logout, isInitialized } = useAuth();
    const { isDark, toggleTheme } = useTheme();
    const { api } = useApi();
    const [isAuthSettingsOpen, setisAuthSettingsOpen] = useState(false);

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
                <div className="relatieve absolute top-6 right-25">
                    <div 
                        className={`bg-white shadow-2xl py-2.5 px-2 rounded-2xl transition-all duration-300 ${
                            isAuthSettingsOpen ? 'h-auto' : 'h-auto'
                        }`}
                    >
                        {/* User info header */}
                        <div 
                            className="flex items-center gap-3 cursor-pointer"
                            onClick={() => setisAuthSettingsOpen(!isAuthSettingsOpen)}
                        >
                            <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                                <img 
                                    src={user?.picture} 
                                    alt={user?.name}
                                    className="w-full h-full object-cover select-none" 
                                />
                            </div>

                            <div className="text-black/55 font-medium min-w-[120px] select-none">
                                {user?.name || "User"}
                            </div>

                            <div className="flex items-center justify-center">
                                {isAuthSettingsOpen ? (
                                    <GoChevronUp className="text-xl text-black/55" />
                                ) : (
                                    <GoChevronDown className="text-xl text-black/55" />
                                )}
                            </div>
                        </div>

                        {/* Dropdown options */}
                        {isAuthSettingsOpen && (
                            <div className="mt-2 pt-2 border-t border-gray-200 select-none">
                                <Button manage={true} text='Manage Account' />
                                <Button logout={true} text='Log out' />
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        return (
            <div className="flex gap-4 items-center">
                <Button login={true} text="Log in" />
                <Button signup={true} text="Sign up" />
            </div>
        );
    }

    return (
        <div className="font-semibold flex justify-between items-center transition-all duration-300 ease-linear mx-16 my-6 h-12">
            <Link 
                to="/"
                className="text-5xl text-white transition-colors duration-300 font-[600] font-mono tracking-tighter"
            >
                Jotes
            </Link>

            {renderAuthSection()}
        </div>
    )
}

export default Navbar
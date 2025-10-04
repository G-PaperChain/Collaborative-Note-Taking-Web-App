import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTheme } from '../Context/Theme'
import { DayAndNightToggle } from 'react-day-and-night-toggle'
import Button from './Button.jsx'
import { useUser } from '../Context/User'

const Navbar = () => {
    const { isDark, toggleTheme } = useTheme()
    const { user, logout } = useUser()

    const handleLogout = async () => {
        await logout()
        window.location.href = '/'
    }

    return (
        <div className="font-semibold flex justify-between items-center transition-all duration-300 ease-linear mx-16 my-8">
            <Link to={'/'} className="text-5xl text-white transition-colors duration-300 font-[600] font-mono tracking-tighter">
                Jotes
            </Link>

            <div className='flex items-center justify-center gap-2.5'>
                <DayAndNightToggle
                    onChange={toggleTheme}
                    checked={isDark}
                    className='shadow-2xl mr-2 hover:opacity-80 transition-opacity duration-400'
                    size={25}
                />
                
                {user ? (
                    <div className='flex items-center gap-3'>
                        <img 
                            src={user.picture} 
                            alt={user.name}
                            className='w-10 h-10 rounded-full border-2 border-white'
                        />
                        <span className='text-white text-sm'>{user.name}</span>
                        <button
                            onClick={handleLogout}
                            className='px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors'
                        >
                            Logout
                        </button>
                    </div>
                ) : (
                    <>
                        <Button login={true} text="Log in" />
                        <Button signup={true} text="Sign up" />
                    </>
                )}
            </div>
        </div>
    )
}

export default Navbar
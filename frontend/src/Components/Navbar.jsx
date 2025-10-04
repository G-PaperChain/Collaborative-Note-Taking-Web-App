import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTheme } from '../Context/Theme'
import { DayAndNightToggle } from 'react-day-and-night-toggle'
import Button from './Button.jsx'

const Navbar = () => {

    const { isDark, toggleTheme } = useTheme()

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
                <Button login={true} text="Log in" />
                <Button signup={true} text="Sign up" />
            </div>
        </div>
    )
}

export default Navbar
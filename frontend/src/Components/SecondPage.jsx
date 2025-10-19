import React, { useState, useEffect, useRef } from 'react'


const SecondPage = () => {


    return (
        <div className='overflow-hidden'>
            <div className="second relative bg-orange-100 min-h-screen flex justify-center items-center overflow-hidden">

                <div className="dark-box bg-orange-500 w-60 h-60 absolute top-20 left-6 rounded-3xl opacity-[0.4]"></div>
                <div className="dark-box bg-pink-500 w-60 h-60 absolute -top-40 left-[50%] rounded-3xl opacity-[0.2] "></div>
                <div className="dark-box bg-orange-500 w-72 h-72 absolute right-6 top-12 rounded-3xl opacity-[0.4]"></div>
                <div className="dark-box bg-red-500 w-80 h-80 absolute top-44 left-36 rounded-3xl opacity-[0.2]"></div>
                <div className="dark-box bg-green-500 w-60 h-60 absolute left-22 top-100 rounded-3xl opacity-[0.1]"></div>
                <div className="dark-box bg-yellow-500 w-96 h-96 absolute left-220 -bottom-16 rounded-3xl opacity-[0.2]"></div>
                <div className="dark-box bg-orange-500 w-60 h-60 absolute right-10 bottom-20 rounded-3xl opacity-[0.025]"></div>
                <div className="dark-box bg-blue-500 w-72 h-72 absolute -right-12 top-72 rounded-3xl opacity-[0.09]"></div>
                <div className="dark-box bg-yellow-400 w-64 h-64 absolute left-1/2 top-6 -translate-x-1/2 rounded-2xl opacity-[0.035]"></div>
                <div className="dark-box bg-red-400 w-60 h-60 absolute right-14 top-28 rounded-2xl opacity-[0.05]"></div>
                <div className="dark-box bg-pink-400 w-68 h-68 absolute left-56 top-40 rounded-full opacity-[0.045]"></div>
                <div className="dark-box bg-amber-400 w-70 h-70 absolute right-4 top-64 rounded-3xl opacity-[0.02]"></div>
                <div className="dark-box bg-lime-400 w-60 h-60 absolute left-20 bottom-28 rounded-3xl opacity-[0.06]"></div>
                <div className="dark-box bg-sky-400 w-100 h-100 absolute left-1/2 bottom-8 -translate-x-1/2 rounded-3xl opacity-[0.03]"></div>

                <div className='flex flex-col gap-5'>
                    <div className='flex items-center text-6xl gap-2.5 z-[0] select-none animate-pulse'>
                        <div className='bg-black text-white px-10 py-2 rounded-full flex items-center'>Create</div>
                        <div>Notes</div>
                    </div>
                    <div className='flex items-center text-6xl gap-2.5 z-[0] select-none'>
                        <div className='bg-black text-white px-10 py-2 rounded-full flex items-center'>Create</div>
                        <div>Notes</div>
                    </div>
                </div>


            </div>
        </div >
    )
}

export default SecondPage
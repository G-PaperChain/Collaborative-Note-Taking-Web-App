import React, { useEffect, useRef, useState } from 'react'
import Navbar from '../Navbar'
import Button from '../Button';
import BottomNav from '../BottomNav';
import { useNavigate } from "react-router-dom";
import { useApi } from '../../Context/Api';


const CreateNotesPage = () => {

    return (
        <div className={`relative min-h-screen w-full overflow-hidden flex flex-col bg-[#F73B20]`}>

            <div className="z-10">
                <Navbar />
            </div>

            <div className="grid grid-cols-5">
                <div className=' font-[600] text-9xl text-white leading-27 px-12 py-12 col-span-2'>
                    <div>Create</div>
                    <div>a Note</div>
                </div>
                <div className='flex justify-center px-12 flex-col items-start gap-6 col-start-4'>
                    <p className='w-80 font-[600] text-[24px] text-white leading-7'>
                        Create your mindmaps and notes and even collabortate with friend along the way.
                    </p>
                    <Button create={true} text='Create a Note'></Button>
                </div>
            </div>

            <BottomNav />

            <script src="https://cdn.tailwindcss.com"></script>
        </div>
    )
}

export default CreateNotesPage
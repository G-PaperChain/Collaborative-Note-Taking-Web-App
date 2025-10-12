import React from 'react'
import { GoCheck } from "react-icons/go";
import { IoIosCloseCircleOutline } from "react-icons/io";
import { IoIosClose } from "react-icons/io";

const Toast = (props) => {
  return (
    <div className={`z-[999] h-16 w-96 fixed top-15 right-15 border-l-6 border-green-600 overflow-hidden rounded-md`}>
        <div className='bg-green-600/30 w-full h-full backdrop-blur-lg'>
            {props.image}
            {props.type}
            {props.text}
        </div>
    </div>
  )
}

export default Toast
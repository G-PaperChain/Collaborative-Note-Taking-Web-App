import { Link } from "react-router-dom"
import { useAuth } from "../Context/AuthContext";
import { IoSettingsOutline } from "react-icons/io5";
import { MdLogout } from "react-icons/md";
import { useState, useRef } from "react";
import { Toast } from 'primereact/toast';

export default function Button(props) {
  const { logout } = useAuth()
  const [buttonHover, setButtonHover] = useState(false)

  if (props.logout) {
    return (
      <button
        onClick={logout}
        onMouseEnter={() => setButtonHover(true)}
        onMouseLeave={() => setButtonHover(false)}
        className={
          `relative px-1 py-3 min-w-full text-black hover:bg-orange-100 transition-colors duration-300 font-semibold overflow-hidden group hover:cursor-pointer rounded-lg grid grid-cols-7 items-center`
        }
      >
        <div className="col-span-1 flex justify-center">
          <MdLogout className={`text-2xl ${buttonHover ? 'text-orange-400 transition-colors duration-300' : ''} `} />
        </div>
        <div className="col-span-6 flex ml-3">
          <span className="block h-[1.4em] overflow-hidden text-black/75">
            <span className="block transform transition-transform duration-300 group-hover:-translate-y-full">{props.text}</span>
            <span className="block transform transition-transform duration-300 group-hover:-translate-y-full">{props.text}</span>
          </span>
        </div>
      </button>
    )
  }

  if (props.manage) {
    return (
      <button
        // onClick={}
        onMouseEnter={() => setButtonHover(true)}
        onMouseLeave={() => setButtonHover(false)}
        className={
          `relative px-1 py-3 min-w-full text-black hover:bg-orange-100 transition-colors duration-300 font-semibold overflow-hidden group hover:cursor-pointer rounded-lg grid grid-cols-7 items-center`
        }
      >
        <div className="col-span-1 flex justify-center">
          <IoSettingsOutline className={`text-2xl ${buttonHover ? 'text-orange-400 transition-colors duration-300' : ''} `} />
        </div>
        <div className="col-span-6 flex ml-2">
          <span className="block h-[1.4em] overflow-hidden text-black/75">
            <span className="block transform transition-transform duration-300 group-hover:-translate-y-full">{props.text}</span>
            <span className="block transform transition-transform duration-300 group-hover:-translate-y-full">{props.text}</span>
          </span>
        </div>
      </button>
    )
  }

  // Default: Link for login/signup
  return (
    <Link to={`${props.login ? "/login" : ""}${props.signup ? "/signup" : ''}`}>
      <button
        className={`relative px-6 py-3 ${props.signup ? "bg-white hover:opacity-75 transition-opacity duration-500 " : ""} text-black font-semibold overflow-hidden group hover:cursor-pointer rounded-lg ${props.login ? "backdrop-blur-md bg-white/30 dark:bg-black/30 border border-white/20 dark:border-gray-700/50 text-white dark:text-white transition-all duration-700 ease-linear" : ""}`}
      >
        <span className="block h-[1.4em] overflow-hidden">
          <span className="block transform transition-transform duration-300 group-hover:-translate-y-full">{props.text}</span>
          <span className="block transform transition-transform duration-300 group-hover:-translate-y-full">{props.text}</span>
        </span>
      </button>
    </Link>
  )
}
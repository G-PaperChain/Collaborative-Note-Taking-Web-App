import { Link } from 'react-router'

export default function Button(props) {

  const fetchGoogle = async () => {
    fetch("http://localhost:5000/login/google", {
      credentials: "include"
    })
  }

  return (
    <Link
      className={
        `relative px-6 py-3 
        ${props.signup ? "bg-white hover:opacity-75 transition-opacity duration-500 " : ""} text-black font-semibold  
        overflow-hiddsen 
        group
        hover:cursor-pointer
        rounded-lg
        ${props.login ? "backdrop-blur-md bg-white/30 dark:bg-black/30 border border-white/20 dark:border-gray-700/50 text-white dark:text-white transition-all duration-700 ease-linear" : ""}
        `
      }
      to={props.signup ? "/signup" : "/login"}
    >
      {/* Text wrapper */}
      <span
        className="
          block h-[1.4em] overflow-hidden
        "
      >
        {/* Default text */}
        <span
          className="
            block transform transition-transform duration-300 
            group-hover:-translate-y-full
          "
        >
          {props.text}
        </span>

        {/* Hover text (slides in) */}
        <span
          className="
            block transform transition-transform duration-300 
            group-hover:-translate-y-full
          "
        >
          {props.text}
        </span>
      </span>
    </Link>
  );
}

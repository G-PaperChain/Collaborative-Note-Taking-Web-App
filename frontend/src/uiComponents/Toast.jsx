import React from 'react';
import { IoIosClose } from "react-icons/io";

const Toast = ({ message, type = 'success', onClose }) => {
  const styles = {
    success: 'border-green-600 bg-green-600/50 text-black',
    error: 'border-red-600 bg-red-600/50 text-white',
    warning: 'border-yellow-600 bg-yellow-600/50 text-white'
  };

  // add animation to come and go of the toast

  return (
    <div className={`z-50 h-12 w-72 border-l-6 overflow-hidden rounded-md shadow-lg ${styles[type]} fixed bottom-15 right-15`}>
      <div className='w-full h-full backdrop-blur-lg flex items-center justify-between px-3'>
        <span className="text-lg shadow-2xl">{message}</span>
        <button onClick={onClose} className="text-white hover:text-gray-200">
          <IoIosClose size={20} />
        </button>
      </div>
    </div>
  );
};

export default Toast;
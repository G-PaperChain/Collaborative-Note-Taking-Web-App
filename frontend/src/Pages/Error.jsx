import React from 'react'
import { Navigate } from 'react-router'

const Error = (props) => {
    const navigate = Navigate()

    return (
        <div className="w-screen h-screen flex items-center justify-center bg-gray-900 text-white">
            <div className="flex flex-col items-center gap-4 max-w-md text-center">
                <div className="text-red-500 text-4xl">⚠️</div>
                <p className="text-lg">{props.error}</p>
                <button
                    onClick={() => navigate('/')}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                >
                    Go Home
                </button>
            </div>
        </div>
    )
}

export default Error
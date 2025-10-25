import React from 'react'

const Loading = () => {
    return (
        <div className="w-screen h-screen flex items-center justify-center bg-gray-900 text-white">
            <div className="flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dashed border-white"></div>
                <p>Loading note...</p>
            </div>
        </div>
    )
}

export default Loading
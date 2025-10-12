import React from 'react'
import { TldrawWrapper } from '../Context/TldrawWrapper'

const Draw = () => {
    const [ roomId ] = React.useState('test-room'); // Use a static or generated room ID

    return (
        <div>
            <h1>Collaborative Whiteboard</h1>
            <TldrawWrapper roomId={roomId} />
        </div>
    )
}

export default Draw
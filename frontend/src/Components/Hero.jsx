import { useEffect, useRef, useState } from 'react';
import bgvid from '/background.mp4';
import Navbar from './Navbar';
import { useTheme } from '../Context/Theme';
import BottomNav from './BottomNav';


const MyNotesPage = () => {
    const { isDark, toggleTheme } = useTheme()
    const [isNotesHover, setIsNotesHover] = useState(false)
    const [isTemplatesHover, setIsTemplatesHover] = useState(false)
    const [isRoomsHover, setIsRoomsHover] = useState(false)
    const [onTextHover, setOnTextHover] = useState(false)
    const bgVideoRef = useRef(null)
    const notesVideoRef = useRef(null)

    useEffect(() => {
        const tryPlay = async (videoEl) => {
            if (!videoEl) return
            try {
                const playPromise = videoEl.play()
                if (playPromise !== undefined) {
                    await playPromise
                    console.debug('video playback started')
                }
            } catch (err) {
                console.warn('video play() failed:', err)
            }
        }

        tryPlay(bgVideoRef.current)
        tryPlay(notesVideoRef.current)
    }, [])

    return (
        <main>
            <section>
                <div className={`relative min-h-screen w-full overflow-hidden ${isDark ? "dark" : "light"} grid grid-cols-1 grid-rows-2`}>

                    <video
                        ref={bgVideoRef}
                        src={bgvid}
                        autoPlay
                        loop
                        muted
                        playsInline
                        preload="auto"
                        onCanPlay={() => console.debug('background video can play')}
                        onLoadedData={() => console.debug('background video loaded data')}
                        className={`absolute inset-0 w-full h-full object-cover ${isDark ? "opacity-25 invert" : "opacity-75"} transition-all duration-500 ease-linear`}
                    ></video>

                    <div className="relative z-20">
                        <Navbar />
                    </div>

                    <div className=" text-white z-10 relative grid grid-cols-3">
                        <div className='headline flex flex-col justify- ml-12 col-span-2 leading-29'>
                            <div className='text-[110px] font-[700] tracking-tighter '>One Place</div>
                            <div className='text-[110px] font-[700] tracking-tighter '>For shared ideas</div>
                        </div>
                    </div>

                    <BottomNav />
                    
                </div>
            </section>

            {/* <section>
                <SecondPage />
            </section> */}


            <script src="https://cdn.tailwindcss.com"></script>
        </main>
    )
}

export default MyNotesPage
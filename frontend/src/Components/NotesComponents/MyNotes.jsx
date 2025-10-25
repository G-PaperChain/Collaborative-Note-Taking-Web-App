import React, { useEffect, useState, useRef } from 'react'
import { useApi } from '../../Context/Api'
import Navbar from '../Navbar'
import BottomNav from '../BottomNav'
import { Link } from 'react-router'

const MyNotes = () => {
    const { api } = useApi()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [notes, setNotes] = useState([])


    useEffect(() => {
        fetchNotes()
    }, [])

    const fetchNotes = async () => {
        try {
            setLoading(true)
            const res = await api.get("/notes")
            if (res.data.success) {
                res.data.notes.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
                setNotes(res.data.notes)
            } else {
                setError(res.data.error)
            }
        } catch (error) {
            console.error(error)
            setError(error.message)
        } finally {
            setLoading(false)
        }
    }

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const error404 = (error) => {
        if (error == 'Request failed with status code 404') {
            return <p className='text-2xl'>You have no Notes yet.....</p>
        } else {
            return <p className='text-2xl'>{error}</p>
        }
    }

    return (
        <div className={`relative min-h-screen w-full overflow-hidden flex flex-col bg-[#F73B20] opacity-75`}>

            <div className="z-10">
                <Navbar />
            </div>

            <div className="grid grid-cols-5">
                <div className='font-[700] text-8xl text-white leading-21 px-12 py-12 col-span-1'>
                    <div>My</div>
                    <div>Notes</div>
                </div>

                <div
                    className="flex justify-center items-center px-12 gap-2 col-span-4 bg-white mr-10 h-130 rounded-4xl ml-10 overflow-x-auto overflow-y-hidden whitespace-nowrap"
                >
                    <div className="flex gap-2">
                        {
                            loading ? 'Loading...' : ''
                        }
                        {
                            error ? error404(error) : ''
                        }
                        {notes.map((note) => (
                            note ? <Link
                                to={`/note/${note.write_token}/${note.id}`}
                                key={`${note.id}`}
                                className='bg-[#F73B20] px-12 py-16 w-max h-max text-white rounded-3xl select-none cursor-pointer shrink-0 snap-center hover:bg-[#F76B20] transition-all duration-300'
                            >
                                <h3 className="font-extrabold text-2xl">{note.title}</h3>
                                <p className='text-xs'>Created: {formatDate(note.created_at)}</p>
                                <p className='text-xs'>Created: {formatDate(note.updated_at)}</p>
                            </Link> : ''
                        ))
                        }
                    </div>
                </div>
            </div>

            <BottomNav />

            <script src="https://cdn.tailwindcss.com"></script>
            <style>{`
    .overflow-x-auto::-webkit-scrollbar {
        display: none;
    }
`}</style>
        </div>
    )
}

export default MyNotes

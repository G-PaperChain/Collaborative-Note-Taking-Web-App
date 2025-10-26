import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom';
import { IoIosClose } from "react-icons/io";
import { IoPersonAdd } from "react-icons/io5";
import { MdContentCopy } from "react-icons/md";
import { useApi } from '../../Context/Api'


const NotesShareModal = (props) => {
    const { api } = useApi()
    const { noteId } = useParams();
    const [shareUrl, setShareUrl] = useState('');
    const [loading, setLoading] = useState('');
    const [isChecked, setIsChecked] = useState(false);
    const [error, setError] = useState('');
    const [copiedToast, setCopiedToast] = useState(false)
    const [notesCollaborators, SetNotesCollaborators] = useState([])

    useEffect(() => {
        urlFetch()
        fetchNotesCollaborators(noteId)
    }, [isChecked]);

    const urlFetch = async () => {
        try {
            setLoading(true);
            const res = await api.post(`/note/${noteId}/create-url`, {
                isChecked: isChecked,
                data: isChecked ? 'Checked data' : 'Unchecked data'
            });
            if (res.data.success) {
                setShareUrl(res.data?.url)
            } else {
                setError(res.data?.error)
            }
        } catch (error) {
            setError(error)
        } finally {
            setLoading(false);
        }
    };

    const fetchNotesCollaborators = async (note_id) => {
        try {
            setLoading(true)
            const res = await api.get(`/${note_id}/collaborators`)
            if (res.data.success) {
                SetNotesCollaborators(res.data.notes)
            } else {
                setError(res.data.error)
            }
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const copiedToastShow = () => {
        setCopiedToast(true)
        setTimeout(() => {
            setCopiedToast(false)
        }, 1000);
    }

    if (props.collaborators) {
        return (
            <div className='fixed h-screen w-screen bg-black/10 z-[301]'>
                <div className='fixed top-3/11 left-3/8 h-75 w-100 bg-white rounded-2xl shadow-2xl p-6'>
                    <div className='grid grid-cols-8 h-max items-center'>
                        <h1 className='text-black select-none col-span-5 col-start-1 text-xl'>Collaborators</h1>
                        <IoIosClose
                            onClick={props.handleclose}
                            className='text-4xl hover:bg-black/5 rounded-full cursor-pointer mt-2.5 mr-2.5 col-start-8' />
                    </div>
                    <div className='flex flex-col gap-1'>
                        {
                            notesCollaborators.map((collab) =>
                                <div className='bg-[#F73B20] text-white px-2 py-3 rounded-lg select-none cursor-pointer hover:bg-[#F71B20]'>
                                    {collab.user_name}
                                </div>)
                        }
                    </div>
                </div>
            </div>
        )
    }

    if (props.share) {
        return (
            <div className='fixed h-screen w-screen bg-black/10 z-[301]'>
                <div className='fixed top-3/11 left-3/8 h-75 w-100 bg-white rounded-2xl shadow-2xl p-6'>
                    <div className='grid grid-cols-8 h-max items-center'>
                        <h1 className='text-black select-none col-span-5 col-start-1 text-xl'>Your Note's Ready</h1>
                        <IoIosClose
                            onClick={props.handleclose}
                            className='text-4xl hover:bg-black/5 rounded-full cursor-pointer mt-2.5 mr-2.5 col-start-8' />
                    </div>
                    <button
                        className='bg-[#0B57D0] mt-4 text-white text-md rounded-3xl px-3 py-2 flex gap-2 items-center'>
                        <IoPersonAdd className='text-xl' />
                        Add by Email</button>
                    <p className='text-black/75 mt-2.5 leading-5'>
                        or share this note link with others you want to work with
                    </p>
                    <div className='w-full h-10 flex items-center bg-black/5 cursor-text rounded-xl mt-2'>
                        <input type="text" className="outline-0 h-max w-full cursor-text rounded-xl px-4 text-[16px]" disabled value={loading ? "Loading..." : shareUrl} />
                        <MdContentCopy
                            onClick={() => {
                                navigator.clipboard.writeText(shareUrl)
                                copiedToastShow()
                            }
                            }
                            className='text-2xl bg-black/5 hover:bg-black/15 rounded-xl w-11 h-full py-2 cursor-pointer'
                            title='Copy link' />
                    </div>

                    {copiedToast && (
                        <div className="z-[999] rounded-tl-2xl rounded-tr-2xl rounded-br-2xl fixed top-87 right-145 bg-green-700 text-white px-1.5 py-1">
                            copied
                        </div>
                    )}

                    <div className='flex gap-1.5 p-2'>
                        <input
                            type="checkbox"
                            className="w-4"
                            checked={isChecked}
                            onChange={(e) => setIsChecked(e.target.checked)}
                        />
                        <label className='text-[15px]'>Read Only</label>
                    </div>
                </div>
            </div>
        )
    }
}

export default NotesShareModal
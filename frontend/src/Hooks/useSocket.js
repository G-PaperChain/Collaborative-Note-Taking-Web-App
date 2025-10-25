import { useEffect, useRef, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { io } from 'socket.io-client'
import { useToast } from '../Context/ToastContext';
import * as Y from 'yjs'
import { SocketIOProvider } from 'y-socket.io'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000'

// You need consistent error handling strategy across all functions.

export const useSocket = (noteId, token, onNoteUpdated, showUserLog) => {
    const navigate = useNavigate()
    const socketRef = useRef(null)
    const [joined, setJoined] = useState(false)
    const [isReconnecting, setIsReconnecting] = useState(false)
    const debounceRef = useRef(null);
    const { addToast } = useToast();

    useEffect(() => {
        return () => {
            clearTimeout(debounceRef.current);
            // Also clean up socket connection
            if (socketRef.current) {
                // socketRef.current.disconnect();
            }
        };
    }, []);

    const connectSocket = () => {
        try {
            const socket = io(SOCKET_URL, {
                withCredentials: true,
                transports: ['websocket'],
                reconnection: true,
                reconnectionAttempts: Infinity,
                reconnectionDelay: 1000,
            });

            socketRef.current = socket;
        } catch (error) {
            console.error('❌ Socket connection failed:', error);
            return null;
        }
    }

    const handleReconnection = (socket) => {

        socket.on('reconnect_attempt', () => {
            console.log('🔁 Reconnecting...')
            setIsReconnecting(true)
        })

        socket.on('reconnect', () => {
            console.log('✅ Reconnected')
            setIsReconnecting(false)
            if (noteId && token) {
                socket.emit('join_note', { note_id: noteId, token })
            }
        })
    }

    const setupSocketListeners = async () => {

        const socket = socketRef.current
        if (!socket) {
            console.warn('❌ No socket available for listeners')
            return
        }

        try {
            socket.on('connect', () => {
                console.log('✅ Connected:', socket.id) // LOG
                setIsReconnecting(false)
            })

            socket.on('note_updated', onNoteUpdated);

            handleReconnection(socket)

            socket.on('disconnect', (reason) => {
                console.log('❌ Disconnected:', reason)
                if (reason !== 'io client disconnect') setIsReconnecting(true)
                setJoined(false)
            })

            socket.on('connect_error', (err) => {
                console.error('❌ Socket error:', err.message)
                setIsReconnecting(true)
            })

            socket.on('joined', (data) => {
                console.log('🎉 SUCCESSFULLY JOINED NOTE ROOM:', data);
                setJoined(true)
                setIsReconnecting(false)
            })

            socket.on('join_error', (err) => {
                console.error('❌ Join error:', err)
                setTimeout(() => navigate('/'), 2500)
            })

            socket.on('update_error', (err) => {
                console.error('❌ Update error:', err)
            })

            socket.on('user_joined', (data) => {
                console.log('👤 User joined:', data.user)
                addToast(`${data.user} joined`, 'success')
            })

            socket.on('user_left', (data) => {
                console.log('👤 User left:', data.user)
                addToast(`${data.user} left`, 'error')
            })

            return

        } catch (err) {
            console.error('❌ Socket listener setup failed:', err);
        }
    }

    const joinNote = useCallback(() => {
        const socket = socketRef.current;

        if (socket?.connected && noteId && token) {
            console.log('🚀 Emitting join_note event - socket is ready!');
            socket.emit('join_note', { note_id: noteId, token });
        } else {
            console.log('⏳ Socket not ready, will join when connected');
            // Don't throw error - just wait for connection
        }
    }, [noteId, token]);

    const leaveNote = useCallback(() => {
        const socket = socketRef.current
        if (!socket) {
            console.warn('❌ No socket available for listeners')
            return
        }

        console.log('🚪 leaveNote called, socket connected:', socket.connected)
        console.log('📡 Socket ID:', socket.id)

        if (noteId) {
            socket.emit('leave_note', { note_id: noteId }, (ack) => {
                console.log('✅ leave_note acknowledged:', ack)
            })

            socket.volatile.emit('leave_note', { note_id: noteId })
        }

        setTimeout(() => {
            console.log('🔌 Force disconnecting socket')
            socket.disconnect()
        }, 500)
    }, [noteId, token])

    return { connectSocket, joinNote, setupSocketListeners, leaveNote, socketRef, joined, isReconnecting }
}
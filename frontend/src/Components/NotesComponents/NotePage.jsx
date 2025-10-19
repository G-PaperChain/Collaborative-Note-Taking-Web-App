// frontend/src/pages/NotePage.jsx
import { Tldraw, getSnapshot, loadSnapshot } from 'tldraw'
import 'tldraw/tldraw.css'
import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { io } from 'socket.io-client'
import { useApi } from '../../Context/Api'

const SOCKET_URL = 'http://localhost:5000' // backend socket endpoint (no /api)
const POLL_INTERVAL = 300 // ms

export default function NotePage() {
	const { token, noteId } = useParams() // will take the dynamic part of url
	const { api } = useApi()
	const navigate = useNavigate()
	const editorRef = useRef(null)
	const socketRef = useRef(null)
	const pollRef = useRef(null)
	const lastSnapshotRef = useRef(null)
	const [canEdit, setCanEdit] = useState(false)
	const [joined, setJoined] = useState(false)


	// Socket setup
	useEffect(() => {
		const socket = io(SOCKET_URL, { withCredentials: true, transports: ['websocket', 'polling'] })
		socketRef.current = socket

		socket.on('connect', () => console.log('✅ Socket connected', socket.id))
		socket.on('connect_error', (err) => console.error('Socket connect error', err))

		socket.on('note_updated', (data) => {
			// apply incoming snapshot only if different and editor exists
			try {
				if (!editorRef.current) return
				if (data.note_id !== noteId) return
				const current = getSnapshot(editorRef.current.store)
				const incoming = data.content
				// simple deep-compare by JSON string (ok for snapshots)
				if (JSON.stringify(current) !== JSON.stringify(incoming)) {
					loadSnapshot(editorRef.current.store, incoming)
					lastSnapshotRef.current = incoming
				}
			} catch (e) {
				console.warn('Failed to apply incoming snapshot', e)
			}
		})

		socket.on('join_error', (err) => {
			console.error('join_error', err)
			navigate('/')
		})

		return () => {
			try { socket.disconnect() } catch (e) { /* ignore */ }
			socketRef.current = null
		}
	}, [noteId, navigate])



	// onMount from Tldraw
	const onMount = async (editor) => {
		editorRef.current = editor

		// Load note and permissions
		try {
			const res = token
				? await api.get(`/note/${noteId}/access?token=${token}`)
				: await api.get(`/note/${noteId}/access`)

			if (!res.data || res.data.error) throw new Error(res.data?.error || 'No data')
			setCanEdit(Boolean(res.data.can_edit))

			if (res.data.note?.content) {
				loadSnapshot(editor.store, res.data.note.content)
				lastSnapshotRef.current = res.data.note.content
			} else {
				// initialize lastSnapshot with current store snapshot
				lastSnapshotRef.current = getSnapshot(editor.store)
			}
		} catch (e) {
			console.error('Failed to load note', e)
			navigate('/')
			return
		}

		// Join the room
		try {
			socketRef.current?.emit('join_note', { note_id: noteId, token })
			setJoined(true)
		} catch (e) {
			console.warn('Socket join failed', e)
		}

		// Start polling for local changes (stable cross-version approach)
		if (pollRef.current) clearInterval(pollRef.current)
		pollRef.current = setInterval(() => {
			console.log("⏱ polling, canEdit =", canEdit, editorRef.current)
			try {
				if (!editorRef.current) return
				if (!canEdit) return
				const snapshot = getSnapshot(editorRef.current.store)
				if (JSON.stringify(snapshot) !== JSON.stringify(lastSnapshotRef.current)) {
					console.log("✉️ sending note_update", noteId)
					lastSnapshotRef.current = snapshot
					socketRef.current?.emit('note_update', { note_id: noteId, content: snapshot })
				}
			} catch (e) {
				console.warn('Polling error', e)
			}
		}, 1000)
		// pollRef.current = setInterval(() => {
		// 	try {
		// 		if (!editorRef.current) return
		// 		if (!canEdit) return
		// 		const snapshot = getSnapshot(editorRef.current.store)
		// 		// compare
		// 		if (JSON.stringify(snapshot) !== JSON.stringify(lastSnapshotRef.current)) {
		// 			lastSnapshotRef.current = snapshot
		// 			// emit update
		// 			console.log("✉️ Sending note_update", {
		// 				note_id: noteId,
		// 				snapshot: editorRef.current?.store?.getSnapshot?.(),
		// 			});
		// 			socketRef.current?.emit('note_update', { note_id: noteId, content: snapshot })
		// 		}
		// 	} catch (e) {
		// 		console.warn('Polling error', e)
		// 	}
		// }, POLL_INTERVAL)
	}




	// Cleanup on unmount
	useEffect(() => {
		return () => {
			try {
				if (pollRef.current) {
					clearInterval(pollRef.current)
					pollRef.current = null
				}
				// optional: emit leave
				if (socketRef.current && joined) {
					try { socketRef.current.emit('leave_note', { note_id: noteId }) } catch (e) { }
				}
				editorRef.current = null
			} catch (e) {
				console.warn('Cleanup error', e)
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])




	return (
		<div className="w-screen h-screen">
			<Tldraw onMount={onMount} />
			{!canEdit && (
				<div className="absolute top-3 right-3 bg-yellow-200 text-black px-3 py-1 rounded-md shadow z-50">
					Read-only mode
				</div>
			)}
		</div>
	)
}

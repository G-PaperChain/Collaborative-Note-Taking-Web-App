// frontend/src/Components/NotesComponents/NotePage.jsx
import { Tldraw, getSnapshot, isDefined, loadSnapshot } from 'tldraw'
import 'tldraw/tldraw.css'
import { useEffect, useRef, useState, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { useApi } from '../../Context/Api'
import BottomNav from '../BottomNav'
import { useSocket } from '../../Hooks/useSocket'
import Loading from '../../Pages/Loading'
import Error from '../../Pages/Error'
import Modal from './Modal'
import { useToast } from '../../Context/ToastContext';
import { useTheme } from '../../Context/Theme'

export default function NotePage() {
	const { token, noteId } = useParams()
	const { api } = useApi()
	const [canEdit, setCanEdit] = useState(false)
	const [error, setError] = useState(false)
	const [isLoading, setIsLoading] = useState(false)
	const editorRef = useRef(null)
	const debounceRef = useRef(null)
	const isReceivingUpdate = useRef(null)
	const lastSnapshotRef = useRef(null)
	const [role, setRole] = useState('')
	const [isReconnecting, setIsReconnecting] = useState(false)
	const { addToast } = useToast();
	const { isDark } = useTheme()

	const handleIncomingUpdate = useCallback((data) => {
		if (!editorRef.current || data.note_id !== noteId) return;

		clearTimeout(debounceRef.current);
		debounceRef.current = setTimeout(() => {
			isReceivingUpdate.current = true;
			try {
				const current = getSnapshot(editorRef.current.store);
				const incoming = data.content;

				console.log('🔍 COMPARING FULL SNAPSHOTS:', {
					currentKeys: Object.keys(current),
					incomingKeys: Object.keys(incoming)
				});

				// Compare FULL snapshots, not just pages
				if (JSON.stringify(current) !== JSON.stringify(incoming)) {
					// console.log('🔄 Applying incoming snapshot - CONTENT IS DIFFERENT');
					applySnapshot(incoming);
				}
			} catch (error) {
				console.error('❌ Editor operation failed:', error);
				setError('Failed to sync changes');
			} finally {
				isReceivingUpdate.current = false;
			}
		}, 16);
	}, [noteId]);

	const { connectSocket, joinNote, setupSocketListeners, socketRef, joined, leaveNote } = useSocket(noteId, token, handleIncomingUpdate)

	useEffect(() => {
		return () => {
			leaveNote();
		};
	}, [leaveNote]);

	useEffect(() => {
		const setupSocket = async () => {
			connectSocket();
			await setupSocketListeners();

			// Wait for socket to be connected
			const socket = socketRef.current;
			if (!socket) return;

			if (socket.connected) {
				console.log('🎯 Socket already connected, joining note');
				joinNote();
			} else {
				console.log('⏳ Waiting for socket connection before joining...');
				socket.once('connect', () => {
					console.log('🎯 Socket connected, now joining note');
					joinNote();
				});
			}
		};

		setupSocket();
	}, [noteId, token, joinNote]);

	useEffect(() => {
		return () => {
			// Clean up Tldraw editor before unmount
			if (editorRef.current) {
				editorRef.current.dispose();
				editorRef.current = null;
			}
		};
	}, []);

	function stripPageState(snapshot) {
		try {
			const data = JSON.parse(JSON.stringify(snapshot))
			if (data.session?.pageStates) delete data.session.pageStates
			if (data.document?.session?.pageStates) delete data.document.session.pageStates
			return data
		} catch {
			return snapshot
		}
	}

	const initializeEditor = (editor) => {
		editorRef.current = editor;
		setIsLoading(true);

		(async () => {
			try {
				const res = await api.get(`/note/${noteId}/access?token=${token}`);
				if (!res.data.success) throw new Error(res.data.error || 'Failed to load note');

				const userCanEdit = !!res.data.can_edit;
				setCanEdit(userCanEdit);
				setRole(res.data?.role);

				if (res.data.note?.content) {
					const contentWithoutPageState = {
						...res.data.note.content,
						session: {
							...res.data.note.content.session,
							pageStates: []
						}
					};
					applySnapshot(contentWithoutPageState);
				}

				editor._unsubscribe = setupRealTimeSync(editor, userCanEdit);
			} catch (err) {
				setError('Error: ' + err.message);
			} finally {
				setIsLoading(false);
			}
		})();

		return () => {
			if (editor._unsubscribe) editor._unsubscribe();
		};
	};


	const applySnapshot = (snapshot) => {
		if (!editorRef.current || !snapshot) {
			console.warn('❌ No editor or snapshot to apply');
			return;
		}
		try {
			isReceivingUpdate.current = true;
			loadSnapshot(editorRef.current.store, snapshot);
			lastSnapshotRef.current = snapshot;

			console.log('✅ Snapshot applied successfully');
		} catch (error) {
			console.error('❌ Failed to apply snapshot:', error);
			setError('Failed to load drawing data');
		} finally {
			isReceivingUpdate.current = false;
		}
	}

	const setupRealTimeSync = (editor, canEdit) => {
		console.log('🔄 Setting up real-time sync, canEdit:', canEdit);
		if (!canEdit) {
			return null;
		}

		const unsubscribe = editor.store.listen(() => {
			if (isReceivingUpdate.current) {
				return
			};

			try {
				const snapshot = getSnapshot(editor.store);
				if (JSON.stringify(snapshot) !== JSON.stringify(lastSnapshotRef.current)) {
					lastSnapshotRef.current = snapshot;
					socketRef.current?.emit('note_update', {
						note_id: noteId,
						content: stripPageState(getSnapshot(editor.store)),
					});
				}
			} catch (error) {
				console.warn('Local update error: ', error);
			}
		});

		return unsubscribe;
	};

	const HideUi = () => {
		if (!canEdit) {
			return true
		}
		return false
	}

	return (
		<div className="w-screen h-screen relative">
			<BottomNav notepage={true} />
			<Tldraw onMount={initializeEditor} hideUi={HideUi()} className={`${ isDark ? "invert" : '' }`} />

			{!canEdit && (
				<div className="absolute bottom-10 right-3 bg-yellow-200 text-black px-3 py-1 rounded-md shadow z-[500]">
					Read-only mode
				</div>
			)}

			{joined && (
				<div className="absolute bottom-1 right-3 bg-green-500 text-white px-3 py-1 rounded-md shadow z-[500] flex items-center gap-2">
					<div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
					Connected
				</div>
			)}

		</div>
	)
};
import { Tldraw, getSnapshot, loadSnapshot } from "tldraw";
import "tldraw/tldraw.css";
import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useApi } from "../../Context/Api";
import BottomNav from '../BottomNav'

const NotePage = () => {
  const { noteId } = useParams();
  const { api } = useApi();
  const navigate = useNavigate();
  const editorRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [initialSnapshot, setInitialSnapshot] = useState(null);
  const saveTimeoutRef = useRef(null);
  const fetchIntervalRef = useRef(null);
  const lastSavedContent = useRef(null);
  const isSavingRef = useRef(false);

  // Fetch initial note data before mounting editor
  useEffect(() => {
    const fetchInitialNote = async () => {
      try {
        const res = await api.get(`/note/${noteId}`);
        console.log("Fetched initial note:", res.data);
        
        if (res.data?.content) {
          // Store separately: document (shapes, pages) and session (camera, zoom)
          const { document, session } = res.data.content;
          
          // Only load document initially - each user should have their own camera position
          // This prevents camera jumping when other users pan/zoom
          setInitialSnapshot({ document });
          lastSavedContent.current = res.data.content;
        } else {
          // No content yet - start with empty editor
          setInitialSnapshot(null);
        }
        
        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching note:", err);
        
        if (err.response?.status === 404) {
          setError("Note not found. It may have been deleted or you don't have access.");
        } else if (err.response?.status === 401) {
          setError("You must be logged in to view this note.");
          setTimeout(() => navigate('/login'), 2000);
        } else {
          setError(`Error loading note: ${err.message}`);
        }
        
        setIsLoading(false);
      }
    };

    fetchInitialNote();
  }, [noteId, api, navigate]);

  // Debounced save function - waits 2 seconds after last change before saving
  const debouncedSave = useCallback(() => {
    // Clear any pending save
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Schedule new save after 2 second delay
    saveTimeoutRef.current = setTimeout(async () => {
      if (!editorRef.current || isSavingRef.current) return;

      try {
        isSavingRef.current = true;
        
        // Get current snapshot
        const snapshot = getSnapshot(editorRef.current.store);
        
        // Only save if content has changed
        if (JSON.stringify(snapshot) === JSON.stringify(lastSavedContent.current)) {
          isSavingRef.current = false;
          return;
        }
        
        console.log("Saving note...");
        
        await api.post(`/note/${noteId}`, { content: snapshot });
        
        console.log("Note saved successfully");
        lastSavedContent.current = snapshot;
        
      } catch (err) {
        console.error("Error saving note:", err);
        
        if (err.response?.status === 404) {
          setError("Note not found. Unable to save changes.");
        } else if (err.response?.status === 401) {
          setError("Session expired. Please log in again.");
        }
      } finally {
        isSavingRef.current = false;
      }
    }, 2000); // 2 second debounce
  }, [noteId, api]);

  // Listen for editor changes and trigger debounced save
  useEffect(() => {
    if (!editorRef.current) return;

    // Listen to store changes
    const removeListener = editorRef.current.store.listen(() => {
      debouncedSave();
    });

    return () => {
      removeListener();
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [debouncedSave]);

  // Poll for updates from other users (only document changes, not session)
  useEffect(() => {
    if (!editorRef.current) return;

    const fetchUpdates = async () => {
      try {
        const res = await api.get(`/note/${noteId}`);
        
        if (res.data?.content && editorRef.current) {
          const { document: remoteDocument } = res.data.content;
          const currentSnapshot = getSnapshot(editorRef.current.store);
          const { document: localDocument } = currentSnapshot;
          
          // Only update if the document (shapes/pages) has changed
          // Ignore session changes (camera position) from other users
          if (JSON.stringify(remoteDocument) !== JSON.stringify(localDocument)) {
            console.log("Loading updates from other users...");
            // Load only the document, preserve local session (camera position)
            loadSnapshot(editorRef.current.store, { document: remoteDocument });
            
            // Update our reference but keep our session
            lastSavedContent.current = {
              document: remoteDocument,
              session: currentSnapshot.session
            };
          }
        }
      } catch (err) {
        console.error("Error fetching updates:", err);
        
        if (err.response?.status === 404 || err.response?.status === 401) {
          if (fetchIntervalRef.current) {
            clearInterval(fetchIntervalRef.current);
          }
        }
      }
    };

    // Poll every 5 seconds for collaborative updates
    fetchIntervalRef.current = setInterval(fetchUpdates, 5000);
    
    return () => {
      if (fetchIntervalRef.current) {
        clearInterval(fetchIntervalRef.current);
      }
    };
  }, [noteId, api]);

  if (isLoading) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-gray-900 text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          <p>Loading note...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-gray-900 text-white">
        <div className="flex flex-col items-center gap-4 max-w-md text-center">
          <div className="text-red-500 text-4xl">⚠️</div>
          <p className="text-lg">{error}</p>
          <div className="text-sm text-gray-400 mt-2">
            Note ID: {noteId}
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => navigate('/')}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              Go Home
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen">
      <BottomNav notepage={true} />
      <Tldraw
        // Load initial snapshot via prop - cleaner than loading after mount
        snapshot={initialSnapshot}
        onMount={(editor) => {
          console.log("Tldraw editor mounted");
          editorRef.current = editor;
        }}
      />
    </div>
  );
};

export default NotePage;
// frontend/src/TldrawWrapper.jsx
import { Tldraw } from 'tldraw';
import 'tldraw/tldraw.css';
import { io } from 'socket.io-client';
import { useEffect, useState } from 'react';
import { useApi } from './Api';

const socket = io('http://localhost:5000/api');

export const TldrawWrapper = ({ roomId }) => {
  const [editor, setEditor] = useState(null);

  useEffect(() => {
    if (!editor) return;

    socket.emit('join_room', { room: roomId });

    const handleUpdate = (update) => {
      editor.store.mergeRemoteChanges(update);
    };

    socket.on('tldraw_update', handleUpdate);

    const handleChange = ({ changes }) => {
      socket.emit('tldraw_update', { room: roomId, update: changes });
    };

    const dispose = editor.store.listen(handleChange, { scope: 'all' });

    return () => {
      socket.off('tldraw_update', handleUpdate);
      socket.emit('leave_room', { room: roomId });
      dispose();
    };
  }, [editor, roomId]);

  const onMount = (mountedEditor) => {
    setEditor(mountedEditor);
  };

  return (
    <div style={{ position: 'fixed', inset: 0 }}>
      <Tldraw onMount={onMount} />
    </div>
  );
};
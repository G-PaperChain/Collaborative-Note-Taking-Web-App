import { StrictMode, useRef } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { createBrowserRouter } from "react-router-dom";
import { RouterProvider } from "react-router-dom";
import { ApiProvider } from "./Context/Api.jsx";
import { ThemeProvider } from './Context/Theme.jsx';
import { AuthProvider } from './Context/AuthContext.jsx';
import LoginPage from './Components/AuthComponents/LoginPage.jsx';
import SignupPage from './Components/AuthComponents/SignupPage.jsx';
import ProtectedRoute from './Context/ProtectedRoute.jsx';
import CreateNotesPage from './Components/NotesComponents/CreateNotesPage.jsx';
import NotePage from './Components/NotesComponents/NotePage.jsx';
import MyNotes from './Components/NotesComponents/MyNotes.jsx';
import { ToastProvider } from './Context/ToastContext.jsx';

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <>
      <div className="w-full min-h-screen bg-red-100 flex justify-center items-center flex-col text-3xl select-none">
        <div className='text-7xl'>⚠️</div>
        <div>Something went wrong </div>
        <div>Please try again later.</div>
      </div>
    </>,
  },
  {
    path: "/login",
    element: <LoginPage />
  },
  {
    path: "/signup",
    element: <SignupPage />
  },
  {
    path: '/notes',
    element: (
      <ProtectedRoute>
        <MyNotes />
      </ProtectedRoute>
    )
  },
  {
    path: '/create-note',
    element: (
      <ProtectedRoute>
        <CreateNotesPage />
      </ProtectedRoute>
    )
  },
  {
    path: '/note/:token/:noteId',
    element: (
      <ProtectedRoute>
        <NotePage />
      </ProtectedRoute>
    )
  },


]);

function Main() {
  return (
    // <StrictMode>
    <ThemeProvider>
      <ApiProvider>
        <AuthProvider>
          <ToastProvider>
            <RouterProvider router={router} />
          </ToastProvider>
        </AuthProvider>
      </ApiProvider>
    </ThemeProvider>
    // </StrictMode>
  );
}

createRoot(document.getElementById('root')).render(<Main />);
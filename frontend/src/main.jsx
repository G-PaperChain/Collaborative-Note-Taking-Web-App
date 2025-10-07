import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import { ApiProvider } from "./Context/Api.jsx";
import { ThemeProvider } from './Context/Theme.jsx';
import LoginPage from './Components/AuthComponents/LoginPage.jsx';
import SignupPage from './Components/AuthComponents/SignupPage.jsx';

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
  }
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <ApiProvider>
        <RouterProvider router={router} />
      </ApiProvider>
    </ThemeProvider>
  </StrictMode>,
)
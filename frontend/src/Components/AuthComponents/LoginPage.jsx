import React, { useState } from 'react'
import bgvid from '/background.mp4'
import axios from 'axios'
import { Link } from 'react-router-dom'
import GoogleButton from 'react-google-button'
import { useApi } from '../../Context/Api'
import { useForm } from "react-hook-form";
import { useAuth } from '../../Context/AuthContext'

const SignupPage = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { login, isInitialized, loading, user, error } = useAuth()
  const { api } = useApi()

  const handleGoogleBtnClick = async () => {
    window.location.href = "https://backend-collab-notes-app.fly.dev/api/login/google";
  }

  async function onSignupFormSubmit(userData) { // change this functiuon
    try {
      const result = await login(userData)
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className='grid grid-cols-12 min-h-screen bg-[#000]'>

      <form className="max-w-lg z-[999] col-span-5 bg-orange-500/25 ebg-white/30 border-white/40 border-1 m-15 p-2.5 rounded-4xl shadow-2xl flex flex-col justify-center items-center gap-3.5"
        onSubmit={handleSubmit(onSignupFormSubmit)}
      >

        <h1 className='text-5xl mb-6 font-semibold text-white shadow-2xs tracking-tight'>Log in</h1>

        <div className=''>
          <input
            type="email"
            {...register("email", { required: 'Email is required', pattern: /^\S+@\S+$/i })}
            className='
          bg-[#FEEBE8]/75 focus:bg-[#FEEBE8] rounded-xl px-4 py-3 w-96 border-b-2 border-black/25 focus:outline-0 focus:border-orange-400 transition-colors duration-400 focus:ring-0 text-black/75
          '
            placeholder='Email'
          />
        </div>

        <div className=''>
          <input
            type="password"
            {...register('password', {
              required: 'Password is required',
              minLength: { value: 8, message: "Minimum 8 characters" }
            })}
            className='
          bg-[#FEEBE8]/75 focus:bg-[#FEEBE8] rounded-xl px-4 py-3 w-96 border-b-2 border-black/25 focus:outline-0 focus:border-orange-400 transition-colors duration-400 focus:ring-0 text-black/75
          '
            placeholder='Password'
          />
        </div>

        <div className='shadow-2xs w-96'>
          <button
            className="w-full flex items-center gap-3 bg-[#FEEBE8]/75 hover:bg-[#FEEBE8] transition-colors px-4 py-3 rounded-lg cursor-pointer"
            type='button'
            onClick={handleGoogleBtnClick}

          >
            <div>
              <svg width="20" height="20" viewBox="0 0 18 19" xmlns="http://www.w3.org/2000/svg"><path d="M9 7.844v3.463h4.844a4.107 4.107 0 0 1-1.795 2.7v2.246h2.907c1.704-1.558 2.685-3.85 2.685-6.575 0-.633-.056-1.246-.162-1.83H9v-.004Z" fill="#3E82F1"></path><path d="M9 14.861c-2.346 0-4.328-1.573-5.036-3.69H.956v2.323A9.008 9.008 0 0 0 9 18.42c2.432 0 4.47-.8 5.956-2.167l-2.907-2.247c-.804.538-1.835.855-3.049.855Z" fill="#32A753"></path><path d="M3.964 5.456H.956a8.928 8.928 0 0 0 0 8.033l3.008-2.318a5.3 5.3 0 0 1-.283-1.699 5.3 5.3 0 0 1 .283-1.699V5.456Z" fill="#F9BB00"></path><path d="m.956 5.456 3.008 2.317c.708-2.116 2.69-3.69 5.036-3.69 1.32 0 2.508.453 3.438 1.338l2.584-2.569C13.465 1.41 11.427.525 9 .525A9.003 9.003 0 0 0 .956 5.456Z" fill="#E74133"></path></svg>
            </div>
            <p
              className="text-black/45 ml-7e"
            >Log in with Google</p>
          </button>
        </div>

        <button type="submit" className="text-white hover:text-white/90 bg-orange-500 px-6 py-2 rounded-lg cursor-pointer hover:bg-orange-600 transition-colors duration-200 w-96">Submit</button>

        <Link to={'/signup'} className='text-orange-50 hover:text-orange-200 transition-colors duration-200 cursor-pointer'>
          Not a member?, Sign up instead
        </Link>
      </form>

      <video
        src={bgvid}
        autoPlay
        loop
        muted
        className={`opacity-75 absolute inset-0 w-full h-full object-cover transition-all duration-500 ease-linear`}
      ></video>


    </div >
  )
}

export default SignupPage
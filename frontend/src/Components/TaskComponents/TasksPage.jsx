import React, { useEffect, useState, useRef } from 'react'
import { useApi } from '../../Context/Api'
import Navbar from '../Navbar'
import BottomNav from '../BottomNav'
import { Link } from 'react-router'
import Button from '../Button'
import Modal from '../NotesComponents/Modal'
import { useTask } from '../../Context/TaskContext'
import { MdDelete } from "react-icons/md";

const TasksPage = () => {
  const { api } = useApi()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isTaskCreateModalOpen, setIsTaskCreateModalOpen] = useState(false)
  const { tasks, isLoading, taskError, deleteTask, taskStatusSwitch, taskStatus } = useTask()

  const closeModal = () => {
    setIsTaskCreateModalOpen(false);
  }

  const openModal = () => {
    setIsTaskCreateModalOpen(true);
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
      return <p className='text-2xl'>You have no Tasks yet.....</p>
    } else {
      return <p className='text-2xl'>{error}</p>
    }
  }
  return (
    <div className="relative min-h-screen w-full overflow-hidden flex flex-col bg-[#F73B20]">
      <div className="z-10">
        <Navbar />
      </div>

      <div className="grid grid-cols-5">
        <div className="font-[700] text-8xl text-white leading-21 px-12 py-12 col-span-1">
          <div>My</div>
          <div>Tasks</div>
          <div className="text-lg mt-12 ml-2">
            <Button tasks={true} text="Create a Task" openModal={openModal} />
          </div>
        </div>

        <div className="col-span-4 bg-white mr-10 h-130 rounded-4xl ml-10 overflow-x-auto overflow-y-hidden whitespace-nowrap">
          <div className="flex gap-1 flex-col px-12 py-12">
            {isLoading && 'Loading...'}
            {taskError && error404(error)}
            {
              tasks.map((task) =>
                <div key={task.task_id} className='bg-[#F73B20] hover:bg-[#D73B20] transition-all duration-200 text-white text-2xl px-6 py-3 rounded-2xl' >
                  <div className='flex justify-between items-center'>
                    <div className='flex gap-3.5 items-center'>
                      <input
                        type='checkbox'
                        defaultChecked
                        className='checkbox checkbox-xl checkbox-warning'
                        checked={task.status}
                        onChange={() => taskStatusSwitch(task.task_id)}
                      />
                      <h1 className={`${task.status ? 'line-through' : ''}`}>{task.task}</h1>
                    </div>
                    <MdDelete className='w-8 h-8' onClick={() => deleteTask(task.task_id)} />
                  </div>
                </div>
              )
            }
          </div>
        </div>
      </div>

      <BottomNav />

      {isTaskCreateModalOpen && <Modal handleclose={closeModal} tasks={true} />}

      <style>{`
      .overflow-x-auto::-webkit-scrollbar {
        display: none;
      }
    `}</style>
    </div>
  );

}

export default TasksPage

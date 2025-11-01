import {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import { useApi } from "./Api";
import { redirect } from "react-router";


const TaskContext = createContext();

export const useTask = () => {
  const context = useContext(TaskContext);
  if (!context) throw new taskError("useTask must be used within TaskProvider");
  return context;
};

export const TaskProvider = ({ children }) => {
  const [taskError, setTaskError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [ taskStatus, setTaskStatus ] = useState(false)
  const { api } = useApi()
  const [tasks, setTasks] = useState([])


  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setIsLoading(true)
      const res = await api.get("/tasks")
      if (res.data.success) {
        res.data.tasks.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
        let resTasks = res.data.tasks
        if (!resTasks) return
        setTasks(resTasks)
      } else {
        setTaskError(res.data.taskError)
      }
    } catch (taskError) {
      console.error(taskError)
      setTaskError(taskError)
    } finally {
      setIsLoading(false)
    }
  }

  const createTask = async ( task ) => {
    try {
      setIsLoading(true)
      const res = await api.post("/create-task", task )
      if (res.data.success) {
        fetchTasks();
      } else {
        setTaskError(res.data.taskError)
      }
    } catch (taskError) {
      console.error(taskError)
      setTaskError(taskError.message)
    } finally {
      setIsLoading(false)
    }
  };

  const deleteTask = async (taskId) => {
    try {
      const res = await api.delete(`/tasks/${taskId}`)
      if (res.data.success) {
        fetchTasks();
      }
    } catch (error) {
      console.error(error)
      setTaskError(error)
    }
  }

  const taskStatusSwitch = async (taskId) => {
    try {
      const res = await api.put(`/tasks/status/${taskId}`)
      if (res.data.success) {
        const updatedTask = res.data.task

        setTasks(prevTasks => 
          prevTasks.map((task) => 
            task.task_id === updatedTask.task_id ? updatedTask : task
          )
        )
        setTaskStatus(res.data.task.status)
      }
    } catch (error) {
      console.error(error)
      setTaskError(error)
    }
  }

  const value = {
    isLoading,
    taskError,
    tasks,
    taskStatus,
    createTask,
    fetchTasks,
    deleteTask,
    taskStatusSwitch,
  };

  return (
    <TaskContext.Provider value={value}>{children}</TaskContext.Provider>
  );
}
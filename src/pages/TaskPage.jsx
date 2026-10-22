import { useEffect, useState } from 'react'
import { API_BASE_URL } from '../api/apiConfig'
import { useNavigate } from 'react-router-dom'

function TaskPage() {
  const [tasks, setTasks] = useState([])
  const [editingTaskId, setEditingTaskId] = useState(null)
  const [statusFilter, setStatusFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'TODO',
    priority: 'MEDIUM'
  })
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const navigate = useNavigate()
  const [error, setError] = useState('')

  const getErrorMessage = (data, fallbackMessage) => {
    if (data.message) {
      return data.message
    }

    if (typeof data === 'object') {
      return Object.values(data).join(', ')
    }

    return fallbackMessage
  }

  useEffect(() => {
    const fetchTasks = async () => {
      const token = localStorage.getItem('token')

      let url

      if (statusFilter) {
        url = `${API_BASE_URL}/api/tasks?status=${statusFilter}`
      } else if (priorityFilter) {
        url = `${API_BASE_URL}/api/tasks?priority=${priorityFilter}`
      } else {
        url = `${API_BASE_URL}/api/tasks/page?page=${page}&size=5&sort=id,desc`
      }

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (response.status === 401) {
        localStorage.removeItem('token')
        navigate('/login')
        return
      }

      const data = await response.json()

      if (!response.ok) {
        setError(getErrorMessage(data, 'Could not load tasks'))
        return
      }

      if (statusFilter || priorityFilter) {
        setTasks(data)
      } else {
        setTasks(data.content)
        setTotalPages(data.totalPages)
      }
    }

    fetchTasks()
  }, [statusFilter, priorityFilter, page])

  const handleUnauthorized = (response) => {
    if (response.status === 401) {
      localStorage.removeItem('token')
      navigate('/login')
      return true
    }

    return false
  }

  const handleChange = (event) => {
    const { name, value } = event.target

    setFormData({
      ...formData,
      [name]: value
    })
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    setError('')

    const token = localStorage.getItem('token')

    if (editingTaskId) {
      const response = await fetch(
        `${API_BASE_URL}/api/tasks/${editingTaskId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(formData)
        }
      )

      if (handleUnauthorized(response)) {
        return
      }

      const updatedTask = await response.json()

      if (!response.ok) {
        setError(getErrorMessage(updatedTask, 'Could not update task'))
        return
      }

      setTasks(
        tasks.map((task) =>
          task.id === editingTaskId ? updatedTask : task
        )
      )

      setEditingTaskId(null)
    } else {
      const response = await fetch(
        `${API_BASE_URL}/api/tasks`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(formData)
        }
      )

      if (handleUnauthorized(response)) {
        return
      }

      const createdTask = await response.json()  

      if (!response.ok) {
        setError(getErrorMessage(createdTask, 'Could not create task'))
        return
      }

      setTasks([...tasks, createdTask])
    }

    setFormData({
      title: '',
      description: '',
      status: 'TODO',
      priority: 'MEDIUM'
    })
  }

  const handleDelete = async (id) => {
    const token = localStorage.getItem('token')

    const response = await fetch(
      `${API_BASE_URL}/api/tasks/${id}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )

    if (handleUnauthorized(response)) {
      return
    }

    

    if (!response.ok) {
      const data = await response.json()
      setError(getErrorMessage(data, 'Could not delete task'))
      return
    }

    if (response.ok) {
      setTasks(tasks.filter((task) => task.id !== id))
    }
  }

  const handleEdit = (task) => {
    setEditingTaskId(task.id)

    setFormData({
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority
    })
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/login')
  }

  return (
    <div>
      <h1>My Tasks</h1>

      <button onClick={handleLogout}>
        Logout
      </button>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="title"
          placeholder="Task title"
          value={formData.title}
          onChange={handleChange}
        />

        <textarea
          name="description"
          placeholder="Description"
          value={formData.description}
          onChange={handleChange}
        />

        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
        >
          <option value="TODO">TODO</option>
          <option value="IN_PROGRESS">IN_PROGRESS</option>
          <option value="DONE">DONE</option>
        </select>

        <select
          name="priority"
          value={formData.priority}
          onChange={handleChange}
        >
          <option value="LOW">LOW</option>
          <option value="MEDIUM">MEDIUM</option>
          <option value="HIGH">HIGH</option>
        </select>

        <button type="submit">
          {editingTaskId ? 'Update Task' : 'Add Task'}
        </button>
      </form>

      <select
        value={statusFilter}
        onChange={(event) => {
            setStatusFilter(event.target.value) 
            setPage(0)
        }}
      >
        <option value="">All Statuses</option>
        <option value="TODO">TODO</option>
        <option value="IN_PROGRESS">IN_PROGRESS</option>
        <option value="DONE">DONE</option>
      </select>

      <select
        value={priorityFilter}
        onChange={(event) => {
            setPriorityFilter(event.target.value)
            setPage(0)
        }}
      >
        <option value="">All Priorities</option>
        <option value="LOW">LOW</option>
        <option value="MEDIUM">MEDIUM</option>
        <option value="HIGH">HIGH</option>
      </select>

      {tasks.map((task) => (
        <div key={task.id}>
          <h3>{task.title}</h3>
          <p>{task.description}</p>
          <p>Status: {task.status}</p>
          <p>Priority: {task.priority}</p>

          <button onClick={() => handleDelete(task.id)}>
            Delete
          </button>
          <button onClick={() => handleEdit(task)}>
            Edit
          </button>
        </div>
      ))}

      <div>
        <button
          onClick={() => setPage(page - 1)}
          disabled={page === 0}
        >
          Previous
        </button>

        <span>
          Page {page + 1} of {totalPages}
        </span>

        <button
          onClick={() => setPage(page + 1)}
          disabled={page + 1 >= totalPages}
        >
          Next
        </button>
      </div>
    </div>
  )
}

export default TaskPage

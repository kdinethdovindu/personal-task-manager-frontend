import { useEffect, useState } from 'react'
import { API_BASE_URL } from '../api/apiConfig'
import { getErrorMessage, readResponse } from '../api/responseUtils'
import { useNavigate } from 'react-router-dom'
import './TaskPage.css'

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

  useEffect(() => {
    const fetchTasks = async () => {
      try {
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

        const data = await readResponse(response)

        if (!response.ok) {
          setError(getErrorMessage(data, 'Could not load tasks'))
          return
        }

        if (statusFilter || priorityFilter) {
          setTasks(Array.isArray(data) ? data : [])
          setTotalPages(0)
        } else {
          setTasks(data?.content || [])
          setTotalPages(data?.totalPages || 0)
        }
      } catch {
        setError('Unable to load tasks. Please try again.')
      }
    }

    fetchTasks()
  }, [statusFilter, priorityFilter, page, navigate])

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

    try {
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

      const updatedTask = await readResponse(response)

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

      const createdTask = await readResponse(response)

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
    } catch {
      setError(editingTaskId ? 'Unable to update task. Please try again.' : 'Unable to add task. Please try again.')
    }
  }

  const handleDelete = async (id) => {
    const token = localStorage.getItem('token')

    try {
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
        const data = await readResponse(response)
        setError(getErrorMessage(data, 'Could not delete task'))
        return
      }

      setTasks(tasks.filter((task) => task.id !== id))
    } catch {
      setError('Unable to delete task. Please try again.')
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
    <div className="task-page">
      <h1>My Tasks</h1>

      <button className="logout-button" onClick={handleLogout}>
        Logout
      </button>

      {error && <p className="form-error">{error}</p>}

      <form className="task-form" onSubmit={handleSubmit}>
        <input
          type="text"
          name="title"
          aria-label="Task title"
          placeholder="Task title"
          value={formData.title}
          onChange={handleChange}
        />

        <textarea
          name="description"
          aria-label="Task description"
          placeholder="Description"
          value={formData.description}
          onChange={handleChange}
        />

        <select
          name="status"
          aria-label="Task status"
          value={formData.status}
          onChange={handleChange}
        >
          <option value="TODO">TODO</option>
          <option value="IN_PROGRESS">IN_PROGRESS</option>
          <option value="DONE">DONE</option>
        </select>

        <select
          name="priority"
          aria-label="Task priority"
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
        className="task-filter task-filter-status"
        aria-label="Filter by status"
        value={statusFilter}
        onChange={(event) => {
            setStatusFilter(event.target.value) 
            setPriorityFilter('')
            setPage(0)
        }}
      >
        <option value="">All Statuses</option>
        <option value="TODO">TODO</option>
        <option value="IN_PROGRESS">IN_PROGRESS</option>
        <option value="DONE">DONE</option>
      </select>

      <select
        className="task-filter task-filter-priority"
        aria-label="Filter by priority"
        value={priorityFilter}
        onChange={(event) => {
            setPriorityFilter(event.target.value)
            setStatusFilter('')
            setPage(0)
        }}
      >
        <option value="">All Priorities</option>
        <option value="LOW">LOW</option>
        <option value="MEDIUM">MEDIUM</option>
        <option value="HIGH">HIGH</option>
      </select>

      {tasks.map((task) => (
        <div className="task-card" data-priority={task.priority} key={task.id}>
          <h3>{task.title}</h3>
          <p className="task-description">{task.description}</p>
          <p className="task-status" data-status={task.status}>Status: {task.status}</p>
          <p className="task-priority" data-priority={task.priority}>Priority: {task.priority}</p>

          <button className="task-delete-button" onClick={() => handleDelete(task.id)}>
            Delete
          </button>
          <button className="task-edit-button" onClick={() => handleEdit(task)}>
            Edit
          </button>
        </div>
      ))}

      {tasks.length === 0 && (
        <p className="empty-state">No tasks found</p>
      )}

      {!statusFilter && !priorityFilter && totalPages > 0 && (
      <div className="task-pagination">
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
      )}
    </div>
  )
}

export default TaskPage

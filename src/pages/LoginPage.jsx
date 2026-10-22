import { useState } from 'react'
import { API_BASE_URL } from '../api/apiConfig'
import {useNavigate} from 'react-router-dom'

function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  

  const handleChange = (event) => {
    const { name, value } = event.target

    setFormData({
      ...formData,
      [name]: value
    })
  }

  const [error, setError] = useState('')

  const navigate = useNavigate()

  const handleSubmit = async (event) => {
    event.preventDefault()

    setError('')

    const response = await fetch(
      `${API_BASE_URL}/api/auth/login`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      }
    )

    const contentType = response.headers.get('content-type')

    let data

    if (contentType && contentType.includes('application/json')) {
      data = await response.json()
    } else {
      data = await response.text()
    }

    if (!response.ok) {
      if (typeof data === 'string') {
        setError(data)
      } else {
        setError(data.message || 'Registration failed')
      }

      return
    }

    localStorage.setItem('token', data.token)

    navigate('/tasks')
  }

  return (
    <div>
      <h1>Login</h1>

      <form onSubmit={handleSubmit}>
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
        />

        <button type="submit">
          Login
        </button>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </form>
    </div>
  )
}

export default LoginPage
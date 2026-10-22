import { useState } from 'react'
import { API_BASE_URL } from '../api/apiConfig'
import { getErrorMessage, readResponse } from '../api/responseUtils'
import {useNavigate} from 'react-router-dom'
import './AuthPage.css'

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

    try {
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
      const data = await readResponse(response)

      if (!response.ok) {
        setError(getErrorMessage(data, 'Login failed'))
        return
      }

      localStorage.setItem('token', data.token)
      navigate('/tasks')
    } catch {
      setError('Unable to reach the server. Please try again.')
    }
  }

  return (
    <div className="auth-page">
      <h1>Login</h1>

      <form className="auth-form" onSubmit={handleSubmit}>
        <input
          type="email"
          name="email"
          aria-label="Email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
        />

        <input
          type="password"
          name="password"
          aria-label="Password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
        />

        <button type="submit">
          Login
        </button>
        {error && <p className="form-error">{error}</p>}
      </form>
    </div>
  )
}

export default LoginPage

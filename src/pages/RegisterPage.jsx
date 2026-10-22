import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { API_BASE_URL } from '../api/apiConfig'
import { getErrorMessage, readResponse } from '../api/responseUtils'
import './AuthPage.css'

function RegisterPage() {
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    name: '',
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

  const handleSubmit = async (event) => {
    event.preventDefault()

    setError('')

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/auth/register`,
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
        setError(getErrorMessage(data, 'Registration failed'))
        return
      }

      navigate('/login')
    } catch {
      setError('Unable to reach the server. Please try again.')
    }
  }

  return (
    <div className="auth-page">
      <h1>Register</h1>

      <form className="auth-form" onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          aria-label="Name"
          placeholder="Name"
          value={formData.name}
          onChange={handleChange}
        />

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
          Register
        </button>
        {error && <p className="form-error">{error}</p>}
      </form>
    </div>
  )
}

export default RegisterPage

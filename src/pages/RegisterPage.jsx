import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { API_BASE_URL } from '../api/apiConfig'

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

    navigate('/login')
  }

  return (
    <div>
      <h1>Register</h1>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Name"
          value={formData.name}
          onChange={handleChange}
        />

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
          Register
        </button>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </form>
    </div>
  )
}

export default RegisterPage
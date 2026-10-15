import { useState } from 'react'
import { API_BASE_URL } from '../api/apiConfig'

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

    const handleSubmit = async (event) => {
        event.preventDefault()

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

        const data = await response.json()

        localStorage.setItem('token', data.token)

        console.log(data)
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
      </form>
    </div>
  )
}

export default LoginPage
import {Route , Routes} from 'react-router-dom'
import RegisterPage from './pages/RegisterPage'
import LoginPage from './pages/LoginPage'
import TaskPage from './pages/TaskPage'
import ProtectedRoute from './components/ProtectedRoute'

function App() {

  return (
    <Routes>
      <Route path='/register' element={<RegisterPage />} />
      <Route path='/login' element={<LoginPage />} />
      <Route path='/tasks' element={
        <ProtectedRoute>
           <TaskPage />
        </ProtectedRoute>} 
      />
    </Routes>
  )
}

export default App

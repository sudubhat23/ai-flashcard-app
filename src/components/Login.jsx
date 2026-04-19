import { useState } from 'react'
import { Brain } from 'lucide-react'

export default function Login({ onLogin }) {
  const [isRegister, setIsRegister] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handle = () => {
    if (!username.trim() || !password.trim())
      return setError('Please enter username and password.')

    const users = JSON.parse(localStorage.getItem('fc-users') || '{}')

    if (isRegister) {
      if (users[username]) return setError('Username already exists.')
      users[username] = password
      localStorage.setItem('fc-users', JSON.stringify(users))
      setSuccess('Account created! Please login now.')
      setUsername('')
      setPassword('')
      setError('')
      setIsRegister(false)
    } else {
      if (!users[username] || users[username] !== password)
        return setError('Invalid username or password.')
      localStorage.setItem('fc-loggedIn', username)
      onLogin(username)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-purple-600 p-3 rounded-2xl mb-3">
            <Brain className="text-white w-8 h-8" />
          </div>
          <h1 className="text-2xl font-semibold text-gray-900">AI Flashcards</h1>
          <p className="text-sm text-gray-500 mt-1">Your AI-powered study companion</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-6 text-center">
            {isRegister ? 'Create account' : 'Welcome back'}
          </h2>

          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Username</label>
              <input
                type="text"
                value={username}
                onChange={e => { setUsername(e.target.value); setError(''); setSuccess('') }}
                onKeyDown={e => e.key === 'Enter' && handle()}
                placeholder="Enter username"
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => { setPassword(e.target.value); setError(''); setSuccess('') }}
                onKeyDown={e => e.key === 'Enter' && handle()}
                placeholder="Enter password"
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition"
              />
            </div>

            {error && (
              <p className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-lg px-4 py-2">
                {error}
              </p>
            )}
            {success && (
              <p className="text-sm text-green-600 bg-green-50 border border-green-100 rounded-lg px-4 py-2">
                {success}
              </p>
            )}

            <button
              onClick={handle}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2.5 rounded-xl transition-colors"
            >
              {isRegister ? 'Create account' : 'Login'}
            </button>
          </div>

          <p className="text-center text-sm text-gray-500 mt-4">
            {isRegister ? 'Already have an account?' : "Don't have an account?"}
            {' '}
            <button
              onClick={() => { setIsRegister(r => !r); setError(''); setSuccess('') }}
              className="text-purple-600 font-medium hover:underline"
            >
              {isRegister ? 'Login' : 'Register'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
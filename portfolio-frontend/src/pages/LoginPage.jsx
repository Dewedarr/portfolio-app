import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { loginAdmin } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await login(form)
      loginAdmin(res.data.token, {
        username: res.data.username,
        email: res.data.email,
      })
      navigate('/admin')
    } catch {
      setError('Invalid username or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#070a10] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-[#0b1120] border border-[#1a2744] rounded-xl p-8">
          <div className="text-center mb-8">
            <div className="text-[#00d4ff] font-mono text-sm tracking-widest mb-2">// ADMIN</div>
            <h1 className="text-2xl font-bold text-white">Portfolio Dashboard</h1>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg p-3 mb-6 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-mono text-[#64748b] tracking-widest uppercase mb-2">
                Username
              </label>
              <input
                type="text"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                className="w-full bg-[#0f1624] border border-[#1a2744] rounded-lg px-4 py-3 text-white outline-none focus:border-[#00d4ff] transition-colors"
                placeholder="Enter username"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-[#64748b] tracking-widest uppercase mb-2">
                Password
              </label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full bg-[#0f1624] border border-[#1a2744] rounded-lg px-4 py-3 text-white outline-none focus:border-[#00d4ff] transition-colors"
                placeholder="Enter password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#00d4ff] text-black font-bold py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
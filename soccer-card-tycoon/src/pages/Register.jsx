import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Register() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signUp } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      setLoading(false)
      return
    }

    const { success, error: signUpError } = await signUp(email, password, username)

    if (success) {
      navigate('/login')
    } else {
      setError(signUpError || 'Failed to create account')
    }

    setLoading(false)
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-electric-purple">
      <div className="absolute inset-0 h-full w-full bg-grid"></div>
      <div className="absolute inset-0 h-full w-full" style={{ background: 'radial-gradient(circle, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.8) 100%)' }}></div>

      <div className="relative z-10 flex w-full grow flex-col justify-between p-6">
        <header className="flex w-full items-center justify-center pt-8 pb-4">
          <div className="flex flex-col items-center gap-3">
            <p className="font-pixel text-4xl uppercase tracking-tighter text-bright-yellow" style={{ textShadow: '3px 3px 0px #000000' }}>SQUAD</p>
          </div>
        </header>

        <main className="flex flex-col items-center justify-center grow py-8">
          <div className="w-full max-w-sm space-y-8">
            <div className="text-center">
              <h1 className="font-pixel text-3xl leading-tight text-white" style={{ textShadow: '2px 2px 0px #000' }}>Join the Squad</h1>
              <p className="mt-2 text-2xl text-bright-cyan">Create your account!</p>
            </div>

            {error && (
              <div className="bg-red-500 text-white p-4 border-4 border-black shadow-pixel-hard text-center font-pixel text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <label className="flex flex-col min-w-40 flex-1">
                <p className="pb-2 text-2xl font-bold leading-normal text-white">USERNAME</p>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-none border-4 border-black bg-white text-black h-14 placeholder:text-gray-500 p-4 text-2xl font-normal leading-normal focus:outline-none focus:ring-4 focus:ring-neon-pink focus:border-black transition-all shadow-pixel-hard-inset"
                  placeholder="Choose username"
                  required
                />
              </label>

              <label className="flex flex-col min-w-40 flex-1">
                <p className="pb-2 text-2xl font-bold leading-normal text-white">EMAIL</p>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-none border-4 border-black bg-white text-black h-14 placeholder:text-gray-500 p-4 text-2xl font-normal leading-normal focus:outline-none focus:ring-4 focus:ring-neon-pink focus:border-black transition-all shadow-pixel-hard-inset"
                  placeholder="Enter email"
                  required
                />
              </label>

              <label className="flex flex-col min-w-40 flex-1">
                <p className="pb-2 text-2xl font-bold leading-normal text-white">PASSWORD</p>
                <div className="flex w-full flex-1 items-stretch rounded-none border-4 border-black bg-white shadow-pixel-hard-inset focus-within:ring-4 focus-within:ring-neon-pink">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden text-black focus:outline-none h-14 placeholder:text-gray-500 p-4 text-2xl font-normal leading-normal transition-all"
                    placeholder="Create password"
                    required
                  />
                  <div className="flex items-center justify-center bg-white pr-4">
                    <span
                      onClick={() => setShowPassword(!showPassword)}
                      className="material-symbols-outlined cursor-pointer text-4xl text-black"
                    >
                      {showPassword ? 'visibility' : 'visibility_off'}
                    </span>
                  </div>
                </div>
              </label>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center rounded-none border-4 border-black bg-neon-pink h-16 p-4 gap-3 transition-all active:translate-x-1 active:translate-y-1 active:shadow-none shadow-pixel-hard disabled:opacity-50"
              >
                <span className="font-pixel text-lg font-extrabold uppercase leading-normal tracking-wide text-white" style={{ textShadow: '2px 2px 0 #000' }}>
                  {loading ? 'Creating...' : 'Sign Up'}
                </span>
                {!loading && (
                  <span className="material-symbols-outlined text-3xl text-white" style={{ textShadow: '2px 2px 0 #000' }}>arrow_forward</span>
                )}
              </button>
            </form>
          </div>
        </main>

        <footer className="flex w-full items-center justify-center py-4">
          <p className="text-center text-xl font-normal leading-normal text-white">
            Already have an account?<br />
            <Link to="/login" className="font-bold text-bright-yellow underline hover:text-bright-cyan">LOG IN!</Link>
          </p>
        </footer>
      </div>
    </div>
  )
}

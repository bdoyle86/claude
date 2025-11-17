import { Component } from 'react'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
    window.location.href = '/'
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-background-dark p-4">
          <div className="max-w-md w-full bg-black/50 rounded-xl border-4 border-red-500 p-8 text-center">
            <div className="mb-6">
              <span className="material-symbols-outlined text-8xl text-red-500">error</span>
            </div>
            <h1 className="text-3xl font-display text-red-500 mb-4 uppercase">OOPS!</h1>
            <p className="text-white font-body mb-2">Something went wrong</p>
            <p className="text-gray-400 font-pixel text-xs mb-6">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <button
              onClick={this.handleReset}
              className="w-full h-12 rounded-lg bg-red-500 text-white font-display uppercase border-2 border-black shadow-pixel-hard active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
            >
              Return Home
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary

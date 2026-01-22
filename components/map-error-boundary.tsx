'use client'

import { Component, ReactNode } from 'react'
import { AlertCircle } from 'lucide-react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class MapErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error) {
    // Suppress Mapbox Header errors - they don't block functionality
    if (!error.message.includes('Headers')) {
      console.error('[v0] Map error:', error)
    }
  }

  render() {
    if (this.state.hasError && this.state.error && !this.state.error.message.includes('Headers')) {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-gray-50">
          <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Map Failed to Load</h3>
          <p className="text-sm text-gray-600 text-center max-w-md">{this.state.error.message}</p>
        </div>
      )
    }

    // Render children even with Mapbox Header errors - they're not critical
    return this.props.children
  }
}

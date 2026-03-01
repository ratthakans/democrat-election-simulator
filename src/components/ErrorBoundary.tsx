import { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
  children?: ReactNode
}

interface State {
  hasError: boolean
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  }

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo)
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
          <div className="text-center p-8 bg-white dark:bg-black/20 rounded-2xl shadow-xl border border-gray-200 dark:border-white/10 max-w-lg">
            <h1 className="text-2xl font-bold text-red-600 mb-4">เกิดข้อผิดพลาดบางอย่าง</h1>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              ระบบไม่สามารถแสดงผลได้ในขณะนี้ กรุณารีเฟรชหน้าจอหรือลองใหม่อีกครั้ง
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              รีเฟรชหน้าจอ
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

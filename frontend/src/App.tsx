import { Routes, Route, Link, useLocation } from 'react-router-dom'
import { Dashboard } from './pages/Dashboard'
import { GoalDetail } from './pages/GoalDetail'

function Nav() {
  const { pathname } = useLocation()
  return (
    <nav className="border-b bg-white shadow-sm">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-3">
        <Link to="/" className="text-lg font-bold text-blue-600 hover:text-blue-700">
          TaskManager
        </Link>
        <div className="flex gap-4 text-sm">
          <Link
            to="/"
            className={`font-medium transition-colors ${pathname === '/' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-800'}`}
          >
            ダッシュボード
          </Link>
        </div>
      </div>
    </nav>
  )
}

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Nav />
      <main className="py-6">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/goals/:id" element={<GoalDetail />} />
        </Routes>
      </main>
    </div>
  )
}

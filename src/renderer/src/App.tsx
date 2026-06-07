import { lazy, Suspense } from 'react'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { TitleBar } from './components/layout/TitleBar'
import { Sidebar } from './components/layout/Sidebar'
import { StatusBar } from './components/layout/StatusBar'
import { Toaster } from './components/ui/Toaster'
import { ErrorBoundary } from './components/ui/ErrorBoundary'
import { useTheme } from './hooks/useTheme'
import { useAnalytics } from './hooks/useAnalytics'
import { useAppStore } from './store/app.store'

// Lazy-loaded views — each view is a separate chunk
const Dashboard = lazy(() => import('./pages/Dashboard').then((m) => ({ default: m.Dashboard })))
const Settings = lazy(() => import('./pages/Settings').then((m) => ({ default: m.Settings })))
const About = lazy(() => import('./pages/About').then((m) => ({ default: m.About })))
const Login = lazy(() => import('./pages/Login').then((m) => ({ default: m.Login })))

function PageLoader() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <div
        style={{
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          border: '2px solid var(--border-default)',
          borderTopColor: 'var(--accent-primary)',
          animation: 'spin 0.7s linear infinite',
          boxShadow: '0 0 12px var(--accent-primary-glow)'
        }}
      />
    </motion.div>
  )
}

function AuthenticatedShell() {
  return (
    <div className="app-shell">
      <TitleBar />
      <div className="app-body">
        <Sidebar />
        <main className="app-content">
          <AnimatePresence mode="wait">
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/about" element={<About />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </Suspense>
          </AnimatePresence>
        </main>
      </div>
      <StatusBar />
    </div>
  )
}

function UnauthenticatedShell() {
  return (
    <div className="app-shell">
      <TitleBar />
      <Suspense fallback={<PageLoader />}>
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="*" element={<Login />} />
          </Routes>
        </AnimatePresence>
      </Suspense>
    </div>
  )
}

function AppInner() {
  useTheme()
  useAnalytics()
  const isAuthenticated = useAppStore((s) => s.isAuthenticated)

  return (
    <ErrorBoundary>
      <AnimatePresence mode="wait">
        {isAuthenticated ? <AuthenticatedShell key="app" /> : <UnauthenticatedShell key="login" />}
      </AnimatePresence>
      <Toaster />
    </ErrorBoundary>
  )
}

export default function App() {
  return (
    <HashRouter>
      <AppInner />
    </HashRouter>
  )
}

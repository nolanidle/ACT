import React, { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AnimatePresence } from 'framer-motion'
import useAuthStore from './store/authStore'
import useUIStore from './store/uiStore'
import useAuth from './hooks/useAuth'
import BadgeUnlockModal from './components/gamification/BadgeUnlockModal'
import Navbar from './components/layout/Navbar'

// Import all pages
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import VerifyEmail from './pages/VerifyEmail'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import Dashboard from './pages/Dashboard'
import SelectTest from './pages/SelectTest'
import DiagnosticSetup from './pages/DiagnosticSetup'
import PracticeSession from './pages/PracticeSession'
import ScoreReport from './pages/ScoreReport'
import StudyGuide from './pages/StudyGuide'
import LessonGenerator from './pages/LessonGenerator'
import LessonViewer from './pages/LessonViewer'
import QuizGenerator from './pages/QuizGenerator'
import ExamGenerator from './pages/ExamGenerator'
import Progress from './pages/Progress'
import Account from './pages/Account'

// Protected route wrapper
function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuthStore()
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

// Public-only route (redirect to dashboard if already logged in)
function PublicRoute({ children }) {
  const { isAuthenticated } = useAuthStore()
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children
}

export default function App() {
  const { isAuthenticated } = useAuthStore()
  const { badgeUnlock, clearBadgeUnlock } = useUIStore()
  const { checkAuth } = useAuth()

  useEffect(() => {
    checkAuth()
  }, [])

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-space-base text-slate-100">
        {isAuthenticated && <Navbar />}
        <AnimatePresence mode="wait">
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<PublicRoute><Landing /></PublicRoute>} />
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
            <Route path="/reset-password" element={<PublicRoute><ResetPassword /></PublicRoute>} />

            {/* Protected routes */}
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/select-test" element={<ProtectedRoute><SelectTest /></ProtectedRoute>} />
            <Route path="/diagnostic-setup" element={<ProtectedRoute><DiagnosticSetup /></ProtectedRoute>} />
            <Route path="/practice-session/:sessionId" element={<ProtectedRoute><PracticeSession /></ProtectedRoute>} />
            <Route path="/score-report/:sessionId" element={<ProtectedRoute><ScoreReport /></ProtectedRoute>} />
            <Route path="/study-guide" element={<ProtectedRoute><StudyGuide /></ProtectedRoute>} />
            <Route path="/lesson-generator" element={<ProtectedRoute><LessonGenerator /></ProtectedRoute>} />
            <Route path="/lesson/:lessonId" element={<ProtectedRoute><LessonViewer /></ProtectedRoute>} />
            <Route path="/quiz-generator" element={<ProtectedRoute><QuizGenerator /></ProtectedRoute>} />
            <Route path="/exam-generator" element={<ProtectedRoute><ExamGenerator /></ProtectedRoute>} />
            <Route path="/progress" element={<ProtectedRoute><Progress /></ProtectedRoute>} />
            <Route path="/account" element={<ProtectedRoute><Account /></ProtectedRoute>} />

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AnimatePresence>

        {/* Global badge unlock modal */}
        <BadgeUnlockModal
          badge={badgeUnlock}
          isOpen={!!badgeUnlock}
          onClose={clearBadgeUnlock}
        />

        {/* Global toast notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1a2236',
              color: '#f1f5f9',
              border: '1px solid #2d3a4f',
            },
            success: { iconTheme: { primary: '#10b981', secondary: '#1a2236' } },
            error: { iconTheme: { primary: '#f43f5e', secondary: '#1a2236' } },
          }}
        />
      </div>
    </BrowserRouter>
  )
}

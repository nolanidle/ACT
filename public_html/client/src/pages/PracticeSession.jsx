import React, { useEffect, useState } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { fadeIn } from '../animations/variants'
import PageWrapper from '../components/layout/PageWrapper'
import Spinner from '../components/ui/Spinner'
import QuizPlayer from '../components/quiz/QuizPlayer'
import api from '../utils/api'

export default function PracticeSession() {
  const { sessionId } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const type = searchParams.get('type') || 'quiz' // 'quiz' | 'diagnostic' | 'exam'

  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchSession = async () => {
      try {
        let endpoint
        switch (type) {
          case 'diagnostic': endpoint = `/diagnostic/${sessionId}`; break
          case 'exam':       endpoint = `/exam/${sessionId}`; break
          default:           endpoint = `/quiz/${sessionId}`
        }
        const { data } = await api.get(endpoint)
        setSession(data)
      } catch (err) {
        const msg = err.response?.data?.message || 'Failed to load session'
        setError(msg)
        toast.error(msg)
      } finally {
        setLoading(false)
      }
    }
    fetchSession()
  }, [sessionId, type])

  const handleComplete = (results) => {
    navigate(`/score-report/${sessionId}?type=${type}`, {
      state: { results },
    })
  }

  if (loading) {
    return (
      <PageWrapper>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <Spinner size="xl" />
          <p className="text-slate-400">Loading your session...</p>
        </div>
      </PageWrapper>
    )
  }

  if (error || !session) {
    return (
      <PageWrapper>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
          <p className="text-rose-400 text-lg font-semibold">Failed to load session</p>
          <p className="text-slate-400 text-sm">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="text-brand-blue hover:underline text-sm"
          >
            Go Back
          </button>
        </div>
      </PageWrapper>
    )
  }

  return (
    <motion.div
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      className="min-h-screen bg-space-base"
    >
      <QuizPlayer
        session={session}
        type={type}
        sessionId={sessionId}
        onComplete={handleComplete}
      />
    </motion.div>
  )
}

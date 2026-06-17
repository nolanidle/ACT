import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle, Target, Zap } from 'lucide-react'
import toast from 'react-hot-toast'
import { fadeInUp, staggerContainer } from '../animations/variants'
import PageWrapper from '../components/layout/PageWrapper'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Spinner from '../components/ui/Spinner'
import LessonViewerComponent from '../components/lesson/LessonViewer'
import api from '../utils/api'
import useUIStore from '../store/uiStore'

export default function LessonViewer() {
  const { lessonId } = useParams()
  const navigate = useNavigate()
  const { setBadgeUnlock } = useUIStore()

  const [lesson, setLesson] = useState(null)
  const [loading, setLoading] = useState(true)
  const [completing, setCompleting] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [xpEarned, setXpEarned] = useState(null)

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        const { data } = await api.get(`/lesson/${lessonId}`)
        setLesson(data)
        setCompleted(data.completed || false)
      } catch (err) {
        toast.error('Failed to load lesson')
      } finally {
        setLoading(false)
      }
    }
    fetchLesson()
  }, [lessonId])

  const handleMarkComplete = async () => {
    setCompleting(true)
    try {
      const { data } = await api.post(`/lesson/${lessonId}/complete`)
      setCompleted(true)
      const xp = data.xp_earned || data.xpEarned
      if (xp) {
        setXpEarned(xp)
        toast.success(`Lesson complete! +${xp} XP earned`)
      } else {
        toast.success('Lesson marked as complete!')
      }
      if (data.badge || data.newBadge) {
        setBadgeUnlock(data.badge || data.newBadge)
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to mark complete')
    } finally {
      setCompleting(false)
    }
  }

  if (loading) {
    return (
      <PageWrapper>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Spinner size="xl" />
        </div>
      </PageWrapper>
    )
  }

  if (!lesson) {
    return (
      <PageWrapper>
        <div className="text-center py-20">
          <p className="text-slate-400">Lesson not found.</p>
          <button onClick={() => navigate(-1)} className="text-brand-blue hover:underline text-sm mt-3">
            Go Back
          </button>
        </div>
      </PageWrapper>
    )
  }

  return (
    <PageWrapper>
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="max-w-3xl mx-auto space-y-5"
      >
        {/* Header */}
        <motion.div variants={fadeInUp} className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              <span className="capitalize">{lesson.section}</span>
              <span>·</span>
              <span className="capitalize">{lesson.test || 'ACT'}</span>
            </div>
            <h1 className="text-2xl font-black text-slate-100">{lesson.title}</h1>
            {lesson.topic && (
              <p className="text-slate-400 text-sm mt-0.5">{lesson.topic}</p>
            )}
          </div>
          {completed && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-semibold">
              <CheckCircle size={14} />
              Completed
            </div>
          )}
        </motion.div>

        {/* Lesson Content */}
        <motion.div variants={fadeInUp}>
          <LessonViewerComponent lesson={lesson} />
        </motion.div>

        {/* XP earned banner */}
        {xpEarned && (
          <motion.div
            variants={fadeInUp}
            className="flex items-center gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20"
          >
            <Zap size={20} className="text-amber-400" />
            <p className="text-amber-300 font-semibold">+{xpEarned} XP earned for completing this lesson!</p>
          </motion.div>
        )}

        {/* Bottom actions */}
        <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-3 pt-2">
          {!completed ? (
            <Button
              variant="success"
              size="lg"
              onClick={handleMarkComplete}
              loading={completing}
              leftIcon={<CheckCircle size={16} />}
            >
              Mark as Complete
            </Button>
          ) : (
            <Button
              variant="secondary"
              size="lg"
              onClick={() => navigate('/lesson-generator')}
              leftIcon={<Zap size={16} />}
            >
              Generate Another Lesson
            </Button>
          )}
          <Button
            variant="secondary"
            size="lg"
            onClick={() => navigate(`/quiz-generator?lessonId=${lessonId}&section=${lesson.section || ''}&topic=${encodeURIComponent(lesson.topic || '')}`)}
            leftIcon={<Target size={16} />}
          >
            Generate Quiz from This Lesson
          </Button>
        </motion.div>
      </motion.div>
    </PageWrapper>
  )
}

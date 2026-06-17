import React from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { BookOpen, ChevronRight, Clock, Layers } from 'lucide-react'
import { fadeInUp, staggerContainer } from '../animations/variants'
import PageWrapper from '../components/layout/PageWrapper'
import Card from '../components/ui/Card'

const tests = [
  {
    id: 'act',
    name: 'ACT',
    description: 'The standard college admissions test. Covers English, Math, Reading, and Science.',
    sections: ['English (75 questions)', 'Math (60 questions)', 'Reading (40 questions)', 'Science (40 questions)'],
    time: '2h 55min',
    color: 'text-brand-blue',
    glow: 'border-brand-blue/30 shadow-brand-blue/10',
    badge: 'Most Popular',
    badgeColor: 'bg-brand-blue/20 text-brand-blue border-brand-blue/30',
  },
  {
    id: 'preact',
    name: 'PreACT',
    description: 'Practice for the full ACT. Shorter format, same content areas — perfect for 10th graders.',
    sections: ['English (45 questions)', 'Math (36 questions)', 'Reading (25 questions)', 'Science (30 questions)'],
    time: '1h 55min',
    color: 'text-brand-violet',
    glow: 'border-brand-violet/30 shadow-brand-violet/10',
    badge: 'Great for 10th Grade',
    badgeColor: 'bg-brand-violet/20 text-brand-violet border-brand-violet/30',
  },
]

export default function SelectTest() {
  const navigate = useNavigate()

  return (
    <PageWrapper>
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="max-w-3xl mx-auto"
      >
        <motion.div variants={fadeInUp} className="text-center mb-10">
          <h1 className="text-3xl font-black text-slate-100 mb-2">Select Your Test</h1>
          <p className="text-slate-400">Choose which test you&apos;re preparing for.</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {tests.map((test) => (
            <motion.div key={test.id} variants={fadeInUp}>
              <Card
                hover
                className={`p-7 cursor-pointer shadow-xl ${test.glow} group`}
                onClick={() => navigate(`/diagnostic-setup?test=${test.id}`)}
              >
                {/* Badge */}
                <div className="flex items-start justify-between mb-5">
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${test.badgeColor}`}>
                    {test.badge}
                  </span>
                  <ChevronRight
                    size={20}
                    className="text-slate-600 group-hover:text-slate-300 group-hover:translate-x-1 transition-all"
                  />
                </div>

                {/* Name */}
                <h2 className={`text-4xl font-black mb-3 ${test.color}`}>{test.name}</h2>
                <p className="text-slate-400 text-sm leading-relaxed mb-6">{test.description}</p>

                {/* Time */}
                <div className="flex items-center gap-1.5 text-slate-400 text-sm mb-5">
                  <Clock size={15} />
                  <span>{test.time} total</span>
                </div>

                {/* Sections */}
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    <Layers size={12} />
                    Sections
                  </div>
                  {test.sections.map((s) => (
                    <div key={s} className="flex items-center gap-2 text-sm text-slate-300">
                      <div className={`w-1.5 h-1.5 rounded-full ${test.id === 'act' ? 'bg-brand-blue' : 'bg-brand-violet'}`} />
                      {s}
                    </div>
                  ))}
                </div>

                <div className={`mt-6 w-full py-2.5 rounded-xl border text-center text-sm font-semibold transition-all duration-200 ${test.glow} ${test.color} group-hover:bg-brand-blue/5`}>
                  Select {test.name} →
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </PageWrapper>
  )
}

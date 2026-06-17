import React, { useEffect, useRef, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, useInView } from 'framer-motion'
import { Brain, Zap, TrendingUp, Star, ChevronDown, Target, BookOpen, Award } from 'lucide-react'
import { fadeInUp, staggerContainer, scaleIn } from '../animations/variants'
import PageWrapper from '../components/layout/PageWrapper'
import Button from '../components/ui/Button'

/* ─── Animated Counter ─────────────────────────────── */
function AnimatedCounter({ end, suffix = '', duration = 2000 }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  useEffect(() => {
    if (!inView) return
    let start = 0
    const step = end / (duration / 16)
    const timer = setInterval(() => {
      start += step
      if (start >= end) {
        setCount(end)
        clearInterval(timer)
      } else {
        setCount(Math.floor(start))
      }
    }, 16)
    return () => clearInterval(timer)
  }, [inView, end, duration])

  return (
    <span ref={ref}>
      {count.toLocaleString()}{suffix}
    </span>
  )
}

/* ─── Features ─────────────────────────────────────── */
const features = [
  {
    icon: Brain,
    title: 'AI Question Generation',
    description: 'Generate unlimited, curriculum-aligned ACT questions tailored to your weak areas in seconds.',
    color: 'text-brand-blue',
    glow: 'shadow-blue-500/20',
    border: 'border-blue-500/20',
  },
  {
    icon: Target,
    title: 'Smart Study Plans',
    description: 'AI crafts a personalized weekly study plan based on your score goals and schedule.',
    color: 'text-brand-violet',
    glow: 'shadow-violet-500/20',
    border: 'border-violet-500/20',
  },
  {
    icon: TrendingUp,
    title: 'Progress Tracking',
    description: 'Track score trends, skill mastery, and accuracy across every ACT topic in real time.',
    color: 'text-emerald-400',
    glow: 'shadow-emerald-500/20',
    border: 'border-emerald-500/20',
  },
  {
    icon: Award,
    title: 'Gamified Learning',
    description: 'Earn XP, unlock badges, maintain streaks, and level up as you master every skill.',
    color: 'text-amber-400',
    glow: 'shadow-amber-500/20',
    border: 'border-amber-500/20',
  },
]

/* ─── Steps ─────────────────────────────────────────── */
const steps = [
  {
    num: '01',
    title: 'Take a Diagnostic',
    description: 'Start with a short diagnostic test to benchmark your current ACT score and identify gaps.',
  },
  {
    num: '02',
    title: 'AI Builds Your Plan',
    description: 'Our AI analyzes your results and generates a personalized study plan with daily targets.',
  },
  {
    num: '03',
    title: 'Practice & Improve',
    description: 'Work through AI-generated lessons and quizzes, earning XP and watching your score climb.',
  },
]

/* ─── Stats ──────────────────────────────────────────── */
const stats = [
  { value: 4, suffix: '+', label: 'Avg. point increase' },
  { value: 50000, suffix: '+', label: 'Questions generated' },
  { value: 98, suffix: '%', label: 'Student satisfaction' },
]

/* ─── Component ─────────────────────────────────────── */
export default function Landing() {
  const navigate = useNavigate()
  const howItWorksRef = useRef(null)

  const scrollToHowItWorks = () => {
    howItWorksRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-space-base overflow-x-hidden">
      {/* ── Navbar ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 border-b border-space-border/50 bg-space-base/80 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-black tracking-tight text-slate-100">
            ACTstr<span className="relative inline-block">
              <span className="text-brand-blue orbit-letter">o</span>
            </span>yds
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login">
            <Button variant="ghost" size="sm">Log In</Button>
          </Link>
          <Link to="/register">
            <Button variant="primary" size="sm">Start Free</Button>
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="stars-bg relative min-h-screen flex flex-col items-center justify-center text-center px-4 pt-20">
        {/* Subtle radial glow */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[700px] h-[700px] rounded-full bg-brand-blue/5 blur-3xl" />
        </div>

        {/* Floating asteroid SVG */}
        <div className="absolute right-10 top-1/4 opacity-40 hidden lg:block asteroid-float">
          <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
            <ellipse cx="60" cy="60" rx="45" ry="38" fill="#1a2236" stroke="#2d3a4f" strokeWidth="2"/>
            <ellipse cx="40" cy="45" rx="8" ry="6" fill="#2d3a4f"/>
            <ellipse cx="70" cy="72" rx="5" ry="4" fill="#2d3a4f"/>
            <ellipse cx="55" cy="35" rx="3" ry="2" fill="#3d4a6f"/>
            <ellipse cx="80" cy="50" rx="4" ry="3" fill="#2d3a4f"/>
            <circle cx="30" cy="68" r="3" fill="#3d4a6f"/>
          </svg>
        </div>

        <div className="absolute left-12 bottom-1/4 opacity-30 hidden lg:block asteroid-float-slow">
          <svg width="70" height="70" viewBox="0 0 70 70" fill="none">
            <ellipse cx="35" cy="35" rx="28" ry="22" fill="#1a2236" stroke="#2d3a4f" strokeWidth="1.5"/>
            <ellipse cx="24" cy="28" rx="5" ry="4" fill="#2d3a4f"/>
            <ellipse cx="45" cy="42" rx="4" ry="3" fill="#2d3a4f"/>
          </svg>
        </div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="relative z-10 max-w-4xl mx-auto"
        >
          {/* Badge */}
          <motion.div variants={fadeInUp} className="mb-6">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-brand-blue/10 border border-brand-blue/30 text-brand-blue">
              <Zap size={12} />
              AI-Powered ACT Prep
            </span>
          </motion.div>

          {/* Title with orbiting O */}
          <motion.h1
            variants={fadeInUp}
            className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tight text-slate-100 mb-6 leading-tight"
          >
            ACTstr
            <span className="relative inline-block mx-0.5">
              <span className="text-brand-blue">o</span>
              {/* Orbiting dot */}
              <span className="orbit-dot-wrapper absolute inset-0 pointer-events-none">
                <span className="orbit-dot bg-amber-400 rounded-full" />
              </span>
            </span>
            yds
          </motion.h1>

          <motion.p
            variants={fadeInUp}
            className="text-xl sm:text-2xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            AI-Powered ACT Prep That{' '}
            <span className="text-slate-100 font-semibold">Actually Works</span>
          </motion.p>

          <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate('/register')}
              leftIcon={<Zap size={18} />}
            >
              Start Free
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={scrollToHowItWorks}
              rightIcon={<ChevronDown size={18} />}
            >
              See How It Works
            </Button>
          </motion.div>
        </motion.div>

        {/* Scroll cue */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.6 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <div className="w-6 h-10 rounded-full border-2 border-space-border flex items-start justify-center pt-2">
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
              className="w-1 h-2 bg-slate-500 rounded-full"
            />
          </div>
        </motion.div>
      </section>

      {/* ── Stats ── */}
      <section className="py-16 border-y border-space-border bg-space-deep">
        <div className="max-w-5xl mx-auto px-4">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center"
          >
            {stats.map((stat) => (
              <motion.div key={stat.label} variants={scaleIn}>
                <div className="text-4xl sm:text-5xl font-black text-brand-blue mb-2">
                  <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                </div>
                <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-black text-slate-100 mb-4">
              Everything You Need to Ace the ACT
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Powered by AI, built for students who want real results.
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {features.map((f) => {
              const Icon = f.icon
              return (
                <motion.div
                  key={f.title}
                  variants={fadeInUp}
                  className={`relative rounded-2xl border bg-space-card p-6 flex flex-col gap-4 shadow-xl ${f.glow} ${f.border} hover:scale-[1.02] transition-transform duration-300`}
                >
                  <div className={`w-12 h-12 rounded-xl bg-space-surface flex items-center justify-center ${f.color}`}>
                    <Icon size={24} />
                  </div>
                  <h3 className="font-bold text-slate-100 text-lg leading-snug">{f.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{f.description}</p>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section ref={howItWorksRef} className="py-24 px-4 bg-space-deep">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-black text-slate-100 mb-4">
              How It Works
            </h2>
            <p className="text-slate-400 text-lg max-w-xl mx-auto">
              Three simple steps to a higher ACT score.
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {steps.map((step, i) => (
              <motion.div key={step.num} variants={fadeInUp} className="relative">
                {/* Connector line */}
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-full w-full h-px bg-gradient-to-r from-brand-blue/40 to-transparent z-0" />
                )}
                <div className="relative z-10 flex flex-col gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-blue to-blue-600 flex items-center justify-center text-2xl font-black text-white shadow-lg shadow-blue-500/30">
                    {step.num}
                  </div>
                  <h3 className="text-xl font-bold text-slate-100">{step.title}</h3>
                  <p className="text-slate-400 leading-relaxed">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="rounded-3xl border border-brand-blue/30 bg-gradient-to-br from-brand-blue/10 via-space-card to-space-card p-12 shadow-2xl shadow-brand-blue/10"
          >
            <Star className="w-12 h-12 text-amber-400 mx-auto mb-4" />
            <h2 className="text-3xl sm:text-4xl font-black text-slate-100 mb-4">
              Ready to Boost Your Score?
            </h2>
            <p className="text-slate-400 text-lg mb-8">
              Join thousands of students who improved their ACT scores with AI-powered prep.
            </p>
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate('/register')}
              leftIcon={<Zap size={18} />}
            >
              Start Free Today
            </Button>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-space-border py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-slate-100 font-bold text-lg">ACTstroyds</span>
          <p className="text-slate-500 text-sm">
            &copy; {new Date().getFullYear()} ACTstroyds. All rights reserved.
          </p>
          <div className="flex gap-4 text-sm text-slate-500">
            <span className="hover:text-slate-300 cursor-pointer transition-colors">Privacy</span>
            <span className="hover:text-slate-300 cursor-pointer transition-colors">Terms</span>
            <span className="hover:text-slate-300 cursor-pointer transition-colors">Contact</span>
          </div>
        </div>
      </footer>

      <style>{`
        .stars-bg {
          background-image:
            radial-gradient(1px 1px at 10% 20%, rgba(255,255,255,0.6) 0%, transparent 100%),
            radial-gradient(1px 1px at 30% 70%, rgba(255,255,255,0.4) 0%, transparent 100%),
            radial-gradient(1.5px 1.5px at 50% 10%, rgba(255,255,255,0.5) 0%, transparent 100%),
            radial-gradient(1px 1px at 70% 40%, rgba(255,255,255,0.3) 0%, transparent 100%),
            radial-gradient(1px 1px at 85% 80%, rgba(255,255,255,0.4) 0%, transparent 100%),
            radial-gradient(1px 1px at 15% 55%, rgba(255,255,255,0.3) 0%, transparent 100%),
            radial-gradient(1.5px 1.5px at 60% 85%, rgba(255,255,255,0.5) 0%, transparent 100%),
            radial-gradient(1px 1px at 90% 15%, rgba(255,255,255,0.4) 0%, transparent 100%),
            radial-gradient(1px 1px at 40% 50%, rgba(255,255,255,0.2) 0%, transparent 100%),
            radial-gradient(1px 1px at 75% 60%, rgba(255,255,255,0.3) 0%, transparent 100%);
        }

        @keyframes orbit {
          from { transform: rotate(0deg) translateX(14px) rotate(0deg); }
          to   { transform: rotate(360deg) translateX(14px) rotate(-360deg); }
        }

        .orbit-dot-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          animation: orbit-spin 2.5s linear infinite;
        }

        @keyframes orbit-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }

        .orbit-dot {
          position: absolute;
          width: 8px;
          height: 8px;
          top: -4px;
          left: 50%;
          margin-left: -4px;
          transform-origin: 4px calc(50% + 50%);
          animation: orbit-dot-anim 2.5s linear infinite;
        }

        @keyframes orbit-dot-anim {
          from { transform: rotate(0deg) translateY(-18px); }
          to   { transform: rotate(360deg) translateY(-18px); }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50%      { transform: translateY(-18px) rotate(3deg); }
        }

        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50%      { transform: translateY(-12px) rotate(-2deg); }
        }

        .asteroid-float      { animation: float 6s ease-in-out infinite; }
        .asteroid-float-slow { animation: float-slow 9s ease-in-out infinite; }
      `}</style>
    </div>
  )
}

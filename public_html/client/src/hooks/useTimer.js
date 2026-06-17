import { useState, useEffect, useRef, useCallback } from 'react'

/**
 * Countdown timer hook.
 * @param {number} initialSeconds - total seconds to count down from
 * @param {Function} onExpire - called when timer reaches 0
 * @returns {{ timeLeft: number, isRunning: boolean, start: Function, pause: Function, reset: Function }}
 */
export function useTimer(initialSeconds, onExpire) {
  const [timeLeft, setTimeLeft] = useState(initialSeconds)
  const [isRunning, setIsRunning] = useState(false)
  const intervalRef = useRef(null)
  const onExpireRef = useRef(onExpire)

  // Keep the callback ref up to date without restarting the timer
  useEffect(() => {
    onExpireRef.current = onExpire
  }, [onExpire])

  useEffect(() => {
    if (!isRunning) return

    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current)
          setIsRunning(false)
          onExpireRef.current?.()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(intervalRef.current)
  }, [isRunning])

  const start = useCallback(() => {
    setIsRunning(true)
  }, [])

  const pause = useCallback(() => {
    setIsRunning(false)
    clearInterval(intervalRef.current)
  }, [])

  const reset = useCallback((newSeconds) => {
    clearInterval(intervalRef.current)
    setIsRunning(false)
    setTimeLeft(newSeconds !== undefined ? newSeconds : initialSeconds)
  }, [initialSeconds])

  return { timeLeft, isRunning, start, pause, reset }
}

export default useTimer

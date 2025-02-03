"use client"

interface TimerProps {
  time: number
}

export default function Timer({ time }: TimerProps) {
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  return <div className="text-xl font-semibold text-purple-600">Time: {formatTime(time)}</div>
}


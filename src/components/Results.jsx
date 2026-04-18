import { Trophy, RotateCcw, Home } from 'lucide-react'

export default function Results({ deck, stats, onHome, onStudyAgain }) {
  const total = stats.know + stats.almost + stats.nope
  const percentage = Math.round((stats.know / total) * 100)

  const getMessage = () => {
    if (percentage === 100) return { text: "Perfect score! Outstanding! 🏆", color: "text-green-600" }
    if (percentage >= 70) return { text: "Great job! Keep it up! 💪", color: "text-blue-600" }
    if (percentage >= 40) return { text: "Good effort! Practice more! 📚", color: "text-amber-600" }
    return { text: "Keep studying, you'll get there! 🎯", color: "text-red-500" }
  }

  const message = getMessage()

  return (
    <div className="max-w-lg mx-auto px-4 py-12 text-center">

      {/* Trophy */}
      <div className="flex justify-center mb-4">
        <div className="bg-yellow-100 p-4 rounded-full">
          <Trophy className="w-10 h-10 text-yellow-500" />
        </div>
      </div>

      <h1 className="text-2xl font-semibold text-gray-900 mb-2">Session Complete!</h1>
      <p className={`text-base font-medium mb-8 ${message.color}`}>{message.text}</p>

      {/* Score circle */}
      <div className="flex justify-center mb-8">
        <div className="w-32 h-32 rounded-full border-8 border-purple-500 flex flex-col items-center justify-center">
          <p className="text-3xl font-bold text-purple-600">{percentage}%</p>
          <p className="text-xs text-gray-400">mastered</p>
        </div>
      </div>

      {/* Stats breakdown */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <p className="text-2xl font-bold text-green-600">{stats.know}</p>
          <p className="text-xs text-green-500 mt-1">Got it</p>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <p className="text-2xl font-bold text-amber-600">{stats.almost}</p>
          <p className="text-xs text-amber-500 mt-1">Almost</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-2xl font-bold text-red-500">{stats.nope}</p>
          <p className="text-xs text-red-400 mt-1">Nope</p>
        </div>
      </div>

      {/* Deck info */}
      <p className="text-sm text-gray-400 mb-8">
        Studied <span className="font-medium text-gray-600">{deck.title}</span> · {total} cards
      </p>

      {/* Buttons */}
      <div className="flex gap-3">
        <button
          onClick={onHome}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 font-medium transition-colors"
        >
          <Home className="w-4 h-4" />
          Home
        </button>
        <button
          onClick={onStudyAgain}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-medium transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          Study again
        </button>
      </div>

    </div>
  )
}
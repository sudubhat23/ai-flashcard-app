import { ArrowLeft } from 'lucide-react'
import { useState, useMemo } from 'react'

export default function StudyMode({ deck, onBack, onSessionDone }) {
  const [idx, setIdx] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [sessionStats, setSessionStats] = useState({ know: 0, almost: 0, nope: 0 })

  const cards = useMemo(() => {
  return [...deck.cards].sort(() => Math.random() - 0.5)
}, [deck])
  const card = cards[idx]
  const progress = Math.round((idx / cards.length) * 100)

  const rate = (type) => {
    const updated = { ...sessionStats, [type]: sessionStats[type] + 1 }
    setSessionStats(updated)
    if (idx < cards.length - 1) {
      setIdx(i => i + 1)
      setFlipped(false)
    } else {
      onSessionDone(updated)
    }
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8">

      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <span className="text-sm text-gray-500">{idx + 1} / {cards.length}</span>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-100 rounded-full h-1.5 mb-8">
        <div
          className="bg-purple-500 h-1.5 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Flashcard */}
      <div
        className="card-flip h-64 mb-6 cursor-pointer"
        onClick={() => setFlipped(f => !f)}
      >
        <div className={`card-inner h-full ${flipped ? 'flipped' : ''}`}>

          {/* Front */}
          <div className="card-face bg-purple-50 border-2 border-purple-200 rounded-2xl flex flex-col items-center justify-center p-8 text-center">
            <p className="text-xs font-semibold text-purple-400 uppercase tracking-widest mb-4">Question</p>
            <p className="text-lg font-medium text-gray-800 leading-relaxed">{card.q}</p>
            <p className="text-xs text-purple-300 mt-6">Tap to reveal answer</p>
          </div>

          {/* Back */}
          <div className="card-face card-back bg-white border-2 border-purple-500 rounded-2xl flex flex-col items-center justify-center p-8 text-center">
            <p className="text-xs font-semibold text-purple-400 uppercase tracking-widest mb-4">Answer</p>
            <p className="text-base text-gray-700 leading-relaxed">{card.a}</p>
          </div>

        </div>
      </div>

      {/* Buttons */}
      {flipped ? (
        <div className="flex gap-3">
          <button
            onClick={() => rate('nope')}
            className="flex-1 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-medium transition-colors"
          >
            Nope
          </button>
          <button
            onClick={() => rate('almost')}
            className="flex-1 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-medium transition-colors"
          >
            Almost
          </button>
          <button
            onClick={() => rate('know')}
            className="flex-1 py-3 rounded-xl bg-green-500 hover:bg-green-600 text-white font-medium transition-colors"
          >
            Got it!
          </button>
        </div>
      ) : (
        <button
          onClick={() => setFlipped(true)}
          className="w-full py-3 rounded-xl border-2 border-purple-500 text-purple-600 font-medium hover:bg-purple-50 transition-colors"
        >
          Flip card
        </button>
      )}

    </div>
  )
}
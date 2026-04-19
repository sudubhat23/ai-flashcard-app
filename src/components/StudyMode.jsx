import { useState, useMemo } from 'react'
import { ArrowLeft } from 'lucide-react'

export default function StudyMode({ deck, onBack, onSessionDone }) {
  const [idx, setIdx] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [sessionStats, setSessionStats] = useState({ know: 0, almost: 0, nope: 0 })
  const [explanation, setExplanation] = useState(null)
  const [loadingExp, setLoadingExp] = useState(false)

  const cards = useMemo(() => {
    return [...deck.cards].sort(() => Math.random() - 0.5)
  }, [deck])

  const card = cards[idx]
  const progress = Math.round((idx / cards.length) * 100)

  const getExplanation = async (type) => {
    setLoadingExp(true)
    setExplanation(null)
    try {
      const prompt = type === 'nope'
        ? `The student got this flashcard wrong. Give a clear, detailed explanation (4-6 sentences) to help them fully understand it.
Question: ${card.q}
Answer: ${card.a}
Explain in simple terms why this is the answer and give a helpful example if possible.`
        : `The student almost got this flashcard right. Give a short helpful hint (2-3 sentences) to reinforce their understanding.
Question: ${card.q}
Answer: ${card.a}
Give a brief clarification or memory tip.`

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [{ role: 'user', content: prompt }]
        })
      })
      const data = await response.json()
      setExplanation(data.choices[0].message.content)
    } catch (e) {
      setExplanation('Could not load explanation. Please try again.')
    }
    setLoadingExp(false)
  }

  const rate = async (type) => {
    const updated = { ...sessionStats, [type]: sessionStats[type] + 1 }
    setSessionStats(updated)

    if (type === 'nope' || type === 'almost') {
      await getExplanation(type)
    } else {
      goNext(updated)
    }
  }

  const goNext = (stats) => {
    setExplanation(null)
    if (idx < cards.length - 1) {
      setIdx(i => i + 1)
      setFlipped(false)
    } else {
      onSessionDone(stats || sessionStats)
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
        onClick={() => !explanation && setFlipped(f => !f)}
      >
        <div className={`card-inner h-full ${flipped ? 'flipped' : ''}`}>
          <div className="card-face bg-purple-50 border-2 border-purple-200 rounded-2xl flex flex-col items-center justify-center p-8 text-center">
            <p className="text-xs font-semibold text-purple-400 uppercase tracking-widest mb-4">Question</p>
            <p className="text-lg font-medium text-gray-800 leading-relaxed">{card.q}</p>
            <p className="text-xs text-purple-300 mt-6">Tap to reveal answer</p>
          </div>
          <div className="card-face card-back bg-white border-2 border-purple-500 rounded-2xl flex flex-col items-center justify-center p-8 text-center">
            <p className="text-xs font-semibold text-purple-400 uppercase tracking-widest mb-4">Answer</p>
            <p className="text-base text-gray-700 leading-relaxed">{card.a}</p>
          </div>
        </div>
      </div>

      {/* Rating buttons */}
      {!explanation && !loadingExp && (
        flipped ? (
          <div className="flex gap-3">
            <button onClick={() => rate('nope')}
              className="flex-1 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-medium transition-colors">
              Nope
            </button>
            <button onClick={() => rate('almost')}
              className="flex-1 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-medium transition-colors">
              Almost
            </button>
            <button onClick={() => rate('know')}
              className="flex-1 py-3 rounded-xl bg-green-500 hover:bg-green-600 text-white font-medium transition-colors">
              Got it!
            </button>
          </div>
        ) : (
          <button onClick={() => setFlipped(true)}
            className="w-full py-3 rounded-xl border-2 border-purple-500 text-purple-600 font-medium hover:bg-purple-50 transition-colors">
            Flip card
          </button>
        )
      )}

      {/* Loading explanation */}
      {loadingExp && (
        <div className="flex flex-col items-center justify-center py-6 gap-3">
          <svg className="animate-spin w-6 h-6 text-purple-500" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
          </svg>
          <p className="text-sm text-gray-500">AI is generating explanation...</p>
        </div>
      )}

      {/* Explanation box */}
      {explanation && !loadingExp && (
        <div className="mt-2 fade-in">
          <div className={`rounded-2xl p-5 border-2 mb-4 ${
            sessionStats.nope > (sessionStats.almost + sessionStats.know)
              ? 'bg-red-50 border-red-200'
              : 'bg-amber-50 border-amber-200'
          }`}>
            <p className={`text-xs font-semibold uppercase tracking-widest mb-2 ${
              sessionStats.nope > (sessionStats.almost + sessionStats.know)
                ? 'text-red-400'
                : 'text-amber-500'
            }`}>
              {sessionStats.nope > (sessionStats.almost + sessionStats.know)
                ? '📖 Full Explanation'
                : '💡 Quick Hint'}
            </p>
            <p className="text-sm text-gray-700 leading-relaxed">{explanation}</p>
          </div>
          <button
            onClick={() => goNext(sessionStats)}
            className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-medium transition-colors"
          >
            Next card →
          </button>
        </div>
      )}

    </div>
  )
}
import { useState, useMemo } from 'react'
import { ArrowLeft, CheckCircle, XCircle, Send } from 'lucide-react'
import { playSound } from '../../utils/audio'

export default function TypeMode({ user, deck, onBack, onSessionDone, onChangeMode }) {
  const [idx, setIdx] = useState(0)
  const [userAnswer, setUserAnswer] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [sessionStats, setSessionStats] = useState({ know: 0, almost: 0, nope: 0 })

  const cards = useMemo(() => {
    return [...(deck.cards || [])].sort(() => Math.random() - 0.5)
  }, [deck])

  const card = cards[idx]
  const soundEnabled = user.settings?.soundEffects ?? true

  const checkAnswer = (e) => {
    e?.preventDefault()
    if (!userAnswer.trim() || submitted) return

    const normUser = userAnswer.toLowerCase().trim().replace(/[^\w\s]/gi, '')
    const normCorrect = card.a.toLowerCase().trim().replace(/[^\w\s]/gi, '')

    // Check exact or partial inclusion
    const match = normUser === normCorrect ||
                  (normCorrect.length > 5 && normUser.includes(normCorrect)) ||
                  (normUser.length > 5 && normCorrect.includes(normUser))

    setIsCorrect(match)
    setSubmitted(true)

    if (match) {
      playSound('correct', soundEnabled)
      setSessionStats(prev => ({ ...prev, know: prev.know + 1 }))
    } else {
      playSound('wrong', soundEnabled)
      setSessionStats(prev => ({ ...prev, nope: prev.nope + 1 }))
    }
  }

  const handleNext = () => {
    setUserAnswer('')
    setSubmitted(false)
    setIsCorrect(false)

    if (idx < cards.length - 1) {
      setIdx(i => i + 1)
    } else {
      playSound('victory', soundEnabled)
      onSessionDone(sessionStats)
    }
  }

  if (!card) return null

  return (
    <div className="max-w-xl mx-auto px-4 py-8 fade-in space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-slate-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Dashboard
        </button>

        {/* Mode Switcher */}
        <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-xl">
          <button
            onClick={() => onChangeMode('flip')}
            className="px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-400 hover:text-slate-200"
          >
            Flip
          </button>
          <button
            onClick={() => onChangeMode('quiz')}
            className="px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-400 hover:text-slate-200"
          >
            Quiz
          </button>
          <button
            onClick={() => onChangeMode('type')}
            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-600 text-white shadow-sm"
          >
            Type
          </button>
        </div>

        <span className="text-xs font-bold text-slate-400">
          {idx + 1} / {cards.length}
        </span>
      </div>

      {/* Main Question Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 glass-card shadow-2xl space-y-6">
        <div>
          <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-widest">
            Type Your Recall Answer
          </span>
          <h2 className="text-lg font-bold text-slate-100 mt-2 leading-relaxed">
            {card.q}
          </h2>
        </div>

        <form onSubmit={checkAnswer} className="space-y-4">
          <div>
            <textarea
              rows={3}
              disabled={submitted}
              value={userAnswer}
              onChange={e => setUserAnswer(e.target.value)}
              placeholder="Type your answer here..."
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500 resize-none"
            />
          </div>

          {!submitted && (
            <button
              type="submit"
              disabled={!userAnswer.trim()}
              className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              Submit Answer
            </button>
          )}
        </form>

        {/* Feedback Section */}
        {submitted && (
          <div className="space-y-4 pt-4 border-t border-slate-800 fade-in">
            <div className={`p-4 rounded-2xl border flex items-start gap-3 ${
              isCorrect
                ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                : 'bg-rose-500/10 border-rose-500/40 text-rose-300'
            }`}>
              {isCorrect ? <CheckCircle className="w-5 h-5 flex-shrink-0 text-emerald-400" /> : <XCircle className="w-5 h-5 flex-shrink-0 text-rose-400" />}
              <div>
                <p className="font-bold text-sm">
                  {isCorrect ? 'Great Recall! Spot on.' : 'Not quite right.'}
                </p>
                <div className="mt-2 text-xs space-y-1">
                  <p className="text-slate-400">Expected Answer:</p>
                  <p className="font-semibold text-slate-100 bg-slate-950 p-2 rounded-xl border border-slate-800">
                    {card.a}
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={handleNext}
              className="w-full py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm transition-all border border-slate-700"
            >
              {idx < cards.length - 1 ? 'Next Question →' : 'Finish Practice'}
            </button>
          </div>
        )}
      </div>

    </div>
  )
}

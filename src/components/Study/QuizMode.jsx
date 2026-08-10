import { useState, useMemo } from 'react'
import { ArrowLeft, Check, X, Trophy, Sparkles } from 'lucide-react'
import { playSound } from '../../utils/audio'

export default function QuizMode({ user, deck, onBack, onSessionDone, onChangeMode }) {
  const [idx, setIdx] = useState(0)
  const [selectedOpt, setSelectedOpt] = useState(null)
  const [isAnswered, setIsAnswered] = useState(false)
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [sessionStats, setSessionStats] = useState({ know: 0, almost: 0, nope: 0 })

  const cards = useMemo(() => {
    return [...(deck.cards || [])].sort(() => Math.random() - 0.5)
  }, [deck])

  const card = cards[idx]
  const soundEnabled = user.settings?.soundEffects ?? true

  // Generate 4 Multiple Choice Options (1 correct + 3 distractors)
  const options = useMemo(() => {
    if (!card) return []
    const correctAnswer = card.a

    // Gather answers from other cards in deck
    const otherAnswers = (deck.cards || [])
      .filter(c => c.a !== correctAnswer)
      .map(c => c.a)

    const shuffledOthers = [...otherAnswers].sort(() => Math.random() - 0.5)
    const distractors = shuffledOthers.slice(0, 3)

    // Fallback distractor generators if deck has few cards
    while (distractors.length < 3) {
      distractors.push(`Option ${distractors.length + 2}: Alternative concept`)
    }

    const pool = [correctAnswer, ...distractors]
    return pool.sort(() => Math.random() - 0.5)
  }, [card, deck])

  const handleSelectOption = (opt) => {
    if (isAnswered) return
    setSelectedOpt(opt)
    setIsAnswered(true)

    const isCorrect = opt === card.a

    if (isCorrect) {
      playSound('correct', soundEnabled)
      setScore(s => s + 100 + streak * 20)
      setStreak(st => st + 1)
      setSessionStats(prev => ({ ...prev, know: prev.know + 1 }))
    } else {
      playSound('wrong', soundEnabled)
      setStreak(0)
      setSessionStats(prev => ({ ...prev, nope: prev.nope + 1 }))
    }
  }

  const handleNext = () => {
    setIsAnswered(false)
    setSelectedOpt(null)

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
            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-600 text-white shadow-sm"
          >
            Quiz
          </button>
          <button
            onClick={() => onChangeMode('type')}
            className="px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-400 hover:text-slate-200"
          >
            Type
          </button>
        </div>

        <span className="text-xs font-bold text-slate-400">
          {idx + 1} / {cards.length}
        </span>
      </div>

      {/* Score & Combo Bar */}
      <div className="flex items-center justify-between bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400">
          <Trophy className="w-4 h-4" />
          <span>Score: {score} pts</span>
        </div>

        {streak > 1 && (
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 animate-bounce">
            <Sparkles className="w-4 h-4" />
            <span>{streak}x Combo Streak!</span>
          </div>
        )}
      </div>

      {/* Question Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 glass-card shadow-2xl space-y-6">
        <div>
          <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-widest">
            Multiple Choice Question
          </span>
          <h2 className="text-lg font-bold text-slate-100 mt-2 leading-relaxed">
            {card.q}
          </h2>
        </div>

        {/* Options */}
        <div className="space-y-3">
          {options.map((opt, i) => {
            let style = "bg-slate-950/80 border-slate-800 text-slate-200 hover:border-indigo-500/50"

            if (isAnswered) {
              if (opt === card.a) {
                style = "bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold"
              } else if (opt === selectedOpt) {
                style = "bg-rose-500/20 border-rose-500 text-rose-300 font-bold"
              } else {
                style = "bg-slate-950/40 border-slate-900 text-slate-600 opacity-50"
              }
            }

            return (
              <button
                key={i}
                disabled={isAnswered}
                onClick={() => handleSelectOption(opt)}
                className={`w-full text-left p-4 rounded-2xl border text-sm transition-all flex items-center justify-between ${style}`}
              >
                <span>{opt}</span>
                {isAnswered && opt === card.a && <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />}
                {isAnswered && opt === selectedOpt && opt !== card.a && <X className="w-4 h-4 text-rose-400 flex-shrink-0" />}
              </button>
            )
          })}
        </div>

        {/* Next Button */}
        {isAnswered && (
          <button
            onClick={handleNext}
            className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm transition-all shadow-lg fade-in"
          >
            {idx < cards.length - 1 ? 'Next Question →' : 'Finish Quiz'}
          </button>
        )}
      </div>

    </div>
  )
}

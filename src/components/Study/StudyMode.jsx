import { useState, useMemo, useEffect, useCallback } from 'react'
import { ArrowLeft, Volume2, Sparkles, HelpCircle, Edit3, RotateCcw, Lightbulb } from 'lucide-react'
import { playSound, speakText } from '../../utils/audio'

export default function StudyMode({ user, deck, onBack, onSessionDone, onChangeMode }) {
  const [idx, setIdx] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [sessionStats, setSessionStats] = useState({ know: 0, almost: 0, nope: 0 })
  const [explanation, setExplanation] = useState(null)
  const [loadingExp, setLoadingExp] = useState(false)

  // Shuffle deck cards for studying
  const cards = useMemo(() => {
    return [...(deck.cards || [])].sort(() => Math.random() - 0.5)
  }, [deck])

  const card = cards[idx]
  const progress = Math.round(((idx) / cards.length) * 100)
  const soundEnabled = user.settings?.soundEffects ?? true
  const speechSpeed = user.settings?.speechSpeed ?? 1

  const handleFlip = useCallback(() => {
    if (explanation || loadingExp) return
    setFlipped(f => {
      const nextState = !f
      playSound('flip', soundEnabled)
      return nextState
    })
  }, [explanation, loadingExp, soundEnabled])

  const getAIExplanation = async (type) => {
    setLoadingExp(true)
    setExplanation(null)
    const apiKey = user.settings?.groqApiKey || import.meta.env.VITE_GROQ_API_KEY

    if (!apiKey) {
      setExplanation(
        `💡 Hint for "${card.q}": The core answer is "${card.a}". Focus on the key definition and key terminology to remember this next time!`
      )
      setLoadingExp(false)
      return
    }

    try {
      const prompt = type === 'nope'
        ? `The student got this flashcard wrong. Provide a clear, encouraging 3-sentence explanation and a practical tip to remember it.
Question: ${card.q}
Answer: ${card.a}`
        : `The student almost got this flashcard right. Provide a concise 2-sentence memory hint.
Question: ${card.q}
Answer: ${card.a}`

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [{ role: 'user', content: prompt }]
        })
      })
      const data = await response.json()
      if (response.ok && data.choices?.[0]?.message?.content) {
        setExplanation(data.choices[0].message.content)
      } else {
        setExplanation(`💡 Tip: Key point for "${card.q}" is "${card.a}".`)
      }
    } catch (e) {
      setExplanation(`💡 Tip: Key answer for "${card.q}" is "${card.a}".`)
    } finally {
      setLoadingExp(false)
    }
  }

  const handleRate = async (type) => {
    if (type === 'know') {
      playSound('correct', soundEnabled)
    } else {
      playSound('wrong', soundEnabled)
    }

    const updated = { ...sessionStats, [type]: sessionStats[type] + 1 }
    setSessionStats(updated)

    if (type === 'nope' || type === 'almost') {
      await getAIExplanation(type)
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
      playSound('victory', soundEnabled)
      onSessionDone(stats || sessionStats)
    }
  }

  const handleTTS = (e, text) => {
    e.stopPropagation()
    speakText(text, speechSpeed)
  }

  // Keyboard Shortcuts Listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return

      if (e.code === 'Space') {
        e.preventDefault()
        handleFlip()
      } else if (flipped && !explanation && !loadingExp) {
        if (e.key === '1') handleRate('nope')
        else if (e.key === '2') handleRate('almost')
        else if (e.key === '3') handleRate('know')
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [flipped, explanation, loadingExp, handleFlip])

  if (!card) return null

  return (
    <div className="max-w-xl mx-auto px-4 py-8 fade-in space-y-6">
      
      {/* Navigation Header */}
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
            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-purple-600 text-white shadow-sm"
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
            className="px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-400 hover:text-slate-200"
          >
            Type
          </button>
        </div>

        <span className="text-xs font-bold text-slate-400">
          {idx + 1} / {cards.length}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-900 border border-slate-800 rounded-full h-2 overflow-hidden">
        <div
          className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* 3D Flashcard Container */}
      <div
        className="card-flip h-72 cursor-pointer select-none"
        onClick={handleFlip}
      >
        <div className={`card-inner h-full ${flipped ? 'flipped' : ''}`}>
          {/* Question Face */}
          <div className="card-face bg-slate-900 border-2 border-purple-500/30 hover:border-purple-500/60 rounded-3xl p-8 flex flex-col items-center justify-between text-center glass-card shadow-2xl transition-all">
            <div className="w-full flex items-center justify-between text-xs text-purple-400 font-bold uppercase tracking-widest">
              <span>Question</span>
              <button
                onClick={(e) => handleTTS(e, card.q)}
                className="p-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 transition-all"
                title="Read question aloud"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>

            <p className="text-lg font-bold text-slate-100 leading-relaxed max-w-md">
              {card.q}
            </p>

            <p className="text-xs text-purple-400/80 font-medium animate-pulse">
              Tap card or press Space to flip ↵
            </p>
          </div>

          {/* Answer Face */}
          <div className="card-face card-back bg-slate-900 border-2 border-indigo-500/50 rounded-3xl p-8 flex flex-col items-center justify-between text-center glass-card shadow-2xl">
            <div className="w-full flex items-center justify-between text-xs text-indigo-400 font-bold uppercase tracking-widest">
              <span>Answer</span>
              <button
                onClick={(e) => handleTTS(e, card.a)}
                className="p-2 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 transition-all"
                title="Read answer aloud"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>

            <p className="text-base font-medium text-slate-200 leading-relaxed max-w-md">
              {card.a}
            </p>

            <p className="text-[11px] text-slate-500">
              Rate your memory recall below
            </p>
          </div>
        </div>
      </div>

      {/* Action Rating Buttons */}
      {!explanation && !loadingExp && (
        flipped ? (
          <div className="grid grid-cols-3 gap-3 fade-in">
            <button
              onClick={() => handleRate('nope')}
              className="py-3 rounded-2xl bg-rose-500/20 hover:bg-rose-500 border border-rose-500/40 text-rose-300 hover:text-white font-bold text-sm transition-all flex flex-col items-center justify-center"
            >
              <span>1. Need Review</span>
              <span className="text-[10px] font-normal opacity-80">(Press 1)</span>
            </button>
            <button
              onClick={() => handleRate('almost')}
              className="py-3 rounded-2xl bg-amber-500/20 hover:bg-amber-500 border border-amber-500/40 text-amber-300 hover:text-white font-bold text-sm transition-all flex flex-col items-center justify-center"
            >
              <span>2. Almost</span>
              <span className="text-[10px] font-normal opacity-80">(Press 2)</span>
            </button>
            <button
              onClick={() => handleRate('know')}
              className="py-3 rounded-2xl bg-emerald-500/20 hover:bg-emerald-500 border border-emerald-500/40 text-emerald-300 hover:text-white font-bold text-sm transition-all flex flex-col items-center justify-center"
            >
              <span>3. Got it!</span>
              <span className="text-[10px] font-normal opacity-80">(Press 3)</span>
            </button>
          </div>
        ) : (
          <button
            onClick={handleFlip}
            className="w-full py-3.5 rounded-2xl border border-purple-500/40 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 font-bold text-sm transition-all"
          >
            Show Answer (Space)
          </button>
        )
      )}

      {/* Loading AI Explanation */}
      {loadingExp && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex items-center justify-center gap-3 text-xs text-purple-400 fade-in">
          <div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
          <span>Generating smart AI explanation hint...</span>
        </div>
      )}

      {/* AI Explanation / Memory Hint Drawer */}
      {explanation && !loadingExp && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 fade-in shadow-xl">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
            <Lightbulb className="w-4 h-4" />
            <span>AI Memory Assistant</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {explanation}
          </p>
          <button
            onClick={() => goNext(sessionStats)}
            className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition-all shadow-md"
          >
            Continue to Next Card →
          </button>
        </div>
      )}

    </div>
  )
}

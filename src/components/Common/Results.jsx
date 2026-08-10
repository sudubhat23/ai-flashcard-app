import { Trophy, RotateCcw, Home, Sparkles, Check, AlertTriangle, X } from 'lucide-react'

export default function Results({ deck, stats, onHome, onStudyAgain }) {
  const total = (stats.know || 0) + (stats.almost || 0) + (stats.nope || 0)
  const percentage = total > 0 ? Math.round(((stats.know || 0) / total) * 100) : 0

  const getMessage = () => {
    if (percentage === 100) return { text: "Flawless Score! Outstanding Mastery! 🏆", color: "text-emerald-400" }
    if (percentage >= 70) return { text: "Great Job! Solid Understanding! 💪", color: "text-purple-400" }
    if (percentage >= 40) return { text: "Good Effort! Keep Practicing! 📚", color: "text-amber-400" }
    return { text: "Keep Studying, You'll Get There! 🎯", color: "text-rose-400" }
  }

  const msg = getMessage()

  return (
    <div className="max-w-md mx-auto px-4 py-12 text-center fade-in space-y-8">
      
      {/* Trophy Badge */}
      <div className="relative inline-block">
        <div className="bg-gradient-to-tr from-amber-500 to-yellow-400 p-5 rounded-3xl shadow-xl shadow-amber-500/20 text-slate-950 inline-block animate-bounce">
          <Trophy className="w-12 h-12" />
        </div>
        <div className="absolute -top-2 -right-2 bg-purple-600 text-white p-1.5 rounded-full shadow">
          <Sparkles className="w-4 h-4" />
        </div>
      </div>

      <div>
        <h1 className="text-3xl font-extrabold text-slate-100">Session Complete!</h1>
        <p className={`text-sm font-semibold mt-2 ${msg.color}`}>{msg.text}</p>
        <p className="text-xs text-slate-400 mt-1">Studied <span className="text-slate-200 font-semibold">{deck.title}</span></p>
      </div>

      {/* Score Ring / Badge */}
      <div className="flex justify-center">
        <div className="w-40 h-40 rounded-full border-8 border-purple-500/30 bg-slate-900 flex flex-col items-center justify-center shadow-2xl relative">
          <span className="text-4xl font-extrabold gradient-text">{percentage}%</span>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest mt-1">Mastery</span>
        </div>
      </div>

      {/* Detailed Breakdown */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 text-center">
          <div className="flex justify-center text-emerald-400 mb-1">
            <Check className="w-5 h-5" />
          </div>
          <p className="text-xl font-bold text-emerald-400">{stats.know || 0}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Got It</p>
        </div>

        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 text-center">
          <div className="flex justify-center text-amber-400 mb-1">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <p className="text-xl font-bold text-amber-400">{stats.almost || 0}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Almost</p>
        </div>

        <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-4 text-center">
          <div className="flex justify-center text-rose-400 mb-1">
            <X className="w-5 h-5" />
          </div>
          <p className="text-xl font-bold text-rose-400">{stats.nope || 0}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Review</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={onHome}
          className="flex-1 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 font-semibold text-xs flex items-center justify-center gap-2 transition-all"
        >
          <Home className="w-4 h-4 text-purple-400" />
          Dashboard
        </button>

        <button
          onClick={onStudyAgain}
          className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg transition-all"
        >
          <RotateCcw className="w-4 h-4" />
          Study Again
        </button>
      </div>

    </div>
  )
}

import { useState } from 'react'
import { Brain, Flame, Settings, LogOut, User, Sparkles, ChevronDown } from 'lucide-react'

export default function Header({ user, onOpenProfile, onOpenSettings, onLogout }) {
  const [dropdownOpen, setDropdownOpen] = useState(false)

  return (
    <header className="bg-slate-900/90 border-b border-slate-800 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        
        {/* Left: Brand */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div className="bg-gradient-to-tr from-purple-600 to-indigo-600 p-2 rounded-xl text-white shadow-lg shadow-purple-500/20">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-slate-100 flex items-center gap-1.5">
              AI Flashcards
              <span className="bg-purple-500/10 border border-purple-500/30 text-purple-400 text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full">
                v2.0
              </span>
            </h1>
            <p className="text-xs text-slate-400 hidden sm:flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-purple-400" />
              Interactive Learning Platform
            </p>
          </div>
        </div>

        {/* Right: Streak & User Actions */}
        <div className="flex items-center gap-3">
          {/* Streak Badge */}
          <div
            className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm"
            title="Daily Study Streak"
          >
            <Flame className="w-4 h-4 text-amber-400 fill-amber-400 animate-pulse" />
            <span>{user.streakCount || 1} Day Streak</span>
          </div>

          {/* Settings Button */}
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-slate-100 border border-slate-700/60 transition-all"
            title="Settings & API Key"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* User Profile Menu Dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 bg-slate-800/90 hover:bg-slate-800 border border-slate-700/80 px-3 py-1.5 rounded-xl transition-all"
            >
              <span className="text-lg">{user.avatar || '⚡'}</span>
              <span className="text-xs font-semibold text-slate-200 hidden md:inline max-w-[100px] truncate">
                {user.displayName || user.username}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {dropdownOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
                <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl z-20 overflow-hidden py-1 fade-in">
                  <div className="px-4 py-2 border-b border-slate-800">
                    <p className="text-xs font-semibold text-slate-200 truncate">
                      {user.displayName || user.username}
                    </p>
                    <p className="text-[10px] text-slate-500 truncate">@{user.username}</p>
                  </div>

                  <button
                    onClick={() => { setDropdownOpen(false); onOpenProfile(); }}
                    className="w-full px-4 py-2 text-xs text-left text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-2 transition-all"
                  >
                    <User className="w-4 h-4 text-purple-400" />
                    User Profile
                  </button>

                  <button
                    onClick={() => { setDropdownOpen(false); onOpenSettings(); }}
                    className="w-full px-4 py-2 text-xs text-left text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-2 transition-all"
                  >
                    <Settings className="w-4 h-4 text-indigo-400" />
                    App Settings
                  </button>

                  <div className="border-t border-slate-800 my-1" />

                  <button
                    onClick={() => { setDropdownOpen(false); onLogout(); }}
                    className="w-full px-4 py-2 text-xs text-left text-rose-400 hover:bg-rose-500/10 flex items-center gap-2 transition-all"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </>
            )}
          </div>

        </div>
      </div>
    </header>
  )
}

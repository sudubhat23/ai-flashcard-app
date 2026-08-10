import { useState } from 'react'
import { X, User, Key, Download, Check, Shield } from 'lucide-react'
import { authService } from '../../services/authService'
import { storageService } from '../../services/storageService'

export default function ProfileModal({ user, onClose, onUpdateUser }) {
  const [displayName, setDisplayName] = useState(user.displayName || user.username)
  const [avatar, setAvatar] = useState(user.avatar || '⚡')
  const [newPassword, setNewPassword] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  const handleSave = (e) => {
    e.preventDefault()
    setSuccessMsg('')
    setErrorMsg('')

    try {
      const updates = {
        displayName,
        avatar
      }
      if (newPassword.trim()) {
        if (newPassword.trim().length < 3) {
          throw new Error('Password must be at least 3 characters long.')
        }
        updates.password = newPassword.trim()
      }

      const updated = authService.updateProfile(user.username, updates)
      onUpdateUser(updated)
      setSuccessMsg('Profile updated successfully!')
      setNewPassword('')
    } catch (err) {
      setErrorMsg(err.message)
    }
  }

  const handleExportBackup = () => {
    storageService.exportUserData(user.username)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-600/20 text-purple-400 border border-purple-500/30 flex items-center justify-center text-xl">
              {avatar}
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">User Profile</h2>
              <p className="text-xs text-slate-400">Manage account & settings</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* User Overview Box */}
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Account Identifier</p>
              <p className="text-base font-bold text-purple-400">@{user.username}</p>
              <p className="text-xs text-slate-400 mt-1">
                Joined: {new Date(user.createdAt || Date.now()).toLocaleDateString()}
              </p>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold">
                🔥 {user.streakCount || 1} Day Streak
              </span>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            {/* Display Name */}
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-1.5">
                Display Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            {/* Avatar Selector */}
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-1.5">
                Avatar Icon
              </label>
              <div className="flex gap-2 overflow-x-auto py-1">
                {authService.DEFAULT_AVATARS.map(emoji => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setAvatar(emoji)}
                    className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all ${
                      avatar === emoji
                        ? 'bg-purple-600 text-white ring-2 ring-purple-400 scale-105'
                        : 'bg-slate-950 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-1.5">
                Change Password <span className="text-slate-500 lowercase">(leave blank to keep unchanged)</span>
              </label>
              <div className="relative">
                <Key className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="New password..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            {/* Feedback messages */}
            {successMsg && (
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 text-xs text-emerald-400 flex items-center gap-2 fade-in">
                <Check className="w-4 h-4" />
                {successMsg}
              </div>
            )}
            {errorMsg && (
              <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-3 text-xs text-rose-400 fade-in">
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-500 text-white font-semibold py-2.5 rounded-xl transition-all shadow-md"
            >
              Save Profile Changes
            </button>
          </form>

          {/* Backup Section */}
          <div className="border-t border-slate-800 pt-4">
            <h3 className="text-xs font-semibold uppercase text-slate-400 mb-2 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-purple-400" />
              Data Backup & Export
            </h3>
            <p className="text-xs text-slate-400 mb-3">
              Export all your personal decks and review stats to a JSON backup file on your device.
            </p>
            <button
              onClick={handleExportBackup}
              className="w-full bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all"
            >
              <Download className="w-4 h-4 text-purple-400" />
              Export Decks Backup (.json)
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

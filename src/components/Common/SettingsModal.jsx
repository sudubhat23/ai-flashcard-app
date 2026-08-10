import { useState, useRef } from 'react'
import { X, Key, Volume2, VolumeX, Upload, Sparkles, Check, AlertCircle } from 'lucide-react'
import { authService } from '../../services/authService'
import { storageService } from '../../services/storageService'

export default function SettingsModal({ user, onClose, onUpdateUser, onDecksImported }) {
  const [apiKey, setApiKey] = useState(user.settings?.groqApiKey || '')
  const [soundEffects, setSoundEffects] = useState(user.settings?.soundEffects ?? true)
  const [speechSpeed, setSpeechSpeed] = useState(user.settings?.speechSpeed ?? 1)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [importError, setImportError] = useState('')
  const [importSuccess, setImportSuccess] = useState('')
  const fileInputRef = useRef(null)

  const handleSave = (e) => {
    e?.preventDefault()
    const updated = authService.updateProfile(user.username, {
      settings: {
        groqApiKey: apiKey.trim(),
        soundEffects,
        speechSpeed
      }
    })
    onUpdateUser(updated)
    setSaveSuccess(true)
    setTimeout(() => setSaveSuccess(false), 2500)
  }

  const handleFileImport = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImportError('')
    setImportSuccess('')

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const text = event.target?.result
        const mergedDecks = storageService.importUserData(user.username, text)
        onDecksImported(mergedDecks)
        setImportSuccess(`Imported backup successfully! (${mergedDecks.length} total decks)`)
      } catch (err) {
        setImportError(err.message)
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            <h2 className="text-lg font-bold text-slate-100">Preferences & Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Groq API Key Setup */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-purple-400" />
                Custom Groq API Key
              </label>
              <a
                href="https://console.groq.com/keys"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-purple-400 hover:underline"
              >
                Get Free Key →
              </a>
            </div>
            <input
              type="password"
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              placeholder="gsk_..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-purple-500"
            />
            <p className="text-[11px] text-slate-500">
              Note: If left empty, the app will automatically use the built-in AI deck generator fallback.
            </p>
          </div>

          {/* Sound & Speech Settings */}
          <div className="space-y-4 pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                  {soundEffects ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
                  Sound Effects
                </p>
                <p className="text-xs text-slate-400">Play subtle flip & answer feedback audio</p>
              </div>
              <button
                type="button"
                onClick={() => setSoundEffects(!soundEffects)}
                className={`w-12 h-6 rounded-full p-1 transition-all ${
                  soundEffects ? 'bg-purple-600' : 'bg-slate-800'
                }`}
              >
                <div className={`w-4 h-4 rounded-full bg-white transition-all ${
                  soundEffects ? 'translate-x-6' : 'translate-x-0'
                }`} />
              </button>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-slate-300">
                  Text-to-Speech Speed: <span className="text-purple-400">{speechSpeed}x</span>
                </label>
              </div>
              <input
                type="range"
                min="0.8"
                max="1.4"
                step="0.1"
                value={speechSpeed}
                onChange={e => setSpeechSpeed(Number(e.target.value))}
                className="w-full accent-purple-500"
              />
            </div>
          </div>

          {/* Save Button */}
          <div className="pt-2">
            <button
              onClick={handleSave}
              className="w-full bg-purple-600 hover:bg-purple-500 text-white font-semibold py-2.5 rounded-xl shadow-md flex items-center justify-center gap-2 transition-all"
            >
              {saveSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  Settings Saved!
                </>
              ) : (
                'Save Preferences'
              )}
            </button>
          </div>

          {/* Import Backup File */}
          <div className="border-t border-slate-800 pt-4 space-y-3">
            <h3 className="text-xs font-semibold uppercase text-slate-400">Restore / Import Backup JSON</h3>
            <input
              type="file"
              ref={fileInputRef}
              accept=".json"
              onChange={handleFileImport}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all"
            >
              <Upload className="w-4 h-4 text-indigo-400" />
              Choose Backup JSON File to Import
            </button>

            {importSuccess && (
              <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-3 rounded-xl text-xs flex items-center gap-2">
                <Check className="w-4 h-4" />
                {importSuccess}
              </div>
            )}
            {importError && (
              <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 p-3 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {importError}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

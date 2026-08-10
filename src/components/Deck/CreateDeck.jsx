import { useState } from 'react'
import { ArrowLeft, Sparkles, FileText, Plus, Check, AlertCircle } from 'lucide-react'
import { generateCardsWithGroq, extractCardsFromNotes } from '../../utils/aiGenerator'

const QUICK_TOPICS = [
  'React Hooks & State',
  'Python Data Structures',
  'World War II History',
  'Spanish Conversation',
  'Medical Terminology',
  'Financial Investing'
]

const COLORS = ['purple', 'blue', 'green', 'amber', 'pink']

export default function CreateDeck({ user, onBack, onDeckCreated }) {
  const [activeTab, setActiveTab] = useState('ai') // 'ai' | 'notes' | 'manual'
  const [topic, setTopic] = useState('')
  const [notes, setNotes] = useState('')
  const [count, setCount] = useState(5)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Manual Deck State
  const [manualTitle, setManualTitle] = useState('')
  const [manualTopic, setManualTopic] = useState('')
  const [manualCards, setManualCards] = useState([
    { q: '', a: '' },
    { q: '', a: '' }
  ])

  const handleGenerate = async () => {
    setError('')
    setLoading(true)

    try {
      let result
      const apiKey = user.settings?.groqApiKey || ''

      if (activeTab === 'ai') {
        if (!topic.trim()) throw new Error('Please enter a study topic.')
        result = await generateCardsWithGroq({ topic: topic.trim(), count, apiKey })
      } else if (activeTab === 'notes') {
        if (!notes.trim()) throw new Error('Please paste your study notes first.')
        result = await extractCardsFromNotes({ notes: notes.trim(), count, apiKey })
      } else if (activeTab === 'manual') {
        if (!manualTitle.trim()) throw new Error('Please enter a deck title.')
        const validCards = manualCards.filter(c => c.q.trim() && c.a.trim())
        if (validCards.length === 0) throw new Error('Please add at least one valid question & answer card.')
        
        result = {
          title: manualTitle.trim(),
          topic: manualTopic.trim() || 'Custom',
          cards: validCards
        }
      }

      const newDeck = {
        id: `deck-${Date.now()}`,
        title: result.title,
        topic: result.topic || topic || 'General',
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        createdAt: new Date().toISOString(),
        cards: result.cards,
        stats: { know: 0, almost: 0, nope: 0, lastStudied: null }
      }

      onDeckCreated(newDeck)
    } catch (err) {
      setError(err.message || 'Failed to create deck.')
    } finally {
      setLoading(false)
    }
  }

  const addManualCard = () => {
    setManualCards(prev => [...prev, { q: '', a: '' }])
  }

  const updateManualCard = (index, field, value) => {
    setManualCards(prev => prev.map((c, i) => i === index ? { ...c, [field]: value } : c))
  }

  const removeManualCard = (index) => {
    if (manualCards.length <= 1) return
    setManualCards(prev => prev.filter((_, i) => i !== index))
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 fade-in space-y-6">
      
      {/* Back Button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-slate-100 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </button>

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="bg-gradient-to-tr from-purple-600 to-indigo-600 p-3 rounded-2xl text-white shadow-lg shadow-purple-500/20">
          <Sparkles className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100">Create Flashcard Deck</h1>
          <p className="text-xs text-slate-400">Generate instantly with AI, extract from notes, or build manually</p>
        </div>
      </div>

      {/* API Key Status Notice */}
      {!user.settings?.groqApiKey && !import.meta.env.VITE_GROQ_API_KEY && (
        <div className="bg-purple-500/10 border border-purple-500/30 rounded-2xl p-4 flex items-center justify-between text-xs text-purple-300">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400 flex-shrink-0" />
            <span>Using built-in smart AI fallback engine. You can also add your free Groq key in Settings.</span>
          </div>
        </div>
      )}

      {/* Main Creation Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 glass-card shadow-2xl space-y-6">
        
        {/* Creation Tabs */}
        <div className="flex bg-slate-950 p-1 rounded-2xl border border-slate-800">
          <button
            onClick={() => { setActiveTab('ai'); setError(''); }}
            className={`flex-1 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'ai'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            AI Topic Generator
          </button>
          <button
            onClick={() => { setActiveTab('notes'); setError(''); }}
            className={`flex-1 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'notes'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            Paste Study Notes
          </button>
          <button
            onClick={() => { setActiveTab('manual'); setError(''); }}
            className={`flex-1 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'manual'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Plus className="w-4 h-4" />
            Manual Cards
          </button>
        </div>

        {/* Tab 1: AI Prompt */}
        {activeTab === 'ai' && (
          <div className="space-y-5 fade-in">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-2">
                Study Topic or Subject
              </label>
              <input
                type="text"
                value={topic}
                onChange={e => setTopic(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleGenerate()}
                placeholder="e.g. Quantum Physics, Machine Learning, World War I, French Verbs..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Quick Topic Chips */}
            <div>
              <p className="text-[11px] font-semibold text-slate-400 mb-2">Quick Ideas:</p>
              <div className="flex flex-wrap gap-2">
                {QUICK_TOPICS.map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTopic(t)}
                    className="px-3 py-1 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs text-purple-400 transition-all"
                  >
                    + {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Number of Cards Slider */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Number of Cards to Generate: <span className="text-purple-400 font-bold">{count}</span>
              </label>
              <input
                type="range"
                min="3"
                max="15"
                step="1"
                value={count}
                onChange={e => setCount(Number(e.target.value))}
                className="w-full accent-purple-500"
              />
              <div className="flex justify-between text-[11px] text-slate-500 mt-1">
                <span>3 Cards</span>
                <span>15 Cards</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Paste Notes */}
        {activeTab === 'notes' && (
          <div className="space-y-5 fade-in">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-2">
                Paste Raw Notes / Article / Textbook Summary
              </label>
              <textarea
                rows={6}
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Paste your lecture notes, textbook summary, or key study points here..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-purple-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Number of Cards to Extract: <span className="text-purple-400 font-bold">{count}</span>
              </label>
              <input
                type="range"
                min="3"
                max="15"
                step="1"
                value={count}
                onChange={e => setCount(Number(e.target.value))}
                className="w-full accent-purple-500"
              />
            </div>
          </div>
        )}

        {/* Tab 3: Manual Entry */}
        {activeTab === 'manual' && (
          <div className="space-y-5 fade-in">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1.5">
                  Deck Title
                </label>
                <input
                  type="text"
                  value={manualTitle}
                  onChange={e => setManualTitle(e.target.value)}
                  placeholder="e.g. Spanish Basics"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1.5">
                  Category / Topic Tag
                </label>
                <input
                  type="text"
                  value={manualTopic}
                  onChange={e => setManualTopic(e.target.value)}
                  placeholder="e.g. Languages"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-semibold uppercase text-slate-400">
                Cards ({manualCards.length})
              </label>
              {manualCards.map((card, idx) => (
                <div key={idx} className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2 relative">
                  <div className="flex justify-between items-center text-xs text-purple-400 font-semibold mb-1">
                    <span>Card #{idx + 1}</span>
                    {manualCards.length > 1 && (
                      <button
                        onClick={() => removeManualCard(idx)}
                        className="text-rose-400 hover:underline"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    value={card.q}
                    onChange={e => updateManualCard(idx, 'q', e.target.value)}
                    placeholder="Question..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-purple-500"
                  />
                  <input
                    type="text"
                    value={card.a}
                    onChange={e => updateManualCard(idx, 'a', e.target.value)}
                    placeholder="Answer..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-purple-500"
                  />
                </div>
              ))}
              <button
                type="button"
                onClick={addManualCard}
                className="w-full border border-dashed border-slate-700 hover:border-purple-500 text-slate-400 hover:text-purple-300 py-2.5 rounded-xl text-xs font-semibold transition-all"
              >
                + Add Another Card
              </button>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 p-3.5 rounded-2xl text-xs flex items-center gap-2 fade-in">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Create Action Button */}
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold py-3.5 rounded-2xl shadow-lg shadow-purple-600/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Generating Cards with AI...</span>
            </>
          ) : (
            <>
              <Check className="w-5 h-5" />
              <span>{activeTab === 'manual' ? 'Save Custom Deck' : 'Generate Deck Now'}</span>
            </>
          )}
        </button>

      </div>
    </div>
  )
}

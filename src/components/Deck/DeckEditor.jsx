import { useState } from 'react'
import { ArrowLeft, Save, Plus, Trash2, Check, AlertCircle } from 'lucide-react'

const COLORS = ['purple', 'blue', 'green', 'amber', 'pink']

export default function DeckEditor({ deck, onBack, onSaveDeck }) {
  const [title, setTitle] = useState(deck.title || '')
  const [topic, setTopic] = useState(deck.topic || '')
  const [color, setColor] = useState(deck.color || 'purple')
  const [cards, setCards] = useState(deck.cards || [])
  const [savedSuccess, setSavedSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleAddCard = () => {
    setCards(prev => [...prev, { q: '', a: '' }])
  }

  const handleUpdateCard = (idx, field, val) => {
    setCards(prev => prev.map((c, i) => i === idx ? { ...c, [field]: val } : c))
  }

  const handleDeleteCard = (idx) => {
    if (cards.length <= 1) {
      setError('Deck must have at least one card.')
      return
    }
    setError('')
    setCards(prev => prev.filter((_, i) => i !== idx))
  }

  const handleSave = () => {
    setError('')
    if (!title.trim()) {
      setError('Deck title cannot be empty.')
      return
    }

    const validCards = cards.filter(c => c.q.trim() && c.a.trim())
    if (validCards.length === 0) {
      setError('Please ensure at least one card has both a Question and Answer.')
      return
    }

    const updatedDeck = {
      ...deck,
      title: title.trim(),
      topic: topic.trim() || 'General',
      color,
      cards: validCards
    }

    onSaveDeck(updatedDeck)
    setSavedSuccess(true)
    setTimeout(() => setSavedSuccess(false), 2000)
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100">Edit Deck</h1>
          <p className="text-xs text-slate-400">Modify title, theme, or add/edit individual cards</p>
        </div>

        <button
          onClick={handleSave}
          className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 transition-all"
        >
          {savedSuccess ? <Check className="w-4 h-4 text-emerald-300" /> : <Save className="w-4 h-4" />}
          <span>{savedSuccess ? 'Saved!' : 'Save Deck'}</span>
        </button>
      </div>

      {/* Main Settings Box */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 glass-card space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-400 mb-1.5">
              Deck Title
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-400 mb-1.5">
              Topic Category
            </label>
            <input
              type="text"
              value={topic}
              onChange={e => setTopic(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>

        {/* Color Theme Selector */}
        <div>
          <label className="block text-xs font-semibold uppercase text-slate-400 mb-2">
            Badge Color Theme
          </label>
          <div className="flex gap-3">
            {COLORS.map(c => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`w-8 h-8 rounded-full border-2 transition-all capitalize ${
                  c === 'purple' ? 'bg-purple-600' :
                  c === 'blue' ? 'bg-blue-600' :
                  c === 'green' ? 'bg-emerald-600' :
                  c === 'amber' ? 'bg-amber-600' : 'bg-pink-600'
                } ${color === c ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-60 hover:opacity-100'}`}
              />
            ))}
          </div>
        </div>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 p-3 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        {/* Cards List Editor */}
        <div className="space-y-4 pt-4 border-t border-slate-800">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-200">Flashcards ({cards.length})</h3>
            <button
              onClick={handleAddCard}
              className="text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              Add New Card
            </button>
          </div>

          <div className="space-y-4">
            {cards.map((card, idx) => (
              <div key={idx} className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-3 relative group">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-purple-400">Card #{idx + 1}</span>
                  <button
                    onClick={() => handleDeleteCard(idx)}
                    className="text-slate-500 hover:text-rose-400 transition-colors p-1"
                    title="Delete card"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Question</label>
                  <textarea
                    rows={2}
                    value={card.q}
                    onChange={e => handleUpdateCard(idx, 'q', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-purple-500 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Answer</label>
                  <textarea
                    rows={2}
                    value={card.a}
                    onChange={e => handleUpdateCard(idx, 'a', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-purple-500 resize-none"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

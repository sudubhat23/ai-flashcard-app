import { BookOpen, Plus, Trash2, Brain } from 'lucide-react'


const colorMap = {
  purple: 'bg-purple-100 text-purple-700',
  blue: 'bg-blue-100 text-blue-700',
  green: 'bg-green-100 text-green-700',
  amber: 'bg-amber-100 text-amber-700',
  pink: 'bg-pink-100 text-pink-700',
}

export default function Home({ decks, user, onStudy, onCreateDeck, onDeleteDeck, onLogout }) {
  const totalCards = decks.reduce((a, d) => a + d.cards.length, 0)
  const totalMastered = decks.reduce((a, d) => a + d.stats.know, 0)

  return (
    <div className="max-w-xl mx-auto px-4 py-8">

      {/* Header */}
     {/* Header */}
<div className="flex items-center justify-between mb-6">
  <div className="flex items-center gap-3">
    <div className="bg-purple-600 p-2 rounded-xl">
      <Brain className="text-white w-6 h-6" />
    </div>
    <div>
      <h1 className="text-xl font-semibold text-gray-900">AI Flashcards</h1>
      <p className="text-sm text-gray-500">Hi, {user} 👋</p>
    </div>
  </div>
  <button
    onClick={onLogout}
    className="text-sm text-gray-500 hover:text-red-500 border border-gray-200 hover:border-red-300 px-3 py-1.5 rounded-lg transition-colors"
  >
    Logout
  </button>
</div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-xs text-gray-500 mb-1">Total cards</p>
          <p className="text-2xl font-semibold text-gray-900">{totalCards}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-xs text-gray-500 mb-1">Mastered</p>
          <p className="text-2xl font-semibold text-green-600">{totalMastered}</p>
        </div>
      </div>

      {/* Deck list header */}
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-base font-semibold text-gray-900">Your decks</h2>
        <button
          onClick={onCreateDeck}
          className="flex items-center gap-1.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          New deck
        </button>
      </div>

      {/* Empty state */}
      {decks.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="text-sm">No decks yet. Create one with AI!</p>
        </div>
      )}

      {/* Decks */}
      <div className="flex flex-col gap-3">
        {decks.map(deck => {
          const total = deck.cards.length
          const pct = total > 0 ? Math.round((deck.stats.know / total) * 100) : 0
          const studied = deck.stats.know + deck.stats.almost + deck.stats.nope > 0

          return (
            <div
              key={deck.id}
              onClick={() => onStudy(deck)}
              className="bg-white border border-gray-200 hover:border-purple-400 rounded-xl p-4 cursor-pointer transition-all"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-medium text-gray-900">{deck.title}</p>
                  <p className="text-sm text-gray-500">{total} cards</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${colorMap[deck.color] || colorMap.purple}`}>
                    {deck.topic}
                  </span>
                  <button
                    onClick={e => { e.stopPropagation(); onDeleteDeck(deck.id) }}
                    className="text-gray-400 hover:text-red-500 transition-colors p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {studied && (
                <div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5 mt-3">
                    <div
                      className="bg-purple-500 h-1.5 rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{pct}% mastered</p>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
import { useState, useMemo } from 'react'
import { Plus, Search, Layers, Trophy, Flame, Play, Edit3, Trash2, Download, HelpCircle, BookOpen, Filter } from 'lucide-react'

const TOPIC_BADGE_COLORS = {
  purple: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
  blue: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  green: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  amber: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  pink: 'bg-pink-500/10 text-pink-400 border-pink-500/30'
}

export default function Home({
  decks,
  user,
  onStudy,
  onCreateDeck,
  onEditDeck,
  onDeleteDeck,
  onExportDeck
}) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [activeMenuId, setActiveMenuId] = useState(null)

  // Aggregated Statistics
  const totalCards = useMemo(() => decks.reduce((sum, d) => sum + (d.cards?.length || 0), 0), [decks])
  const totalMastered = useMemo(() => decks.reduce((sum, d) => sum + (d.stats?.know || 0), 0), [decks])

  // Topics for categories filter
  const categories = useMemo(() => {
    const set = new Set(decks.map(d => d.topic || 'General').filter(Boolean))
    return ['All', ...Array.from(set)]
  }, [decks])

  // Filtered Decks
  const filteredDecks = useMemo(() => {
    return decks.filter(deck => {
      const matchesSearch = deck.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (deck.topic && deck.topic.toLowerCase().includes(searchQuery.toLowerCase()))
      const matchesCat = selectedCategory === 'All' || deck.topic === selectedCategory
      return matchesSearch && matchesCat
    })
  }, [decks, searchQuery, selectedCategory])

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      
      {/* Welcome & Stats Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-900/60 border border-slate-800 rounded-3xl p-6 glass-card">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">{user.avatar || '⚡'}</span>
            <h2 className="text-2xl font-extrabold text-slate-100">
              Welcome back, {user.displayName || user.username}!
            </h2>
          </div>
          <p className="text-sm text-slate-400">
            Ready to sharpen your memory? You have <span className="text-purple-400 font-semibold">{decks.length} decks</span> ({totalCards} cards) in your library.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onCreateDeck}
            className="w-full md:w-auto bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold px-5 py-3 rounded-2xl shadow-lg shadow-purple-600/25 flex items-center justify-center gap-2 transition-all scale-100 hover:scale-[1.02]"
          >
            <Plus className="w-5 h-5" />
            <span>Create New Deck</span>
          </button>
        </div>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex items-center gap-4">
          <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-xl text-purple-400">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Total Decks</p>
            <p className="text-2xl font-black text-slate-100">{decks.length}</p>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex items-center gap-4">
          <div className="p-3 bg-indigo-500/10 border border-indigo-500/30 rounded-xl text-indigo-400">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Total Cards</p>
            <p className="text-2xl font-black text-slate-100">{totalCards}</p>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Mastered Cards</p>
            <p className="text-2xl font-black text-emerald-400">{totalMastered}</p>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex items-center gap-4">
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Daily Streak</p>
            <p className="text-2xl font-black text-amber-400">{user.streakCount || 1} Days</p>
          </div>
        </div>
      </div>

      {/* Controls Bar: Search & Category Chips */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search decks by title or tag..."
            className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500"
          />
        </div>

        {/* Categories */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          <Filter className="w-3.5 h-3.5 text-slate-500 mr-1 flex-shrink-0" />
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Empty State */}
      {filteredDecks.length === 0 && (
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-12 text-center fade-in">
          <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-300">No Decks Found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto mb-6">
            {searchQuery
              ? `No decks match your search "${searchQuery}". Try clearing filters or create a new deck.`
              : 'You do not have any flashcard decks yet. Create one using AI or choose a template!'}
          </p>
          <button
            onClick={onCreateDeck}
            className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold px-5 py-2.5 rounded-xl inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create AI Deck Now
          </button>
        </div>
      )}

      {/* Deck Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredDecks.map(deck => {
          const cardCount = deck.cards?.length || 0
          const mastered = deck.stats?.know || 0
          const masteryPct = cardCount > 0 ? Math.round((mastered / cardCount) * 100) : 0
          const badgeStyle = TOPIC_BADGE_COLORS[deck.color] || TOPIC_BADGE_COLORS.purple

          return (
            <div
              key={deck.id}
              className="bg-slate-900/80 border border-slate-800/80 hover:border-purple-500/40 rounded-3xl p-6 glass-card glass-card-hover flex flex-col justify-between relative group"
            >
              <div>
                {/* Header Row */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${badgeStyle}`}>
                    {deck.topic || 'General'}
                  </span>
                  
                  {/* Actions Dropdown / Quick Buttons */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onEditDeck(deck)}
                      className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-all"
                      title="Edit Deck Cards"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteDeck(deck.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all"
                      title="Delete Deck"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold text-slate-100 mb-1 group-hover:text-purple-300 transition-colors">
                  {deck.title}
                </h3>
                <p className="text-xs text-slate-400 mb-4">
                  {cardCount} flashcard{cardCount === 1 ? '' : 's'}
                </p>
              </div>

              {/* Progress bar */}
              <div className="space-y-4 pt-2 border-t border-slate-800/80">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-500">Mastery Progress</span>
                    <span className="text-purple-400 font-semibold">{masteryPct}%</span>
                  </div>
                  <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full transition-all duration-500"
                      style={{ width: `${masteryPct}%` }}
                    />
                  </div>
                </div>

                {/* Study Launchers */}
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => onStudy(deck, 'flip')}
                    className="bg-purple-600/20 hover:bg-purple-600 border border-purple-500/40 text-purple-300 hover:text-white py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-all"
                    title="Classic Flip Card Mode"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    Flip
                  </button>

                  <button
                    onClick={() => onStudy(deck, 'quiz')}
                    className="bg-indigo-600/20 hover:bg-indigo-600 border border-indigo-500/40 text-indigo-300 hover:text-white py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-all"
                    title="Multiple Choice Quiz"
                  >
                    <HelpCircle className="w-3 h-3" />
                    Quiz
                  </button>

                  <button
                    onClick={() => onStudy(deck, 'type')}
                    className="bg-emerald-600/20 hover:bg-emerald-600 border border-emerald-500/40 text-emerald-300 hover:text-white py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-all"
                    title="Type Answer Practice"
                  >
                    <Edit3 className="w-3 h-3" />
                    Type
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

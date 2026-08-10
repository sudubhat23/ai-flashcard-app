// Storage Service for Isolated Per-User Data Management

const SAMPLE_DECKS = [
  {
    id: 'deck-js-basics',
    title: 'JavaScript Mastery',
    topic: 'Programming',
    color: 'purple',
    createdAt: new Date().toISOString(),
    cards: [
      { q: "What is a closure in JavaScript?", a: "A function bundled together with references to its surrounding state (lexical environment)." },
      { q: "What is the difference between == and ===?", a: "== performs type coercion before comparison, while === checks both value and type strictly." },
      { q: "What is Event Bubbling?", a: "The process where an event starts at the target element and bubbles up through parent elements in the DOM tree." },
      { q: "What is a Promise?", a: "An object representing the eventual completion or failure of an asynchronous operation and its resulting value." },
      { q: "What does the 'this' keyword refer to?", a: "It refers to the object executing the current function, which varies depending on how the function was invoked." }
    ],
    stats: { know: 3, almost: 1, nope: 1, lastStudied: new Date().toISOString() }
  },
  {
    id: 'deck-world-geo',
    title: 'World Geography & Wonders',
    topic: 'Geography',
    color: 'blue',
    createdAt: new Date().toISOString(),
    cards: [
      { q: "What is the capital of Japan?", a: "Tokyo" },
      { q: "Which is the longest river in the world?", a: "The Nile River (approx 6,650 km)" },
      { q: "What island country lies south of India?", a: "Sri Lanka" },
      { q: "Which mountain range separates Europe from Asia?", a: "The Ural Mountains" }
    ],
    stats: { know: 2, almost: 1, nope: 0, lastStudied: new Date().toISOString() }
  },
  {
    id: 'deck-science-cosmos',
    title: 'Space & Astronomy',
    topic: 'Science',
    color: 'amber',
    createdAt: new Date().toISOString(),
    cards: [
      { q: "What planet is known as the Red Planet?", a: "Mars (due to iron oxide on its surface)" },
      { q: "What is the closest star to Earth?", a: "The Sun (Proxima Centauri is the next closest)" },
      { q: "What galaxy is the Milky Way on a collision course with?", a: "The Andromeda Galaxy (in ~4.5 billion years)" }
    ],
    stats: { know: 0, almost: 0, nope: 0, lastStudied: null }
  }
]

const getDeckStorageKey = (username) => `fc-user-decks-${username.toLowerCase()}`

export const storageService = {
  // Get all decks for a specific user
  getUserDecks: (username) => {
    if (!username) return []
    try {
      const key = getDeckStorageKey(username)
      const saved = localStorage.getItem(key)
      if (!saved) {
        // Seed initial sample decks for new user
        localStorage.setItem(key, JSON.stringify(SAMPLE_DECKS))
        return SAMPLE_DECKS
      }
      return JSON.parse(saved)
    } catch (e) {
      console.error('Failed to load user decks:', e)
      return SAMPLE_DECKS
    }
  },

  // Save all decks for a specific user
  saveUserDecks: (username, decks) => {
    if (!username) return
    try {
      const key = getDeckStorageKey(username)
      localStorage.setItem(key, JSON.stringify(decks))
    } catch (e) {
      console.error('Failed to save user decks:', e)
    }
  },

  // Save or update a single deck
  saveDeck: (username, deck) => {
    const decks = storageService.getUserDecks(username)
    const existingIndex = decks.findIndex(d => d.id === deck.id)
    let updatedDecks
    if (existingIndex >= 0) {
      updatedDecks = decks.map(d => d.id === deck.id ? deck : d)
    } else {
      updatedDecks = [deck, ...decks]
    }
    storageService.saveUserDecks(username, updatedDecks)
    return updatedDecks
  },

  // Delete deck
  deleteDeck: (username, deckId) => {
    const decks = storageService.getUserDecks(username)
    const updated = decks.filter(d => d.id !== deckId)
    storageService.saveUserDecks(username, updated)
    return updated
  },

  // Export full user data backup (decks + metadata)
  exportUserData: (username) => {
    const decks = storageService.getUserDecks(username)
    const exportData = {
      app: 'AI Flashcards',
      version: '2.0',
      exportedAt: new Date().toISOString(),
      username,
      decks
    }
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `flashcard_backup_${username}_${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  },

  // Import user data from backup file
  importUserData: (username, jsonText) => {
    try {
      const parsed = JSON.parse(jsonText)
      if (!parsed.decks || !Array.isArray(parsed.decks)) {
        throw new Error('Invalid backup file format. "decks" array missing.')
      }
      const existing = storageService.getUserDecks(username)
      // Merge unique decks
      const existingIds = new Set(existing.map(d => d.id))
      const newDecks = parsed.decks.map(d => ({
        ...d,
        id: existingIds.has(d.id) ? `imported-${Date.now()}-${Math.random().toString(36).substr(2, 4)}` : d.id
      }))
      const merged = [...newDecks, ...existing]
      storageService.saveUserDecks(username, merged)
      return merged
    } catch (e) {
      throw new Error(`Failed to import backup: ${e.message}`)
    }
  }
}

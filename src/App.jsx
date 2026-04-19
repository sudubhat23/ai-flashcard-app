import { useState, useEffect } from 'react'
import Login from './components/Login'
import Home from './components/Home'
import CreateDeck from './components/CreateDeck'
import StudyMode from './components/StudyMode'
import Results from './components/Results'

const SAMPLE_DECK = {
  id: 1,
  title: "JavaScript Basics",
  topic: "JavaScript",
  color: "purple",
  cards: [
    { q: "What is a closure?", a: "A function that retains access to its outer scope's variables even after the outer function has returned." },
    { q: "What does === do?", a: "Strict equality — checks both value AND type without type coercion." },
    { q: "What is event bubbling?", a: "When an event fires on a child, it propagates up through all ancestor elements in the DOM." },
  ],
  stats: { know: 0, almost: 0, nope: 0 }
}

export default function App() {
const [user, setUser] = useState(null) 
 const [decks, setDecks] = useState(() => {
  const currentUser = localStorage.getItem('fc-loggedIn')
  const saved = localStorage.getItem(`flashcard-decks-${currentUser}`)
  return saved ? JSON.parse(saved) : [SAMPLE_DECK]
})
  const [view, setView] = useState('home')
  const [activeDeck, setActiveDeck] = useState(null)
  const [sessionStats, setSessionStats] = useState(null)

  useEffect(() => {
  if (user) {
    localStorage.setItem(`flashcard-decks-${user}`, JSON.stringify(decks))
  }
}, [decks, user])

const handleLogin = (username) => {
  setUser(username)
  const saved = localStorage.getItem(`flashcard-decks-${username}`)
  setDecks(saved ? JSON.parse(saved) : [SAMPLE_DECK])
}

 const handleLogout = () => {
  localStorage.removeItem('fc-loggedIn')
  setUser(null)
  setDecks([SAMPLE_DECK])
  setView('home')
}

  const handleStudy = (deck) => { setActiveDeck(deck); setView('study') }

  const handleDeckCreated = (deck) => {
    setDecks(prev => [...prev, deck])
    setActiveDeck(deck)
    setView('study')
  }

  const handleDeleteDeck = (id) => setDecks(prev => prev.filter(d => d.id !== id))

  const handleSessionDone = (stats) => {
    setSessionStats(stats)
    setDecks(prev => prev.map(d =>
      d.id === activeDeck.id
        ? { ...d, stats: { know: stats.know, almost: stats.almost, nope: stats.nope } }
        : d
    ))
    setView('results')
  }

  const goHome = () => { setView('home'); setActiveDeck(null); setSessionStats(null) }

  if (!user) return <Login onLogin={handleLogin} />

  return (
    <div className="min-h-screen bg-gray-50">
      {view === 'home' && (
        <Home
          decks={decks}
          user={user}
          onStudy={handleStudy}
          onCreateDeck={() => setView('create')}
          onDeleteDeck={handleDeleteDeck}
          onLogout={handleLogout}
        />
      )}
      {view === 'create' && (
        <CreateDeck onBack={goHome} onDeckCreated={handleDeckCreated} />
      )}
      {view === 'study' && activeDeck && (
        <StudyMode deck={activeDeck} onBack={goHome} onSessionDone={handleSessionDone} />
      )}
      {view === 'results' && (
        <Results deck={activeDeck} stats={sessionStats} onHome={goHome} onStudyAgain={() => setView('study')} />
      )}
    </div>
  )
}
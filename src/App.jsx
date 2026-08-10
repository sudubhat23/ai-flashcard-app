import { useState, useEffect } from 'react'
import Header from './components/Dashboard/Header'
import Home from './components/Dashboard/Home'
import Login from './components/Auth/Login'
import ProfileModal from './components/Auth/ProfileModal'
import SettingsModal from './components/Common/SettingsModal'
import CreateDeck from './components/Deck/CreateDeck'
import DeckEditor from './components/Deck/DeckEditor'
import StudyMode from './components/Study/StudyMode'
import QuizMode from './components/Study/QuizMode'
import TypeMode from './components/Study/TypeMode'
import Results from './components/Common/Results'

import { authService } from './services/authService'
import { storageService } from './services/storageService'

export default function App() {
  // Session & User State
  const [user, setUser] = useState(() => authService.getCurrentUser())
  const [decks, setDecks] = useState(() => {
    const currentUser = authService.getCurrentUser()
    return currentUser ? storageService.getUserDecks(currentUser.username) : []
  })

  // Navigation & Modals State
  const [view, setView] = useState('home') // 'home' | 'create' | 'edit-deck' | 'study' | 'results'
  const [studyMode, setStudyMode] = useState('flip') // 'flip' | 'quiz' | 'type'
  const [activeDeck, setActiveDeck] = useState(null)
  const [sessionStats, setSessionStats] = useState(null)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)

  // Reload decks whenever user changes
  useEffect(() => {
    if (user) {
      const userDecks = storageService.getUserDecks(user.username)
      setDecks(userDecks)
    } else {
      setDecks([])
    }
  }, [user])

  // Auth Handlers
  const handleLoginSuccess = (authenticatedUser) => {
    setUser(authenticatedUser)
    const userDecks = storageService.getUserDecks(authenticatedUser.username)
    setDecks(userDecks)
    setView('home')
  }

  const handleLogout = () => {
    authService.logout()
    setUser(null)
    setDecks([])
    setActiveDeck(null)
    setView('home')
  }

  const handleUpdateUser = (updatedUser) => {
    setUser(updatedUser)
  }

  // Deck Handlers
  const handleDeckCreated = (newDeck) => {
    const updated = storageService.saveDeck(user.username, newDeck)
    setDecks(updated)
    setActiveDeck(newDeck)
    setStudyMode('flip')
    setView('study')
  }

  const handleSaveDeck = (updatedDeck) => {
    const updated = storageService.saveDeck(user.username, updatedDeck)
    setDecks(updated)
    setView('home')
  }

  const handleDeleteDeck = (deckId) => {
    const updated = storageService.deleteDeck(user.username, deckId)
    setDecks(updated)
  }

  const handleExportDeck = (deck) => {
    storageService.exportUserData(user.username)
  }

  const handleDecksImported = (importedDecks) => {
    setDecks(importedDecks)
  }

  // Study Handlers
  const handleStartStudy = (deck, mode = 'flip') => {
    setActiveDeck(deck)
    setStudyMode(mode)
    setView('study')
  }

  const handleSessionDone = (stats) => {
    setSessionStats(stats)
    if (activeDeck) {
      const currentKnow = activeDeck.stats?.know || 0
      const updatedDeck = {
        ...activeDeck,
        stats: {
          know: Math.max(currentKnow, stats.know || 0),
          almost: stats.almost || 0,
          nope: stats.nope || 0,
          lastStudied: new Date().toISOString()
        }
      }
      const updatedDecks = storageService.saveDeck(user.username, updatedDeck)
      setDecks(updatedDecks)
      setActiveDeck(updatedDeck)
    }
    setView('results')
  }

  const goHome = () => {
    setView('home')
    setActiveDeck(null)
    setSessionStats(null)
  }

  // Unauthenticated View
  if (!user) {
    return <Login onLoginSuccess={handleLoginSuccess} />
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-purple-500 selection:text-white font-sans antialiased">
      {/* Header */}
      <Header
        user={user}
        onOpenProfile={() => setShowProfileModal(true)}
        onOpenSettings={() => setShowSettingsModal(true)}
        onLogout={handleLogout}
      />

      {/* Main View Container */}
      <main className="pb-16">
        {view === 'home' && (
          <Home
            decks={decks}
            user={user}
            onStudy={handleStartStudy}
            onCreateDeck={() => setView('create')}
            onEditDeck={(deck) => { setActiveDeck(deck); setView('edit-deck'); }}
            onDeleteDeck={handleDeleteDeck}
            onExportDeck={handleExportDeck}
          />
        )}

        {view === 'create' && (
          <CreateDeck
            user={user}
            onBack={goHome}
            onDeckCreated={handleDeckCreated}
          />
        )}

        {view === 'edit-deck' && activeDeck && (
          <DeckEditor
            deck={activeDeck}
            onBack={goHome}
            onSaveDeck={handleSaveDeck}
          />
        )}

        {view === 'study' && activeDeck && (
          <>
            {studyMode === 'flip' && (
              <StudyMode
                user={user}
                deck={activeDeck}
                onBack={goHome}
                onSessionDone={handleSessionDone}
                onChangeMode={(m) => setStudyMode(m)}
              />
            )}
            {studyMode === 'quiz' && (
              <QuizMode
                user={user}
                deck={activeDeck}
                onBack={goHome}
                onSessionDone={handleSessionDone}
                onChangeMode={(m) => setStudyMode(m)}
              />
            )}
            {studyMode === 'type' && (
              <TypeMode
                user={user}
                deck={activeDeck}
                onBack={goHome}
                onSessionDone={handleSessionDone}
                onChangeMode={(m) => setStudyMode(m)}
              />
            )}
          </>
        )}

        {view === 'results' && activeDeck && sessionStats && (
          <Results
            deck={activeDeck}
            stats={sessionStats}
            onHome={goHome}
            onStudyAgain={() => setView('study')}
          />
        )}
      </main>

      {/* Modals */}
      {showProfileModal && (
        <ProfileModal
          user={user}
          onClose={() => setShowProfileModal(false)}
          onUpdateUser={handleUpdateUser}
        />
      )}

      {showSettingsModal && (
        <SettingsModal
          user={user}
          onClose={() => setShowSettingsModal(false)}
          onUpdateUser={handleUpdateUser}
          onDecksImported={handleDecksImported}
        />
      )}
    </div>
  )
}
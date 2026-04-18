import { useState } from 'react'
import { ArrowLeft, Sparkles } from 'lucide-react'


const COLORS = ['purple', 'blue', 'green', 'amber', 'pink']

export default function CreateDeck({ onBack, onDeckCreated }) {
  const [topic, setTopic] = useState('')
  const [count, setCount] = useState(5)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
const generate = async () => {
console.log('API KEY:', import.meta.env.VITE_GROQ_API_KEY)
  if (!topic.trim()) return setError('Please enter a topic.')
  setError('')
  setLoading(true)

  try {
const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
  },
  body: JSON.stringify({
   model: 'llama-3.3-70b-versatile',
    messages: [{
      role: 'user',
      content: `Generate exactly ${count} flashcard question-answer pairs about: "${topic}". Return ONLY valid JSON like this, no markdown, no backticks: {"title":"Deck title","cards":[{"q":"question","a":"answer"}]}`
    }]
  })
})

const data = await response.json()
console.log('API response:', data)

if (!response.ok) {
  setError(`API Error: ${data.error?.message || 'Unknown error'}`)
  setLoading(false)
  return
}

const text = data.choices[0].message.content
const clean = text.replace(/```json|```/g, '').trim()
const parsed = JSON.parse(clean)

onDeckCreated({
  id: Date.now(),
  title: parsed.title || topic,
  topic: topic.trim(),
  cards: parsed.cards,
  color: COLORS[Math.floor(Math.random() * COLORS.length)],
  stats: { know: 0, almost: 0, nope: 0 }
})

} catch (e) {
  console.error('Caught error:', e)
  setError('Failed to generate cards. Check console for details.')
}

    setLoading(false)
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8">

      {/* Header */}
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      <div className="flex items-center gap-3 mb-2">
        <div className="bg-purple-600 p-2 rounded-xl">
          <Sparkles className="text-white w-5 h-5" />
        </div>
        <h1 className="text-xl font-semibold text-gray-900">Create AI deck</h1>
      </div>
      <p className="text-sm text-gray-500 mb-8">
        Enter any topic and AI will generate flashcards instantly.
      </p>

      {/* Form */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 flex flex-col gap-6">

        {/* Topic input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Topic
          </label>
          <input
            type="text"
            value={topic}
            onChange={e => setTopic(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && generate()}
            placeholder="e.g. React hooks, World War II, Python decorators..."
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition"
          />
        </div>

        {/* Card count slider */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Number of cards: <span className="text-purple-600 font-semibold">{count}</span>
          </label>
          <input
            type="range"
            min="3"
            max="15"
            step="1"
            value={count}
            onChange={e => setCount(Number(e.target.value))}
            className="w-full accent-purple-600"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>3</span>
            <span>15</span>
          </div>
        </div>

        {/* Error */}
        {error && (
          <p className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-lg px-4 py-2">
            {error}
          </p>
        )}

        {/* Submit button */}
        <button
          onClick={generate}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white font-medium py-3 rounded-xl transition-colors"
        >
          {loading ? (
            <>
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Generate with AI
            </>
          )}
        </button>

      </div>
    </div>
  )
}
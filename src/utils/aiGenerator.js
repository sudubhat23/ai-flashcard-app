// AI Generator Service: Handles Groq API, Offline Fallback Templates, and Notes Extraction

const OFFLINE_CARD_BANKS = {
  javascript: [
    { q: "What is a closure in JavaScript?", a: "A function that retains access to variables in its outer scope even after the parent function has finished executing." },
    { q: "What is the difference between let, const, and var?", a: "var is function-scoped and hoisted. let and const are block-scoped, with const preventing re-assignment." },
    { q: "What is the Event Loop?", a: "The mechanism in JS that coordinates asynchronous operations by executing callbacks from the task queue when the call stack is empty." },
    { q: "What are Promises and async/await?", a: "Promises represent future asynchronous results. async/await is syntactic sugar over Promises making async code look synchronous." },
    { q: "What is Event Delegation?", a: "Attaching a single event listener to a parent element to handle events for multiple child elements using event bubbling." },
    { q: "What is Hoisting?", a: "JavaScript's default behavior of moving variable and function declarations to the top of their containing scope during compilation." }
  ],
  python: [
    { q: "What is a Python Decorator?", a: "A function that takes another function as an argument, extends its behavior without modifying it, and returns the modified function." },
    { q: "What is the difference between a List and a Tuple?", a: "Lists are mutable (modifiable), defined with []. Tuples are immutable (read-only), defined with ()." },
    { q: "What is the GIL (Global Interpreter Lock)?", a: "A mutex that allows only one native thread to execute Python bytecodes at a time in CPython." },
    { q: "What are List Comprehensions?", a: "A concise syntax to create lists based on existing iterables: [x*2 for x in range(10)]." },
    { q: "How does exception handling work in Python?", a: "Using try, except, else, and finally blocks to catch and handle errors gracefully." }
  ],
  react: [
    { q: "What is the Virtual DOM?", a: "A lightweight in-memory representation of the real DOM. React computes minimal diffs to optimize rendering." },
    { q: "What is the useEffect hook used for?", a: "For performing side effects in functional components like data fetching, subscriptions, and DOM updates." },
    { q: "What is the difference between State and Props?", a: "Props are read-only inputs passed down from parent components. State is local mutable data managed inside the component." },
    { q: "Why are key props necessary in React lists?", a: "Keys help React identify which items have changed, been added, or removed for efficient rendering." }
  ],
  history: [
    { q: "When did World War II end?", a: "1945 (following the surrender of Germany in May and Japan in September)." },
    { q: "Who was the first President of the United States?", a: "George Washington (1789–1797)." },
    { q: "What civilization built the Machu Picchu Citadel?", a: "The Inca Empire in 15th-century Peru." },
    { q: "When was the Magna Carta signed?", a: "1215 at Runnymede, establishing principles of constitutional law." }
  ],
  science: [
    { q: "What is Photosynthesis?", a: "The process by which green plants convert sunlight, carbon dioxide, and water into glucose and oxygen." },
    { q: "What is Newton's First Law of Motion?", a: "An object remains at rest or in uniform motion in a straight line unless acted upon by a net external force." },
    { q: "What is DNA's double-helix structure made of?", a: "Sugar-phosphate backbones connected by adenine-thymine and guanine-cytosine base pairs." },
    { q: "What is the speed of light in a vacuum?", a: "Approximately 299,792,458 meters per second (~300,000 km/s)." }
  ],
  spanish: [
    { q: "How do you say 'Hello, how are you?' in Spanish?", a: "¡Hola, ¿cómo estás?" },
    { q: "What does 'Por favor' and 'Gracias' mean?", a: "'Por favor' means Please, and 'Gracias' means Thank you." },
    { q: "How do you conjugate 'Ser' (to be) for Yo, Tú, Él?", a: "Yo soy, Tú eres, Él/Ella es." },
    { q: "What is the Spanish word for 'Library'?", a: "Biblioteca (not librería, which means bookstore)." }
  ]
}

export const generateCardsWithGroq = async ({ topic, count = 5, apiKey = '' }) => {
  const effectiveApiKey = apiKey || import.meta.env.VITE_GROQ_API_KEY

  if (!effectiveApiKey) {
    console.log('No Groq API Key found. Using intelligent offline generator...')
    return generateOfflineFallbackCards(topic, count)
  }

  try {
    const prompt = `Generate exactly ${count} educational flashcard question-answer pairs about: "${topic}".
Return ONLY valid raw JSON with NO markdown formatting, NO backticks, NO explanation text.
JSON Structure:
{
  "title": "Deck Title",
  "topic": "${topic}",
  "cards": [
    { "q": "Clear, concise question?", "a": "Accurate, clear answer." }
  ]
}`

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${effectiveApiKey}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }]
      })
    })

    const data = await response.json()
    if (!response.ok) {
      console.warn('Groq API Error, falling back to offline cards:', data.error?.message)
      return generateOfflineFallbackCards(topic, count)
    }

    const content = data.choices[0].message.content
    const cleaned = content.replace(/```json|```/g, '').trim()
    const parsed = JSON.parse(cleaned)

    return {
      title: parsed.title || `${topic} Flashcards`,
      topic: topic,
      cards: parsed.cards || []
    }
  } catch (e) {
    console.error('Groq AI API error, falling back:', e)
    return generateOfflineFallbackCards(topic, count)
  }
}

export const extractCardsFromNotes = async ({ notes, count = 5, apiKey = '' }) => {
  const effectiveApiKey = apiKey || import.meta.env.VITE_GROQ_API_KEY

  if (effectiveApiKey) {
    try {
      const prompt = `Analyze the following study notes and create exactly ${count} high-quality flashcards (Question & Answer pairs).
Return ONLY raw JSON with NO markdown formatting:
{
  "title": "Summary from Notes",
  "cards": [
    { "q": "Question derived from notes?", "a": "Answer extracted from notes." }
  ]
}

NOTES CONTENT:
${notes}`

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${effectiveApiKey}`
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [{ role: 'user', content: prompt }]
        })
      })

      const data = await response.json()
      if (response.ok && data.choices?.[0]?.message?.content) {
        const cleaned = data.choices[0].message.content.replace(/```json|```/g, '').trim()
        const parsed = JSON.parse(cleaned)
        return {
          title: parsed.title || 'Extracted Study Cards',
          topic: 'Study Notes',
          cards: parsed.cards || []
        }
      }
    } catch (e) {
      console.error('Notes AI extraction failed, fallback parser running:', e)
    }
  }

  // Fallback Rule-based parser for notes
  const lines = notes.split('\n').filter(l => l.trim().length > 5)
  const cards = []
  
  for (let i = 0; i < lines.length && cards.length < count; i++) {
    const line = lines[i].trim()
    if (line.includes(':') || line.includes('-') || line.includes('?')) {
      const parts = line.split(/[:\-\?]/)
      if (parts.length >= 2 && parts[0].trim().length > 3) {
        cards.push({
          q: parts[0].trim() + (line.includes('?') ? '?' : ''),
          a: parts.slice(1).join(' ').trim()
        })
      }
    } else {
      cards.push({
        q: `What is key point #${cards.length + 1} from notes?`,
        a: line
      })
    }
  }

  if (cards.length === 0) {
    cards.push({
      q: "Summary of provided study notes",
      a: notes.substring(0, 150) + "..."
    })
  }

  return {
    title: 'Extracted Flashcards',
    topic: 'Notes',
    cards
  }
}

export const generateOfflineFallbackCards = (topic, count = 5) => {
  const normalized = topic.toLowerCase().trim()
  let matchedBank = null

  for (const key in OFFLINE_CARD_BANKS) {
    if (normalized.includes(key) || key.includes(normalized)) {
      matchedBank = OFFLINE_CARD_BANKS[key]
      break
    }
  }

  if (matchedBank) {
    const shuffled = [...matchedBank].sort(() => Math.random() - 0.5)
    return {
      title: `${topic.charAt(0).toUpperCase() + topic.slice(1)} Mastery`,
      topic: topic,
      cards: shuffled.slice(0, count)
    }
  }

  // Dynamic procedural topic generator for unknown topics
  const dynamicCards = []
  const capitalizedTopic = topic.charAt(0).toUpperCase() + topic.slice(1)
  
  dynamicCards.push(
    { q: `What is the core definition of ${capitalizedTopic}?`, a: `${capitalizedTopic} is a key concept studied in this field to understand fundamental principles and practical applications.` },
    { q: `What is the primary function or purpose of ${capitalizedTopic}?`, a: `It provides a structured mechanism to analyze, optimize, and organize key processes efficiently.` },
    { q: `What are the essential components or elements of ${capitalizedTopic}?`, a: `Key components include fundamental rules, core modules, standard practices, and context-specific configurations.` },
    { q: `How is ${capitalizedTopic} applied in real-world scenarios?`, a: `It is implemented across practical systems to improve outcomes, maintain consistency, and solve complex problems.` },
    { q: `What is a common best practice when working with ${capitalizedTopic}?`, a: `Follow established guidelines, verify inputs/assumptions, and review edge cases regularly.` }
  )

  return {
    title: `${capitalizedTopic} Core Principles`,
    topic: topic,
    cards: dynamicCards.slice(0, count)
  }
}

// Authentication & Profile Storage Service

const USERS_DB_KEY = 'fc-users-db'
const ACTIVE_SESSION_KEY = 'fc-active-session'

const DEFAULT_AVATARS = ['⚡', '🚀', '🧠', '🔮', '🎓', '🔥', '🌟', '🦊', '🦉', '💎']

const getUsers = () => {
  try {
    const raw = localStorage.getItem(USERS_DB_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch (e) {
    console.error('Failed to parse users DB:', e)
    return {}
  }
}

const saveUsers = (users) => {
  localStorage.setItem(USERS_DB_KEY, JSON.stringify(users))
}

export const authService = {
  DEFAULT_AVATARS,

  getCurrentUser: () => {
    try {
      const activeUsername = localStorage.getItem(ACTIVE_SESSION_KEY)
      if (!activeUsername) return null
      const users = getUsers()
      return users[activeUsername] || null
    } catch (e) {
      return null
    }
  },

  register: ({ username, password, displayName, email }) => {
    const cleanUsername = username.trim().toLowerCase()
    if (!cleanUsername || !password.trim()) {
      throw new Error('Username and password are required.')
    }
    if (cleanUsername.length < 3) {
      throw new Error('Username must be at least 3 characters.')
    }

    const users = getUsers()
    if (users[cleanUsername]) {
      throw new Error('Username already exists. Please pick another one or log in.')
    }

    const newUser = {
      username: cleanUsername,
      displayName: (displayName && displayName.trim()) || cleanUsername,
      email: (email && email.trim()) || '',
      password: password.trim(), // Stored locally per user preference
      avatar: DEFAULT_AVATARS[Math.floor(Math.random() * DEFAULT_AVATARS.length)],
      createdAt: new Date().toISOString(),
      streakCount: 1,
      lastActiveDate: new Date().toISOString().split('T')[0],
      settings: {
        groqApiKey: '',
        soundEffects: true,
        speechSpeed: 1,
        theme: 'dark'
      }
    }

    users[cleanUsername] = newUser
    saveUsers(users)
    localStorage.setItem(ACTIVE_SESSION_KEY, cleanUsername)
    return newUser
  },

  login: (username, password) => {
    const cleanUsername = username.trim().toLowerCase()
    const users = getUsers()
    const user = users[cleanUsername]

    if (!user || user.password !== password.trim()) {
      throw new Error('Invalid username or password.')
    }

    // Update streak logic
    const today = new Date().toISOString().split('T')[0]
    const lastActive = user.lastActiveDate ? user.lastActiveDate.split('T')[0] : null
    
    if (lastActive) {
      const lastDate = new Date(lastActive)
      const currentDate = new Date(today)
      const diffTime = Math.abs(currentDate - lastDate)
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

      if (diffDays === 1) {
        user.streakCount = (user.streakCount || 0) + 1
      } else if (diffDays > 1) {
        user.streakCount = 1
      }
    } else {
      user.streakCount = 1
    }

    user.lastActiveDate = today
    users[cleanUsername] = user
    saveUsers(users)
    localStorage.setItem(ACTIVE_SESSION_KEY, cleanUsername)
    return user
  },

  logout: () => {
    localStorage.removeItem(ACTIVE_SESSION_KEY)
  },

  updateProfile: (username, updates) => {
    const users = getUsers()
    const user = users[username]
    if (!user) throw new Error('User not found')

    const updatedUser = {
      ...user,
      ...updates,
      settings: {
        ...user.settings,
        ...(updates.settings || {})
      }
    }

    users[username] = updatedUser
    saveUsers(users)
    return updatedUser
  }
}

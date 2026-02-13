import { ref, computed } from 'vue'

interface MotivationResult {
  success: boolean
  message: string
  streak?: number
}

interface StreakCheck {
  broken: boolean
  message?: string
}

const motivationPhrases = [
  "C'est l'heure de créer ! Ton futur client attend ton contenu. 💪",
  "Chaque création te rapproche de ton objectif freelance ! 🚀",
  "Les meilleurs freelances créent quotidiennement. À toi de jouer ! ⭐",
  "Ton portfolio s'enrichit à chaque publication. Go ! 🎯",
  "La régularité est la clé du succès freelance. Crée maintenant ! 🔑",
  "Transforme cette inspiration en contenu. Tu en es capable ! 💡",
  "Tes futurs clients cherchent ton expertise. Montre-la ! 📱",
  "Un petit pas aujourd'hui = un grand bond demain. Commence ! 🏃",
  "Le contenu que tu crées aujourd'hui travaillera pour toi demain ! 💼",
  "Ta créativité est unique. Partage-la avec le monde ! 🌟",
  "Les opportunités freelance viennent à ceux qui créent ! 🎨",
  "Aujourd'hui est parfait pour créer quelque chose d'incroyable ! ✨",
  "Ta consistency = ta crédibilité. Continue comme ça ! 📈",
  "Chaque contenu est une vitrine de ton talent. Brille ! 💎",
  "Le momentum se construit jour après jour. Ne casse pas la chaîne ! ⚡",
  "Ton audience grandit avec chaque création. Persévère ! 📊",
  "Les meilleurs portfolios se construisent une création à la fois ! 🏗️",
  "Ta discipline d'aujourd'hui = ton succès de demain ! 🏆",
  "Crée maintenant, ton futur toi te remerciera ! 🙏",
  "L'algorithme aime la régularité. Donne-lui ce qu'il veut ! 📲"
]

export function useMotivation() {
  const streak = ref<number>(parseInt(localStorage.getItem('creatorStreak') || '0'))
  const lastCreatedDate = ref<string | null>(localStorage.getItem('lastCreatedDate'))
  const notificationTime = ref<string>(localStorage.getItem('notificationTime') || '09:00')
  const currentMotivation = ref<string>(getRandomMotivation())

  function getRandomMotivation(): string {
    return motivationPhrases[Math.floor(Math.random() * motivationPhrases.length)]!
  }

  function updateMotivation(): void {
    currentMotivation.value = getRandomMotivation()
  }

  function markCreated(): MotivationResult {
    const today = new Date().toDateString()
    
    if (lastCreatedDate.value === today) {
      return { success: false, message: 'Tu as déjà marqué ta création aujourd\'hui ! 🎉' }
    }
    
    if (lastCreatedDate.value) {
      const lastDate = new Date(lastCreatedDate.value)
      const todayDate = new Date(today)
      const diffTime = todayDate.getTime() - lastDate.getTime()
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
      
      if (diffDays === 1) {
        streak.value++
      } else if (diffDays > 1) {
        streak.value = 1
      }
    } else {
      streak.value = 1
    }
    
    lastCreatedDate.value = today
    localStorage.setItem('lastCreatedDate', lastCreatedDate.value)
    localStorage.setItem('creatorStreak', streak.value.toString())
    
    updateMotivation()
    
    return { 
      success: true, 
      message: `🎉 Bravo ! Streak de ${streak.value} jour${streak.value > 1 ? 's' : ''} !`,
      streak: streak.value
    }
  }

  function checkStreak(): StreakCheck {
    const today = new Date().toDateString()
    
    if (lastCreatedDate.value) {
      const lastDate = new Date(lastCreatedDate.value)
      const todayDate = new Date(today)
      const diffTime = todayDate.getTime() - lastDate.getTime()
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
      
      if (diffDays > 1 && streak.value > 0) {
        streak.value = 0
        localStorage.setItem('creatorStreak', '0')
        return { broken: true, message: '⚠️ Ta streak a été cassée. Recommence aujourd\'hui !' }
      }
    }
    
    return { broken: false }
  }

  const hasCreatedToday = computed(() => {
    if (!lastCreatedDate.value) return false
    return lastCreatedDate.value === new Date().toDateString()
  })

  const lastCreatedDisplay = computed(() => {
    if (!lastCreatedDate.value) return null
    
    const date = new Date(lastCreatedDate.value)
    const today = new Date().toDateString()
    
    if (date.toDateString() === today) {
      return '✅ Tu as déjà créé aujourd\'hui ! Génial !'
    }
    
    return `Dernière création : ${date.toLocaleDateString('fr-FR')}`
  })

  async function requestNotificationPermission(): Promise<MotivationResult> {
    if (!('Notification' in window)) {
      return { success: false, message: 'Les notifications ne sont pas supportées par ton navigateur' }
    }
    
    if (Notification.permission === 'granted') {
      scheduleNotification()
      return { success: true, message: 'Notifications activées !' }
    }
    
    if (Notification.permission === 'denied') {
      return { success: false, message: 'Notifications bloquées. Active-les dans les paramètres de ton navigateur.' }
    }
    
    const permission = await Notification.requestPermission()
    
    if (permission === 'granted') {
      scheduleNotification()
      return { success: true, message: 'Notifications activées !' }
    }
    
    return { success: false, message: 'Notifications refusées.' }
  }

  function scheduleNotification(): void {
    const [hours = '0', minutes = '0'] = notificationTime.value.split(':')
    localStorage.setItem('notificationTime', notificationTime.value)
    
    const now = new Date()
    const scheduledTime = new Date()
    scheduledTime.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0)
    
    if (scheduledTime <= now) {
      scheduledTime.setDate(scheduledTime.getDate() + 1)
    }
    
    const timeUntilNotification = scheduledTime.getTime() - now.getTime()
    
    setTimeout(() => {
      sendNotification()
      scheduleNotification()
    }, timeUntilNotification)
  }

  function sendNotification(): void {
    if (Notification.permission === 'granted') {
      const motivation = getRandomMotivation()
      new Notification('🎨 C\'est l\'heure de créer !', {
        body: motivation,
        icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y="75" font-size="75">🎨</text></svg>',
        tag: 'daily-creator',
        requireInteraction: true
      })
    }
  }

  return {
    streak,
    lastCreatedDate,
    notificationTime,
    currentMotivation,
    hasCreatedToday,
    lastCreatedDisplay,
    updateMotivation,
    markCreated,
    checkStreak,
    requestNotificationPermission,
    sendNotification
  }
}
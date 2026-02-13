<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useMotivation } from '@/composables/useMotivation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Flame, 
  Bell, 
  Sparkles, 
  Shuffle, 
  Clock,
  CheckCircle2,
  TrendingUp
} from 'lucide-vue-next'

const {
  streak,
  currentMotivation,
  hasCreatedToday,
  lastCreatedDisplay,
  notificationTime,
  updateMotivation,
  markCreated,
  checkStreak,
  requestNotificationPermission
} = useMotivation()

const statusMessage = ref('')
const statusType = ref<'success' | 'info'>('success')
const showStatus = ref(false)
const notificationsEnabled = ref(Notification.permission === 'granted')

const displayStatus = (message: string, type: 'success' | 'info' = 'success') => {
  statusMessage.value = message
  statusType.value = type
  showStatus.value = true
  
  setTimeout(() => {
    showStatus.value = false
  }, 4000)
}

const handleMarkCreated = () => {
  const result = markCreated()
  displayStatus(result.message, result.success ? 'success' : 'info')
}

const handleEnableNotifications = async () => {
  const result = await requestNotificationPermission()
  displayStatus(result.message, result.success ? 'success' : 'info')
  
  if (result.success) {
    notificationsEnabled.value = true
  }
}

onMounted(() => {
  const streakCheck = checkStreak()
  if (streakCheck.broken && streakCheck.message) {
    displayStatus(streakCheck.message, 'info')
  }
  
  if (Notification.permission === 'granted') {
    notificationsEnabled.value = true
  }
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-green-600 via-green-700 to-indigo-800 py-8 px-4">
    <div class="max-w-2xl mx-auto space-y-6">
      
      <!-- Header -->
      <div class="text-center space-y-2">
        <h1 class="text-5xl font-bold text-white flex items-center justify-center gap-3">
          <Sparkles class="w-10 h-10" />
          Créateur Quotidien
        </h1>
        <p class="text-green-100 text-lg">Ta dose quotidienne de motivation freelance</p>
      </div>

      <!-- Status Message -->
      <Transition
        enter-active-class="transition ease-out duration-300"
        enter-from-class="opacity-0 transform -translate-y-2"
        enter-to-class="opacity-100 transform translate-y-0"
        leave-active-class="transition ease-in duration-200"
        leave-from-class="opacity-100 transform translate-y-0"
        leave-to-class="opacity-0 transform -translate-y-2"
      >
        <Alert v-if="showStatus" :class="statusType === 'success' ? 'bg-green-500/20 border-green-400/50' : 'bg-blue-500/20 border-blue-400/50'">
          <AlertDescription class="text-white text-center font-medium">
            {{ statusMessage }}
          </AlertDescription>
        </Alert>
      </Transition>

      <!-- Streak Card -->
      <Card class="bg-white/10 backdrop-blur-lg border-white/20">
        <CardContent class="pt-6">
          <div class="text-center space-y-4">
            <div class="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-orange-400 to-red-500 rounded-full shadow-lg">
              <Flame class="w-14 h-14 text-white" />
            </div>
            
            <div>
              <div class="text-7xl font-bold text-white mb-2">{{ streak }}</div>
              <div class="text-xl text-green-100">jours de suite</div>
            </div>

            <div v-if="hasCreatedToday" class="flex items-center justify-center gap-2 text-green-300">
              <CheckCircle2 class="w-5 h-5" />
              <span class="font-medium">Créé aujourd'hui !</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Motivation Card -->
      <Card class="bg-white/10 backdrop-blur-lg border-white/20">
        <CardContent class="pt-6 space-y-6">
          <div class="flex items-start gap-3">
            <TrendingUp class="w-6 h-6 text-green-300 mt-1 flex-shrink-0" />
            <p class="text-xl text-white italic leading-relaxed">
              {{ currentMotivation }}
            </p>
          </div>
          
          <Button 
            variant="outline" 
            class="w-full bg-white/10 border-white/30 text-white hover:bg-white/20"
            @click="updateMotivation"
          >
            <Shuffle class="w-4 h-4 mr-2" />
            Nouvelle phrase
          </Button>
        </CardContent>
      </Card>

      <!-- Notification Settings -->
      <Card class="bg-white/10 backdrop-blur-lg border-white/20">
        <CardHeader>
          <CardTitle class="flex items-center gap-3 text-white">
            <Clock class="w-5 h-5 text-green-300" />
            Notifications quotidiennes
          </CardTitle>
          <CardDescription class="text-green-200">
            Reçois un rappel chaque jour à l'heure que tu choisis
          </CardDescription>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="space-y-2">
            <Label for="notification-time" class="text-white">Heure de notification</Label>
            <Input 
              id="notification-time"
              v-model="notificationTime"
              type="time"
              class="bg-white/20 border-white/30 text-white text-center text-lg"
            />
          </div>

          <Button 
            v-if="!notificationsEnabled"
            class="w-full bg-gradient-to-r from-green-500 to-pink-500 hover:from-green-600 hover:to-pink-600"
            @click="handleEnableNotifications"
          >
            <Bell class="w-4 h-4 mr-2" />
            Activer les notifications
          </Button>
          
          <Badge v-else variant="secondary" class="w-full justify-center py-2 bg-green-500/30 border-green-400/50 text-white">
            <CheckCircle2 class="w-4 h-4 mr-2" />
            Notifications activées
          </Badge>
        </CardContent>
      </Card>

      <!-- Action Button -->
      <Button 
        size="lg"
        class="w-full bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 text-white text-lg py-6 shadow-xl shadow-pink-500/50"
        :disabled="hasCreatedToday"
        @click="handleMarkCreated"
      >
        <Sparkles class="w-5 h-5 mr-2" />
        {{ hasCreatedToday ? 'Déjà créé aujourd\'hui !' : 'J\'ai créé aujourd\'hui !' }}
      </Button>

      <!-- Last Created -->
      <div v-if="lastCreatedDisplay" class="text-center text-green-200 text-sm">
        {{ lastCreatedDisplay }}
      </div>

      <!-- Footer -->
      <div class="text-center text-green-200 text-sm space-y-2 pt-4">
        <p>💡 Crée du contenu chaque jour pour booster ta carrière freelance</p>
        <p class="text-xs opacity-75">Stockage local • Aucune donnée envoyée • 100% privé</p>
      </div>

    </div>
  </div>
</template>

<style scoped>
input[type="time"]::-webkit-calendar-picker-indicator {
  filter: invert(1);
  cursor: pointer;
}
</style>
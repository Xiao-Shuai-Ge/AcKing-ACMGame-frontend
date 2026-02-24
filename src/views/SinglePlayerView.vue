<template>
  <div class="min-h-[calc(100vh-64px)] bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center p-4 transition-colors duration-300">
    <!-- Loading State -->
    <div v-if="loading && !room" class="flex flex-col items-center">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
      <p class="mt-4 text-gray-600 dark:text-gray-300 font-medium">正在进入单人模式...</p>
    </div>

    <!-- Room Content -->
    <template v-else-if="room">
      <!-- Game Interface (Blurred when finished) -->
      <div 
        class="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-3 gap-8 items-start transition-all duration-500"
        :class="{ 'blur-sm opacity-50 pointer-events-none select-none': (room.status !== 0 && showSummary) }"
      >
        
        <!-- Main Game Area (Timer & Actions) -->
        <div class="lg:col-span-2 flex flex-col items-center justify-center min-h-[50vh] space-y-8">
          
          <!-- Problem Info -->
          <div class="w-full flex justify-between items-center bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <div>
              <p class="text-sm text-gray-500 dark:text-gray-400 font-mono mb-1">Problem ID</p>
              <h3 class="text-2xl font-bold text-gray-900 dark:text-white font-mono">{{ room.problem_id }}</h3>
            </div>
            <div class="text-right">
              <p class="text-sm text-gray-500 dark:text-gray-400 font-mono mb-1">Difficulty</p>
              <div class="flex items-center gap-2 justify-end">
                <span 
                  class="text-2xl font-black tabular-nums"
                  :class="getDifficultyColor(room.problem_difficulty)"
                >
                  {{ room.problem_difficulty }}
                </span>
              </div>
            </div>
          </div>

          <!-- Big Timer -->
          <div class="text-center relative group py-8">
            <div class="absolute inset-0 bg-indigo-500/10 blur-3xl rounded-full transform scale-150 group-hover:scale-175 transition-transform duration-700"></div>
            <h2 class="relative text-8xl md:text-9xl font-mono font-bold text-gray-900 dark:text-white tracking-widest tabular-nums drop-shadow-sm">
              {{ formatDuration(elapsedTime) }}
            </h2>
            <p class="relative text-lg text-gray-500 dark:text-gray-400 mt-4 font-medium tracking-widest uppercase">已用时间</p>
          </div>

          <!-- Action Buttons -->
          <div class="flex flex-col sm:flex-row gap-6 w-full max-w-md">
            <a
              :href="room.problem_url"
              target="_blank"
              class="flex-1 flex items-center justify-center px-8 py-5 rounded-2xl bg-indigo-600 text-white text-xl font-bold hover:bg-indigo-700 active:scale-95 transition-all shadow-lg hover:shadow-indigo-500/30 transform hover:-translate-y-1"
            >
              <span class="mr-2">🚀</span> 进入题目
            </a>
            
            <button
              v-if="room.status === 0"
              @click="handleAbandonRoom"
              class="flex-1 px-8 py-5 rounded-2xl bg-white dark:bg-gray-800 text-red-500 font-bold border-2 border-red-100 dark:border-red-900/30 hover:bg-red-50 dark:hover:bg-red-900/20 active:scale-95 transition-all"
            >
              放弃挑战
            </button>
            <button
              v-else
              @click="showSummary = true"
              class="flex-1 px-8 py-5 rounded-2xl bg-white dark:bg-gray-800 text-indigo-500 font-bold border-2 border-indigo-100 dark:border-indigo-900/30 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 active:scale-95 transition-all"
            >
              查看结算
            </button>
          </div>
        </div>

        <!-- Submission Status List -->
        <div class="lg:col-span-1 w-full bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-xl shadow-gray-200/50 dark:shadow-black/20 border border-gray-100 dark:border-gray-700/50 h-[60vh] flex flex-col">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span class="w-2 h-6 bg-indigo-500 rounded-full"></span>
              最近提交
            </h3>
            <span class="text-xs font-mono text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
              {{ submissions.length }} 次尝试
            </span>
          </div>
          
          <div class="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
            <TransitionGroup name="list">
              <div
                v-for="sub in submissions"
                :key="sub.submission_id"
                class="group relative p-4 rounded-xl border-2 transition-all duration-300 cursor-default overflow-hidden"
                :class="[
                  sub.isRead 
                    ? 'bg-gray-50 dark:bg-gray-700/30 border-transparent opacity-75 hover:opacity-100' 
                    : 'bg-white dark:bg-gray-800 border-indigo-100 dark:border-indigo-900/50 shadow-md translate-x-0 scale-100 z-10'
                ]"
                @mouseenter="markAsRead(sub.submission_id)"
              >
                <!-- Unread Indicator -->
                <div 
                  v-if="!sub.isRead" 
                  class="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-bl-lg shadow-sm animate-pulse"
                ></div>

                <div class="flex justify-between items-center mb-2">
                  <span 
                    class="font-bold text-lg"
                    :class="getVerdictColor(sub.verdict)"
                  >
                    {{ sub.verdict }}
                  </span>
                  <span class="text-xs font-mono text-gray-400">{{ formatTime(sub.submit_time * 1000) }}</span>
                </div>
                
                <div class="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <div class="flex items-center gap-2">
                    <span class="px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700">#{{ sub.submission_id }}</span>
                    <span>{{ sub.isRead ? '已读' : '新状态' }}</span>
                  </div>
                  <!-- Penalty Badge -->
                  <div v-if="isPenalty(sub.verdict)" class="px-2 py-0.5 rounded bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 font-bold">
                    +3 罚时
                  </div>
                </div>
              </div>
            </TransitionGroup>

            <div v-if="submissions.length === 0" class="h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 space-y-4 opacity-50">
              <div class="text-4xl">📝</div>
              <p class="text-sm">暂无提交记录</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Game Over Summary Overlay -->
      <div v-if="(room.status === 1 || room.status === 2) && showSummary" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 transition-all duration-500">
        <div class="relative bg-white dark:bg-gray-800 p-8 md:p-12 rounded-[2rem] shadow-2xl max-w-lg w-full transform transition-all animate-fade-in-up border border-gray-100 dark:border-gray-700">
          
          <!-- Close Button -->
          <button 
            @click="showSummary = false"
            class="absolute top-4 right-4 p-2 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div class="text-center mb-10">
            <div class="text-7xl mb-6 animate-bounce-slow">
              {{ room.status === 2 ? '🎉' : '🏳️' }}
            </div>
            <h2 class="text-4xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">
              {{ room.status === 2 ? '挑战成功！' : '挑战结束' }}
            </h2>
            <p class="text-gray-500 dark:text-gray-400">
              {{ room.status === 2 ? '恭喜你完成了本次挑战' : '不要气馁，下次继续加油' }}
            </p>
          </div>
          
          <div class="grid grid-cols-2 gap-6 mb-10">
            <div class="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-gray-700 dark:to-gray-700/50 p-6 rounded-2xl text-center">
              <p class="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Rating 变动</p>
              <p class="text-4xl font-black tabular-nums" :class="ratingDiff >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'">
                {{ ratingDiff > 0 ? '+' : '' }}{{ ratingDiff }}
              </p>
            </div>
            <div class="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-2xl text-center border border-gray-100 dark:border-gray-700">
              <p class="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">总用时</p>
              <p class="text-3xl font-bold text-gray-900 dark:text-white font-mono">
                {{ formatDuration(finalDuration) }}
              </p>
            </div>
          </div>

          <button 
            @click="startNewGame"
            class="w-full py-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-lg font-bold transition-all shadow-lg hover:shadow-indigo-500/30 active:scale-95"
          >
            开始新一局
          </button>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '../store/user'
import { API_BASE_URL } from '../api/request'
import {
  abandonSinglePlayerRoom,
  createSinglePlayerRoom,
  getSinglePlayerRoomInfo,
  type SinglePlayerRoomInfo,
  type RoomSubmissionRecord
} from '../api/singlePlayer'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

// State
const room = ref<SinglePlayerRoomInfo | null>(null)
const loading = ref(false)
const showSummary = ref(false)
const wsConnected = ref(false)
const elapsedTime = ref(0)
let timerInterval: number | null = null
let ws: WebSocket | null = null

// Submissions List
interface Submission extends RoomSubmissionRecord {
  isRead: boolean
}
const submissions = ref<Submission[]>([])

const updateSubmissions = (newRecords: RoomSubmissionRecord[] | undefined) => {
  if (!newRecords) return
  
  const isInitialLoad = submissions.value.length === 0
  const readStatus = new Map<number, boolean>()
  submissions.value.forEach(s => {
    readStatus.set(s.submission_id, s.isRead)
  })

  const mapped = newRecords.map(r => ({
    ...r,
    isRead: readStatus.has(r.submission_id) ? readStatus.get(r.submission_id)! : (isInitialLoad ? true : false)
  })).reverse()

  submissions.value = mapped
}

watch(() => room.value, (newRoom) => {
  if (newRoom?.submissions) {
    updateSubmissions(newRoom.submissions)
  }
}, { deep: true })

// Computed
const ratingDiff = computed(() => {
  if (!room.value) return 0
  // If rating_after is not set yet (e.g. 0 or null), use current rating or 0
  // Usually backend returns rating_after when status is finished
  if (room.value.rating_after === undefined || room.value.rating_after === null) return 0
  return room.value.rating_after - room.value.rating_before
})

const finalDuration = computed(() => {
  if (!room.value) return 0
  if (room.value.end_time) {
    // If end_time is timestamp in seconds or ms? Usually API returns seconds or ms.
    // Based on `formatTimestamp` usage later, let's check.
    // Assuming backend returns seconds for end_time and created_at is ISO string.
    const start = new Date(room.value.created_at).getTime()
    const end = room.value.end_time * 1000 // assuming seconds
    return Math.max(0, end - start)
  }
  return elapsedTime.value
})

// Lifecycle
onMounted(() => {
  checkAndEnterRoom()
})

onBeforeUnmount(() => {
  if (timerInterval) clearInterval(timerInterval)
  if (ws) ws.close()
})

// Methods
const getDifficultyColor = (difficulty: number) => {
  if (!difficulty) return 'text-gray-500 dark:text-gray-400'
  if (difficulty < 1200) return 'text-gray-500 dark:text-gray-400'
  if (difficulty < 1400) return 'text-green-500 dark:text-green-400'
  if (difficulty < 1600) return 'text-teal-500 dark:text-teal-400'
  if (difficulty < 1900) return 'text-blue-500 dark:text-blue-400'
  if (difficulty < 2100) return 'text-indigo-500 dark:text-indigo-400'
  if (difficulty < 2400) return 'text-yellow-500 dark:text-yellow-400'
  return 'text-red-500 dark:text-red-400'
}

const isPenalty = (verdict: string) => {
  if (!verdict) return false
  const v = verdict.toLowerCase()
  const pendingStates = ['running', 'compiling', 'judging', 'pending', 'queued']
  if (pendingStates.some(s => v.includes(s))) return false
  const okStates = ['accepted', 'ac', 'ok']
  if (okStates.some(s => v.includes(s))) return false
  // CE usually not penalty in CF rules, but let's assume standard penalty rules for non-AC
  if (v.includes('compilation error')) return false 
  return true
}

const checkAndEnterRoom = async () => {
  loading.value = true
  const routeRoomId = route.params.roomId as string
  const savedRoomId = localStorage.getItem('single_player_room_id')

  // 1. Check URL Room ID
  if (routeRoomId) {
    try {
      const res = await getSinglePlayerRoomInfo(routeRoomId)
      if (res.room) {
        room.value = res.room
        if (Number(res.room.status) === 0) {
          // Active room, resume it
          localStorage.setItem('single_player_room_id', res.room.room_id)
          connectWs()
          startTimer()
        } else {
          // Finished room, show summary
          showSummary.value = true
          stopTimer()
        }
        loading.value = false
        return
      }
    } catch (e) {
      console.warn('Room not found or error', e)
      ElMessage.warning('房间不存在或已失效')
      // Redirect to clean URL and create new room
      router.replace({ name: 'single-player' }).then(() => {
        handleCreateRoom()
      })
      return
    }
  }

  // 2. Check Saved Active Room
  if (savedRoomId) {
    try {
      const res = await getSinglePlayerRoomInfo(savedRoomId)
      if (res.room && Number(res.room.status) === 0) {
        room.value = res.room
        connectWs()
        startTimer()
        loading.value = false
        // Update URL to include roomId
        router.replace({ name: 'single-player', params: { roomId: res.room.room_id } })
        return
      } else {
        localStorage.removeItem('single_player_room_id')
      }
    } catch (e) {
      localStorage.removeItem('single_player_room_id')
    }
  }

  // 3. Create New Room
  await handleCreateRoom()
}

const handleCreateRoom = async () => {
  loading.value = true
  try {
    const res = await createSinglePlayerRoom()
    room.value = res.room
    localStorage.setItem('single_player_room_id', res.room.room_id)
    
    // Update URL
    router.replace({ name: 'single-player', params: { roomId: res.room.room_id } })
    
    connectWs()
    startTimer()
    submissions.value = []
    showSummary.value = false
  } catch (error) {
    console.error(error)
    ElMessage.error('创建房间失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

const handleAbandonRoom = async () => {
  if (!room.value) return
  try {
    const res = await abandonSinglePlayerRoom(room.value.room_id)
    room.value = res.room
    stopTimer()
    updateUserRating(room.value.rating_after)
    showSummary.value = true
  } catch (error) {
    console.error(error)
    ElMessage.error('操作失败')
  }
}

const startNewGame = () => {
  localStorage.removeItem('single_player_room_id')
  room.value = null
  showSummary.value = false
  router.push({ name: 'single-player' }).then(() => {
    handleCreateRoom()
  })
}

const updateUserRating = (newRating: number | undefined) => {
  if (newRating !== undefined && userStore.userInfo) {
    userStore.userInfo.rating = newRating
    localStorage.setItem('userInfo', JSON.stringify(userStore.userInfo))
  }
}

// Timer Logic
const startTimer = () => {
  if (timerInterval) clearInterval(timerInterval)
  updateElapsedTime()
  timerInterval = window.setInterval(updateElapsedTime, 1000)
}

const stopTimer = () => {
  if (timerInterval) {
    clearInterval(timerInterval)
    timerInterval = null
  }
}

const updateElapsedTime = () => {
  if (!room.value) return
  const start = new Date(room.value.created_at).getTime()
  const now = Date.now()
  elapsedTime.value = Math.max(0, now - start)
}

// Formatting
const formatDuration = (ms: number) => {
  const totalSeconds = Math.floor(ms / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  
  const pad = (n: number) => n.toString().padStart(2, '0')
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
}

const formatTime = (timestamp: number) => {
  const date = new Date(timestamp)
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

const getVerdictColor = (verdict: string) => {
  const v = verdict.toLowerCase()
  if (v.includes('accepted') || v === 'ok' || v === 'ac') return 'text-green-600 dark:text-green-400'
  if (v.includes('wrong') || v === 'wa') return 'text-red-600 dark:text-red-400'
  if (v.includes('time') || v === 'tle') return 'text-yellow-600 dark:text-yellow-400'
  return 'text-gray-600 dark:text-gray-400'
}

// Submissions & Status
const markAsRead = (id: number) => {
  const sub = submissions.value.find(s => s.submission_id === id)
  if (sub && !sub.isRead) {
    sub.isRead = true
  }
}

// WebSocket
const buildWsUrl = () => {
  const base = API_BASE_URL
  const origin = base.replace(/\/api\/?$/, '')
  const token = localStorage.getItem('token') || ''
  const url = new URL(`${origin}/api/common/ws`)
  if (token) {
    url.searchParams.set('token', token)
  }
  if (room.value?.room_id) {
    url.searchParams.set('room_id', room.value.room_id)
  }
  return url.toString().replace(/^http/, 'ws')
}

const connectWs = () => {
  if (!localStorage.getItem('token') || !room.value) {
    return
  }
  try {
    if (ws) ws.close()
    ws = new WebSocket(buildWsUrl())
    
    ws.onopen = () => {
      wsConnected.value = true
    }
    
    ws.onclose = () => {
      wsConnected.value = false
    }
    
    ws.onerror = () => {
      wsConnected.value = false
    }
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data || '{}')
        
        // Handle Room Update
        if (data.type === 'single_room_update' && data.data?.room) {
          room.value = data.data.room
          // Submissions are handled by watcher on room.value
        } else if (data.type === 'single_room_finish' && data.data?.room) {
          room.value = data.data.room
          stopTimer()
          if (room.value?.rating_after) {
            updateUserRating(room.value.rating_after)
          }
          showSummary.value = true
        }
      } catch (error) {
        console.error('WS Error', error)
      }
    }
  } catch (error) {
    console.error(error)
  }
}
</script>

<style scoped>
/* List Transitions */
.list-enter-active,
.list-leave-active {
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}
.list-enter-from {
  opacity: 0;
  transform: translateX(50px) scale(0.9);
}
.list-leave-to {
  opacity: 0;
  transform: translateX(-50px);
}

/* Animations */
@keyframes bounce-slow {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}
.animate-bounce-slow {
  animation: bounce-slow 3s infinite ease-in-out;
}

@keyframes fade-in-up {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in-up {
  animation: fade-in-up 0.6s ease-out forwards;
}

/* Custom Scrollbar */
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgba(156, 163, 175, 0.5);
  border-radius: 3px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: rgba(156, 163, 175, 0.8);
}
</style>

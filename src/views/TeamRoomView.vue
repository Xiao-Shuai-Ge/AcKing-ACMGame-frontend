<template>
  <div class="min-h-[calc(100vh-64px)] bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
    <div v-if="loading && !room" class="flex flex-col items-center justify-center py-20">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
      <p class="mt-4 text-gray-600 dark:text-gray-300 font-medium">正在进入团队房间...</p>
    </div>

    <div v-else-if="room" class="w-full max-w-7xl mx-auto px-4 py-6 space-y-6">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white">房间 {{ room.room_id }}</h2>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
            模式 {{ room.mode }} · {{ room.status === 0 ? '进行中' : '已结束' }} · 题目 {{ room.problems.length }}
          </p>
          <div class="mt-3 flex flex-wrap items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
            <span class="px-2 py-1 rounded-lg bg-gray-100 dark:bg-gray-700/60">
              倒计时 {{ getCountdownText() }}
            </span>
            <span class="px-2 py-1 rounded-lg bg-gray-100 dark:bg-gray-700/60">
              已解 {{ getSolvedCount() }}/{{ room.problems.length }}
            </span>
            <span class="px-2 py-1 rounded-lg bg-gray-100 dark:bg-gray-700/60">
              总罚时 {{ getTotalPenaltyMinutes() }}分
            </span>
          </div>
        </div>
        <div class="flex items-center gap-3">
          <span
            class="text-xs px-2 py-1 rounded-full"
            :class="wsConnected ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300' : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300'"
          >
            {{ wsConnected ? '实时连接中' : '未连接' }}
          </span>
          <button
            @click="backToList"
            class="px-4 py-2 rounded-xl bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
          >
            返回房间列表
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div class="lg:col-span-3 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 h-[calc(100vh-240px)] overflow-y-auto">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">题目列表</h3>
          <div class="mt-4 space-y-3">
            <a
              v-for="problem in room.problems"
              :key="problem.problem_id"
              :href="problem.problem_url"
              target="_blank"
              class="block rounded-xl border p-3 transition"
              :class="problem.solved
                ? 'border-green-200 bg-green-50 hover:bg-green-100 dark:border-green-500/30 dark:bg-green-500/10 dark:hover:bg-green-500/20'
                : 'border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/40'"
            >
              <div class="flex items-center justify-between">
                <span class="font-mono text-indigo-600 dark:text-indigo-400">
                  {{ problem.problem_id }}
                </span>
                <span :class="getDifficultyColor(problem.difficulty)" class="font-semibold">
                  {{ problem.difficulty }}
                </span>
              </div>
              <div class="mt-2 text-xs text-gray-500 dark:text-gray-400">
                <span v-if="problem.solved">
                  已通过 · {{ getUserName(problem.solved_by) }} · 罚时 {{ getProblemPenaltyMinutes(problem) }}
                </span>
                <span v-else>未通过</span>
              </div>
            </a>
            <div v-if="room.problems.length === 0" class="text-sm text-gray-400 dark:text-gray-500">
              暂无题目
            </div>
          </div>
        </div>

        <div class="lg:col-span-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 h-[calc(100vh-240px)] flex flex-col">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">聊天室</h3>
          <div ref="chatScrollRef" class="mt-4 flex-1 overflow-y-auto space-y-4" @scroll="handleChatScroll">
            <div v-if="messages.length === 0" class="text-sm text-gray-400 dark:text-gray-500 text-center mt-10">
              暂无消息
            </div>
            <div
              v-for="message in messages"
              :key="message.id"
              class="flex"
              :class="message.type === 'system' ? 'justify-center' : (isSelf(message.userId) ? 'justify-end' : 'justify-start')"
            >
              <div v-if="message.type === 'system'" class="text-xs text-gray-400 dark:text-gray-500">
                {{ message.content }}
              </div>
              <div
                v-else
                class="max-w-[70%] w-fit flex flex-col"
                :class="isSelf(message.userId) ? 'ml-auto items-end' : 'items-start'"
              >
                <div
                  class="text-xs mb-1 flex items-center gap-2"
                  :class="isSelf(message.userId) ? 'justify-end text-indigo-100/90' : 'justify-start text-gray-500 dark:text-gray-300'"
                >
                  <template v-if="isSelf(message.userId)">
                    <span>{{ formatTime(message.time) }}</span>
                    <span>{{ getMessageUserName(message) }}</span>
                  </template>
                  <template v-else>
                    <span>{{ getMessageUserName(message) }}</span>
                    <span>{{ formatTime(message.time) }}</span>
                  </template>
                </div>
                <div
                  class="px-4 py-3 rounded-2xl shadow-sm w-fit max-w-full"
                  :class="isSelf(message.userId)
                    ? 'bg-indigo-600 text-white rounded-br-md'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-bl-md'"
                >
                  <div class="text-sm whitespace-pre-line break-words">{{ message.content }}</div>
                </div>
              </div>
            </div>
          </div>
          <div class="pt-4 flex items-center gap-3">
            <input
              v-model="chatInput"
              @keydown.enter.prevent="sendChat"
              type="text"
              placeholder="输入消息，回车发送"
              class="flex-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              @click="sendChat"
              class="px-5 py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 active:scale-95 transition"
            >
              发送
            </button>
          </div>
        </div>

        <div class="lg:col-span-3 space-y-6">
          <div class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 h-[calc(50vh-140px)] overflow-y-auto">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">用户列表</h3>
            <div class="mt-4 space-y-3">
              <div
                v-for="player in room.players"
                :key="player.user_id"
                class="flex items-center justify-between text-sm"
              >
                <a
                  class="text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
                  :href="getProfileLink(player.user_id)"
                  target="_blank"
                  rel="noopener"
                >
                  {{ player.username }}
                </a>
              </div>
              <div v-if="room.players.length === 0" class="text-sm text-gray-400 dark:text-gray-500">
                暂无成员
              </div>
            </div>
          </div>

          <div class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 h-[calc(50vh-140px)] overflow-y-auto">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">提交记录</h3>
            <div class="mt-4 space-y-3">
              <div
                v-for="item in submissions"
                :key="item.id"
                class="text-sm border border-gray-100 dark:border-gray-700 rounded-xl px-3 py-2"
              >
                <div class="flex items-center justify-between">
                  <span class="font-mono text-indigo-600 dark:text-indigo-400">{{ item.problemId }}</span>
                  <span :class="getVerdictColor(item.verdict)">{{ item.verdict }}</span>
                </div>
                <div class="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  {{ item.username || item.userId }} · {{ formatTime(item.submitTime) }}
                </div>
              </div>
              <div v-if="submissions.length === 0" class="text-sm text-gray-400 dark:text-gray-500">
                暂无提交记录
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { API_BASE_URL } from '../api/request'
import { getUserInfo } from '../api/auth'
import { getTeamRoomInfo, type TeamRoomInfo, type TeamRoomProblemInfo, type TeamRoomSubmissionInfo } from '../api/teamRoom'
import { useUserStore } from '../store/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const room = ref<TeamRoomInfo | null>(null)
const loading = ref(false)
const wsConnected = ref(false)
let ws: WebSocket | null = null
const chatInput = ref('')
const userNameMap = ref<Record<string, string>>({})
const fetchingUserIds = new Set<string>()
const remainingSeconds = ref(0)
let countdownTimer: number | null = null

interface RoomMessage {
  id: number
  type: 'system' | 'chat'
  content: string
  time: number
  userId: string
  username: string
}

interface SubmissionItem {
  id: number
  problemId: string
  verdict: string
  userId: string
  username: string
  submitTime: number
}

const messages = ref<RoomMessage[]>([])
const submissions = ref<SubmissionItem[]>([])
let messageSeq = 1
let submissionSeq = 1
const chatScrollRef = ref<HTMLElement | null>(null)
const chatAtBottom = ref(true)

const addSystemMessage = (content: string) => {
  messages.value.push({
    id: messageSeq++,
    type: 'system',
    content,
    time: Date.now(),
    userId: '',
    username: '',
  })
}

const addChatMessage = (payload: { content: string; userId: string; username: string; time: number }) => {
  if (payload.userId) {
    setUserName(payload.userId, payload.username)
  }
  messages.value.push({
    id: messageSeq++,
    type: 'chat',
    content: payload.content,
    time: payload.time,
    userId: payload.userId,
    username: payload.username,
  })
}

const handleChatScroll = () => {
  const el = chatScrollRef.value
  if (!el) return
  const distance = el.scrollHeight - el.scrollTop - el.clientHeight
  chatAtBottom.value = distance <= 24
}

const scrollChatToBottom = (behavior: ScrollBehavior = 'auto') => {
  const el = chatScrollRef.value
  if (!el) return
  el.scrollTo({ top: el.scrollHeight, behavior })
}

const addSubmission = (payload: { problemId: string; verdict: string; userId: string }) => {
  submissions.value.unshift({
    id: submissionSeq++,
    problemId: payload.problemId,
    verdict: payload.verdict,
    userId: payload.userId,
    username: getUserName(payload.userId),
    submitTime: Date.now(),
  })
}

const fetchRoom = async () => {
  const roomId = route.params.roomId as string
  if (!roomId) return
  loading.value = true
  try {
    const res = await getTeamRoomInfo(roomId)
    room.value = res.room
    syncUserNamesFromRoom(res.room)
    resetSubmissionsFromRoom(res.room.submissions)
    updateCountdown()
  } catch (error) {
    console.error(error)
    ElMessage.error('房间不存在或已失效')
    router.replace({ name: 'team-room-list' })
  } finally {
    loading.value = false
  }
}

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
      addSystemMessage('已连接到房间')
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
        if (data.type === 'team_room_update' && data.data?.room) {
          room.value = data.data.room
          syncUserNamesFromRoom(data.data.room)
          updateCountdown()
          if (data.data?.user_id && data.data?.problem_id && data.data?.last_verdict) {
            void ensureUserName(String(data.data.user_id))
            addSubmission({
              problemId: data.data.problem_id,
              verdict: data.data.last_verdict,
              userId: String(data.data.user_id),
            })
            addSystemMessage(`${getUserName(String(data.data.user_id))} 提交 ${data.data.problem_id} - ${data.data.last_verdict}`)
          }
        } else if (data.type === 'team_room_member_update' && data.data?.room) {
          room.value = data.data.room
          syncUserNamesFromRoom(data.data.room)
          updateCountdown()
          const action = data.data?.action === 'leave' ? '离开' : '加入'
          void ensureUserName(String(data.data?.user_id || ''))
          const userName = getUserName(String(data.data?.user_id))
          addSystemMessage(`${userName} ${action}了房间`)
        } else if (data.type === 'team_room_finish' && data.data?.room) {
          room.value = data.data.room
          syncUserNamesFromRoom(data.data.room)
          updateCountdown()
          addSystemMessage('房间已结束')
        } else if (data.type === 'team_room_chat' && data.data?.content) {
          const senderId = String(data.data.user_id || '')
          const senderName = String(data.data.username || getUserName(senderId))
          void ensureUserName(senderId)
          addChatMessage({
            content: String(data.data.content),
            userId: senderId,
            username: senderName,
            time: Number(data.data.ts) * 1000 || Date.now(),
          })
        }
      } catch (error) {
        console.error('WS Error', error)
      }
    }
  } catch (error) {
    console.error(error)
  }
}

const backToList = () => {
  router.push({ name: 'team-room-list' })
}

const getProfileLink = (userId: string) => {
  if (!userId) return '#'
  return router.resolve({ name: 'user-profile', params: { id: userId } }).href
}

const isSelf = (userId: string) => {
  if (!userId) return false
  return userStore.userInfo?.id === userId
}

const setUserName = (userId: string, username: string) => {
  if (!userId || !username) return
  userNameMap.value[userId] = username
}

const syncUserNamesFromRoom = (roomInfo?: TeamRoomInfo | null) => {
  const source = roomInfo || room.value
  if (!source?.players?.length) return
  source.players.forEach((player) => {
    if (!player.user_id || !player.username) return
    userNameMap.value[player.user_id] = player.username
  })
}

const ensureUserName = async (userId: string) => {
  if (!userId || userNameMap.value[userId]) return
  if (fetchingUserIds.has(userId)) return
  fetchingUserIds.add(userId)
  try {
    const res = await getUserInfo(userId)
    setUserName(userId, res.username || userId)
  } catch (error) {
    console.error(error)
  } finally {
    fetchingUserIds.delete(userId)
  }
}

const getUserName = (userId: string) => {
  if (!userId) return ''
  if (userNameMap.value[userId]) return userNameMap.value[userId]
  const current = room.value?.players?.find(p => p.user_id === userId)
  if (current?.username) {
    setUserName(userId, current.username)
    return current.username
  }
  void ensureUserName(userId)
  return userId
}

const getMessageUserName = (message: RoomMessage) => {
  if (!message.userId) return ''
  return message.username || getUserName(message.userId)
}

const resetSubmissionsFromRoom = (items?: TeamRoomSubmissionInfo[]) => {
  submissions.value = []
  submissionSeq = 1
  if (!items || items.length === 0) return
  const sorted = [...items].sort((a, b) => b.submit_time - a.submit_time)
  submissions.value = sorted.map((item) => {
    void ensureUserName(item.user_id)
    return {
      id: submissionSeq++,
      problemId: item.problem_id,
      verdict: item.verdict,
      userId: item.user_id,
      username: getUserName(item.user_id),
      submitTime: item.submit_time * 1000,
    }
  })
}

const getProblemPenaltyMinutes = (problem: TeamRoomProblemInfo) => {
  if (!problem.solved) return 0
  const minutes = Math.floor(problem.solved_at / 60)
  return minutes + (problem.penalty || 0)
}

const getSolvedCount = () => {
  if (!room.value) return 0
  return room.value.problems.filter(p => p.solved).length
}

const getTotalPenaltyMinutes = () => {
  if (!room.value) return 0
  return room.value.problems.reduce((total, problem) => {
    if (!problem.solved) return total
    return total + getProblemPenaltyMinutes(problem)
  }, 0)
}

const updateCountdown = () => {
  if (!room.value) return
  if (room.value.status !== 0) {
    remainingSeconds.value = 0
    return
  }
  if (room.value.duration <= 0) {
    remainingSeconds.value = 0
    return
  }
  const start = new Date(room.value.created_at).getTime()
  if (!start || Number.isNaN(start)) {
    remainingSeconds.value = 0
    return
  }
  const end = start + room.value.duration * 1000
  const now = Date.now()
  remainingSeconds.value = Math.max(0, Math.floor((end - now) / 1000))
}

const getCountdownText = () => {
  if (!room.value) return '--'
  if (room.value.status !== 0) return '已结束'
  if (room.value.duration <= 0) return '不限时'
  const total = Math.max(0, remainingSeconds.value)
  const hours = Math.floor(total / 3600)
  const minutes = Math.floor((total % 3600) / 60)
  const seconds = total % 60
  const hh = String(hours).padStart(2, '0')
  const mm = String(minutes).padStart(2, '0')
  const ss = String(seconds).padStart(2, '0')
  return `${hh}:${mm}:${ss}`
}

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

const getVerdictColor = (verdict: string) => {
  const v = verdict.toLowerCase()
  if (v.includes('accepted') || v === 'ok' || v === 'ac') return 'text-green-600 dark:text-green-400'
  if (v.includes('wrong') || v === 'wa') return 'text-red-600 dark:text-red-400'
  if (v.includes('time') || v === 'tle') return 'text-yellow-600 dark:text-yellow-400'
  return 'text-gray-600 dark:text-gray-400'
}

const formatTime = (timestamp: number) => {
  const date = new Date(timestamp)
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

const sendChat = () => {
  const content = chatInput.value.trim()
  if (!content || !ws || !wsConnected.value || !room.value?.room_id) {
    return
  }
  ws.send(
    JSON.stringify({
      type: 'team_room_chat',
      data: {
        room_id: room.value.room_id,
        content,
      },
    })
  )
  chatInput.value = ''
}

onMounted(async () => {
  await fetchRoom()
  if (room.value) {
    connectWs()
  }
  await nextTick()
  scrollChatToBottom()
  countdownTimer = window.setInterval(() => {
    updateCountdown()
  }, 1000)
})

watch(
  () => messages.value.length,
  async () => {
    if (!chatAtBottom.value) return
    await nextTick()
    scrollChatToBottom('smooth')
  }
)

watch(
  () => chatInput.value,
  async () => {
    if (!chatAtBottom.value) return
    await nextTick()
    scrollChatToBottom()
  }
)

onBeforeUnmount(() => {
  if (ws) {
    ws.close()
    ws = null
  }
  if (countdownTimer) {
    window.clearInterval(countdownTimer)
    countdownTimer = null
  }
})
</script>

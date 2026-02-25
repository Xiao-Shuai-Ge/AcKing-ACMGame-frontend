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
            <div
              v-for="problem in room.problems"
              :key="problem.problem_id"
              class="rounded-xl border border-gray-100 dark:border-gray-700 p-3 hover:bg-gray-50 dark:hover:bg-gray-700/40 transition"
            >
              <div class="flex items-center justify-between">
                <a
                  :href="problem.problem_url"
                  target="_blank"
                  class="font-mono text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  {{ problem.problem_id }}
                </a>
                <span :class="getDifficultyColor(problem.difficulty)" class="font-semibold">
                  {{ problem.difficulty }}
                </span>
              </div>
              <div class="mt-2 text-xs text-gray-500 dark:text-gray-400">
                <span v-if="problem.solved">
                  已通过 · {{ getUserName(problem.solved_by) }} · {{ formatDuration(problem.solved_at) }}
                </span>
                <span v-else>未通过</span>
              </div>
            </div>
            <div v-if="room.problems.length === 0" class="text-sm text-gray-400 dark:text-gray-500">
              暂无题目
            </div>
          </div>
        </div>

        <div class="lg:col-span-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 h-[calc(100vh-240px)] flex flex-col">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">聊天室</h3>
          <div class="mt-4 flex-1 overflow-y-auto space-y-3">
            <div v-if="events.length === 0" class="text-sm text-gray-400 dark:text-gray-500 text-center mt-10">
              暂无消息
            </div>
            <div
              v-for="event in events"
              :key="event.id"
              class="px-4 py-3 rounded-xl border border-gray-100 dark:border-gray-700"
            >
              <div class="text-sm text-gray-700 dark:text-gray-200">{{ event.message }}</div>
              <div class="text-xs text-gray-400 dark:text-gray-500 mt-1">{{ formatTime(event.time) }}</div>
            </div>
          </div>
          <div class="pt-4 text-xs text-gray-400 dark:text-gray-500">
            当前仅展示系统消息与提交动态
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
                <span class="text-gray-700 dark:text-gray-200">{{ player.username }}</span>
                <span class="text-xs text-gray-400 dark:text-gray-500">{{ formatTime(player.join_at * 1000) }}</span>
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
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { API_BASE_URL } from '../api/request'
import { getTeamRoomInfo, type TeamRoomInfo } from '../api/teamRoom'

const route = useRoute()
const router = useRouter()
const room = ref<TeamRoomInfo | null>(null)
const loading = ref(false)
const wsConnected = ref(false)
let ws: WebSocket | null = null

interface RoomEvent {
  id: number
  message: string
  time: number
}

interface SubmissionItem {
  id: number
  problemId: string
  verdict: string
  userId: string
  username: string
  submitTime: number
}

const events = ref<RoomEvent[]>([])
const submissions = ref<SubmissionItem[]>([])
let eventSeq = 1
let submissionSeq = 1

const addEvent = (message: string) => {
  events.value.push({
    id: eventSeq++,
    message,
    time: Date.now(),
  })
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
      addEvent('已连接到房间')
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
          if (data.data?.user_id && data.data?.problem_id && data.data?.last_verdict) {
            addSubmission({
              problemId: data.data.problem_id,
              verdict: data.data.last_verdict,
              userId: String(data.data.user_id),
            })
            addEvent(`${getUserName(String(data.data.user_id))} 提交 ${data.data.problem_id} - ${data.data.last_verdict}`)
          }
        } else if (data.type === 'team_room_member_update' && data.data?.room) {
          room.value = data.data.room
          const action = data.data?.action === 'leave' ? '离开' : '加入'
          const userName = getUserName(String(data.data?.user_id))
          addEvent(`${userName} ${action}了房间`)
        } else if (data.type === 'team_room_finish' && data.data?.room) {
          room.value = data.data.room
          addEvent('房间已结束')
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

const getUserName = (userId: string) => {
  const current = room.value?.players?.find(p => p.user_id === userId)
  return current?.username || userId
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

const formatDuration = (seconds: number) => {
  const total = Math.max(0, Math.floor(seconds))
  const minutes = Math.floor(total / 60)
  const secs = total % 60
  return `${minutes}分${secs}秒`
}

const formatTime = (timestamp: number) => {
  const date = new Date(timestamp)
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

onMounted(async () => {
  await fetchRoom()
  if (room.value) {
    connectWs()
  }
})

onBeforeUnmount(() => {
  if (ws) {
    ws.close()
    ws = null
  }
})
</script>

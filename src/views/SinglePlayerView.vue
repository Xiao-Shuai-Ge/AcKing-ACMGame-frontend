<template>
  <div class="min-h-[calc(100vh-64px)] bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
    <div class="max-w-5xl mx-auto px-6 py-10">
      <div class="flex flex-col gap-6">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white">单人模式</h2>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">完成题目后将自动结算评分</p>
          </div>
          <div class="flex items-center gap-3">
            <span
              class="text-xs px-3 py-1 rounded-full"
              :class="wsConnected ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' : 'bg-gray-200 text-gray-600 dark:bg-gray-800 dark:text-gray-400'"
            >
              {{ wsConnected ? 'WebSocket已连接' : 'WebSocket未连接' }}
            </span>
            <button
              v-if="!room"
              class="px-5 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
              :disabled="loading"
              @click="handleCreateRoom"
            >
              {{ loading ? '创建中...' : '开始匹配' }}
            </button>
          </div>
        </div>

        <div v-if="room" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div class="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">题目信息</h3>
              <span
                class="text-xs px-3 py-1 rounded-full"
                :class="room.status === 0 ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-200'"
              >
                {{ statusText }}
              </span>
            </div>
            <div class="mt-4 space-y-3 text-sm text-gray-700 dark:text-gray-300">
              <div class="flex items-center justify-between">
                <span>题目ID</span>
                <span class="font-medium">{{ room.problem_id }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span>难度</span>
                <span class="font-medium">{{ room.problem_difficulty }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span>罚时</span>
                <span class="font-medium">{{ room.penalty }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span>表现分</span>
                <span class="font-medium">{{ room.performance_score }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span>结算前rating</span>
                <span class="font-medium">{{ room.rating_before }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span>结算后rating</span>
                <span class="font-medium">{{ room.rating_after }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span>最近判题</span>
                <span class="font-medium">{{ lastVerdict || '暂无' }}</span>
              </div>
            </div>
            <div class="mt-6 flex items-center gap-3">
              <a
                :href="room.problem_url"
                target="_blank"
                class="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
              >
                打开题目
              </a>
              <button
                v-if="room.status === 0"
                class="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 disabled:opacity-50"
                :disabled="loading"
                @click="handleAbandonRoom"
              >
                放弃
              </button>
            </div>
          </div>

          <div class="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">房间信息</h3>
            <div class="mt-4 space-y-3 text-sm text-gray-700 dark:text-gray-300">
              <div class="flex items-center justify-between">
                <span>房间ID</span>
                <span class="font-medium">{{ room.room_id }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span>用户ID</span>
                <span class="font-medium">{{ room.user_id }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span>创建时间</span>
                <span class="font-medium">{{ formatTime(room.created_at) }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span>结束时间</span>
                <span class="font-medium">{{ room.end_time ? formatTimestamp(room.end_time) : '进行中' }}</span>
              </div>
            </div>
            <div class="mt-6 text-xs text-gray-500 dark:text-gray-400">
              提交后状态更新将通过 WebSocket 实时推送
            </div>
          </div>
        </div>

        <div v-else class="rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 p-10 text-center">
          <p class="text-gray-600 dark:text-gray-300">暂未创建房间，点击开始匹配进入单人模式</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '../store/user'
import { API_BASE_URL } from '../api/request'
import {
  abandonSinglePlayerRoom,
  createSinglePlayerRoom,
  getSinglePlayerRoomInfo,
  type SinglePlayerRoomInfo,
} from '../api/singlePlayer'

const route = useRoute()
const userStore = useUserStore()
const room = ref<SinglePlayerRoomInfo | null>(null)
const loading = ref(false)
const wsConnected = ref(false)
const lastVerdict = ref('')
let ws: WebSocket | null = null

const statusText = computed(() => {
  if (!room.value) return ''
  if (room.value.status === 0) return '进行中'
  if (room.value.status === 1) return '已放弃'
  if (room.value.status === 2) return '已完成'
  return '未知'
})

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
  if (!localStorage.getItem('token')) {
    return
  }
  try {
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
        if (data.type === 'single_room_update' && data.data?.room) {
          room.value = data.data.room
          lastVerdict.value = data.data.last_verdict || ''
          syncRating(room.value)
        }
        if (data.type === 'single_room_finish' && data.data?.room) {
          room.value = data.data.room
          lastVerdict.value = ''
          syncRating(room.value)
        }
      } catch (error) {
        console.error(error)
      }
    }
  } catch (error) {
    console.error(error)
  }
}

const syncRating = (info: SinglePlayerRoomInfo | null) => {
  if (!info || !userStore.userInfo) return
  if (info.rating_after > 0) {
    userStore.userInfo.rating = info.rating_after
    localStorage.setItem('userInfo', JSON.stringify(userStore.userInfo))
  }
}

const handleCreateRoom = async () => {
  if (!localStorage.getItem('token')) {
    ElMessage.error('请先登录')
    return
  }
  loading.value = true
  try {
    const res = await createSinglePlayerRoom()
    room.value = res.room
    lastVerdict.value = ''
  } finally {
    loading.value = false
  }
}

const handleAbandonRoom = async () => {
  if (!room.value) return
  loading.value = true
  try {
    const res = await abandonSinglePlayerRoom(room.value.room_id)
    room.value = res.room
    lastVerdict.value = ''
    syncRating(room.value)
  } finally {
    loading.value = false
  }
}

const loadRoomByQuery = async () => {
  const roomId = route.query.room_id
  if (!roomId) return
  const id = Array.isArray(roomId) ? roomId[0] : roomId
  if (!id) return
  loading.value = true
  try {
    const res = await getSinglePlayerRoomInfo(id)
    room.value = res.room
  } finally {
    loading.value = false
  }
}

const formatTime = (value: string) => {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString()
}

const formatTimestamp = (value: number) => {
  if (!value) return ''
  const date = new Date(value * 1000)
  return date.toLocaleString()
}

onMounted(() => {
  connectWs()
  loadRoomByQuery()
})

onBeforeUnmount(() => {
  if (ws) {
    ws.close()
  }
})
</script>

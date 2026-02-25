<template>
  <div class="min-h-[calc(100vh-64px)] bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
    <div class="w-full max-w-6xl mx-auto px-4 py-8 space-y-8">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 class="text-3xl font-bold text-gray-900 dark:text-white">团队模式</h2>
          <p class="text-gray-500 dark:text-gray-400 mt-1">选择模式创建房间，或加入已有房间</p>
        </div>
        <div class="flex items-center gap-3">
          <button
            @click="fetchRooms"
            class="px-4 py-2 rounded-xl bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
          >
            刷新
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div class="lg:col-span-1 bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">创建房间</h3>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">选择一个模式开始组队</p>

          <div class="mt-4 space-y-3">
            <button
              v-for="mode in modes"
              :key="mode.mode"
              @click="selectedMode = mode.mode"
              class="w-full text-left px-4 py-3 rounded-xl border transition"
              :class="selectedMode === mode.mode
                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300'
                : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/60'"
            >
              <div class="flex items-center justify-between">
                <span class="font-semibold">{{ mode.mode }}</span>
                <span class="text-xs text-gray-500 dark:text-gray-400">{{ formatDuration(mode.duration) }}</span>
              </div>
              <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {{ mode.problems.length }} 题
              </div>
            </button>
            <div v-if="modes.length === 0" class="text-sm text-gray-400 dark:text-gray-500">
              暂无可用模式
            </div>
          </div>

          <button
            @click="handleCreateRoom"
            class="mt-6 w-full px-5 py-3 rounded-2xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 active:scale-95 transition"
          >
            创建房间
          </button>
        </div>

        <div class="lg:col-span-2 space-y-4">
          <div class="flex items-center gap-3">
            <button
              @click="switchStatusFilter('all')"
              class="px-4 py-2 rounded-xl border transition"
              :class="statusFilter === 'all'
                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300'
                : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'"
            >
              全部
            </button>
            <button
              @click="switchStatusFilter(0)"
              class="px-4 py-2 rounded-xl border transition"
              :class="statusFilter === 0
                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300'
                : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'"
            >
              进行中
            </button>
            <button
              @click="switchStatusFilter(1)"
              class="px-4 py-2 rounded-xl border transition"
              :class="statusFilter === 1
                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300'
                : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'"
            >
              已结束
            </button>
          </div>

          <div class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
            <div v-if="loadingRooms" class="p-8 text-center text-gray-500 dark:text-gray-400">
              房间加载中...
            </div>
            <div v-else-if="rooms.length === 0" class="p-8 text-center text-gray-400 dark:text-gray-500">
              暂无房间
            </div>
            <div v-else class="divide-y divide-gray-100 dark:divide-gray-700">
              <div
                v-for="room in rooms"
                :key="room.room_id"
                class="p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
              >
                <div>
                  <div class="flex items-center gap-3">
                    <span class="text-lg font-semibold text-gray-900 dark:text-white">房间 {{ room.room_id }}</span>
                    <span
                      class="text-xs px-2 py-1 rounded-full"
                      :class="room.status === 0
                        ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300'
                        : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300'"
                    >
                      {{ room.status === 0 ? '进行中' : '已结束' }}
                    </span>
                  </div>
                  <div class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    模式 {{ room.mode }} · {{ room.player_count }} 人 · {{ room.problem_count }} 题
                  </div>
                  <div class="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    创建时间 {{ formatDate(room.created_at) }}
                  </div>
                </div>
                <div class="flex items-center gap-3">
                  <button
                    @click="enterRoom(room.room_id)"
                    class="px-4 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95 transition"
                  >
                    {{ room.status === 0 ? '加入房间' : '查看房间' }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  createTeamRoom,
  listTeamRoomModes,
  listTeamRooms,
  type TeamRoomListItem,
  type TeamRoomModeInfo,
} from '../api/teamRoom'

const router = useRouter()
const modes = ref<TeamRoomModeInfo[]>([])
const rooms = ref<TeamRoomListItem[]>([])
const selectedMode = ref('')
const loadingRooms = ref(false)
const statusFilter = ref<'all' | 0 | 1>('all')

const fetchModes = async () => {
  try {
    const res = await listTeamRoomModes()
    modes.value = res.modes || []
    if (!selectedMode.value && modes.value.length > 0) {
      const first = modes.value[0]
      if (first) {
        selectedMode.value = first.mode
      }
    }
  } catch (error) {
    console.error(error)
  }
}

const fetchRooms = async () => {
  loadingRooms.value = true
  try {
    const params: { page?: number; limit?: number; status?: number } = {
      page: 1,
      limit: 20,
    }
    if (statusFilter.value !== 'all') {
      params.status = statusFilter.value
    }
    const res = await listTeamRooms(params)
    rooms.value = res.rooms || []
  } catch (error) {
    console.error(error)
  } finally {
    loadingRooms.value = false
  }
}

const switchStatusFilter = (status: 'all' | 0 | 1) => {
  statusFilter.value = status
  fetchRooms()
}

const handleCreateRoom = async () => {
  if (!selectedMode.value) {
    ElMessage.warning('请先选择模式')
    return
  }
  try {
    const res = await createTeamRoom(selectedMode.value)
    if (res.room?.room_id) {
      router.push({ name: 'team-room', params: { roomId: res.room.room_id } })
    }
  } catch (error) {
    console.error(error)
    ElMessage.error('创建房间失败')
  }
}

const enterRoom = (roomId: string) => {
  router.push({ name: 'team-room', params: { roomId } })
}

const formatDate = (value: string) => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString()
}

const formatDuration = (seconds: number) => {
  const total = Math.max(0, Math.floor(seconds))
  const hours = Math.floor(total / 3600)
  const minutes = Math.floor((total % 3600) / 60)
  return `${hours}h ${minutes}m`
}

onMounted(() => {
  fetchModes()
  fetchRooms()
})
</script>

<template>
  <div class="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
    <div class="mt-8 flex flex-col md:flex-row gap-8">
      <button
        @click="handleSinglePlayer"
        class="
          group relative flex items-center justify-center gap-4
          px-20 py-10
          text-3xl font-bold text-white tracking-widest
          bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600
          dark:from-blue-600 dark:via-indigo-600 dark:to-purple-700
          bg-[length:200%_auto] hover:bg-right
          rounded-3xl shadow-xl hover:shadow-2xl hover:shadow-blue-500/30 dark:hover:shadow-blue-900/40
          transform transition-all duration-500 ease-out
          hover:scale-110 hover:-translate-y-2
          overflow-hidden
          focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800
        "
      >
        <el-icon class="text-5xl transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110">
          <User />
        </el-icon>
        
        <span class="relative z-10 drop-shadow-md">单人模式</span>
        
        <!-- Animated background shine effect -->
        <div class="absolute top-0 -left-[100%] w-full h-full bg-gradient-to-r from-transparent via-white/25 to-transparent skew-x-12 group-hover:animate-shine"></div>
      </button>

      <button
        @click="handleTeamRoom"
        class="
          group relative flex items-center justify-center gap-4
          px-20 py-10
          text-3xl font-bold text-white tracking-widest
          bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-600
          dark:from-emerald-600 dark:via-teal-600 dark:to-cyan-700
          bg-[length:200%_auto] hover:bg-right
          rounded-3xl shadow-xl hover:shadow-2xl hover:shadow-emerald-500/30 dark:hover:shadow-emerald-900/40
          transform transition-all duration-500 ease-out
          hover:scale-110 hover:-translate-y-2
          overflow-hidden
          focus:outline-none focus:ring-4 focus:ring-emerald-300 dark:focus:ring-emerald-800
        "
      >
        <el-icon class="text-5xl transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110">
          <UserFilled />
        </el-icon>
        
        <span class="relative z-10 drop-shadow-md">团队模式</span>
        
        <div class="absolute top-0 -left-[100%] w-full h-full bg-gradient-to-r from-transparent via-white/25 to-transparent skew-x-12 group-hover:animate-shine"></div>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { UserFilled, User } from '@element-plus/icons-vue'

const router = useRouter()

const handleSinglePlayer = () => {
  router.push('/single-player')
}

const handleTeamRoom = () => {
  router.push('/team-room')
}
</script>

<template>
  <nav class="bg-white dark:bg-gray-800 shadow-md transition-colors duration-300">
    <!-- Changed max-w-7xl to w-full and adjusted padding for better responsiveness -->
    <div class="w-full px-6 lg:px-10">
      <div class="flex justify-between h-16">
        <div class="flex">
          <div class="flex-shrink-0 flex items-center cursor-pointer" @click="router.push('/')">
            <h1 class="text-xl font-bold text-gray-800 dark:text-white">ACM Game</h1>
          </div>
          <!-- Removed explicit "首页" link as requested -->
          <div class="hidden sm:ml-6 sm:flex sm:space-x-8">
            <!-- Add more links here if needed -->
          </div>
        </div>
        <div class="flex items-center">
          <button @click="toggleDarkMode" class="p-2 rounded-full text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white focus:outline-none">
            <el-icon v-if="isDark"><Moon /></el-icon>
            <el-icon v-else><Sunny /></el-icon>
          </button>
          
          <div v-if="userStore.token" class="ml-4 flex items-center">
             <span class="text-gray-700 dark:text-gray-300 mr-2">{{ userStore.userInfo?.username }}</span>
             <button @click="handleLogout" class="text-sm text-red-500 hover:text-red-700">退出</button>
          </div>
          <div v-else class="ml-4 flex space-x-2">
            <router-link to="/login" class="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium">登录</router-link>
            <router-link to="/register" class="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-md text-sm font-medium">注册</router-link>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useUserStore } from '../store/user'
import { useRouter } from 'vue-router'
import { Moon, Sunny } from '@element-plus/icons-vue'

const userStore = useUserStore()
const router = useRouter()
const isDark = ref(false)

const toggleDarkMode = () => {
  isDark.value = !isDark.value
  if (isDark.value) {
    document.documentElement.classList.add('dark')
    localStorage.setItem('theme', 'dark')
  } else {
    document.documentElement.classList.remove('dark')
    localStorage.setItem('theme', 'light')
  }
}

const handleLogout = () => {
  userStore.logout()
  router.push('/login')
}

onMounted(() => {
  const theme = localStorage.getItem('theme')
  if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    isDark.value = true
    document.documentElement.classList.add('dark')
  } else {
    isDark.value = false
    document.documentElement.classList.remove('dark')
  }
})
</script>

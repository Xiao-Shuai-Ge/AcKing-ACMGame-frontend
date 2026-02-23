<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 dark:bg-gray-900">
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
          创建新账号
        </h2>
      </div>
      <form class="mt-8 space-y-6" @submit.prevent="handleRegister">
        <input type="hidden" name="remember" value="true" />
        <div class="rounded-md shadow-sm -space-y-px">
          <div>
            <label for="username" class="sr-only">用户名</label>
            <input
              id="username"
              name="username"
              type="text"
              required
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              placeholder="Codeforces用户名（请保持一致）"
              v-model="form.username"
            />
          </div>
          <div>
            <label for="email-address" class="sr-only">邮箱地址</label>
            <input
              id="email-address"
              name="email"
              type="email"
              autocomplete="email"
              required
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              placeholder="邮箱地址"
              v-model="form.email"
            />
          </div>
          <div class="flex">
            <div class="flex-1">
              <label for="email-code" class="sr-only">验证码</label>
              <input
                id="email-code"
                name="email-code"
                type="text"
                required
                class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                placeholder="邮箱验证码"
                v-model="form.code"
              />
            </div>
            <button
              type="button"
              :disabled="sendingCode || codeCountdown > 0"
              class="ml-2 w-28 flex-shrink-0 inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
              @click="handleSendCode"
            >
              <span v-if="codeCountdown === 0">发送验证码</span>
              <span v-else>{{ codeCountdown }}s</span>
            </button>
          </div>
          <div>
            <label for="password" class="sr-only">密码</label>
            <input
              id="password"
              name="password"
              type="password"
              autocomplete="new-password"
              required
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              placeholder="密码"
              v-model="form.password"
            />
          </div>
          <div>
            <label for="confirm-password" class="sr-only">确认密码</label>
            <input
              id="confirm-password"
              name="confirm-password"
              type="password"
              autocomplete="new-password"
              required
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              placeholder="确认密码"
              v-model="confirmPassword"
            />
          </div>
        </div>

        <div>
          <button
            type="submit"
            :disabled="loading"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            <span v-if="!loading">注册</span>
            <span v-else>注册中...</span>
          </button>
        </div>
      </form>
       <div class="text-center">
        <router-link to="/login" class="font-medium text-indigo-600 hover:text-indigo-500">
          已有账号？点击登录
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'
import { useRouter } from 'vue-router'
import { register, sendCode } from '../api/auth'
import { ElMessage } from 'element-plus'

const router = useRouter()

const form = ref({
  username: '',
  email: '',
  code: '',
  password: '',
})
const confirmPassword = ref('')
const loading = ref(false)
const sendingCode = ref(false)
const codeCountdown = ref(0)
let codeTimer: number | undefined

const startCountdown = () => {
  codeCountdown.value = 60
  if (codeTimer) {
    clearInterval(codeTimer)
  }
  codeTimer = window.setInterval(() => {
    codeCountdown.value -= 1
    if (codeCountdown.value <= 0) {
      codeCountdown.value = 0
      if (codeTimer) {
        clearInterval(codeTimer)
      }
    }
  }, 1000)
}

const handleSendCode = async () => {
  if (!form.value.email) {
    ElMessage.error('请先输入邮箱')
    return
  }
  if (codeCountdown.value > 0 || sendingCode.value) {
    return
  }
  sendingCode.value = true
  try {
    await sendCode({ email: form.value.email })
    ElMessage.success('验证码已发送')
    startCountdown()
  } catch (error: any) {
    console.error(error)
  } finally {
    sendingCode.value = false
  }
}

onBeforeUnmount(() => {
  if (codeTimer) {
    clearInterval(codeTimer)
  }
})

const handleRegister = async () => {
  if (form.value.password !== confirmPassword.value) {
    ElMessage.error('两次输入的密码不一致')
    return
  }
  if (!form.value.code) {
    ElMessage.error('请输入邮箱验证码')
    return
  }

  loading.value = true
  try {
    await register(form.value)
    ElMessage.success('注册成功，请登录')
    router.push('/login')
  } catch (error: any) {
    console.error(error)
  } finally {
    loading.value = false
  }
}
</script>

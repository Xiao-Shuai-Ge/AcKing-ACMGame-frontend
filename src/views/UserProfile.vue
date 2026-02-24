<template>
  <div class="min-h-[calc(100vh-64px)] bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
    <div class="max-w-3xl mx-auto">
      <div class="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden transition-colors duration-300">
        <!-- Header / Cover -->
        <div class="h-32 bg-gradient-to-r from-blue-500 to-purple-600"></div>
        
        <div class="relative px-6 pb-6">
          <!-- Avatar -->
          <div class="relative -mt-16 mb-6">
            <div class="w-32 h-32 rounded-full border-4 border-white dark:border-gray-800 bg-white dark:bg-gray-700 flex items-center justify-center text-4xl font-bold text-gray-500 dark:text-gray-300 shadow-lg overflow-hidden">
              <span v-if="userInfo?.username">{{ userInfo.username[0]?.toUpperCase() }}</span>
              <el-icon v-else><User /></el-icon>
            </div>
          </div>

          <!-- User Info -->
          <div class="flex justify-between items-start">
            <div>
              <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {{ userInfo?.username || 'Loading...' }}
              </h1>
              <div class="flex items-center text-gray-600 dark:text-gray-400 mb-4">
                <el-icon class="mr-2"><Message /></el-icon>
                <span>{{ userInfo?.email || 'No email' }}</span>
              </div>
              
              <!-- Rating Badge -->
              <div class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                <el-icon class="mr-1"><Trophy /></el-icon>
                Rating: {{ userInfo?.rating || 0 }}
              </div>
            </div>

            <!-- Edit Button (Only visible for own profile) -->
            <button
              v-if="isOwnProfile"
              @click="showEditDialog = true"
              class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md shadow transition-colors flex items-center"
            >
              <el-icon class="mr-2"><Edit /></el-icon>
              编辑资料
            </button>
          </div>

          <!-- Stats or Additional Info could go here -->
          <div class="mt-8 border-t border-gray-200 dark:border-gray-700 pt-6">
             <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">统计信息</h3>
             <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
               <div class="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-center">
                 <div class="text-2xl font-bold text-gray-900 dark:text-white">{{ userInfo?.rating || 0 }}</div>
                 <div class="text-sm text-gray-500 dark:text-gray-400">Rating</div>
               </div>
               <!-- Placeholder for other stats -->
               <div class="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-center">
                 <div class="text-2xl font-bold text-gray-900 dark:text-white">-</div>
                 <div class="text-sm text-gray-500 dark:text-gray-400">Solved</div>
               </div>
               <div class="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-center">
                 <div class="text-2xl font-bold text-gray-900 dark:text-white">-</div>
                 <div class="text-sm text-gray-500 dark:text-gray-400">Rank</div>
               </div>
             </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Profile Dialog -->
    <el-dialog
      v-model="showEditDialog"
      title="编辑资料"
      width="30%"
      :close-on-click-modal="false"
      class="dark:bg-gray-800 dark:text-white"
    >
      <el-form :model="editForm" label-position="top">
        <el-form-item label="用户名">
          <el-input v-model="editForm.username" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showEditDialog = false">取消</el-button>
          <el-button type="primary" @click="handleUpdateProfile" :loading="updating">
            保存
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '../store/user'
import { getUserInfo, updateProfile, type UserInfo } from '../api/auth'
import { ElMessage } from 'element-plus'
import { User, Message, Trophy, Edit } from '@element-plus/icons-vue'

const route = useRoute()
const userStore = useUserStore()

const userInfo = ref<UserInfo | null>(null)
const loading = ref(false)
const showEditDialog = ref(false)
const updating = ref(false)

const editForm = ref({
  username: ''
})

// Check if viewing own profile
const isOwnProfile = computed(() => {
  if (!userStore.userInfo || !userInfo.value) return false
  return String(userStore.userInfo.id) === String(userInfo.value.id)
})

const fetchUser = async (id: string) => {
  loading.value = true
  try {
    const res = await getUserInfo(id)
    userInfo.value = res
    if (isOwnProfile.value) {
      editForm.value.username = res.username
    }
  } catch (error) {
    console.error(error)
    ElMessage.error('获取用户信息失败')
  } finally {
    loading.value = false
  }
}

const handleUpdateProfile = async () => {
  if (!editForm.value.username.trim()) {
    ElMessage.warning('用户名不能为空')
    return
  }
  
  updating.value = true
  try {
    await updateProfile({ username: editForm.value.username })
    ElMessage.success('更新成功')
    showEditDialog.value = false
    // Refresh data
    if (userInfo.value) {
        await fetchUser(String(userInfo.value.id))
        // Also update store if it's own profile
        await userStore.fetchUserInfo()
    }
  } catch (error) {
    console.error(error)
    ElMessage.error('更新失败')
  } finally {
    updating.value = false
  }
}

onMounted(() => {
  const userId = route.params.id as string
  if (userId) {
    fetchUser(userId)
  }
})

// Watch route params to refetch when navigating between profiles
watch(
  () => route.params.id,
  (newId) => {
    if (newId) {
      fetchUser(newId as string)
    }
  }
)
</script>

<style scoped>
/* Add any specific styles if needed */
</style>

import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import SinglePlayerView from '../views/SinglePlayerView.vue'
import TeamRoomListView from '../views/TeamRoomListView.vue'
import TeamRoomView from '../views/TeamRoomView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView,
    },
    {
      path: '/user/:id',
      name: 'user-profile',
      component: () => import('../views/UserProfile.vue'),
    },
    {
      path: '/single-player/:roomId?',
      name: 'single-player',
      component: SinglePlayerView,
    },
    {
      path: '/team-room',
      name: 'team-room-list',
      component: TeamRoomListView,
    },
    {
      path: '/team-room/:roomId',
      name: 'team-room',
      component: TeamRoomView,
    },
  ],
})

export default router

import { createRouter, createWebHashHistory } from 'vue-router'
import RefereePanel from '@/components/RefereePanel.vue'
import BroadcastPanel from '@/components/BroadcastPanel.vue'

const routes = [
  {
    path: '/',
    redirect: '/referee'
  },
  {
    path: '/referee',
    name: 'referee',
    component: RefereePanel
  },
  {
    path: '/broadcast',
    name: 'broadcast',
    component: BroadcastPanel
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router 
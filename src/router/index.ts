import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'PatientQueue',
    component: () => import('../views/PatientQueue.vue')
  },
  {
    path: '/display',
    name: 'DisplayQueue',
    component: () => import('../views/DisplayQueue.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
import { createRouter, createWebHistory } from 'vue-router'
import PatientQueue from '../views/PatientQueue.vue'
import DisplayQueue from '../views/DisplayQueue.vue'

const routes = [
  {
    path: '/',
    name: 'PatientQueue',
    component: PatientQueue
  },
  {
    path: '/display',
    name: 'DisplayQueue',
    component: DisplayQueue
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
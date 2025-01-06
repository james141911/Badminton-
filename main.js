import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

const app = createApp(App)

// 添加错误处理
app.config.errorHandler = (err, vm, info) => {
  console.error('Vue Error:', err)
  console.error('Error Info:', info)
}

app.use(router)
app.mount('#app') 
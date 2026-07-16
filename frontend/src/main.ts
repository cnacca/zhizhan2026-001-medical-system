import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import { createApp } from 'vue'
import App from './App.vue'
import './styles.css'
import './cs-portal.css'
import './doctor-portal.css'
import './admin-portal.css'
import './admin-order-page.css'

createApp(App).use(ElementPlus).mount('#app')

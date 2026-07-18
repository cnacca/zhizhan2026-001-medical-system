import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import { createApp } from 'vue'
import App from './App.vue'
import './styles.css'
import './cs-portal.css'
import './cs-rebuilt-pages.css'
import './doctor-portal.css'
import './admin-portal.css'
import './admin-order-page.css'
import './doctor/doctor-portal-v2.css'

createApp(App).use(ElementPlus).mount('#app')

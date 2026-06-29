<script setup lang="ts">
import { computed, ref } from 'vue'

type LoginResponse = {
  accessToken: string
  username: string
  roles: string[]
  expiresAt: string
}

const username = ref('admin')
const password = ref('change-me-admin')
const token = ref('')
const loginError = ref('')
const health = ref('未检查')
const loading = ref(false)

const isLoggedIn = computed(() => Boolean(token.value))

async function checkHealth() {
  health.value = '检查中...'
  const response = await fetch('/api/bootstrap/health')
  if (!response.ok) {
    health.value = `后端异常：${response.status}`
    return
  }
  const payload = await response.json() as { status: string }
  health.value = payload.status
}

async function login() {
  loading.value = true
  loginError.value = ''
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: username.value, password: password.value })
    })
    if (!response.ok) {
      throw new Error(`登录失败：${response.status}`)
    }
    const payload = await response.json() as LoginResponse
    token.value = payload.accessToken
  } catch (error) {
    loginError.value = error instanceof Error ? error.message : '登录失败'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <main class="app-shell">
    <section class="workspace">
      <div class="status-bar">
        <span>AI 智能下单与生产协同平台</span>
        <el-tag :type="isLoggedIn ? 'success' : 'info'" round>
          {{ isLoggedIn ? 'ADMIN 已登录' : '骨架烟测' }}
        </el-tag>
      </div>

      <div class="content-grid">
        <section class="panel">
          <h1>项目骨架</h1>
          <p>当前仅用于验证前端、后端、基础登录和代理链路可运行。</p>
          <el-button type="primary" @click="checkHealth">检查后端</el-button>
          <p class="result">后端状态：{{ health }}</p>
        </section>

        <section class="panel">
          <h2>ADMIN 登录烟测</h2>
          <el-form label-position="top" @submit.prevent="login">
            <el-form-item label="用户名">
              <el-input v-model="username" autocomplete="username" />
            </el-form-item>
            <el-form-item label="密码">
              <el-input v-model="password" type="password" autocomplete="current-password" show-password />
            </el-form-item>
            <el-button type="primary" :loading="loading" @click="login">登录</el-button>
          </el-form>
          <p v-if="token" class="result success">登录成功，已获得骨架 token。</p>
          <p v-if="loginError" class="result error">{{ loginError }}</p>
        </section>
      </div>
    </section>
  </main>
</template>

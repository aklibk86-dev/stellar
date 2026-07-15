<template>
  <div class="not-found">
    <div class="nf-content">
      <h1 class="nf-code">404</h1>
      <p class="nf-text">页面不存在</p>
      <n-button type="primary" @click="$router.push('/dashboard')">返回首页</n-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { NButton } from 'naive-ui'
</script>

<style scoped>
.not-found { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: var(--stellar-bg); }
.nf-content { text-align: center; }
.nf-code { font-size: 120px; font-weight: 800; color: var(--stellar-primary); margin: 0; line-height: 1; }
.nf-text { font-size: 18px; color: var(--stellar-text-muted); margin: 16px 0 32px; }
</style>

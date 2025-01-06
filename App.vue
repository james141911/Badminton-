<template>
  <div id="app">
    <nav class="top-nav">
      <div class="nav-title">羽毛球比赛记分系统</div>
      <div class="nav-tabs">
        <router-link to="/referee" class="nav-tab">控制端</router-link>
        <router-link to="/broadcast" class="nav-tab">直播端</router-link>
      </div>
      <div class="system-info">v1.0</div>
    </nav>
    <main class="main-content">
      <router-view></router-view>
    </main>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  height: 100%;
  background: #f0f0f0;
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.top-nav {
  background: #e6e6e6;
  border-bottom: 1px solid #ccc;
  padding: 5px 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 40px;
}

.nav-title {
  font-size: 14px;
  color: #333;
}

.nav-tabs {
  display: flex;
  gap: 10px;
}

.nav-tab {
  padding: 4px 12px;
  text-decoration: none;
  color: #333;
  font-size: 14px;
  border: 1px solid #ccc;
  border-radius: 3px;
  background: #f5f5f5;
}

.nav-tab.router-link-active {
  background: #fff;
  border-color: #999;
}

.system-info {
  font-size: 12px;
  color: #666;
}

.main-content {
  flex: 1;
  display: flex;
}
</style> 
connectWebSocket() {
  const wsHost = window.location.hostname;  // 自动获取当前主机名
  const wsUrl = `ws://${wsHost}:8081`;
  this.ws = new WebSocket(wsUrl);
  // ... 其他代码保持不变 ...
} 
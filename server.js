const WebSocket = require('ws');
const http = require('http');
const server = http.createServer();
const wss = new WebSocket.Server({ 
  server,
  host: '0.0.0.0'  // 允许外部访问
});

// 存储连接的客户端
const clients = new Map();
// 存储比赛数据
const matchData = new Map();

wss.on('connection', (ws) => {
  const clientId = Date.now();
  clients.set(clientId, { ws, type: null, court: null });
  console.log(`新客户端连接: ${clientId}`);
  console.log(`当前连接数: ${clients.size}`);

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message.toString());
      console.log(`收到消息 [${clientId}]:`, data);

      switch (data.type) {
        case 'register':
          // 注册客户端类型
          const client = clients.get(clientId);
          client.type = data.clientType;
          client.court = data.court;
          console.log(`客户端 ${clientId} 注册为 ${data.clientType}, 场地: ${data.court}`);

          // 如果是直播端，立即发送当前数据
          if (data.clientType === 'broadcast') {
            const currentData = matchData.get(data.court);
            if (currentData) {
              console.log(`向直播端 ${clientId} 发送当前数据:`, currentData);
              ws.send(JSON.stringify({
                type: 'match_data',
                data: currentData
              }));
            }
          }
          break;

        case 'update':
          // 更新比赛数据
          const updatingClient = clients.get(clientId);
          if (!updatingClient || !updatingClient.court) {
            console.error('未注册的客户端发送更新');
            return;
          }

          // 保存更新的数据
          matchData.set(updatingClient.court, data.data);
          console.log(`更新场地 ${updatingClient.court} 数据:`, data.data);

          // 广播给所有相关客户端
          let broadcastCount = 0;
          clients.forEach((client, id) => {
            if (client.court === updatingClient.court && 
                client.type === 'broadcast' && 
                client.ws.readyState === WebSocket.OPEN) {
              try {
                const updateMessage = JSON.stringify({
                  type: 'match_data',
                  data: data.data
                });
                client.ws.send(updateMessage);
                broadcastCount++;
                console.log(`已广播到直播端 ${id}`);
              } catch (err) {
                console.error(`发送到客户端 ${id} 失败:`, err);
              }
            }
          });
          console.log(`完成广播，共发送到 ${broadcastCount} 个直播端`);
          break;
      }
    } catch (error) {
      console.error('处理消息错误:', error);
    }
  });

  ws.on('close', () => {
    console.log(`客户端断开: ${clientId}`);
    clients.delete(clientId);
    console.log(`当前连接数: ${clients.size}`);
  });

  ws.on('error', (error) => {
    console.error(`WebSocket错误 [${clientId}]:`, error);
  });
});

// 定期清理断开的连接
setInterval(() => {
  clients.forEach((client, id) => {
    if (client.ws.readyState === WebSocket.CLOSED) {
      console.log(`清理断开的连接: ${id}`);
      clients.delete(id);
    }
  });
}, 30000);

const PORT = 8081;
server.listen(PORT, '0.0.0.0', () => {  // 监听所有网络接口
  console.log(`WebSocket 服务器运行在端口 ${PORT}`);
}); 
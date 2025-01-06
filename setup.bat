@echo off
echo 启动WebSocket服务器...
cd .
npm install
start node server.js

echo 启动前端开发服务器...
cd frontend
npm install
start npm run serve

echo 服务启动完成！
echo WebSocket服务器运行在: ws://localhost:8081
echo 前端页面访问地址: http://localhost:8080
pause 
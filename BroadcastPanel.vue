<template>
  <div class="broadcast-panel">
    <div class="scoreboard">
      <!-- 第一行：选手A -->
      <div class="score-row">
        <div class="player-info">
          <span class="country-flag">{{ getCountryFlag(countryA) }}</span>
          <span class="player-name">{{ teamAName }}</span>
        </div>
        <div class="scores">
          <div class="score-box">{{ playerAScores[0] }}</div>
          <div class="score-box">{{ playerAScores[1] }}</div>
          <div class="score-box brown">{{ playerAScores[2] }}</div>
        </div>
        <div class="server-indicator">
          <span v-if="currentServer === 'A'" class="shuttle">🏸</span>
        </div>
      </div>

      <!-- 第二行：选手B -->
      <div class="score-row">
        <div class="player-info">
          <span class="country-flag">{{ getCountryFlag(countryB) }}</span>
          <span class="player-name">{{ teamBName }}</span>
        </div>
        <div class="scores">
          <div class="score-box">{{ playerBScores[0] }}</div>
          <div class="score-box">{{ playerBScores[1] }}</div>
          <div class="score-box brown">{{ playerBScores[2] }}</div>
        </div>
        <div class="server-indicator">
          <span v-if="currentServer === 'B'" class="shuttle">🏸</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'BroadcastPanel',
  data() {
    return {
      countryA: '',
      countryB: '',
      teamAName: '',
      teamBName: '',
      currentGame: 1,
      playerAScores: [0, 0, 0],
      playerBScores: [0, 0, 0],
      currentServer: 'A',
      timer: '12:00.0',
      matchInfo: {
        name: '',
        round: '',
        venue: '',
        date: ''
      }
    }
  },
  created() {
    this.connectWebSocket()
  },
  methods: {
    getCountryFlag(country) {
      const flags = {
        CHN: '🇨🇳',
        JPN: '🇯🇵',
        MAS: '🇲🇾',
        INA: '🇮🇩',
        KOR: '🇰🇷',
        TPE: '🇹🇼',
        THA: '🇹🇭',
        IND: '🇮🇳'
      }
      return flags[country] || ''
    },
    connectWebSocket() {
      try {
        console.log('直播端: 尝试连接 WebSocket...')
        const ws = new WebSocket('ws://localhost:8080')
        
        ws.onopen = () => {
          console.log('直播端: WebSocket 连接成功')
        }
        
        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data)
            console.log('直播端: 收到数据:', data)
            this.updateScore(data)
          } catch (error) {
            console.error('直播端: 数据解析错误:', error)
          }
        }
        
        ws.onerror = (error) => {
          console.error('直播端: WebSocket 错误:', error)
        }
        
        ws.onclose = () => {
          console.log('直播端: WebSocket 连接关闭，尝试重连...')
          setTimeout(() => {
            this.connectWebSocket()
          }, 3000)
        }
      } catch (error) {
        console.error('直播端: WebSocket 连接失败:', error)
      }
    },
    updateScore(data) {
      try {
        // 更新比赛信息
        this.matchInfo = {
          name: data.matchInfo.name || '羽毛球比赛',
          round: data.matchInfo.round || '',
          type: data.matchInfo.type || '',
          venue: data.matchInfo.venue || '',
          date: data.matchInfo.date || ''
        }
        
        // 更新选手信息
        if (data.playerA) {
          this.countryA = data.playerA.country
          this.teamAName = data.playerA.name
        }
        if (data.playerB) {
          this.countryB = data.playerB.country
          this.teamBName = data.playerB.name
        }
        
        // 更新比分
        if (data.scores) {
          this.currentGame = data.scores.currentGame
          this.playerAScores = data.scores.games.playerAScores
          this.playerBScores = data.scores.games.playerBScores
          this.currentServer = data.scores.currentServer
        }
        
        // 更新计时器
        if (data.timer) {
          this.timer = data.timer.display
          this.timerRunning = data.timer.isRunning
        }
        
        // 更新比赛状态
        if (data.gameStatus) {
          this.gameStarted = data.gameStatus.isStarted
          this.gameOver = data.gameStatus.isOver
          this.isPaused = data.gameStatus.isPaused
        }
        
        // 根据状态更新显示效果
        this.updateDisplayEffects()
      } catch (error) {
        console.error('直播端: 更新数据失败:', error)
      }
    },
    
    updateDisplayEffects() {
      // 可以添加一些视觉效果
      if (this.isPaused) {
        // 显示暂停效果
      }
      if (this.gameOver) {
        // 显示比赛结束效果
      }
      // ... 其他效果
    }
  }
}
</script>

<style scoped>
.broadcast-panel {
  background: #000;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}

.scoreboard {
  background: #e0e0e0;
  border-radius: 8px;
  padding: 4px;
  width: 400px;
}

.score-row {
  display: flex;
  align-items: center;
  background: #fff;
  margin: 2px 0;
  padding: 4px 8px;
  height: 40px;
}

.player-info {
  display: flex;
  align-items: center;
  width: 180px;
  gap: 8px;
}

.country-flag {
  width: 32px;
  height: 24px;
  font-size: 20px;
}

.player-name {
  font-size: 18px;
  font-weight: bold;
  color: #000;
  text-transform: uppercase;
}

.scores {
  display: flex;
  margin-left: auto;
  gap: 4px;
}

.score-box {
  width: 40px;
  height: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 20px;
  font-weight: bold;
  color: #000;
  background: transparent;
}

.brown {
  background: #8B4513;
  color: #fff;
}

.server-indicator {
  width: 24px;
  display: flex;
  justify-content: center;
  margin-left: 8px;
}

.shuttle {
  color: #8B4513;
  font-size: 16px;
}
</style> 
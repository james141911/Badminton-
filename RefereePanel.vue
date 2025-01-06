<template>
  <div class="referee-panel">
    <!-- 比赛信息区域 -->
    <div class="match-info-bar">
      <div class="match-details">
        <input v-model="matchInfo.name" 
               class="match-name" 
               placeholder="输入比赛名称">
        <select v-model="currentGame" class="game-selector">
          <option value="1">第一局</option>
          <option value="2">第二局</option>
          <option value="3">第三局</option>
        </select>
      </div>
    </div>

    <!-- 比分控制区域 -->
    <div class="score-control">
      <!-- 主队 -->
      <div class="team-section">
        <div class="team-info">
          <div class="flag-selector">
            <select v-model="countryA" class="country-select">
              <option value="">选择国家</option>
              <option value="MAS">🇲🇾 马来西亚</option>
              <option value="JPN">🇯🇵 日本</option>
              <option value="CHN">🇨🇳 中国</option>
              <option value="INA">🇮🇩 印尼</option>
              <option value="KOR">🇰🇷 韩国</option>
              <option value="TPE">🇹🇼 中国台北</option>
            </select>
          </div>
          <input v-model="teamAName" 
                 class="player-name" 
                 placeholder="输入选手名字"
                 @input="validatePlayerName">
        </div>
        <div class="score-grid">
          <div class="game-score" v-for="(score, index) in playerAScores" :key="'A'+index">
            <div class="game-label">第{{ index + 1 }}局</div>
            <div class="score-control">
              <button class="score-btn minus" @click="adjustScore('A', index, -1)">-</button>
              <div class="score-display" @click="editScore('A', index)">{{ score }}</div>
              <button class="score-btn plus" @click="adjustScore('A', index, 1)">+</button>
            </div>
          </div>
        </div>
      </div>

      <!-- 客队 -->
      <div class="team-section">
        <div class="team-info">
          <div class="flag-selector">
            <select v-model="countryB" class="country-select">
              <option value="">选择国家</option>
              <option value="MAS">🇲🇾 马来西亚</option>
              <option value="JPN">🇯🇵 日本</option>
              <option value="CHN">🇨🇳 中国</option>
              <option value="INA">🇮🇩 印尼</option>
              <option value="KOR">🇰🇷 韩国</option>
              <option value="TPE">🇹🇼 中国台北</option>
            </select>
          </div>
          <input v-model="teamBName" 
                 class="player-name" 
                 placeholder="输入选手名字"
                 @input="validatePlayerName">
        </div>
        <div class="score-grid">
          <div class="game-score" v-for="(score, index) in playerBScores" :key="'B'+index">
            <div class="game-label">第{{ index + 1 }}局</div>
            <div class="score-control">
              <button class="score-btn minus" @click="adjustScore('B', index, -1)">-</button>
              <div class="score-display" @click="editScore('B', index)">{{ score }}</div>
              <button class="score-btn plus" @click="adjustScore('B', index, 1)">+</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 控制按钮 -->
    <div class="control-bar">
      <button class="control-btn" @click="switchServer">
        <span class="btn-icon">🏸</span>
        切换发球
      </button>
      <button class="control-btn" @click="undoLastPoint">
        <span class="btn-icon">↩️</span>
        撤销
      </button>
      <button class="control-btn" @click="resetGame">
        <span class="btn-icon">🔄</span>
        重置
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'RefereePanel',
  data() {
    return {
      showSetup: false,
      countryA: '',
      countryB: '',
      teamAName: '',
      teamBName: '',
      currentGame: 1,
      playerAScores: [0, 0, 0], // 三局比分
      playerBScores: [0, 0, 0], // 三局比分
      currentServer: 'A',
      gameStarted: false,
      isGameOver: false,
      scoreHistory: [],
      ws: null,
      tournamentName: '',
      matchType: 'MS',
      matchStage: '',
      matchList: [], // 比赛列表
      currentMatchId: null, // 当前选中的比赛ID
      timer: {
        time: 720, // 12:00 in seconds
        running: false,
        interval: null
      },
      // 新增比赛设置相关数据
      matchSetup: {
        name: '',
        date: '',
        venue: '',
        round: '',
        umpire: ''
      }
    }
  },
  computed: {
    canStartMatch() {
      return this.countryA && this.countryB && this.teamAName && this.teamBName
    },
    canUndo() {
      return this.scoreHistory.length > 0
    },
    formattedTime() {
      const minutes = Math.floor(this.timer.time / 60)
      const seconds = this.timer.time % 60
      const tenths = Math.floor((this.timer.time % 1) * 10)
      return `${minutes}:${seconds.toString().padStart(2, '0')}.${tenths}`
    }
  },
  methods: {
    validatePlayerName(event) {
      // 限制输入为字母、数字和点号
      event.target.value = event.target.value.replace(/[^A-Za-z0-9.]/g, '').toUpperCase();
    },
    getCountryFlag(country) {
      const flags = {
        CHN: '🇨🇳',
        JPN: '🇯🇵',
        KOR: '🇰🇷',
        MAS: '🇲🇾',
        INA: '🇮🇩',
        THA: '🇹🇭',
        TPE: '🇹🇼',
        HKG: '🇭🇰',
        SGP: '🇸🇬',
        VNM: '🇻🇳',
        IND: '🇮🇳'
      }
      return flags[country] || ''
    },
    startMatch() {
      if (this.canStartMatch) {
        this.createNewMatch()
      }
    },
    addScore(player) {
      const currentGameIndex = this.currentGame - 1
      this.scoreHistory.push({
        playerAScores: [...this.playerAScores],
        playerBScores: [...this.playerBScores],
        server: this.currentServer,
        currentGame: this.currentGame
      })

      if (player === 'A') {
        this.playerAScores[currentGameIndex]++
      } else {
        this.playerBScores[currentGameIndex]++
      }

      this.updateServer()
      this.checkGameStatus()
      this.sendUpdate()
    },
    checkGameStatus() {
      const currentGameIndex = this.currentGame - 1
      const scoreA = this.playerAScores[currentGameIndex]
      const scoreB = this.playerBScores[currentGameIndex]

      // 检查是否达到获胜条件
      if ((scoreA >= 21 || scoreB >= 21) && Math.abs(scoreA - scoreB) >= 2) {
        if (this.currentGame < 3) {
          this.currentGame++
        } else {
          this.isGameOver = true
        }
      }
      // 处理29平后的情况
      else if (scoreA === 30 || scoreB === 30) {
        if (this.currentGame < 3) {
          this.currentGame++
        } else {
          this.isGameOver = true
        }
      }
    },
    updateServer() {
      const currentGameIndex = this.currentGame - 1
      const totalScore = this.playerAScores[currentGameIndex] + this.playerBScores[currentGameIndex]
      if (totalScore % 2 === 0) {
        this.currentServer = this.currentServer === 'A' ? 'B' : 'A'
      }
    },
    undoLastPoint() {
      if (this.scoreHistory.length > 0) {
        const lastState = this.scoreHistory.pop()
        this.playerAScores = [...lastState.playerAScores]
        this.playerBScores = [...lastState.playerBScores]
        this.currentServer = lastState.server
        this.currentGame = lastState.currentGame
        this.isGameOver = false
        this.sendUpdate()
      }
    },
    resetGame() {
      if (confirm('确定要重置比赛吗？')) {
        this.playerAScores = [0, 0, 0]
        this.playerBScores = [0, 0, 0]
        this.currentGame = 1
        this.currentServer = 'A'
        this.scoreHistory = []
        this.isGameOver = false
        this.gameStarted = false
        this.sendUpdate()
      }
    },
    sendUpdate() {
      try {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
          const data = {
            // 比赛基本信息
            matchId: this.currentMatchId,
            matchInfo: {
              name: this.tournamentName,
              round: this.matchStage,
              type: this.matchType,
              venue: this.matchSetup.venue,
              date: this.matchSetup.date,
              umpire: this.matchSetup.umpire
            },
            
            // 选手信息
            playerA: {
              country: this.countryA,
              name: this.teamAName
            },
            playerB: {
              country: this.countryB,
              name: this.teamBName
            },
            
            // 比分信息
            scores: {
              current: {
                A: this.playerAScores[this.currentGame - 1],
                B: this.playerBScores[this.currentGame - 1]
              },
              games: {
                playerAScores: this.playerAScores,
                playerBScores: this.playerBScores
              },
              currentGame: this.currentGame,
              currentServer: this.currentServer
            },
            
            // 比赛状态
            gameStatus: {
              isStarted: this.gameStarted,
              isOver: this.isGameOver,
              isPaused: this.isPaused
            },
            
            // 计时器状态
            timer: {
              display: this.formattedTime,
              isRunning: this.timer.running
            }
          }
          
          console.log('裁判端: 发送数据:', data)
          this.ws.send(JSON.stringify(data))
        }
      } catch (error) {
        console.error('裁判端: 发送数据失败:', error)
      }
    },
    showNewMatch() {
      this.showSetup = true
    },
    cancelSetup() {
      this.showSetup = false
    },
    // 计时器控制
    startTimer() {
      if (!this.timer.running) {
        this.timer.running = true
        this.timer.interval = setInterval(() => {
          if (this.timer.time > 0) {
            this.timer.time -= 0.1
          } else {
            this.pauseTimer()
          }
        }, 100)
      }
    },
    pauseTimer() {
      this.timer.running = false
      clearInterval(this.timer.interval)
    },
    resetTimer() {
      this.pauseTimer()
      this.timer.time = 720 // Reset to 12:00
    },
    adjustTimer(amount) {
      this.timer.time = Math.max(0, this.timer.time + amount)
    },
    // 比赛管理
    createNewMatch() {
      const match = {
        id: Date.now(),
        name: this.matchSetup.name || '新比赛',
        date: this.matchSetup.date,
        venue: this.matchSetup.venue,
        round: this.matchSetup.round,
        umpire: this.matchSetup.umpire,
        playerA: {
          country: this.countryA,
          name: this.teamAName
        },
        playerB: {
          country: this.countryB,
          name: this.teamBName
        },
        scores: {
          playerAScores: [0, 0, 0],
          playerBScores: [0, 0, 0]
        },
        currentGame: 1,
        currentServer: 'A'
      }
      this.matchList.push(match)
      this.currentMatchId = match.id
      this.showSetup = false
      this.gameStarted = true
    },
    selectMatch(id) {
      this.currentMatchId = id
      const match = this.matchList.find(m => m.id === id)
      if (match) {
        this.loadMatch(match)
      }
    },
    loadMatch(match) {
      this.countryA = match.playerA.country
      this.countryB = match.playerB.country
      this.teamAName = match.playerA.name
      this.teamBName = match.playerB.name
      this.playerAScores = [...match.scores.playerAScores]
      this.playerBScores = [...match.scores.playerBScores]
      this.currentGame = match.currentGame
      this.currentServer = match.currentServer
      this.gameStarted = true
    },
    deleteMatch(id) {
      if (confirm('确定要删除这场比赛吗？')) {
        const index = this.matchList.findIndex(m => m.id === id)
        if (index !== -1) {
          this.matchList.splice(index, 1)
          if (this.currentMatchId === id) {
            this.currentMatchId = null
            this.resetGame()
          }
        }
      }
    },
    // 调整分数
    adjustScore(player, index, amount) {
      const currentGameIndex = this.currentGame - 1;
      
      // 保存当前状态用于撤销
      this.scoreHistory.push({
        playerAScores: [...this.playerAScores],
        playerBScores: [...this.playerBScores],
        server: this.currentServer,
        currentGame: this.currentGame
      });

      // 更新分数
      if (player === 'A') {
        this.playerAScores[index] = Math.max(0, this.playerAScores[index] + amount);
      } else {
        this.playerBScores[index] = Math.max(0, this.playerBScores[index] + amount);
      }

      // 检查比赛状态
      this.checkGameStatus();
      this.updateServer();
      this.sendUpdate();
    },
    // 切换计时器
    toggleTimer() {
      if (this.timer.running) {
        this.pauseTimer();
      } else {
        this.startTimer();
      }
      this.sendUpdate();
    },
    // 切换发球方
    switchServer() {
      this.currentServer = this.currentServer === 'A' ? 'B' : 'A';
      this.sendUpdate();
    },
    // 切换场地
    switchCourt() {
      // 交换选手信息
      [this.countryA, this.countryB] = [this.countryB, this.countryA];
      [this.teamAName, this.teamBName] = [this.teamBName, this.teamAName];
      
      // 交换比分
      [this.playerAScores, this.playerBScores] = [this.playerBScores, this.playerAScores];
      
      // 切换发球方
      this.currentServer = this.currentServer === 'A' ? 'B' : 'A';
      
      this.sendUpdate();
    },
    // 编辑分数
    editScore(player, index) {
      const score = player === 'A' ? this.playerAScores[index] : this.playerBScores[index];
      const newScore = prompt(`请输入新的分数：`, score);
      
      if (newScore !== null && !isNaN(newScore)) {
        const scoreNum = parseInt(newScore);
        if (scoreNum >= 0) {
          // 保存当前状态用于撤销
          this.scoreHistory.push({
            playerAScores: [...this.playerAScores],
            playerBScores: [...this.playerBScores],
            server: this.currentServer,
            currentGame: this.currentGame
          });

          // 更新分数
          if (player === 'A') {
            this.playerAScores[index] = scoreNum;
          } else {
            this.playerBScores[index] = scoreNum;
          }

          // 检查比赛状态
          this.checkGameStatus();
          this.updateServer();
          this.sendUpdate();
        }
      }
    }
  }
}
</script>

<style scoped>
.referee-panel {
  background: #1a1a1a;
  padding: 20px;
  min-height: 100vh;
  color: #fff;
}

.match-info-bar {
  background: #2d2d2d;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.match-details {
  display: flex;
  gap: 20px;
  align-items: center;
}

.match-name {
  flex: 1;
  padding: 8px;
  font-size: 16px;
  background: #363636;
  border: none;
  border-radius: 4px;
  color: #fff;
}

.game-selector {
  padding: 8px;
  font-size: 16px;
  background: #363636;
  border: none;
  border-radius: 4px;
  color: #fff;
}

.score-control {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.team-section {
  flex: 1;
  background: #2d2d2d;
  padding: 20px;
  border-radius: 8px;
}

.team-info {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.country-select {
  padding: 8px;
  font-size: 16px;
  background: #363636;
  border: none;
  border-radius: 4px;
  color: #fff;
}

.player-name {
  flex: 1;
  padding: 8px;
  font-size: 16px;
  background: #363636;
  border: none;
  border-radius: 4px;
  color: #fff;
}

.score-grid {
  display: grid;
  gap: 15px;
}

.game-score {
  display: flex;
  align-items: center;
  gap: 15px;
}

.game-label {
  width: 80px;
  font-size: 14px;
  color: #888;
}

.score-control {
  display: flex;
  align-items: center;
  gap: 10px;
}

.score-btn {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 18px;
  background: #4CAF50;
  color: white;
  font-size: 18px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.score-btn:hover {
  transform: scale(1.1);
}

.score-display {
  width: 60px;
  height: 40px;
  background: #363636;
  border-radius: 4px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 24px;
  font-weight: bold;
  cursor: pointer;
}

.control-bar {
  display: flex;
  justify-content: center;
  gap: 20px;
  padding: 20px;
  background: #2d2d2d;
  border-radius: 8px;
}

.control-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  background: #363636;
  color: white;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
}

.control-btn:hover {
  background: #4a4a4a;
}

.btn-icon {
  font-size: 18px;
}
</style> 
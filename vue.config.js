const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  transpileDependencies: true,
  lintOnSave: false,
  publicPath: './',
  devServer: {
    host: '0.0.0.0',  // 允许外部访问
    port: 8080,
    allowedHosts: 'all'  // 允许所有主机访问
  }
}) 
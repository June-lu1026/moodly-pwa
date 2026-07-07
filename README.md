# Moodly AI Design Match Final v14

这版按你确认的 UI 设计图重构：

- 浅色高级感 App UI
- M + smile 图标全部使用真实 PNG
- Today / AI Reflection / Insights / Calendar / Chat / Settings
- Check In 后自动进入 AI Reflection
- 心情可直接记录，文本可选
- Calendar / Insights / Trigger / Localized Expression 动态更新
- Chat 功能保留
- EN / 中文切换
- PWA 配置完整

## 上传 GitHub

把所有文件上传到仓库根目录：

- index.html
- style.css
- app.js
- manifest.webmanifest
- service-worker.js
- render.yaml
- icons/

## Gemini API

打开 app.js 第一行：

const GEMINI_API_KEY = "YOUR_GEMINI_API_KEY";

替换成你的 Gemini API Key。

## Render

Static Site
Publish Directory: .

## 防缓存

部署后访问：
https://moodly-pwa.onrender.com?v=14

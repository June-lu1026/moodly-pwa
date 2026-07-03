# Moodly AI Simplified Final PWA

这版是简化后的 App UI 版本，适合参赛 Demo：

- Today / AI Reflection / Insights / Calendar / Chat / Settings
- 底部导航保留 5 个主页面
- AI Reflection 通过 Check In 后进入/查看
- M + Smile PWA 图标
- 文本输入可选，选择心情即可记录
- 动态 Calendar、Insights、情绪触发点、本地化表达
- EN / 中文切换
- PWA manifest + service worker

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

## 避免缓存

部署后用：

https://moodly-pwa.onrender.com?v=11

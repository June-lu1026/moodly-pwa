# Moodly AI Final PWA v16

这版基于你确认的最终设计稿制作：

- Today / AI Reflection / Insights / Calendar / Chat / Settings
- 使用你确认的 Moodly M + smile 渐变 logo
- PWA 安装图标已经写入 icons/icon-192.png 和 icons/icon-512.png
- Check In 后进入 AI Reflection
- Calendar / Insights / Chat / Settings 基础交互保留
- EN / 中文切换保留
- 支持 GitHub + Render 静态部署

## 上传 GitHub

把压缩包里的文件全部上传到仓库根目录：

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

把 YOUR_GEMINI_API_KEY 替换成你的 Gemini API Key。

## Render 部署

- Service type: Static Site
- Publish Directory: .
- Build Command: 留空

## 防缓存访问

部署后打开：
https://moodly-pwa.onrender.com?v=16

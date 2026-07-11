# Moodly Final Design Match v19

这是按最终母版重做的 Moodly AI PWA 代码包。

## 本版重点
- 重新生成了带圆形光晕的 M + smile logo
- Today / AI Reflection / Insights / Calendar / Chat / Settings
- 统一浅粉紫、白色卡片、轻阴影、大圆角风格
- Check In 后进入 AI Reflection
- Chat 基础交互
- EN / 中文切换
- PWA 安装支持
- Gemini API 接口保留

## 上传 GitHub

解压后，把里面所有文件上传到仓库根目录：

- icons/
- README.md
- app.js
- index.html
- manifest.webmanifest
- render.yaml
- service-worker.js
- style.css

不要上传 zip 文件。

## Gemini API

打开 app.js 第一行：

const GEMINI_API_KEY = "YOUR_GEMINI_API_KEY";

替换成你的 Gemini API Key。

## Render

Static Site
Publish Directory: .
Build Command: 留空

部署后打开：

https://moodly-pwa.onrender.com?v=19

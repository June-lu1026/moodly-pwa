# Moodly Final Pixel Match v20

基于你确认的最终 UI 展示图继续调整的版本。

## v20 重点
- 重新生成带圆形光晕的 M + smile logo
- 去掉页面中过强的大背景色块
- 字号、卡片、按钮、间距整体压小
- Today 更接近最终展示图中间主屏
- Reflection / Insights / Calendar / Chat / Settings 更接近右侧小屏比例
- PWA、语言切换、Gemini API 入口保留

## 上传
解压后上传根目录文件：
icons/
README.md
app.js
index.html
manifest.webmanifest
render.yaml
service-worker.js
style.css

不要上传 zip 文件。

## Gemini API
app.js 第一行替换：
const GEMINI_API_KEY = "YOUR_GEMINI_API_KEY";

## Render
Static Site
Publish Directory: .
Build Command: 留空

部署后打开：
https://moodly-pwa.onrender.com?v=20

# Moodly AI PWA - Final M + Smile Logo Version

这版已按你的图标方向调整：

- 右上角图标：紫粉渐变 + 白色 M + 下方微笑弧线
- PWA 安装图标：icons/icon-192.png、icons/icon-512.png 已同步为 M + smile
- 保留 PWA App 结构：Today / Calendar / Insights / Chat / Settings
- 保留语言切换
- 保留心情可直接记录，文字可选
- 保留动态 Calendar、Insights、触发点、本地化表达

## 上传 GitHub

把本文件夹里的所有文件上传到仓库根目录：

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

替换成你的 Gemini Key。

## Render 部署

Static Site
Publish Directory: .

## 如果看不到更新

访问：
https://moodly-pwa.onrender.com?v=10

或者清理浏览器缓存 / Render Manual Deploy latest commit。

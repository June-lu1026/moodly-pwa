# Moodly PWA - Restored Original Logo v11

这版已从你上传的 `moodly-pwa-calendar-soft-v3(1).zip` 里提取原来的 logo 样式，并同步到当前 PWA：

- `icons/icon-192.png`
- `icons/icon-512.png`
- `icons/apple-touch-icon.png`
- `icons/favicon-32.png`
- `icons/maskable-icon-512.png`
- 页面右上角 app-mark 直接使用 `icons/icon-192.png`，不再用 CSS 重新画 M 和笑脸

这样会更接近你之前桌面上的 Moodly 图标效果。

## 上传 GitHub

覆盖仓库根目录里的这些文件：

- index.html
- style.css
- app.js
- manifest.webmanifest
- service-worker.js
- render.yaml
- icons/

## 部署后看不到变化

请用：
`https://moodly-pwa.onrender.com?v=11`

或者清除浏览器缓存 / Render Manual Deploy latest commit。

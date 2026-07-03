# Moodly AI PWA App

这是一个真正按 PWA App 结构做的 Moodly AI：

- 手机 App 样式界面
- Today / Calendar / Insights / Chat / Settings
- 底部 Tab Bar
- PWA manifest
- Service Worker 离线缓存
- Install 按钮
- Gemini AI 接入占位

## 使用方法

1. 打开 `app.js`
2. 把第一行的 `YOUR_GEMINI_API_KEY` 换成你的 Gemini API Key
3. 上传全部文件到 GitHub 仓库根目录
4. Render 新建 Static Site
5. Publish Directory 填 `.`
6. 部署后用手机 Chrome 打开网址
7. 点击 Install，或浏览器菜单选择“添加到主屏幕”

## 说明

这是 PWA App，不是 APK。它可以像 App 一样安装到手机桌面，但本质是 Web App。
如果后续要 APK，需要再用 Capacitor / Bubblewrap 包装。

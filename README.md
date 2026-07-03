# Moodly AI - Award Optimized PWA

这版是参赛优化版：

## 关键升级

- 开始记录后会真正保存数据到 localStorage
- Today 会显示今日记录
- Calendar 会根据记录动态显示不同心情色块
- Insights 会根据最近 7 天记录动态生成趋势图
- 情绪触发点会根据输入文本自动识别
- Localized Expression 会生成更自然的英文情绪表达
- 没有 Gemini Key 时也能跑本地 Demo 反馈
- 有 Gemini Key 时会调用 Gemini API
- Settings 保留 EN / 中文 切换
- 支持 Export Data / Delete All Data
- PWA manifest + service worker + icons

## 使用方法

1. 打开 `app.js`
2. 把第一行的 `YOUR_GEMINI_API_KEY` 换成你的 Gemini API Key
3. 上传全部文件到 GitHub 仓库根目录
4. Render 新建 Static Site
5. Publish Directory 填 `.`
6. 部署后用手机 Chrome 打开网址
7. 点击 Install，或浏览器菜单选择“添加到主屏幕”

## 更新后看到旧页面怎么办

请用：
`你的网址?v=5`

或者清除浏览器缓存 / Render 手动重新部署最新 commit。

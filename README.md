# Moodly PWA 安装包

这是一个可直接部署到 GitHub + Render 的 Moodly PWA 包。

## 包含内容

- `index.html`：Moodly 主应用，包含中英切换、深色模式预览、本地心情记录、Journal、Insights、Settings。
- `manifest.json`：PWA 安装配置。
- `service-worker.js`：离线缓存与 PWA 支持。
- `icons/`：App 图标。

## GitHub 重新上传

1. 解压本 zip。
2. 进入你的 GitHub 仓库。
3. 删除旧的 `index.html`、`manifest.json`、`service-worker.js`、`icons/`。
4. 上传解压后的全部文件。
5. Commit changes。

## Render 重新部署

1. 打开 Render Dashboard。
2. 进入你的 Moodly Static Site。
3. 点击 `Manual Deploy`。
4. 选择 `Deploy latest commit`。

## 手机安装

### iPhone

1. 用 Safari 打开 Render 网址。
2. 点击分享按钮。
3. 选择“添加到主屏幕”。

### Android

1. 用 Chrome 打开 Render 网址。
2. 点击右上角菜单。
3. 选择“安装应用”或“添加到主屏幕”。

## 注意

如果更新后手机还是旧界面，请访问：

`https://你的网址.onrender.com/?v=3`

这样可以绕过缓存。

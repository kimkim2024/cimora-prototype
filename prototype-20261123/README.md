# Cimora UI 与交互原型

这份交接包是 2026-11-23 的静态 UI 与交互原型，包含前端源码、素材、设计规范和内置案例。

## 启动

1. 完整解压 ZIP，在解压出的 Cimora-UI-Interaction-20261123 文件夹打开终端。
2. 使用 Node.js 18 或更新版本，执行 `npm run preview`。无需安装依赖。
3. 在 Chrome 或 Edge 打开 http://127.0.0.1:4173/#/app 。

如果端口已占用，执行 `npm run preview -- --port=4187`，然后打开 http://127.0.0.1:4187/#/app 。

## 主要交互入口

- Creation Space `#/app`
- My Projects `#/app/projects`
- Asset Library `#/app/assets`
- Tasks & Orchestration `#/app/tasks`
- Creative Tools `#/app/tools`
- Export & Delivery `#/app/exports`
- Showcase `#/app/community`
- Market `#/app/market`
- Account center `#/app/settings?tab=account`，钱包和资料页分别用 `tab=wallet` 与 `tab=profile`
- 视频项目示例 `#/app/video?project=video-sc-workspace-rain&tab=overview`

## 联调用途

页面由 `index.html` 加载，使用原生 HTML、CSS 和 JavaScript。设计参考见 `design/DESIGN-SYSTEM.md` 和 `design/tokens.css`。

登录、AI 生成、支付和积分使用本地演示逻辑。项目和素材保存在浏览器本地，切换端口会得到独立的浏览器存储。包内有预置案例，发送者浏览器内创建的项目和上传内容随浏览器存储保留。

已知检查项。当前 `npm run lint` 报告 `tokens.css` 样式加载顺序错误，并提示部分素材文件体积较大。`npm run preview` 可直接运行。

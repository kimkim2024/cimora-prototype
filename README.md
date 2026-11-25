# Cimora 前端交付 · 2026-11-26

这是当前可交互的 Cimora 静态前端快照，包含 HTML、CSS、JavaScript、字体、图片、视频和预置案例。解压后可以直接启动，无需安装 npm 依赖或执行构建。

## 本地启动

需要 Node.js 18 或更新版本。在快照根目录运行：

```bash
npm run preview
```

打开 [创作空间](http://127.0.0.1:4173/#/app)。如端口已被占用，运行 `npm run preview -- --port=4187`。

## 页面入口

| 页面 | Hash 路由 |
| --- | --- |
| 创作空间 | `#/app` |
| 我的项目 | `#/app/projects` |
| 故事创作 | `#/app/script` |
| 漫画创作 | `#/app/comic` |
| 视频创作 | `#/app/video` |
| 资产库 | `#/app/assets` |
| 任务中心 | `#/app/tasks` |
| Creative Tools | `#/app/tools` |
| Image to Motion | `#/app/tools/image-motion` |
| OC Character Sheet | `#/app/tools/oc-sheet` |
| 市场 | `#/app/market` |
| 积分钱包 | `#/app/wallet` |
| 导出 | `#/app/exports` |

## 后端对接

- `index.html` 加载应用模块，`site-core.js` 管理 Hash 路由及原型状态。项目、资产和积分的演示数据主要保存在浏览器本地。
- 项目和资产入口在 `studio-projects.js`、`studio-library.js`。任务、市场和积分钱包入口在 `cimora-task-center.js`、`cimora-pages.js`、`points-wallet.js`。
- 生成、钱包与支付目前用于交互演示。真实接口、鉴权和支付由后端对接，源码中没有生产环境配置。
- [Creative Tools 设计说明](CREATIVE-TOOLS-UI.md) · [设计规范](design/DESIGN-SYSTEM.md)

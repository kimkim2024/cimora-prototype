# Creative Tools UI 说明

这份文档说明 **14 个创作工具页面（Creative Tools）** 共用的视觉与交互语言：它由什么组成、每个组件的准确参数、哪些页面用了哪一套作用域、怎么给新页面接入，以及目前还没解决的问题。

- 适用页面：`#/app/tools/*`（Image to Motion 以及其余 13 个工具页）
- 视觉基准：Image to Motion
- 性质：**只改视觉与交互状态**。布局几何、DOM 顺序、业务逻辑、状态管理、事件处理都没有重构。
- 前置说明：本目录是 2026-11-23 的静态原型快照，运行方式见同目录 `README.md`。

---

## 1. 一句话结构

页面渲染完成后，`tool-detail-layout.js` 的 `enhance()` 会自动识别"这是一个工具详情页"，加上 `.tw-detail`，然后按需装配上传槽、`⋯` 菜单、分段控件、返回链接和页头资产库入口。

样式分**两层作用域**：

| 作用域 | 覆盖范围 | 说明 |
|---|---|---|
| `.tw-detail:not(.tm-page)` | 13 个工具页（自动生效） | 共用皮肤：按钮、下拉、列表、上传槽、`⋯`、分段控件、空态 |
| `.tw-detail.tw-v2` | Image to Motion、Colorize、Lettering（显式 opt-in） | 在共用皮肤之上再加一层"从 Motion 抬出来的"密度与间距，含 36px 控件变量、面板内边距、结果区排版 |

没有被 `enhance()` 命中的页面、以及没有 `.tw-v2` 的页面，渲染保持原样 —— 这是本轮改动不回归的底线。

### 判定条件

```js
// tool-detail-layout.js
const detail = !!page.querySelector('.ts-heading a[href="#/app/tools"]');
document.body.classList.toggle('tool-detail-page', detail);
page.classList.add('tw-detail');
```

- 页面根节点是 `.ts-page`，且页头有指回 `#/app/tools` 的链接，才视为工具详情页。
- 工作台容器按 `[class$="-workbench"]` 识别，并给左右两个子面板打上 `.tw-input` / `.tw-output`。
- 调用点：`tool-studio.js` 每次渲染后 `window.ToolDetailLayout?.enhance()`；`tool-oc.js` 在 `sync()` 里也会调用一次。

---

## 2. 变量

`.tw-v2` 只新增了 5 个布局变量，其余全部映射到既有 token：

| 变量 | 值 | 用途 |
|---|---|---|
| `--tw-control-h` | `36px` | 按钮 / 分段控件高度 |
| `--tw-control-radius` | `10px` | 按钮圆角 |
| `--tw-hover-shadow` | `0 4px 12px rgba(0,0,0,.10)` | hover 抬升阴影 |
| `--tw-title-gap` | `12px` | 标题 → 内容 |
| `--tw-section-gap` | `24px` | 区块之间 |

主题色不新造，`--tw-line / --tw-surface / --tw-soft / --tw-text / --tw-muted` 依次接到 `--ap-*` → `--cm-*` 的既有值上。

实际用到的设计 token：

| token | 值 | 出现位置 |
|---|---|---|
| `--color-paper-muted` | `#f5f5f5` | 按钮/分段默认底、OC 并列卡底、下拉触发器底 |
| `--color-accent-soft` | `rgba(200,242,78,.16)` | hover / 选中态底 |
| `--color-ink` | `#171717` | 主按钮底、强调文字 |
| `--color-ink-label` | `#404040` | 按钮默认文字 |
| `--color-ink-muted` | `#666666` | 说明文字、caption |
| `--color-hairline` | `#dedede` | 输入框描边、下拉面板描边 |
| `--shadow-md` | — | 下拉面板阴影 |
| `--dur-fast` / `--dur-base` | — | 状态过渡 / 图标动效 |
| `--space-1/2/3/4/6` | 4/8/12/16/24px | 间距节奏 |

---

## 3. 组件规格

### 3.1 按钮

```css
height: 36px;  border-radius: 10px;  padding: 0 12px;
font: 500 12px/1.4 var(--font-ui);
background: #f5f5f5;  color: #404040;  border: 1px solid transparent;
```

| 状态 | 规格 |
|---|---|
| 默认 | `#f5f5f5` 底 + `#404040` 字 |
| hover | 底 `rgba(200,242,78,.16)`、字 `#000`、`translateY(-1px)`、`0 4px 12px rgba(0,0,0,.10)` |
| active | 回到原位，阴影移除 |
| disabled | `opacity: .45`，保持灰底，`cursor: not-allowed` |
| focus-visible | `outline: 2px solid var(--color-accent-text)`，`offset: 2px` |

**主按钮（`.cm-button.primary`）例外：墨色填充在 hover 时不变色**，只做 1px 抬升。也就是说"填充色 = 层级"，浅灰可被柠檬色接管，墨色不被接管。

带 `img` 的按钮、`.tw-dropzone` 不套用这套皮肤（图片按钮有自己的形状）。纯文字动作用 `.tw-text-action`：无底、下划线、`12px/500`、hover 只变字色。

### 3.2 输入

```css
height: 40px;  background: #fff;
border: 1px solid var(--color-hairline);  border-radius: 10px;
```

- `select` 固定 40px、`padding: 0 12px`；`textarea` 不限制高度、`line-height: 1.7`、可垂直拉伸。
- 标题到内容 12px；区块之间 20–24px；面板内部**不使用分隔线**，靠间距分组。
- 下拉面板：触发器无边框、`#f5f5f5` 底，hover 转柠檬；展开的面板 1px hairline + `--shadow-md`，选项 hover / 选中为柠檬底黑字。

### 3.3 分段控件 `.tw-segmented`

由 `segmented()` 自动装配：找到 2–3 个互为互斥的 `[aria-pressed]` 兄弟按钮，容器改造成 `.tw-segmented`。

```css
容器：display:flex; flex-wrap:nowrap; gap:8px; width:100%;
      background:transparent; border:0; box-shadow:none;
按钮：flex:1 1 0; height:36px; border-radius:10px; padding:0 10px;
      font:500 12px/1.4; white-space:nowrap; text-overflow:ellipsis; overflow:hidden;
```

- 默认 `#f5f5f5` + `#404040`；选中与 hover 都是柠檬底 + `#000`。
- 等宽、单行、可省略 —— 与 Image to Motion 的扁平胶囊一致。
- **跳过名单**（内容网格/预设/动作行保留自己的排布）：

```
.oc-base-board  .pn-states  .pn-actions  .pn-background  .perf-presets
.perf-cards  .tr-suggestions  .tr-operations  .stk-presets  .stk-card-grid
.vo-examples  .bgm-examples  .pn-suggestions  .tm-page
```

### 3.4 上传槽 `.tw-slot`

结构（每个 `<input type=file>` 外层的 `label` 会被原地改造成这个结构）：

```
.tw-slot
├─ .tw-slot-preview          # 预览面（空态时是 22px/12px 内边距的浅块）
│  ├─ .tw-slot-empty         # "No image added yet." / "No reference added yet."
│  ├─ .tw-slot-media         # 已选画面；相对定位容器
│  │  └─ .tw-remove          # 只有在图片 hover / focus-within 时出现
│  └─ .cm-button             # 示例按钮（可选）
└─ .tw-slot-actions          # 上传 / 资产库 / ⋯，flex wrap，gap 8
```

- 容器的 `<input type=file>` **保留不动**，由捕获阶段的 `input`/`change` 委托接管（工具页会在 document `change` 上 `stopImmediatePropagation()`，所以必须在捕获阶段喂数据）。
- 已选画面存在内存 `slotMedia` Map 里（key = 路由 hash + 槽位序号），页面重渲染后自动回填；页面自带的缩略图会被"收养"一次，之后由槽位自己维护。
- 装饰是幂等的：`paintSlot()` 先比对再写 DOM，配 `MutationObserver(childList)` + 80ms 防抖，静置时 0 次变更（不会自激）。
- **删除入口只有一个**：图片表面 hover 出现的 `Remove`。行内和页面级都没有第二个删除按钮。
- 空态文案统一为英文短句；Image to Motion 不参与上传槽改造。

### 3.5 `⋯` 菜单 `.tw-menu`

由 `menus()` 把 `details.tw-disclosure` / `.ts-panel details` 转成三点菜单，`mergeMenus()` 把相邻菜单合并。

- 触发器：`.tw-menu-button` 36×36，`.tw-menu-dots` 18px，灰底，hover 柠檬。
- 面板：**内联、无边框、透明**，`position: static`、`border: 0`、`background: transparent`、`box-shadow: none`，`margin-top: 10px`，内容直接流进父卡片。
- 面板内部布局：`display:flex; flex-wrap:wrap; gap:12px 16px`，每一项基线 240px（`.tw-menu-item` / 直接子元素），说明文字用 `.tw-menu-caption`（11px/500、`#666`）。
- 面板里原来的卡片会自动去掉自己的边框、底色和内边距 —— 只保留一层表面。
- 槽位编号菜单 `.tw-slot-menu` 是例外：它是带 1px hairline 的小面板，出现在动作行下方。

### 3.6 页头：返回链接 + 资产库入口

- **返回**：保留原 `cm-text-link` 文字链，前面加一个 14px 左箭头 SVG（`stroke-width: 1.8`），无边框、无底色、无阴影。Motion 上原来那个悬浮 "Go Back" 按钮和它的 tooltip 已移除。
- **资产库**：`.tw-asset-link`，36px 高、10px 圆角、`12px/500`、18px 图标；hover 时外层转柠檬 + 抬升 + 阴影，图标两层做 2px/1px 的反向位移。
- 资产库入口有两种语义，见 §7 待决问题 6。

### 3.7 资产库选择器 `#site-modal .tw-picker`

在 Image to Motion 的槽位上，页头资产库入口是**选择器**而不是跳转：点开 `Site.modal`，用 `.tw-picker-grid` / `.tw-picker-choice` 展示 `StudioLibrary.load().assets` 里的图片，选中后转成 PNG `File` 并派发 `input` / `change`，走和本地上传完全相同的链路。空库时显示 `.tw-picker-empty`。

### 3.8 OC 并列卡 `.tw-oc-pair`

角色设定表里 Outfit 与 Character Intro 变成并列的两张卡：

```css
grid-template-columns: repeat(2, minmax(0,1fr));  gap: 16px;
卡片：padding 18px; border-radius 12px; background: #f5f5f5;
≤820px 折叠为单列
```

两张卡内部都是无边框的 `⋯` 面板；内部按钮为白底，确保在灰卡上仍有层级。

### 3.9 空态

`td-empty / tc-empty / oc-empty / pn-empty / perf-empty / stk-empty / tm-empty / tr-empty / cut-empty / opt-empty` 统一：最小高 280px、`28px 16px` 内边距、标题 17px、说明 13px/1.7 且最宽 36ch。

---

## 4. 页面覆盖

| 页面文件 | 页面类名 | 作用域 | 备注 |
|---|---|---|---|
| `tool-motion.js` | `ts-page tm-page tw-v2` | `.tw-v2` + 自己的 `.tm-*` | 视觉基准；上传槽与 `⋯` 由本页自己实现 |
| `tool-color.js` | `ts-page tc-page tw-v2` | `.tw-v2` | 页头换成共享资产库组件 |
| `tool-studio.js`（Lettering） | `ts-page ts-detail tw-v2` | `.tw-v2` | `tw-v2` 只在 lettering 时加上 |
| `tool-oc.js` | `ts-page oc-page` | 共用皮肤 | `⋯` 内联、Outfit/Intro 并列、间距按 4px 节奏 |
| `tool-pngtuber.js` | `ts-page pn-page` | 共用皮肤 | 标签页改为分段控件 |
| `tool-performance.js` | `ts-page perf-page` | 共用皮肤 | 预设网格不接管 |
| `tool-optimize.js` | `ts-page opt-page` | 共用皮肤 | 前后对比保留自己的布局 |
| `tool-sticker.js` | `ts-page stk-page` | 共用皮肤 | 预设网格不接管 |
| `tool-cutout.js` | `ts-page cut-page` | 共用皮肤 | — |
| `tool-redraw.js` | `ts-page tr-page` | 共用皮肤 | — |
| `tool-voiceover.js` | `ts-page vo-page` | 共用皮肤 | 示例行不接管 |
| `tool-music.js` | `ts-page bgm-page` / `sfx-page` | 共用皮肤 | 示例行不接管 |
| `tool-draw.js` | `ts-page td-page` | 共用皮肤 | — |
| `tool-studio.js`（其余 kind） | `ts-page ts-detail` / `ts-live2d` | 共用皮肤 | Live2D 加了 `legacyResult` 兜底 |

路由形式为 `#/app/tools/<tool-id>`，入口是 `#/app/tools`。

---

## 5. 给新页面接入

1. 页面根节点用 `.ts-page`，页头必须有一个指回 `#/app/tools` 的链接（`enhance()` 靠它识别工具详情页）。
2. 需要 Motion 那一层密度（36px 控件、结果区排版）时，给根节点加 `tw-v2`；只想要共用皮肤，什么都不用加。
3. 页头资产库入口用 `ToolDetailLayout.assetLibraryLink()`，不要手写链接。
4. 上传区保持原生 `<input type=file>` 包在 `label` 里 —— 槽位会自动改造，**不要**自己写删除按钮。
5. 可折叠说明用 `details`，会被转成 `⋯`；不想被合并的加 `data-tw-menu` 占位或放进跳过名单。
6. 2–3 个互斥选项用带 `aria-pressed` 的兄弟按钮即可，`segmented()` 会自动接管；如果它是内容网格，加进 `SEGMENTED_SKIP`。
7. 所有数值只用 §2 的 token；不新增颜色，不写死 hex。

---

## 6. 文案与 i18n

- 界面文案走 `studio-interface-en.js`（992 行）：短标签 Title Case 且不带句号，整句 sentence case，缩写 AI / CSS / MP4 原样保留，`Asset Library` 作为品牌词不翻译。
- 该文件同时处理：`Set N`、`Generate Selected (N)`、`N 秒 / 原片 M 秒`、`^(.+)的角色参考$` 一类模式；`Label: Value` 会按冒号拆开分别翻译；正则捕获到的中文片段会二次翻译；`alt` 文本也翻译。

---

## 7. 已知限制与待决问题

### 限制

- 没有任何 AI / 模型接入，结果区全是演示占位。
- 资产库选择器只列图片资产，视频资产未纳入。
- 窄面板（<360px）下按钮文案会省略，`⋯` 折叠逻辑尚未实现。
- 13 个共享页的页头 `Asset Library` 仍是跳转链接，只有 Motion 是选择器 —— 语义不统一。
- Live2D 的 `legacyResult` 只加了守卫，历史数据结构未迁移。
- `npm run lint` 仍有基线遗留的 1 个 `tokens-order` 与 24 个素材体积 warning。

### 需要团队拍板

1. 墨色主按钮 hover 不改填充、浅灰次按钮 hover 转柠檬 —— 这套"填充色 = 层级"要不要写进 `design/DESIGN-SYSTEM.md`？
2. `⋯` 面板内联无边框、内容流进父卡片，与卡片内边距的关系在并排卡片下是否成立？
3. 删除入口只在图片 hover 出现，可发现性是否足够？是否需要常驻弱化入口？
4. 分段控件继续用 `aria-pressed` 自动识别 + 跳过名单，还是改为各页显式标记 class？
5. 返回控件是"文字链 + 14px 箭头"，与页头资产库按钮的视觉权重是否平衡？
6. 页头 `Asset Library` 到底是"去资产库"还是"从资产库挑一个喂给当前工具"？
7. 仓库 PR 模板要求"一页一 PR"，但共享层改动跨 14 页，是否给"共享 UI 层"开例外？

---

## 8. 本轮改动的文件

| 文件 | 行数 | 说明 |
|---|---|---|
| `tool-detail-layout.js` | 517 | 共享层逻辑：`enhance` / `uploads` / `slots` / `menus` / `mergeMenus` / `ocPanels` / `segmented` / `backControl` / `assetLibraryLink` / `openLibrary` |
| `tool-detail-layout.css` | 737 | `.tw-v2` + `.tw-detail:not(.tm-page)` 双作用域、槽位、菜单、分段、选择器、空态 |
| `tool-motion.js` / `tool-motion.css` | — | Image to Motion 页面与结果区重构 |
| `studio-interface-en.js` | 992 | 英文文案与规则 |
| `tool-studio.js` | — | `legacyResult` 兜底、`.ts-empty` 兜底、串联 `enhance()` |
| `tool-color.js` | — | 接入 `.tw-v2` 与共享资产库组件 |
| `tool-light-tasks.js` | — | 去掉重复的状态小字 |
| `cimora-workspace.css` | — | 纸张背景扩展到 `.tool-detail-page`（2 行变更） |

---

## 9. 怎么看

```bash
npm run preview                 # http://127.0.0.1:4173/#/app/tools
npm run preview -- --port=4187  # 端口占用时
```

评审顺序建议：先看 Image to Motion（视觉基准）→ 再看 Colorize / Lettering（同样的 `.tw-v2`）→ 最后抽查 OC、Expressions、PNGtuber（共用皮肤 + 并列卡 + 分段控件）。

回归检查口径：13 个工具页 DOM 里 0 处中文残留、0 横向溢出、无整页滚动条、console 无报错；分段控件单行 36px；上传槽在 298px 宽下不溢出；静置时无 DOM 变更。

# ELIET AEIS 前端

基于 **Vue 3 + Vite + Ant Design Vue** 的全新前端项目，用于月度课时费管理系统及后续功能扩展。

## 快速开始

```bash
# 安装依赖（推荐使用 npm）
npm install

# 本地开发，端口为 45654
npm run dev

# 生产构建
npm run build

# 本地预览生产构建
npm run preview
```

开发服务器默认会自动打开浏览器，如果端口 45654 被占用，可在 `vite.config.js` 中调整。

## 技术栈

- [Vue 3](https://vuejs.org/) + [Vite](https://vitejs.dev/)
- [Ant Design Vue](https://antdv.com/)（绿色主题）
- 状态管理使用组合式 API（Compositional API）
- [Axios](https://axios-http.com/) 用于 HTTP 请求
- [Day.js](https://day.js.org/) 处理日期
- [Sortable.js](https://sortablejs.github.io/Sortable/) 实现拖拽交互

## 目录结构

```
├── index.html
├── package.json
├── src
│   ├── api
│   │   └── http.js         # Axios 实例
│   ├── pages
│   │   └── SchedulePage.vue# 月度课时费管理页面
│   ├── router
│   │   └── index.js        # Vue Router 配置
│   ├── styles
│   │   └── global.css      # 全局基础样式
│   ├── App.vue
│   └── main.js
├── vite.config.js
└── .env                    # 后端 API 基地址
```

## 与后端联调

- 默认后端地址为 `http://localhost:8000`，可在 `.env` 中通过 `VITE_API_BASE_URL` 修改。
- 前端 API 均通过 Axios 实例 `src/api/http.js` 发起，已统一处理超时和错误信息。

## 主题与定制

- Ant Design Vue 通过 `ConfigProvider` 设置主题主色为官方绿色 `#52c41a`。
- 若需自定义品牌元素或多语言支持，可在 `App.vue` 或相应页面中扩展。

## 注意事项

- 当前未引入 ESLint/Prettier 等工程化工具，如需统一代码风格可自行添加。
- 课程、课表、额外费用等功能已从原始 HTML 页面迁移至 Vue 组件，保持原有交互逻辑。
- 若需要扩展其它页面或模块，可在 `src/pages` 中新增组件并通过 `vue-router` 挂载。

祝开发顺利！

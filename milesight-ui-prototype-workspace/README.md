# Milesight AI UI Prototype Workspace

一个可静态部署的 React + Vite 工作台，用于手工验证：

`Requirement → page.json → Schema Validator → Design System Validator → Renderer → Interactive UI Demo`

当前默认案例是 [设备离线告警配置](examples/test-cases/device-offline-alert-config.page.json)。Workspace 本身与 `page.json` 原型分离：中间画布只通过现有 Renderer 渲染 JSON，右侧 Inspector 读取真实 Validator 结果。

本阶段为 Manual Generation Mode：不调用外部 LLM，不使用飞书 API、数据库或登录服务。

## 本地运行

```bash
npm install
npm run dev
```

打开终端显示的本地地址（通常为 `http://localhost:5173`）。

## 发布前验证

```bash
npm run validate
npm run typecheck
npm run lint
npm run build
npm run preview
```

生产静态资源会输出到 `dist/`。`vite.config.ts` 已明确使用根路径 `/` 和 `dist` 输出目录。

## 部署到 Vercel（推荐）

1. 将此项目推送到 GitHub、GitLab 或 Bitbucket。
2. 在 [Vercel](https://vercel.com/new) 选择该仓库并导入。
3. 保持自动检测的 Vite 设置：Build Command 为 `npm run build`，Output Directory 为 `dist`。
4. 点击 Deploy，完成后 Vercel 会提供公网 URL。

[vercel.json](vercel.json) 已把所有路径重写到 `index.html`，因此直接刷新任意 Workspace URL 不会出现 404。

## 部署到 Netlify

1. 将项目推送到 GitHub、GitLab 或 Bitbucket。
2. 在 [Netlify](https://app.netlify.com/start) 选择仓库并创建站点。
3. 构建命令使用 `npm run build`，发布目录使用 `dist`。
4. 部署完成后使用 Netlify 分配的公网 URL，或在站点设置中绑定自定义域名。

[netlify.toml](netlify.toml) 已包含构建设置及 SPA fallback；直接刷新任意路径会返回 Workspace 的 `index.html`。

## 通用静态托管

任意静态主机均可发布 `dist/` 内容，但需要配置 SPA 回退规则：当请求的文件不存在时，返回 `index.html` 并使用 HTTP 200。不要公开提交 `.env.local`；当前 Workspace 不需要它即可运行和部署。

## 架构边界

- `examples/test-cases/*.page.json`：最终产品 Prototype 的 schema、数据、事件、流程与状态。
- `src/renderer/`：递归按 schema 渲染 registry-backed adapters，不包含页面类型分支。
- `src/validator/`：Schema 与 Design System 语义校验。
- `src/workspace/`：创作工作台外壳，不进入生成的 Prototype JSON。

Design System Coverage 按组件实例计算：

`已注册且有 registry-backed adapter 的实例 / 全部 Design System 相关实例`

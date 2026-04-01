# 超市收银系统 - 部署指南

## 方式一：部署到 GitHub Pages（推荐）

### 步骤 1：创建 GitHub 仓库

1. 登录 [GitHub](https://github.com)
2. 创建新仓库，命名为 `supermarket-cashier-system`（或其他名称）
3. 不要初始化 README（我们会推送本地代码）

### 步骤 2：修改配置

编辑 `vite.config.ts` 文件，添加 `base` 配置：

```typescript
import path from 'path';
import { defineConfig } from '@lark-apaas/fullstack-vite-preset';

export default defineConfig({
  base: '/supermarket-cashier-system/', // 替换为你的仓库名
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'client/src'),
    },
  },
});
```

### 步骤 3：创建 GitHub Actions 工作流

创建 `.github/workflows/deploy.yml` 文件：

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: 'pages'
  cancel-in-progress: true

jobs:
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build:client

      - name: Setup Pages
        uses: actions/configure-pages@v4

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './dist/client'

      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

### 步骤 4：推送到 GitHub

```bash
# 初始化 Git 仓库（如果尚未初始化）
git init

# 添加所有文件
git add .

# 提交
git commit -m "Initial commit"

# 关联远程仓库（替换为你的用户名和仓库名）
git remote add origin https://github.com/你的用户名/supermarket-cashier-system.git

# 推送
git push -u origin main
```

### 步骤 5：启用 GitHub Pages

1. 打开 GitHub 仓库页面
2. 点击 **Settings** → **Pages**
3. **Source** 选择 **GitHub Actions**
4. 等待 Actions 完成部署
5. 访问 `https://你的用户名.github.io/supermarket-cashier-system/`

---

## 方式二：本地 Python 服务器运行

### 方法 A：直接运行（最简单）

```bash
# 进入项目目录
cd supermarket-cashier-system

# 先构建项目
npm run build:client

# 进入构建输出目录
cd dist/client

# 启动 Python HTTP 服务器（Python 3）
python -m http.server 8080

# 或 Python 2
python -m SimpleHTTPServer 8080
```

然后打开浏览器访问：`http://localhost:8080`

### 方法 B：使用 http.server + 后台运行

```bash
# 构建项目
npm run build:client

# 后台启动服务器（Linux/Mac）
cd dist/client && python -m http.server 8080 &

# Windows 使用 start 命令
start python -m http.server 8080
```

### 方法 C：指定目录启动（无需 cd）

```bash
# Python 3.7+
python -m http.server 8080 --directory dist/client

# 或创建一个启动脚本
echo '#!/bin/bash
cd dist/client && python -m http.server 8080' > start.sh
chmod +x start.sh
./start.sh
```

---

## 方式三：其他免费托管平台

### Vercel（推荐，自动部署）

1. 注册 [Vercel](https://vercel.com) 账号
2. 导入 GitHub 仓库
3. 构建命令：`npm run build:client`
4. 输出目录：`dist/client`
5. 自动获得域名，如 `https://supermarket-cashier-system.vercel.app`

### Netlify

1. 注册 [Netlify](https://netlify.com) 账号
2. 拖拽 `dist/client` 文件夹到部署区域
3. 或使用 Git 集成自动部署

---

## 本地开发环境运行

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 或单独启动客户端
npm run dev:client
```

---

## 常见问题

### Q: GitHub Pages 刷新后 404？

这是单页应用（SPA）的常见问题。解决方案：

1. 在 `dist/client` 目录创建 `404.html`，内容与 `index.html` 相同
2. 或使用 hash 路由模式（需要修改代码）

### Q: 数据存储在哪里？

使用浏览器 localStorage，数据保存在用户本地浏览器中。换浏览器或清除缓存会丢失数据。

### Q: 如何备份数据？

浏览器控制台执行：

```javascript
// 导出商品数据
console.log(localStorage.getItem('__global_cashier_products'));

// 导出订单数据
console.log(localStorage.getItem('__global_cashier_orders'));
```

---

## 文件说明

```
supermarket-cashier-system/
├── client/              # 前端源码
│   ├── src/
│   │   ├── pages/       # 页面组件
│   │   ├── components/  # 组件
│   │   └── ...
│   └── index.html
├── dist/client/         # 构建输出（部署用这个目录）
├── DEPLOY.md            # 本文件
└── package.json
```

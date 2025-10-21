# Vercel 部署指南

本项目已配置为支持 Vercel 全栈部署。

## 部署步骤

### 1. 安装 Vercel CLI（可选）

```bash
npm install -g vercel
```

### 2. 通过 Vercel 网站部署（推荐）

1. 访问 [vercel.com](https://vercel.com)
2. 使用 GitHub/GitLab/Bitbucket 账号登录
3. 点击 "New Project"
4. 导入你的 Git 仓库
5. Vercel 会自动检测配置

### 3. 配置环境变量

在 Vercel 项目设置中添加以下环境变量：

**必需的环境变量：**
- `OPENAI_API_KEY` - 你的 OpenAI API 密钥
- `OPENAI_MODEL` - (可选) 默认为 `gpt-4o-mini`

**设置步骤：**
1. 进入 Vercel 项目 Dashboard
2. 点击 "Settings" → "Environment Variables"
3. 添加上述环境变量
4. 选择环境：Production, Preview, Development

### 4. 部署

#### 方法 A: 通过 Git 自动部署
- 推送代码到 Git 仓库
- Vercel 会自动触发部署

#### 方法 B: 使用 Vercel CLI
```bash
# 首次部署
vercel

# 部署到生产环境
vercel --prod
```

## 项目结构

```
flint/
├── api/             # Vercel Serverless Functions
│   ├── chat.js      # Chat API endpoint
│   └── package.json # API dependencies
├── client/          # React 前端 (Vite)
├── server/          # Express 后端 (本地开发)
├── vercel.json      # Vercel 配置
└── package.json     # 根配置
```

## Vercel 配置说明

`vercel.json` 配置了：
- **构建命令**: 自动安装依赖并构建前端
- **输出目录**: `client/dist` 作为静态文件根目录
- **API 路由**: `/api/*` 自动映射到 `api/` 目录下的 Serverless 函数
- **重写规则**: 确保 API 请求正确路由

## 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器（前端 + 后端）
npm run dev
```

- 前端: http://localhost:5173
- 后端: http://localhost:3001

## 生产环境 API 配置

客户端会自动使用环境变量 `VITE_API_URL`：
- 本地开发: `/api` (通过 Vite proxy)
- 生产环境: `/api` (通过 Vercel 路由)

## 注意事项

1. **API 密钥安全**: 
   - 永远不要在前端代码中硬编码 API 密钥
   - 使用 Vercel 环境变量管理敏感信息

2. **Serverless 限制**:
   - 每个函数执行时间限制（免费版 10 秒）
   - 冷启动可能导致首次请求较慢

3. **环境变量**:
   - 修改环境变量后需要重新部署
   - 可以为不同环境设置不同的值

## 故障排查

### 部署失败
- 检查 Vercel 构建日志
- 确认所有依赖都在 `package.json` 中
- 确保 `api/package.json` 包含 `axios` 依赖

### API 调用失败（500 错误）
**最常见原因：环境变量未设置**
1. 进入 Vercel Dashboard → 你的项目 → Settings → Environment Variables
2. 添加 `OPENAI_API_KEY`（必需）
3. 添加 `OPENAI_MODEL`（可选，默认 `gpt-4o-mini`）
4. **重要**: 添加环境变量后必须重新部署！

**检查步骤：**
- 在 Vercel Dashboard → Deployments → 最新部署 → Functions
- 点击 `/api/chat` 查看函数日志
- 查看是否有 API key 相关错误

### API 调用失败（404 错误）
- 确认 `api/chat.js` 文件存在
- 检查 `vercel.json` 配置正确
- 确认前端请求路径为 `/api/chat`

### 前端无法访问 API
- 检查浏览器控制台网络请求
- 确认请求 URL 为 `/api/chat`（不是 `http://localhost:3001/api/chat`）
- 查看 Network 标签中的响应状态码和错误信息

## 更多资源

- [Vercel 文档](https://vercel.com/docs)
- [Vercel Serverless Functions](https://vercel.com/docs/functions)
- [Vite 部署指南](https://vitejs.dev/guide/static-deploy.html)

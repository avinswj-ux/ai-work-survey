# AI 工作流小调查

一套可直接部署的匿名问卷系统：

- 前台：用户名必填，6 道题全部支持多选，“其他”可补充文字
- 查重：用户名去除首尾空格并忽略英文大小写，同一用户名只能提交一次
- 后台：密码登录、答卷总数、各题选项排行、原始答卷、批量删除、Excel 兼容 CSV 导出
- 存储：服务端 JSON 文件，Docker 数据卷持久化，删除前自动备份
- 部署：Next.js standalone + Docker Compose + Caddy 自动 HTTPS

## 本地运行

```bash
npm install
cp .env.example .env.local
npm run dev
```

打开：

- 前台：`http://localhost:3000`
- 后台：`http://localhost:3000/admin`

## 服务器部署

```bash
cp .env.production.example .env.production
# 修改 ADMIN_PASSWORD
docker compose up -d --build
```

默认公网域名为 `https://ai-survey.103-30-76-149.nip.io`。如果服务器上已有 Caddy 占用 80/443，
请使用 `compose.server.yaml` 启动问卷，并把 `Caddyfile.server` 的站点块合并进现有 Caddy。

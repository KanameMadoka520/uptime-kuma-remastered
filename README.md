# Uptime Kuma Remastered

`Uptime Kuma Remastered` 是一个基于 `Uptime Kuma 2.2.1` 的独立魔改分支。

它不是官方上游版本，也不是准备回提交给官方仓库的通用补丁集合，而是围绕个人使用习惯、节点展示需求和运维方式做的长期自用分支。

官方仓库：

- https://github.com/louislam/uptime-kuma

## 核心修改

- 把 Dashboard 右下角不断堆积的状态弹窗改成消息箱，避免遮挡后台操作。
- 修正状态页默认排序逻辑，支持“按状态降序”与“完全恢复手动固定顺序”两种模式。
- 新增可开关的自定义展示层，可覆盖原版状态页渲染。
- 自定义展示层支持推荐卡片、分区卡片、分区列数、主展示节点、节点标签与备注。
- 自定义展示层卡片支持玻璃主题配色，不再只有单一颜色。
- 状态页编辑侧栏默认更宽，并支持拖拽调整宽度。
- 状态页顶部总体状态改成更紧凑的标题旁状态胶囊。
- 状态页保存时自动导出快照，避免展示层配置和说明区内容被误覆盖后无法恢复。
- 保留并延续 Cloudflared Tunnel 的使用方式。

## 当前设计取向

这个分支不追求“尽量接近上游默认 UI”，而是优先考虑：

- 后台运维时不被大量通知干扰
- 玩家打开状态页时，先看到更适合选择线路的信息
- 以后新增或调整线路时，尽量通过页面配置完成，而不是每次改源码

## 从零开始构建可用镜像

如果你在一台新机器上部署，推荐直接从当前源码完整构建镜像，不依赖“先运行官方现成容器再覆盖”的方式。

### 1. 获取源码

```powershell
git clone https://github.com/KanameMadoka520/uptime-kuma-remastered.git
cd uptime-kuma-remastered
```

### 2. 安装依赖并构建前端

```powershell
npm ci
npm run build
```

### 3. 构建完整 Docker 镜像

下面这条命令会直接用仓库内的完整 Dockerfile 构建镜像：

```powershell
docker build -f docker/dockerfile -t uptime-kuma-remastered:2.2.1 .
```

这条路径适合：

- 新机器第一次部署
- 你希望完全自己构建镜像
- 不想依赖本地已有旧镜像缓存

### 4. 运行容器

```powershell
docker run -d ^
  --name uptime-kuma ^
  -p 3001:3001 ^
  -v ./data:/app/data ^
  -e TZ=Asia/Shanghai ^
  uptime-kuma-remastered:2.2.1
```

启动后访问：

- `http://localhost:3001`

## 使用 Docker Compose 运行

可以使用一个最小化的 `docker-compose.yml`：

```yaml
services:
  uptime-kuma:
    image: uptime-kuma-remastered:2.2.1
    container_name: uptime-kuma
    ports:
      - "3001:3001"
    volumes:
      - ./data:/app/data
    environment:
      - TZ=Asia/Shanghai
    restart: unless-stopped
```

启动：

```powershell
docker compose up -d
```

## 已有本地镜像时的快速增量重建

仓库中还保留了 `docker/plana-runtime.dockerfile`，用于“本地快速覆盖构建”。

适合场景：

- 你已经有一个可用的 `uptime-kuma-remastered:2.2.1`
- 只想覆盖 `dist/` 和几个改过的后端文件
- 希望减少重建时间

快速重建时可以使用：

```powershell
npm run build
docker build -f docker/plana-runtime.dockerfile -t uptime-kuma-remastered:2.2.1 .
```

注意：

- 这种方式依赖本地已经存在一个可用的 `uptime-kuma-remastered:2.2.1`
- 它更像“增量重建”，不是新机器首次部署的推荐方式

## 数据持久化

运行时最重要的是把 `/app/data` 挂载出来。

数据目录里通常至少会包含：

- `kuma.db`
- `upload/`
- `screenshots/`
- `docker-tls/`
- `plana-status-page/`

其中 `plana-status-page/` 是这个分支额外增加的状态页快照目录，保存：

- `default.live.json`
- `default.description.html`
- `default.custom.css`
- `history/`

所以只要 `./data` 目录保留，重建容器时通常不会丢失：

- 监控数据
- 状态页文本
- 自定义 CSS
- 展示层配置
- 状态页快照

## 与官方版的差异

这个仓库的目标不是“尽量少改”，而是“按当前个人需求把 Uptime Kuma 做得更顺手”。

因此你在这里看到的一些设计选择，可能和官方默认思路明显不同，例如：

- 更重的状态页展示层定制
- 更主观的线路推荐结构
- 更偏运维友好的后台状态提示方式

如果你想要的是完全贴近官方体验，请直接使用官方仓库；如果你想要的是一个已经把这些定向体验改好的分支，这个仓库才是目标。

## 仓库内与魔改直接相关的主要文件

- `src/components/MonitorEventInbox.vue`
- `src/mixins/socket.js`
- `src/pages/StatusPage.vue`
- `src/components/PlanaStatusShowcase.vue`
- `src/components/PlanaShowcaseEditor.vue`
- `src/config/plana-showcase-themes.js`
- `server/model/status_page.js`
- `server/socket-handlers/status-page-socket-handler.js`
- `server/utils/plana-status-page-snapshot.js`
- `db/knex_migrations/2026-04-13-0000-add-default-status-sort.js`
- `db/knex_migrations/2026-04-13-0001-add-plana-showcase-config.js`

## 一句话概括

这是一个把消息箱、自定义状态页展示层、玻璃卡片主题、排序控制、快照持久化和 Cloudflared 延续整合到一起的个人化 Uptime Kuma 独立分支。

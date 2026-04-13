# Uptime Kuma Remastered

这是一个基于 `Uptime Kuma 2.2.1` 做出来的独立魔改分支。

它不是官方上游版本，也不是准备回提交给官方仓库的通用补丁集合。更准确地说，它是我按照自己的使用习惯、线路展示需求和运维方式，长期往下改出来的一套个人分支。目标一直很明确：后台要更顺手，状态页要更好看，后续维护尽量靠配置完成，而不是反复改源码。

官方仓库在这里：

- https://github.com/louislam/uptime-kuma

## 这个分支主要改了什么

如果只看最核心的变化，可以概括成下面这些：

- 把 Dashboard 右下角容易堆满屏幕的状态弹窗改成了消息箱。这样节点一多、上下线一频繁，也不会挡住后台操作按钮。
- 把状态页默认排序逻辑重新接管了。现在既可以默认按状态降序显示，也可以彻底关闭默认排序，回到手动固定顺序。
- 做了一套可开关的“自定义展示层”，可以覆盖原版状态页渲染。推荐卡片、分区卡片、主展示节点、节点标签、备注、列数这些都在这里完成。
- 给展示层卡片做了玻璃风格的主题系统，不再是单一颜色，而是可以直接选不同配色。
- 把状态页编辑侧栏加宽了，并支持拖拽调整宽度。因为既然加了很多配置项，编辑器本身就不能继续那么窄。
- 把顶部整体状态提示压缩成更紧凑的标题旁状态胶囊，不再占一整条位置。
- 给状态页加了自动快照落盘，避免好不容易调好的展示层配置、说明区内容和 CSS 被覆盖以后完全没法恢复。
- 保留并延续了 Cloudflared Tunnel 的用法，不用为了这套分支重新换一套反代接入方式。

## 这个分支想解决的其实是什么问题

上游的 Uptime Kuma 已经很好用了，但我自己的场景有几个很明确的痛点：

- 监控项比较多时，后台状态提示会太吵，甚至影响点按钮。
- 原版状态页更像“监控列表”，但我需要它更像“给玩家看的线路入口页”。
- 一旦官方排序逻辑覆盖掉手动顺序，页面观感和线路优先级就会被打乱。
- 有些展示内容并不是监控本身的问题，而是“怎么把节点呈现给人看”的问题，这就需要更高程度的页面组织能力。

所以这个分支的重点，从来都不是“改一两个样式”，而是把 Uptime Kuma 从“纯监控工具”往“更适合当前这套线路场景的状态展示工具”方向推了一步。

## 从零开始构建可用镜像

如果你是在一台新机器上第一次部署，最稳妥的做法是直接从这份源码完整构建镜像，而不是先拉官方容器再想办法覆盖文件。

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

完整构建请直接使用仓库里的完整 Dockerfile：

```powershell
docker build -f docker/dockerfile -t uptime-kuma-remastered:2.2.1 .
```

这一种方式适合：

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

启动后直接访问：

- `http://localhost:3001`

## 用 Docker Compose 启动

如果你更习惯 Compose，可以用下面这种最小配置：

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

启动命令：

```powershell
docker compose up -d
```

## 已有本地镜像时的快速增量重建

仓库里还保留了一个 `docker/plana-runtime.dockerfile`，它不是给“新机器第一次部署”用的，而是给“本地已经有可用镜像时的快速增量覆盖构建”用的。

它更适合下面这种场景：

- 你本地已经有一个能跑的 `uptime-kuma-remastered:2.2.1`
- 这次只是改了 `dist/` 或少量后端文件
- 想要更快完成重建

用法是：

```powershell
npm run build
docker build -f docker/plana-runtime.dockerfile -t uptime-kuma-remastered:2.2.1 .
```

这里要特别说明一下：

- 这条路径依赖本地已经存在一个可用的 `uptime-kuma-remastered:2.2.1`
- 它本质上是“本地增量重建”
- 如果是第一次部署，还是推荐前面的完整构建方式

## 数据怎么持久化

这套分支和原版一样，最关键的仍然是把 `/app/data` 挂载出来。

通常这个目录里至少会有这些内容：

- `kuma.db`
- `upload/`
- `screenshots/`
- `docker-tls/`
- `plana-status-page/`

其中 `plana-status-page/` 是这个分支额外加的状态页快照目录，里面会保存：

- `default.live.json`
- `default.description.html`
- `default.custom.css`
- `history/`

所以只要 `./data` 目录在，重建容器时通常不会丢：

- 监控数据
- 状态页文案
- 自定义 CSS
- 自定义展示层配置
- 状态页快照

## 这个仓库和官方版的关系

这个仓库的目标从来不是“尽量少改”，而是“把 Uptime Kuma 改成更适合我自己长期使用的样子”。

所以你会在这里看到一些很明显偏主观的选择，比如：

- 更重的状态页展示层定制
- 更强调线路推荐而不是单纯罗列监控项
- 更偏运维友好的后台状态提示方式

如果你想要的是完全贴近官方默认体验，请直接使用官方仓库；如果你想要的是一套已经把这些方向做好、并且适合继续往下迭代的个人分支，那这个仓库就是为这个目的存在的。

## 仓库里哪些文件最值得先看

如果你准备继续维护这个分支，最值得先看的基本就是这些：

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

## 最后一句话

`Uptime Kuma Remastered` 不是“官方版加一点皮肤”，而是一套围绕消息箱、自定义状态页展示层、玻璃卡片主题、排序控制、快照持久化和 Cloudflared 延续这几个方向持续演化出来的个人化分支。

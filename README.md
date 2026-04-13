# Uptime Kuma Remastered

这是一个基于 `Uptime Kuma 2.2.1` 做出来的独立魔改分支。

它不是官方上游版本，也不是一套准备回提交给官方仓库的通用补丁，而是围绕个人使用习惯、线路展示需求和运维方式持续改出来的一套自用版本。可以把它理解成：在保留 Uptime Kuma 原本监控能力的前提下，把后台体验和状态页展示往“更适合当前这类线路场景”的方向推了一步。

官方仓库：

- https://github.com/louislam/uptime-kuma

## 先说最重要的一件事

`uptime-kuma-remastered:2.2.1` 不是一个已经发布到 Docker Hub、GHCR 或其它公共镜像仓库的镜像。

也就是说：

- 你不能直接执行 `docker pull uptime-kuma-remastered:2.2.1`
- README 里出现的这个名字，只是“你本地构建完成后得到的镜像标签”
- 想使用这个分支，必须先自己从源码把镜像构建出来，或者手动导入别人已经构建好的镜像包

如果你第一次接触这个仓库，正确顺序不是“先运行容器”，而是“先构建镜像，再运行容器”。

## 这个分支主要改了什么

如果只看核心变化，大概可以概括成下面这些：

- 把 Dashboard 右下角容易堆满屏幕的状态弹窗改成了消息箱，避免大量通知挡住后台操作。
- 重做了状态页默认排序逻辑，现在既支持默认按状态降序显示，也支持完全回到手动固定顺序。
- 做了一套可开关的自定义展示层，可以覆盖原版状态页渲染。
- 自定义展示层支持推荐卡片、分区卡片、主展示节点、节点标签、备注、列数这些配置。
- 给展示层卡片做了玻璃风格的主题系统，不再是单一颜色。
- 把状态页编辑侧栏加宽，并支持拖拽改宽度。
- 顶部整体状态提示改成更紧凑的标题旁状态胶囊。
- 保存状态页时会自动生成本地快照，避免展示层配置、说明区内容和自定义 CSS 被覆盖后无法恢复。
- 保留并延续了 Cloudflared Tunnel 的用法，不需要另起一套反代接入方案。

## 这个分支想解决的其实是什么问题

上游的 Uptime Kuma 已经很好用了，但对我自己的场景来说，有几个问题一直很明显：

- 监控项一多，后台状态提示会太吵，甚至影响点按钮。
- 原版状态页更像“监控列表”，但我需要它更像“给玩家看的线路入口页”。
- 一旦默认排序覆盖掉手动顺序，线路优先级和页面观感都会被打乱。
- 很多问题不在“能不能监控”，而在“这些节点该怎么更适合地展示给人看”。

所以这个分支的重点从来都不是改一两个样式，而是把 Uptime Kuma 从“纯监控工具”往“更适合当前线路展示场景的状态页工具”方向改。

## 从零开始构建可用镜像

如果你是在一台新机器上第一次部署，最稳妥的做法就是直接从这份源码完整构建镜像，而不是先拉官方容器再去覆盖文件。

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

第一次部署请优先使用仓库里的完整 Dockerfile：

```powershell
docker build -f docker/dockerfile -t uptime-kuma-remastered:2.2.1 .
```

这一步完成之后，你本地才会真正出现 `uptime-kuma-remastered:2.2.1` 这个镜像标签。

这条路径适合：

- 新机器第一次部署
- 你希望完全自己构建镜像
- 你不想依赖本地已有旧镜像缓存

### 4. 运行容器

前提是你已经完成了上面的本地构建。

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

## 用 Docker Compose 启动

如果你更习惯 Compose，建议第一次就直接把 `build` 写进去，这样不会让人误以为这个镜像可以直接从网上拉。

```yaml
services:
  uptime-kuma:
    image: uptime-kuma-remastered:2.2.1
    build:
      context: .
      dockerfile: docker/dockerfile
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
docker compose up -d --build
```

如果你已经在本地构建过镜像，也可以把 `build:` 这一段删掉，只保留 `image:` 来直接启动本地镜像。

## 已有本地镜像时的快速增量重建

仓库里还保留了一个 `docker/plana-runtime.dockerfile`。它不是给“新机器第一次部署”用的，而是给“你本地已经有可用镜像时的快速增量覆盖构建”用的。

更适合下面这种场景：

- 你本地已经有一个能跑的 `uptime-kuma-remastered:2.2.1`
- 这次只是改了 `dist/` 或少量后端文件
- 你想尽快完成重建

用法：

```powershell
npm run build
docker build -f docker/plana-runtime.dockerfile -t uptime-kuma-remastered:2.2.1 .
```

这里要特别说明一下：

- 这条路径依赖本地已经存在一个可用的 `uptime-kuma-remastered:2.2.1`
- 它本质上是“本地增量重建”
- 如果是第一次部署，还是推荐前面的完整构建方式

## 数据怎么持久化

和原版一样，最关键的仍然是把 `/app/data` 挂载出来。

通常这个目录里至少会包含：

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

所以只要 `./data` 目录保留，重建容器时通常不会丢：

- 监控数据
- 状态页文本
- 自定义 CSS
- 自定义展示层配置
- 状态页快照

## 这个仓库和官方版的关系

这个仓库的目标从来不是“尽量少改”，而是“把 Uptime Kuma 改成更适合我自己长期使用的样子”。

所以你会在这里看到一些很明显偏主观的取舍，比如：

- 更重的状态页展示层定制
- 更强调线路推荐，而不是单纯罗列监控项
- 更偏运维友好的后台状态提示方式

如果你想要的是完全贴近官方默认体验，请直接使用官方仓库；如果你想要的是一套已经把这些方向做出来、并且适合继续往下迭代的个人分支，这个仓库才是目标。

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

`Uptime Kuma Remastered` 不是“官方版加一点皮肤”，而是一套围绕消息箱、自定义状态页展示层、玻璃卡片主题、排序控制、快照持久化和 Cloudflared 延续这些方向慢慢长出来的个人化分支。

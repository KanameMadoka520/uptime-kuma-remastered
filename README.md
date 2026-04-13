# Uptime Kuma Remastered

更新时间：2026-04-13

## 1. 这是什么

`uptime-kuma-remastered` 是基于官方 `Uptime Kuma 2.2.1` 做的本地独立魔改分支。

这不是官方上游分支，也不是准备提交回官方仓库的通用方案，而是：

- 按照当前这套服务器、线路展示需求、运维习惯和个人审美偏好做的长期自用版本
- 以“方便自己维护”和“让玩家看起来更顺手”为第一目标
- 在保留 Uptime Kuma 原有监控能力的前提下，对 Dashboard、状态页、编辑体验、Cloudflared 使用方式做了定向增强

官方上游仓库地址：

- https://github.com/louislam/uptime-kuma

## 2. 目录与运行关系

当前正式环境约定如下：

- 正式运行目录：`D:\_Plana_Docker\UptimeKuma`
- 正式数据目录：`D:\_Plana_Docker\UptimeKuma\data`
- Remastered 源码目录：`D:\_Plana_Docker\uptime-kuma-remastered`
- 正式容器名：`uptime-kuma`
- 正式访问地址：`http://localhost:3001`

也就是说：

- 容器的数据始终放在 `D:\_Plana_Docker\UptimeKuma\data`
- 容器镜像由 `D:\_Plana_Docker\uptime-kuma-remastered` 构建
- 日后如果要继续改功能，原则上只改 `uptime-kuma-remastered`

## 3. 这个分支做了哪些魔改

### 3.1 Dashboard 状态弹窗改为消息箱

官方默认行为是在 Dashboard 右下角持续弹出监控状态变化提示。

这个分支改成了：

- 状态变化写入消息箱，而不是无限堆叠 toast
- 消息箱关闭时显示未读变化数量
- 可以手动全部设为已读
- 可以清空消息箱
- 避免大量上下线通知遮挡页面右上角按钮

这是偏运维体验的修改，目的是在大量节点波动时依然能正常操作后台。

### 3.2 状态页默认排序逻辑修正

官方新版本加入排序后，会默认改变状态页呈现顺序，影响手动固定排序。

这个分支补了两层逻辑：

- 默认支持“按状态降序”排序，让可用性更高的节点优先显示
- 同时提供关闭开关，关闭后回到手动固定排序为主

这样就不会再出现“明明自己排好了顺序，结果官方逻辑又偷偷改掉”的问题。

### 3.3 自定义展示层

这是本分支最核心的魔改之一。

状态页现在支持两种渲染方式：

- 使用原版 Uptime Kuma 的公开分组渲染
- 使用我们自己的展示层覆盖原版渲染

展示层可以做的事：

- 顶部推荐入口卡片
- 自定义分区卡片
- 每个分区单独设置列数
- 每个分区单独设置小标题、标题、说明
- 每个卡片/分区手动指定要展示哪些节点
- 推荐卡片可指定主展示节点
- 为节点补标签和备注

这些配置都不是写死在源码里，而是保存在状态页配置中。

### 3.4 玻璃卡片主题系统

展示层卡片支持多种玻璃风格配色，不再是单一颜色。

当前预设包括：

- 晶白
- 翡翠
- 绯红
- 琥珀
- 天青
- 石墨

这些颜色来自实际页面里已经认可的玻璃容器视觉风格，并且已经接入编辑侧栏，可直接切换。

### 3.5 编辑侧栏增强

为了让状态页配置真正可维护，编辑侧栏做了额外增强：

- 默认宽度加大
- 支持拖拽调节宽度
- 宽度持久化保存
- 新增展示层卡片配置区
- 新增分区配置区
- 新增节点标签与备注配置区

这样做的目的，是让之后的改动尽量由页面配置完成，而不是每次重新改源码。

### 3.6 顶部总体状态胶囊

状态页顶部原本会有一整条比较占地方的总体状态提示。

本分支把它压缩成标题旁边的小胶囊：

- 更紧凑
- 不抢布局空间
- 仍保留状态感知能力

### 3.7 说明区布局重排

状态页说明区目前采用已经确认过的方案：

- 顶部保留一张大的 `GameDig` 说明玻璃卡
- 大卡内部同一行并列两张子卡
- 左侧是“官网入口”
- 右侧是“物理机网络环境与应急预案说明”

这部分文案不是写死在前端组件里，而是保存在状态页的 `description` 中。

### 3.8 状态页配置快照持久化

为了避免“辛苦调好的状态页又被覆盖”，本分支新增了状态页快照导出机制。

每次通过页面保存状态页时，会自动把状态页配置导出到数据目录：

- `data/plana-status-page/default.live.json`
- `data/plana-status-page/default.description.html`
- `data/plana-status-page/default.custom.css`
- `data/plana-status-page/history/`

这意味着：

- 重建容器后，数据卷里的状态页配置仍然存在
- 日后需要人工恢复时，有明确的本地快照可用
- 不再只靠数据库一份内容硬扛

### 3.9 Cloudflared 继续保留并自动接续

本分支保留了当前 Uptime Kuma 的 Cloudflared Tunnel 支持。

正式环境中：

- `cloudflaredTunnelToken` 仍保存在正式数据库里
- 容器启动后会继续按原逻辑自动启动 cloudflared
- 更新镜像时不会主动清理该 token

也就是说，Cloudflared 不是另起炉灶，而是延续当前正式环境的既有行为。

## 4. 当前源码中与魔改直接相关的关键文件

### 前端

- `src/layouts/Layout.vue`
  - 后台布局中挂载消息箱
- `src/components/MonitorEventInbox.vue`
  - Dashboard 右下角消息箱组件
- `src/mixins/socket.js`
  - 状态变化不再直接弹 toast，而是写入消息箱
- `src/pages/StatusPage.vue`
  - 状态页编辑逻辑
  - 自定义展示层配置归一化
  - 侧栏宽度拖拽
  - 顶部总体状态胶囊
- `src/components/PlanaStatusShowcase.vue`
  - 自定义展示层渲染
- `src/components/PlanaShowcaseEditor.vue`
  - 自定义展示层编辑器
- `src/config/plana-status-showcase.js`
  - 展示层默认配置工厂
- `src/config/plana-showcase-themes.js`
  - 展示层玻璃卡片主题预设

### 后端

- `server/model/group.js`
  - 暴露公开状态页需要的排序信息
- `server/model/monitor.js`
  - 暴露手动顺序等监控元数据
- `server/model/status_page.js`
  - 暴露 `planaShowcaseConfig`
  - 暴露默认状态排序开关
- `server/socket-handlers/status-page-socket-handler.js`
  - 保存状态页时写入展示层配置
  - 保存时自动落盘快照
- `server/utils/plana-status-page-snapshot.js`
  - 状态页快照持久化

### 数据库迁移

- `db/knex_migrations/2026-04-13-0000-add-default-status-sort.js`
- `db/knex_migrations/2026-04-13-0001-add-plana-showcase-config.js`

## 5. 构建方式

### 5.1 前端构建

在源码目录执行：

```powershell
cd D:\_Plana_Docker\uptime-kuma-remastered
npm run build
```

### 5.2 构建正式镜像

```powershell
cd D:\_Plana_Docker\UptimeKuma
docker compose build uptime-kuma
```

说明：

- 当前 `docker/plana-runtime.dockerfile` 默认以上一次已经构建好的 `uptime-kuma-remastered:2.2.1` 作为本地增量构建基底
- 这样做的目的，是在 Docker Hub 不稳定时，仍然可以只依赖本地现有正式镜像继续重建
- 如果以后要在一台全新的机器上从零启动，需要先准备官方 `louislam/uptime-kuma:2.2.1` 基础镜像，或者先导入一份已经构建好的 `uptime-kuma-remastered:2.2.1`

### 5.3 启动正式容器

```powershell
cd D:\_Plana_Docker\UptimeKuma
docker compose up -d uptime-kuma
```

## 6. 数据持久化说明

正式数据全部在：

- `D:\_Plana_Docker\UptimeKuma\data`

其中最重要的是：

- `kuma.db`
- `upload/`
- `screenshots/`
- `docker-tls/`
- `plana-status-page/`

因此：

- 重建容器不会丢失监控数据
- 不会丢失状态页文本和自定义 CSS
- 不会丢失我们新增的展示层配置
- 不会丢失状态页快照文件

## 7. 关于独立分支定位

必须强调：

- 这个目录不是“官方标准版”
- 它是按个人需求做的独立魔改分支
- 未来继续改 UI/交互/展示逻辑时，不以和上游完全一致为目标
- 优先满足当前这套部署环境、节点体系和使用习惯

换句话说，这个分支的设计原则就是：

- 先让自己用着顺手
- 再考虑是否优雅
- 不强求上游通用性

## 8. 后续维护建议

日后继续开发时，建议遵守以下原则：

- 只在 `uptime-kuma-remastered` 里改源码
- 不要直接改容器内文件
- 状态页文案和展示层优先通过页面配置保存
- 重大修改前先备份 `UptimeKuma\data\kuma.db`
- 如果要调整说明区 HTML，优先同步更新 `data/plana-status-page/default.live.json`

## 9. 一句话总结

`uptime-kuma-remastered` 是一个围绕“消息箱、状态页展示层、可配置玻璃卡片、排序控制、快照持久化、Cloudflared 延续”构建的个人化 Uptime Kuma 独立分支。

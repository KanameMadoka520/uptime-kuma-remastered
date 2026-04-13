const fs = require("fs");
const path = require("path");
const sqlite3 = require("@louislam/sqlite3");

const dataDir = process.env.DATA_DIR || process.argv[3] || path.resolve(__dirname, "../../UptimeKuma/data");
const snapshotDir = path.join(dataDir, "plana-status-page");
const recoveredDir = path.join(snapshotDir, "recovered");
const slug = "default";
const applyCandidate = process.argv[2] || "";

const themeMap = {
    "domestic-primary": "amber",
    "hongkong-primary": "sky",
    "overseas-primary": "emerald",
    "recommended-routes": "emerald",
    "backup-routes": "amber",
    "web-services": "sky",
    "network-probes": "slate",
};

function normalizeConfig(config) {
    config.featuredRoutes = (config.featuredRoutes || []).map((route) => ({
        enabled: route.enabled !== false,
        theme: themeMap[route.id] || "neutral",
        ...route,
    }));

    config.sections = (config.sections || []).map((section) => ({
        enabled: section.enabled !== false,
        kicker: section.kicker || "状态分区",
        theme: themeMap[section.id] || "neutral",
        columns: section.columns || 3,
        ...section,
    }));

    return config;
}

const candidate1 = normalizeConfig({
    enabled: true,
    showSummaryCards: false,
    showUnassignedMonitors: false,
    featuredRoutes: [
        {
            id: "domestic-primary",
            kicker: "糖醋鱼自建线路",
            title: "国内首选线路",
            description: "适合大多数玩家直接连入。都是直连无压力的",
            monitorIds: [2, 1, 24, 3, 35, 4],
        },
        {
            id: "hongkong-primary",
            kicker: "糖醋鱼自建线路",
            title: "国外玩家推荐就近选择",
            description: "国外玩家推荐，选择就近的可以降低后半段延迟",
            monitorIds: [35, 25, 24, 3, 5, 26, 6],
        },
    ],
    sections: [
        {
            id: "recommended-routes",
            title: "推荐线路",
            description: "优先使用这些糖醋鱼自己的线路",
            monitorIds: [2, 1, 24, 35, 3],
        },
        {
            id: "backup-routes",
            title: "ChmlFRP穿透线路",
            description: "如果ChmlFRP寄了就不能用",
            monitorIds: [12, 19, 8, 17, 6, 14, 5, 15, 10, 18, 9, 16, 7, 11, 13],
        },
        {
            id: "web-services",
            title: "网站与服务",
            description: "官网、API、Wallos 与号池服务统一放在一起，方便快速判断外围服务是否正常。",
            monitorIds: [29, 30, 28, 27, 31, 32, 34, 33, 36, 37],
        },
        {
            id: "network-probes",
            title: "物理机外网探测",
            description: "用多目标探测来判断物理机当前对外连通性，方便区分线路问题和主机问题。",
            monitorIds: [21, 20, 22, 23],
            columns: 4,
        },
    ],
});

const candidate3 = normalizeConfig({
    enabled: true,
    showSummaryCards: false,
    showUnassignedMonitors: false,
    featuredRoutes: [
        {
            id: "domestic-primary",
            enabled: true,
            kicker: "国内优先",
            title: "国内首选线路",
            description: "优先选择阿里云 BGP 与香港高防这一组入口，适合大多数大陆玩家直接连入。",
            monitorIds: [2, 1, 24],
            highlightMonitorId: 2,
        },
        {
            id: "hongkong-primary",
            enabled: true,
            kicker: "跨境稳定",
            title: "香港推荐入口",
            description: "香港高防与香港直连更适合需要兼顾稳定性和跨境体验的场景。",
            monitorIds: [24, 3, 12],
            highlightMonitorId: 24,
        },
        {
            id: "overseas-primary",
            enabled: true,
            kicker: "海外优先",
            title: "海外玩家优先线路",
            description: "优先选择离自己近的减少后半段延迟；\n如果游玩实际堵塞则更换线路",
            monitorIds: [25, 35, 26, 5, 6, 14, 24, 3],
            highlightMonitorId: 24,
        },
    ],
    sections: [
        {
            id: "recommended-routes",
            enabled: true,
            kicker: "状态分区",
            title: "推荐线路",
            description: "这些节点更适合作为玩家优先尝试的入口。",
            monitorIds: [2, 1, 24, 25, 35, 26, 3, 4],
            columns: 3,
        },
        {
            id: "backup-routes",
            enabled: true,
            kicker: "状态分区",
            title: "穿透与备用线路",
            description: "当首选线路波动，或者你需要特定地区入口时，再看这一组备用与穿透节点。",
            monitorIds: [12, 19, 8, 17, 6, 14, 5, 15, 10, 18, 9, 16, 7, 11, 13],
            columns: 3,
        },
        {
            id: "web-services",
            enabled: true,
            kicker: "状态分区",
            title: "网站与服务",
            description: "官网、API、Wallos 与号池服务统一放在一起，方便快速判断外围服务是否正常。",
            monitorIds: [29, 30, 28, 27, 31, 32, 34, 33, 36, 37],
            columns: 3,
        },
        {
            id: "network-probes",
            enabled: true,
            kicker: "状态分区",
            title: "物理机外网探测",
            description: "用多目标探测来判断物理机当前对外连通性。",
            monitorIds: [21, 20, 22, 23],
            columns: 4,
        },
    ],
});

const liveSnapshotPath = path.join(snapshotDir, `${slug}.live.json`);
const liveSnapshot = JSON.parse(fs.readFileSync(liveSnapshotPath, "utf8"));

candidate1.monitorMetaEntries = liveSnapshot.config.planaShowcaseConfig.monitorMetaEntries || [];
candidate3.monitorMetaEntries = liveSnapshot.config.planaShowcaseConfig.monitorMetaEntries || [];

fs.mkdirSync(recoveredDir, { recursive: true });

function writeCandidate(name, config) {
    const payload = JSON.parse(JSON.stringify(liveSnapshot));
    payload.savedAt = new Date().toISOString();
    payload.note = `Recovered historical showcase configuration: ${name}`;
    payload.config.planaShowcaseConfig = config;
    fs.writeFileSync(path.join(recoveredDir, `${slug}.${name}.json`), JSON.stringify(payload, null, 2), "utf8");
}

writeCandidate("candidate1", candidate1);
writeCandidate("candidate3", candidate3);

if (!applyCandidate) {
    console.log(JSON.stringify({
        ok: true,
        rebuiltCandidates: ["candidate1", "candidate3"],
    }, null, 2));
    process.exit(0);
}

const selectedConfig = {
    candidate1,
    candidate3,
}[applyCandidate];

if (!selectedConfig) {
    throw new Error(`Unknown candidate '${applyCandidate}'`);
}

const db = new sqlite3.Database(path.join(dataDir, "kuma.db"));
db.run(
    "UPDATE status_page SET plana_showcase_config = ?, modified_date = datetime('now') WHERE slug = ?",
    [JSON.stringify(selectedConfig), slug],
    (error) => {
        if (error) {
            throw error;
        }

        console.log(JSON.stringify({
            ok: true,
            appliedCandidate: applyCandidate,
        }, null, 2));
        db.close();
    }
);

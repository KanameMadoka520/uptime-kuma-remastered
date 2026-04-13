const fs = require("fs");
const path = require("path");
const Database = require("../database");

function cloneJSON(value) {
    return JSON.parse(JSON.stringify(value));
}

function getSnapshotRootDir() {
    return path.resolve(Database.dataDir || "./data", "plana-status-page");
}

function ensureSnapshotDirs() {
    const rootDir = getSnapshotRootDir();
    const historyDir = path.join(rootDir, "history");

    fs.mkdirSync(rootDir, { recursive: true });
    fs.mkdirSync(historyDir, { recursive: true });

    return {
        rootDir,
        historyDir,
    };
}

function createTimestamp() {
    return new Date().toISOString().replace(/[:.]/g, "-");
}

function buildSnapshotPayload(slug, config, publicGroupList) {
    return {
        version: 1,
        slug,
        savedAt: new Date().toISOString(),
        config: cloneJSON(config || {}),
        publicGroupList: cloneJSON(publicGroupList || []),
    };
}

function writeStatusPageSnapshot(slug, config, publicGroupList) {
    const { rootDir, historyDir } = ensureSnapshotDirs();
    const payload = buildSnapshotPayload(slug, config, publicGroupList);
    const snapshotText = JSON.stringify(payload, null, 2);

    const liveJsonPath = path.join(rootDir, `${slug}.live.json`);
    const liveDescriptionPath = path.join(rootDir, `${slug}.description.html`);
    const liveCssPath = path.join(rootDir, `${slug}.custom.css`);

    const previousText = fs.existsSync(liveJsonPath) ? fs.readFileSync(liveJsonPath, "utf8") : null;

    fs.writeFileSync(liveJsonPath, snapshotText, "utf8");
    fs.writeFileSync(liveDescriptionPath, config?.description || "", "utf8");
    fs.writeFileSync(liveCssPath, config?.customCSS || "", "utf8");

    if (previousText !== snapshotText) {
        const historyPath = path.join(historyDir, `${slug}.${createTimestamp()}.json`);
        fs.writeFileSync(historyPath, snapshotText, "utf8");
    }

    return {
        rootDir,
        liveJsonPath,
    };
}

module.exports = {
    buildSnapshotPayload,
    getSnapshotRootDir,
    writeStatusPageSnapshot,
};

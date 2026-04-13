const fs = require("fs");
const path = require("path");
const sqlite3 = require("@louislam/sqlite3");

const slug = process.argv[2] || "default";
const dataDir = process.env.DATA_DIR || process.argv[4] || path.resolve(__dirname, "../../UptimeKuma/data");
const snapshotPath = process.argv[3]
    || path.resolve(dataDir, "plana-status-page", `${slug}.live.json`);

const snapshot = JSON.parse(fs.readFileSync(snapshotPath, "utf8"));
const config = snapshot.config || {};
const publicGroupList = Array.isArray(snapshot.publicGroupList) ? snapshot.publicGroupList : [];

const db = new sqlite3.Database(path.join(dataDir, "kuma.db"));

function run(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function (error) {
            if (error) {
                reject(error);
            } else {
                resolve(this);
            }
        });
    });
}

function get(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (error, row) => {
            if (error) {
                reject(error);
            } else {
                resolve(row);
            }
        });
    });
}

(async () => {
    const statusPage = await get("SELECT id, icon FROM status_page WHERE slug = ?", [slug]);

    if (!statusPage) {
        throw new Error(`Status page '${slug}' not found`);
    }

    await run("BEGIN TRANSACTION");

    try {
        await run(
            `UPDATE status_page SET
                title = ?,
                description = ?,
                icon = ?,
                auto_refresh_interval = ?,
                theme = ?,
                show_tags = ?,
                custom_css = ?,
                footer_text = ?,
                show_powered_by = ?,
                analytics_id = ?,
                analytics_script_url = ?,
                analytics_type = ?,
                show_certificate_expiry = ?,
                show_only_last_heartbeat = ?,
                rss_title = ?,
                default_status_sort_enabled = ?,
                plana_showcase_config = ?,
                modified_date = datetime('now')
            WHERE id = ?`,
            [
                config.title ?? "",
                config.description ?? "",
                config.logo ?? statusPage.icon ?? "",
                config.autoRefreshInterval ?? 300,
                config.theme ?? "auto",
                config.showTags ? 1 : 0,
                config.customCSS ?? "",
                config.footerText ?? "",
                config.showPoweredBy ? 1 : 0,
                config.analyticsId ?? null,
                config.analyticsScriptUrl ?? null,
                config.analyticsType ?? null,
                config.showCertificateExpiry ? 1 : 0,
                config.showOnlyLastHeartbeat ? 1 : 0,
                config.rssTitle ?? null,
                config.enableDefaultStatusSort === false ? 0 : 1,
                config.planaShowcaseConfig ? JSON.stringify(config.planaShowcaseConfig) : null,
                statusPage.id,
            ]
        );

        await run(
            "DELETE FROM monitor_group WHERE group_id IN (SELECT id FROM `group` WHERE status_page_id = ? AND public = 1)",
            [statusPage.id]
        );
        await run("DELETE FROM `group` WHERE status_page_id = ? AND public = 1", [statusPage.id]);

        for (let groupIndex = 0; groupIndex < publicGroupList.length; groupIndex += 1) {
            const group = publicGroupList[groupIndex];
            const groupInsert = await run(
                "INSERT INTO `group` (status_page_id, name, public, weight) VALUES (?, ?, 1, ?)",
                [statusPage.id, group.name ?? "", groupIndex + 1]
            );

            for (let monitorIndex = 0; monitorIndex < (group.monitorList || []).length; monitorIndex += 1) {
                const monitor = group.monitorList[monitorIndex];
                await run(
                    "INSERT INTO monitor_group (group_id, monitor_id, weight, send_url, custom_url) VALUES (?, ?, ?, ?, ?)",
                    [
                        groupInsert.lastID,
                        monitor.id,
                        monitorIndex + 1,
                        monitor.sendUrl ?? null,
                        monitor.url ?? null,
                    ]
                );
            }
        }

        await run("COMMIT");
        console.log(JSON.stringify({
            ok: true,
            slug,
            snapshotPath,
            restoredGroups: publicGroupList.length,
        }, null, 2));
    } catch (error) {
        await run("ROLLBACK");
        throw error;
    } finally {
        db.close();
    }
})().catch((error) => {
    console.error(error);
    process.exit(1);
});

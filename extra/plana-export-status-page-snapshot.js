const sqlite3 = require("@louislam/sqlite3");
const { writeStatusPageSnapshot } = require("../server/utils/plana-status-page-snapshot");
const Database = require("../server/database");
const path = require("path");

const slug = process.argv[2] || "default";
Database.dataDir = process.env.DATA_DIR || process.argv[3] || path.resolve(__dirname, "../../UptimeKuma/data");

const db = new sqlite3.Database(path.join(Database.dataDir, "kuma.db"));

function all(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (error, rows) => {
            if (error) {
                reject(error);
            } else {
                resolve(rows);
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
    const statusPage = await get("SELECT * FROM status_page WHERE slug = ?", [slug]);

    if (!statusPage) {
        throw new Error(`Status page '${slug}' not found`);
    }

    const groups = await all(
        "SELECT id, name, weight FROM `group` WHERE status_page_id = ? AND public = 1 ORDER BY weight ASC",
        [statusPage.id]
    );

    const publicGroupList = [];
    for (const group of groups) {
        const monitors = await all(
            `SELECT
                mg.weight,
                mg.monitor_id AS id,
                mg.send_url AS sendUrl,
                COALESCE(mg.custom_url, monitor.url, 'https://') AS url,
                monitor.name
            FROM monitor_group mg
            JOIN monitor ON monitor.id = mg.monitor_id
            WHERE mg.group_id = ?
            ORDER BY mg.weight ASC`,
            [group.id]
        );

        publicGroupList.push({
            id: group.id,
            name: group.name,
            monitorList: monitors,
        });
    }

    const config = {
        slug: statusPage.slug,
        title: statusPage.title,
        description: statusPage.description,
        logo: statusPage.icon,
        autoRefreshInterval: statusPage.autoRefreshInterval,
        theme: statusPage.theme,
        showTags: !!statusPage.show_tags,
        customCSS: statusPage.custom_css,
        footerText: statusPage.footer_text,
        showPoweredBy: !!statusPage.show_powered_by,
        analyticsId: statusPage.analytics_id,
        analyticsScriptUrl: statusPage.analytics_script_url,
        analyticsType: statusPage.analytics_type,
        showCertificateExpiry: !!statusPage.show_certificate_expiry,
        showOnlyLastHeartbeat: !!statusPage.show_only_last_heartbeat,
        rssTitle: statusPage.rss_title,
        enableDefaultStatusSort: !!statusPage.default_status_sort_enabled,
        planaShowcaseConfig: statusPage.plana_showcase_config ? JSON.parse(statusPage.plana_showcase_config) : null,
    };

    const result = writeStatusPageSnapshot(slug, config, publicGroupList);
    console.log(JSON.stringify(result, null, 2));
    db.close();
})().catch((error) => {
    console.error(error);
    db.close();
    process.exit(1);
});

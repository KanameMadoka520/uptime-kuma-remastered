const sqlite3 = require("@louislam/sqlite3");
const path = require("path");

const customArgs = process.argv.slice(2);
const force = customArgs.includes("--force");
const dataDirArg = customArgs.find((arg) => arg !== "--force");
const dataDir = process.env.DATA_DIR || dataDirArg || path.resolve(__dirname, "../../UptimeKuma/data");
const db = new sqlite3.Database(path.join(dataDir, "kuma.db"));

const showcaseConfig = {
    enabled: true,
    showSummaryCards: false,
    showUnassignedMonitors: false,
    featuredRoutes: [
        {
            id: "domestic-primary",
            enabled: true,
            kicker: "\u56fd\u5185\u4f18\u5148",
            title: "\u56fd\u5185\u9996\u9009\u7ebf\u8def",
            description: "\u4f18\u5148\u9009\u62e9\u963f\u91cc\u4e91 BGP \u4e0e\u9999\u6e2f\u9ad8\u9632\u8fd9\u4e00\u7ec4\u5165\u53e3\uff0c\u9002\u5408\u5927\u591a\u6570\u5927\u9646\u73a9\u5bb6\u76f4\u63a5\u8fde\u5165\u3002",
            theme: "amber",
            monitorIds: [2, 1, 24],
            highlightMonitorId: 2,
        },
        {
            id: "hongkong-primary",
            enabled: true,
            kicker: "\u8de8\u5883\u7a33\u5b9a",
            title: "\u9999\u6e2f\u63a8\u8350\u5165\u53e3",
            description: "\u9999\u6e2f\u9ad8\u9632\u4e0e\u9999\u6e2f\u76f4\u8fde\u66f4\u9002\u5408\u9700\u8981\u517c\u987e\u7a33\u5b9a\u6027\u548c\u8de8\u5883\u4f53\u9a8c\u7684\u573a\u666f\u3002",
            theme: "sky",
            monitorIds: [24, 3, 12],
            highlightMonitorId: 24,
        },
        {
            id: "overseas-primary",
            enabled: true,
            kicker: "\u6d77\u5916\u4f18\u5148",
            title: "\u6d77\u5916\u73a9\u5bb6\u4f18\u5148\u7ebf\u8def",
            description: "\u7f8e\u56fd\u3001\u65e5\u672c\u3001\u65b0\u52a0\u5761\u8282\u70b9\u653e\u5728\u4e00\u8d77\uff0c\u65b9\u4fbf\u5feb\u901f\u6311\u9009\u5f53\u524d\u66f4\u7a33\u7684\u6d77\u5916\u5165\u53e3\u3002",
            theme: "emerald",
            monitorIds: [25, 35, 26],
            highlightMonitorId: 25,
        },
    ],
    sections: [
        {
            id: "recommended-routes",
            enabled: true,
            kicker: "\u72b6\u6001\u5206\u533a",
            title: "\u63a8\u8350\u7ebf\u8def",
            description: "\u8fd9\u4e9b\u8282\u70b9\u66f4\u9002\u5408\u4f5c\u4e3a\u73a9\u5bb6\u4f18\u5148\u5c1d\u8bd5\u7684\u5165\u53e3\u3002",
            theme: "emerald",
            monitorIds: [2, 1, 24, 25, 35, 26, 3, 4],
            columns: 3,
        },
        {
            id: "backup-routes",
            enabled: true,
            kicker: "\u72b6\u6001\u5206\u533a",
            title: "\u7a7f\u900f\u4e0e\u5907\u7528\u7ebf\u8def",
            description: "\u5f53\u9996\u9009\u7ebf\u8def\u6ce2\u52a8\uff0c\u6216\u8005\u4f60\u9700\u8981\u7279\u5b9a\u5730\u533a\u5165\u53e3\u65f6\uff0c\u518d\u770b\u8fd9\u4e00\u7ec4\u5907\u7528\u4e0e\u7a7f\u900f\u8282\u70b9\u3002",
            theme: "amber",
            monitorIds: [12, 19, 8, 17, 6, 14, 5, 15, 10, 18, 9, 16, 7, 11, 13],
            columns: 3,
        },
        {
            id: "web-services",
            enabled: true,
            kicker: "\u72b6\u6001\u5206\u533a",
            title: "\u7f51\u7ad9\u4e0e\u670d\u52a1",
            description: "\u5b98\u7f51\u3001API\u3001Wallos \u4e0e\u53f7\u6c60\u670d\u52a1\u7edf\u4e00\u653e\u5728\u4e00\u8d77\uff0c\u65b9\u4fbf\u5feb\u901f\u5224\u65ad\u5916\u56f4\u670d\u52a1\u662f\u5426\u6b63\u5e38\u3002",
            theme: "sky",
            monitorIds: [29, 30, 28, 27, 31, 32, 34, 33, 36, 37],
            columns: 3,
        },
        {
            id: "network-probes",
            enabled: true,
            kicker: "\u72b6\u6001\u5206\u533a",
            title: "\u7269\u7406\u673a\u5916\u7f51\u63a2\u6d4b",
            description: "\u7528\u591a\u76ee\u6807\u63a2\u6d4b\u6765\u5224\u65ad\u7269\u7406\u673a\u5f53\u524d\u5bf9\u5916\u8fde\u901a\u6027\u3002",
            theme: "slate",
            monitorIds: [21, 20, 22, 23],
            columns: 4,
        },
    ],
    monitorMetaEntries: [
        { id: "meta-2", monitorId: 2, badge: "\u56fd\u5185\u9996\u9009", note: "\u963f\u91cc\u4e91\u5317\u4eac BGP\uff0c\u9002\u5408\u5927\u9646\u73a9\u5bb6\u4f18\u5148\u5c1d\u8bd5\u3002" },
        { id: "meta-1", monitorId: 1, badge: "\u56fd\u5185\u9996\u9009", note: "\u963f\u91cc\u4e91\u676d\u5dde BGP\uff0c\u53ef\u4e0e\u5317\u4eac\u7ebf\u8def\u5bf9\u6bd4\u9009\u62e9\u3002" },
        { id: "meta-24", monitorId: 24, badge: "\u9ad8\u9632\u63a8\u8350", note: "\u9999\u6e2f\u9ad8\u9632\u5165\u53e3\uff0c\u9002\u5408\u9700\u8981\u7a33\u5b9a\u8de8\u5883\u8bbf\u95ee\u65f6\u4f18\u5148\u4f7f\u7528\u3002" },
        { id: "meta-25", monitorId: 25, badge: "\u6d77\u5916\u63a8\u8350", note: "\u7f8e\u56fd\u8282\u70b9\uff0c\u9002\u5408\u6d77\u5916\u73a9\u5bb6\u6216\u56fd\u9645\u7ebf\u8def\u6d4b\u8bd5\u3002" },
        { id: "meta-35", monitorId: 35, badge: "\u6d77\u5916\u63a8\u8350", note: "\u65e5\u672c\u8282\u70b9\uff0c\u9002\u5408\u4e1c\u4e9a\u4e0e\u90e8\u5206\u6d77\u5916\u73a9\u5bb6\u3002" },
        { id: "meta-26", monitorId: 26, badge: "\u89c2\u5bdf\u4e2d", note: "\u65b0\u52a0\u5761\u8282\u70b9\uff0c\u5efa\u8bae\u5728\u63a8\u8350\u6d77\u5916\u8282\u70b9\u6ce2\u52a8\u65f6\u4f5c\u4e3a\u8865\u5145\u3002" },
        { id: "meta-3", monitorId: 3, badge: "\u9999\u6e2f\u76f4\u8fde", note: "\u9999\u6e2f\u76f4\u8fde\u5165\u53e3\uff0c\u53ef\u4f5c\u4e3a\u9ad8\u9632\u7ebf\u8def\u7684\u66ff\u4ee3\u3002" },
        { id: "meta-4", monitorId: 4, badge: "BGP\u5907\u7528", note: "\u5bbf\u8fc1 BGP \u4e09\u7ebf\uff0c\u53ef\u4f5c\u4e3a\u56fd\u5185\u8865\u5145\u5165\u53e3\u3002" },
        { id: "meta-29", monitorId: 29, badge: "\u5b98\u7f51", note: "\u56fd\u9645\u4e3b\u7ad9\u3002" },
        { id: "meta-28", monitorId: 28, badge: "\u76f4\u8fde\u5b98\u7f51", note: "\u9999\u6e2f\u76f4\u8fde\u5b98\u7f51\u5165\u53e3\u3002" },
        { id: "meta-30", monitorId: 30, badge: "CDN", note: "\u5b98\u7f51 CDN \u5907\u7528\u5165\u53e3\u3002" },
        { id: "meta-36", monitorId: 36, badge: "\u5185\u90e8\u670d\u52a1", note: "Wallos \u6210\u672c\u7ba1\u7406\u670d\u52a1\u3002" },
        { id: "meta-37", monitorId: 37, badge: "\u5185\u90e8\u670d\u52a1", note: "\u79c1\u4eba\u53f7\u6c60\u670d\u52a1\u3002" },
        { id: "meta-21", monitorId: 21, badge: "\u5916\u7f51\u63a2\u6d4b", note: "\u817e\u8baf DNS \u8fde\u901a\u6027\u3002" },
        { id: "meta-20", monitorId: 20, badge: "\u5916\u7f51\u63a2\u6d4b", note: "\u963f\u91cc DNS \u8fde\u901a\u6027\u3002" },
        { id: "meta-22", monitorId: 22, badge: "\u5916\u7f51\u63a2\u6d4b", note: "Cloudflare DNS \u8fde\u901a\u6027\u3002" },
        { id: "meta-23", monitorId: 23, badge: "\u5916\u7f51\u63a2\u6d4b", note: "Google DNS \u8fde\u901a\u6027\u3002" },
    ],
};

const description = `<div style="display:flex;flex-wrap:wrap;gap:20px;align-items:stretch;">
<div style="flex:1 1 420px;background:rgba(255,255,255,0.75);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);padding:20px;border-radius:16px;border:1px solid rgba(255,255,255,0.6);box-shadow:0 8px 24px rgba(0,0,0,0.05);box-sizing:border-box;">
<h3 style="display:flex;align-items:center;color:#15803d;margin-top:0;margin-bottom:10px;">
<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:8px;"><path d="M12 7.5a4.5 4.5 0 1 1 4.5 4.5M12 7.5A4.5 4.5 0 1 0 7.5 12M12 7.5V9m-4.5 3a4.5 4.5 0 1 1 4.5 4.5M7.5 12H9m3 4.5a4.5 4.5 0 1 1 4.5-4.5M12 16.5V15m4.5-3h-1.5"/></svg>
\u7cd6\u918b\u9c7c\u795e\u4eba\u670d\u52a1\u5668\u76d1\u63a7\u9875-\u76ee\u524d\u5df2\u6539\u4e3aGameDig\u68c0\u6d4b\u65b9\u5f0f\uff0c\u66f4\u51c6\u786e
</h3>
<p style="margin-bottom:15px;color:#334155;">\u8fd9\u91cc\u662f\u670d\u52a1\u5668\u7269\u7406\u673a\u6240\u5728\u7f51\u7edc\u7684<strong>\u771f\u5b9e\u8fde\u63a5\u60c5\u51b5</strong> <span style="color:#ef4444;">&hearts;</span></p>
<div style="background:rgba(255,255,255,0.6);padding:12px 15px;border-radius:12px;border:1px solid rgba(255,255,255,0.8);box-shadow:0 2px 4px rgba(0,0,0,0.02);margin-bottom:0;">
<strong style="display:flex;align-items:center;color:#15803d;margin-bottom:8px;">
<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:6px;"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg>
\u5b98\u7f51\u5165\u53e3
</strong>
<ul style="margin-bottom:0;padding-left:20px;line-height:1.6;font-size:0.95em;color:#334155;">
<li>\u56fd\u9645\u4e3b\u7ad9\uff1a<a href="https://tcymc.space" style="font-weight:600;">tcymc.space</a></li>
<li>\u9999\u6e2f\u76f4\u8fde\uff1a<a href="https://hkw.tcymc.space" style="font-weight:600;color:#ea580c;">hkw.tcymc.space</a> <strong style="color:#ea580c;font-size:0.85em;">(\u56fd\u5185\u6781\u901f\u9996\u9009)</strong></li>
<li>CDN \u5907\u7528\uff1a<a href="https://cn.tcymc.space" style="font-weight:600;">cn.tcymc.space</a> <small style="opacity:0.8;">(\u5efa\u8bae IPv6)</small></li>
</ul>
</div>
</div>
<div style="flex:1 1 420px;background:rgba(239,246,255,0.75);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);padding:18px;border-radius:12px;border:1px solid rgba(147,197,253,0.8);box-shadow:0 4px 12px rgba(0,0,0,0.03);color:#1e3a8a;font-size:0.95em;line-height:1.6;box-sizing:border-box;">
<strong style="display:flex;align-items:center;margin-bottom:10px;color:#1d4ed8;font-size:1.05em;">
<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:6px;"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
\u7269\u7406\u673a\u7f51\u7edc\u73af\u5883\u4e0e\u5e94\u6025\u9884\u6848\u8bf4\u660e
</strong>
<p style="margin:0 0 10px 0;">
\u7531\u4e8e\u6761\u4ef6\u9650\u5236\uff0c\u670d\u52a1\u5668\u65e5\u5e38\u4ecd\u4f18\u5148\u6302\u5728<strong>\u6821\u56ed\u7f51\u56fa\u5b9a\u5bbd\u5e26</strong>\u4e0a\u8fd0\u884c\uff0c\u4ee5\u786e\u4fdd<strong>\u56fd\u5916\u73a9\u5bb6</strong>\u7684\u5165\u5883\u6d41\u91cf\u4e0d\u62e5\u5835\u3002\u5982\u679c\u6821\u56ed\u7f51\u7a81\u53d1\u5f02\u5e38\uff0c\u7f51\u7edc\u4f1a\u4e34\u65f6\u5207\u56de <strong>5G CPE \u65b9\u6848</strong>\u4fdd\u5e95\u8fd0\u884c\u3002
</p>
<p style="margin:0;">
\u5728\u5e94\u6025\u5207\u6362\u671f\u95f4\uff0c\u56fd\u5916\u73a9\u5bb6\u53ef\u80fd\u4f1a\u611f\u5230\u660e\u663e\u5ef6\u8fdf\u6216\u5361\u987f\uff0c\u8fd9\u5c5e\u4e8e\u5f53\u524d\u786c\u4ef6\u4e0e\u7f51\u7edc\u6761\u4ef6\u4e0b\u7684\u4e34\u65f6\u5bb9\u707e\u7b56\u7565\u3002
</p>
</div>
</div>`;

db.serialize(() => {
    db.get(
        "SELECT plana_showcase_config, description FROM status_page WHERE slug = 'default'",
        (error, row) => {
            if (error) {
                throw error;
            }

            if (!force && row && (row.plana_showcase_config || row.description)) {
                console.error("Refusing to overwrite existing status-page customization. Re-run with --force if you really want to reseed.");
                db.close();
                return;
            }

            db.run(
                "UPDATE status_page SET plana_showcase_config = ?, description = ? WHERE slug = 'default'",
                [JSON.stringify(showcaseConfig), description]
            );

            db.get(
                "SELECT LENGTH(plana_showcase_config) AS showcaseLength, LENGTH(description) AS descriptionLength FROM status_page WHERE slug = 'default'",
                (innerError, innerRow) => {
                    if (innerError) {
                        throw innerError;
                    }

                    console.log(JSON.stringify(innerRow, null, 2));
                    db.close();
                }
            );
        }
    );
});

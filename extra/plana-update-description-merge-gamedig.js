const sqlite3 = require("@louislam/sqlite3");
const path = require("path");

const slug = process.argv[2] || "default";
const dataDir = process.env.DATA_DIR || process.argv[3] || path.resolve(__dirname, "../../UptimeKuma/data");
const db = new sqlite3.Database(path.join(dataDir, "kuma.db"));

const description = `<div style="display:grid;gap:20px;">
<div style="background:rgba(255,255,255,0.75);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);padding:20px;border-radius:16px;border:1px solid rgba(255,255,255,0.6);box-shadow:0 8px 24px rgba(0,0,0,0.05);box-sizing:border-box;">
<h3 style="display:flex;align-items:center;color:#15803d;margin-top:0;margin-bottom:10px;">
<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:8px;"><path d="M12 7.5a4.5 4.5 0 1 1 4.5 4.5M12 7.5A4.5 4.5 0 1 0 7.5 12M12 7.5V9m-4.5 3a4.5 4.5 0 1 1 4.5 4.5M7.5 12H9m3 4.5a4.5 4.5 0 1 1 4.5-4.5M12 16.5V15m4.5-3h-1.5"/></svg>
\u7cd6\u918b\u9c7c\u795e\u4eba\u670d\u52a1\u5668\u76d1\u63a7\u9875-\u76ee\u524d\u5df2\u6539\u4e3aGameDig\u68c0\u6d4b\u65b9\u5f0f\uff0c\u66f4\u51c6\u786e
</h3>
<p style="margin-bottom:15px;color:#334155;">\u8fd9\u91cc\u662f\u670d\u52a1\u5668\u7269\u7406\u673a\u6240\u5728\u7f51\u7edc\u7684<strong>\u771f\u5b9e\u8fde\u63a5\u60c5\u51b5</strong> <span style="color:#ef4444;">&hearts;</span></p>
<div style="display:flex;flex-wrap:wrap;gap:20px;align-items:stretch;">
<div style="flex:1 1 320px;background:rgba(255,255,255,0.6);padding:12px 15px;border-radius:12px;border:1px solid rgba(255,255,255,0.8);box-shadow:0 2px 4px rgba(0,0,0,0.02);box-sizing:border-box;">
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
<div style="flex:1 1 320px;background:rgba(239,246,255,0.75);padding:18px;border-radius:12px;border:1px solid rgba(147,197,253,0.8);box-shadow:0 4px 12px rgba(0,0,0,0.03);color:#1e3a8a;font-size:0.95em;line-height:1.6;box-sizing:border-box;">
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
</div>
</div>
</div>`;

db.serialize(() => {
    db.run(
        "UPDATE status_page SET description = ?, modified_date = datetime('now') WHERE slug = ?",
        [description, slug]
    );

    db.get(
        "SELECT LENGTH(description) AS descriptionLength FROM status_page WHERE slug = ?",
        [slug],
        (error, row) => {
            if (error) {
                throw error;
            }

            console.log(JSON.stringify(row, null, 2));
            db.close();
        }
    );
});

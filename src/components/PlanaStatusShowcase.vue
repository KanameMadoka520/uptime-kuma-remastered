<template>
    <div class="plana-showcase">
        <section v-if="showcaseConfig.showSummaryCards" class="showcase-summary">
            <div class="hero-metrics">
                <div class="metric-card">
                    <span class="metric-label">推荐线路可用</span>
                    <strong class="metric-value">{{ recommendedUpCount }}/{{ recommendedTotal }}</strong>
                </div>
                <div class="metric-card">
                    <span class="metric-label">网站服务正常</span>
                    <strong class="metric-value">{{ sectionUpCount("web-services") }}/{{ sectionTotal("web-services") }}</strong>
                </div>
                <div class="metric-card">
                    <span class="metric-label">外网探测正常</span>
                    <strong class="metric-value">{{ sectionUpCount("network-probes") }}/{{ sectionTotal("network-probes") }}</strong>
                </div>
            </div>
        </section>

        <section class="featured-grid">
            <article
                v-for="route in featuredRoutes"
                :key="route.id"
                class="featured-card"
                :style="themeStyle(route.theme)"
            >
                <div class="route-kicker">{{ route.kicker }}</div>
                <h3>{{ route.title }}</h3>
                <p class="route-description">{{ route.description }}</p>

                <template v-if="route.primaryMonitor">
                    <div class="route-primary">
                        <div>
                            <div class="route-primary-title">
                                <span class="status-pill" :class="statusClass(route.primaryStatus)">
                                    {{ statusLabel(route.primaryStatus) }}
                                </span>
                                <strong>{{ route.primaryMonitor.name }}</strong>
                            </div>
                            <p class="route-note">{{ monitorMeta(route.primaryMonitor).note || "当前建议优先查看此入口。" }}</p>
                        </div>
                        <div class="route-uptime">{{ formatUptime(route.primaryMonitor.id) }}</div>
                    </div>

                    <HeartbeatBar size="small" :monitor-id="route.primaryMonitor.id" />

                    <div class="route-candidates">
                        <span v-for="candidate in route.candidates" :key="candidate.id" class="candidate-chip">
                            {{ candidate.name }}
                        </span>
                    </div>
                </template>

                <div v-else class="route-empty">当前没有可展示的节点。</div>
            </article>
        </section>

        <section
            v-for="section in visibleSections"
            :key="section.id"
            class="monitor-section"
            :style="themeStyle(section.theme)"
        >
            <header class="section-header">
                <div>
                    <p class="section-kicker">{{ section.kicker || "状态分区" }}</p>
                    <h3>{{ section.title }}</h3>
                    <p class="section-description">{{ section.description }}</p>
                </div>
                <div class="section-metric">
                    <span>在线</span>
                    <strong>{{ section.upCount }}/{{ section.monitors.length }}</strong>
                </div>
            </header>

            <div class="monitor-grid" :class="sectionColumnsClass(section)">
                <article
                    v-for="monitor in section.monitors"
                    :key="monitor.id"
                    class="monitor-card"
                    :class="statusClass(statusForMonitor(monitor.id))"
                >
                    <div class="monitor-top">
                        <div class="monitor-title">
                            <div class="title-row">
                                <a
                                    v-if="monitorLink(monitor)"
                                    :href="monitor.url"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    class="monitor-link"
                                >
                                    {{ monitor.name }}
                                </a>
                                <span v-else>{{ monitor.name }}</span>
                                <span v-if="monitorMeta(monitor).badge" class="meta-badge">
                                    {{ monitorMeta(monitor).badge }}
                                </span>
                            </div>
                            <p v-if="monitorMeta(monitor).note" class="monitor-note">
                                {{ monitorMeta(monitor).note }}
                            </p>
                        </div>

                        <div class="monitor-side">
                            <span class="status-pill" :class="statusClass(statusForMonitor(monitor.id))">
                                {{ statusLabel(statusForMonitor(monitor.id)) }}
                            </span>
                            <div class="uptime-label">{{ formatUptime(monitor.id) }}</div>
                        </div>
                    </div>

                    <div class="monitor-bottom">
                        <HeartbeatBar size="small" :monitor-id="monitor.id" />
                    </div>
                </article>
            </div>
        </section>

        <details v-if="showcaseConfig.showUnassignedMonitors && leftoverMonitors.length > 0" class="fallback-section">
            <summary>未归类节点（保留原始透明度）</summary>
            <div class="monitor-grid fallback-grid">
                <article
                    v-for="monitor in leftoverMonitors"
                    :key="monitor.id"
                    class="monitor-card"
                    :class="statusClass(statusForMonitor(monitor.id))"
                >
                    <div class="monitor-top">
                        <div class="monitor-title">
                            <div class="title-row">
                                <span>{{ monitor.name }}</span>
                            </div>
                        </div>
                        <div class="monitor-side">
                            <span class="status-pill" :class="statusClass(statusForMonitor(monitor.id))">
                                {{ statusLabel(statusForMonitor(monitor.id)) }}
                            </span>
                            <div class="uptime-label">{{ formatUptime(monitor.id) }}</div>
                        </div>
                    </div>
                    <div class="monitor-bottom">
                        <HeartbeatBar size="small" :monitor-id="monitor.id" />
                    </div>
                </article>
            </div>
        </details>
    </div>
</template>

<script>
import HeartbeatBar from "./HeartbeatBar.vue";
import { getPlanaShowcaseThemeStyle } from "../config/plana-showcase-themes";
import { DOWN, MAINTENANCE, PENDING, UP } from "../util.ts";
export default {
    components: {
        HeartbeatBar,
    },
    props: {
        slug: {
            type: String,
            required: true,
        },
        publicGroupList: {
            type: Array,
            required: true,
        },
        showcaseConfig: {
            type: Object,
            required: true,
        },
    },
    computed: {
        flatMonitors() {
            return this.publicGroupList.flatMap((group) => group.monitorList || []);
        },

        monitorMap() {
            return new Map(this.flatMonitors.map((monitor) => [monitor.id, monitor]));
        },

        monitorMetaMap() {
            return new Map(
                (this.showcaseConfig.monitorMetaEntries || [])
                    .filter((entry) => entry.monitorId != null)
                    .map((entry) => [entry.monitorId, entry])
            );
        },

        assignedMonitorIds() {
            return new Set((this.showcaseConfig.sections || []).flatMap((section) => section.monitorIds || []));
        },

        featuredRoutes() {
            return (this.showcaseConfig.featuredRoutes || []).map((route) => {
                const candidates = route.monitorIds
                    .map((id) => this.monitorMap.get(id))
                    .filter(Boolean);

                const primaryMonitor = route.highlightMonitorId
                    ? this.monitorMap.get(route.highlightMonitorId) || this.pickPreferredMonitor(candidates)
                    : this.pickPreferredMonitor(candidates);

                return {
                    ...route,
                    candidates,
                    primaryMonitor,
                    primaryStatus: primaryMonitor ? this.statusForMonitor(primaryMonitor.id) : -1,
                };
            }).filter((route) => route.enabled !== false);
        },

        visibleSections() {
            return (this.showcaseConfig.sections || [])
                .map((section) => {
                    const monitors = section.monitorIds
                        .map((id) => this.monitorMap.get(id))
                        .filter(Boolean)
                        .sort((a, b) => this.sortByStatusThenManual(a, b));

                    return {
                        ...section,
                        monitors,
                        upCount: monitors.filter((monitor) => this.statusForMonitor(monitor.id) === UP).length,
                    };
                })
                .filter((section) => section.enabled !== false && section.monitors.length > 0);
        },

        leftoverMonitors() {
            return this.flatMonitors
                .filter((monitor) => !this.assignedMonitorIds.has(monitor.id))
                .sort((a, b) => this.sortByStatusThenManual(a, b));
        },

        recommendedMonitorIds() {
            return [...new Set((this.showcaseConfig.featuredRoutes || []).flatMap((route) => route.monitorIds || []))];
        },

        recommendedUpCount() {
            return this.recommendedMonitorIds.filter((id) => this.statusForMonitor(id) === UP).length;
        },

        recommendedTotal() {
            return this.recommendedMonitorIds.filter((id) => this.monitorMap.has(id)).length;
        },
    },
    methods: {
        monitorMeta(monitor) {
            return this.monitorMetaMap.get(monitor.id) || {};
        },

        statusForMonitor(monitorId) {
            const beats = this.$root.heartbeatList[monitorId] || [];
            return beats.length > 0 ? beats[beats.length - 1].status : -1;
        },

        statusPriority(status) {
            if (status === UP) {
                return 4;
            }
            if (status === PENDING) {
                return 3;
            }
            if (status === MAINTENANCE) {
                return 2;
            }
            if (status === DOWN) {
                return 1;
            }
            return 0;
        },

        pickPreferredMonitor(monitors) {
            return [...monitors].sort((a, b) => this.sortByStatusThenManual(a, b))[0] || null;
        },

        sortByStatusThenManual(a, b) {
            const statusDiff = this.statusPriority(this.statusForMonitor(b.id)) - this.statusPriority(this.statusForMonitor(a.id));

            if (statusDiff !== 0) {
                return statusDiff;
            }

            const aOrder = typeof a.manualOrder === "number" ? a.manualOrder : Number.MAX_SAFE_INTEGER;
            const bOrder = typeof b.manualOrder === "number" ? b.manualOrder : Number.MAX_SAFE_INTEGER;
            return aOrder - bOrder;
        },

        statusLabel(status) {
            if (status === UP) {
                return "在线";
            }
            if (status === DOWN) {
                return "故障";
            }
            if (status === PENDING) {
                return "检测中";
            }
            if (status === MAINTENANCE) {
                return "维护中";
            }
            return "未知";
        },

        statusClass(status) {
            if (status === UP) {
                return "status-up";
            }
            if (status === DOWN) {
                return "status-down";
            }
            if (status === PENDING) {
                return "status-pending";
            }
            if (status === MAINTENANCE) {
                return "status-maintenance";
            }
            return "status-unknown";
        },

        formatUptime(monitorId) {
            const value = this.$root.uptimeList[`${monitorId}_24`];
            if (value == null || value === "") {
                return "24h 未知";
            }

            const uptime = Number.parseFloat(value);
            if (Number.isNaN(uptime)) {
                return "24h 未知";
            }

            const percentValue = uptime <= 1.0001 ? uptime * 100 : uptime;
            return `24h ${percentValue.toFixed(percentValue >= 99.995 ? 0 : 2)}%`;
        },

        sectionUpCount(sectionId) {
            const section = this.visibleSections.find((item) => item.id === sectionId);
            return section ? section.upCount : 0;
        },

        sectionTotal(sectionId) {
            const section = this.visibleSections.find((item) => item.id === sectionId);
            return section ? section.monitors.length : 0;
        },

        monitorLink(monitor) {
            return monitor.sendUrl && monitor.url && monitor.url !== "https://";
        },

        themeStyle(theme) {
            return getPlanaShowcaseThemeStyle(theme);
        },

        sectionColumnsClass(section) {
            return `cols-${section.columns || 3}`;
        },
    },
};
</script>

<style lang="scss" scoped>
.plana-showcase {
    display: grid;
    gap: 24px;
    --plana-card-bg: rgba(255, 255, 255, 0.78);
    --plana-card-border: rgba(255, 255, 255, 0.72);
    --plana-card-shadow: 0 8px 24px rgba(15, 23, 42, 0.06);
    --plana-card-text: #0f172a;
    --plana-muted-text: #475569;
    --plana-muted-strong: #64748b;
    --plana-accent-strong: #2563eb;
    --plana-chip-bg: rgba(37, 99, 235, 0.1);
    --plana-chip-border: rgba(37, 99, 235, 0.18);
    --plana-chip-text: #1d4ed8;
    --plana-surface-bg: rgba(248, 250, 252, 0.86);
    --plana-surface-border: rgba(148, 163, 184, 0.16);
}

.section-kicker,
.route-kicker {
    margin: 0 0 8px;
    font-size: 0.78rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--plana-accent-strong);
    font-weight: 700;
}

.section-header h3,
.featured-card h3 {
    margin: 0;
}

.section-description,
.route-description,
.route-note,
.monitor-note {
    margin: 8px 0 0;
    color: var(--plana-muted-text);
    line-height: 1.55;
}

.hero-metrics {
    display: grid;
    gap: 12px;
    grid-template-columns: repeat(3, minmax(0, 1fr));
}

.metric-card {
    padding: 16px 18px;
    border-radius: 18px;
    background: rgba(255, 255, 255, 0.72);
    border: 1px solid rgba(148, 163, 184, 0.16);
}

.metric-label {
    display: block;
    font-size: 0.88rem;
    color: #64748b;
}

.metric-value {
    display: block;
    margin-top: 6px;
    font-size: 1.7rem;
}

.featured-grid,
.monitor-grid {
    display: grid;
    gap: 16px;
}

.featured-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
}

.featured-card,
.monitor-section,
.fallback-section {
    padding: 20px;
    border-radius: 22px;
    background: var(--plana-card-bg);
    border: 1px solid var(--plana-card-border);
    box-shadow: var(--plana-card-shadow);
    backdrop-filter: blur(16px);
    color: var(--plana-card-text);
}

.route-primary,
.section-header,
.monitor-top,
.title-row {
    display: flex;
    justify-content: space-between;
    gap: 12px;
}

.route-primary-title {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
}

.route-uptime,
.uptime-label {
    font-weight: 700;
    white-space: nowrap;
    color: var(--plana-card-text);
}

.route-candidates {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 12px;
}

.candidate-chip,
.meta-badge {
    display: inline-flex;
    align-items: center;
    padding: 4px 10px;
    border-radius: 999px;
    background: var(--plana-chip-bg);
    border: 1px solid var(--plana-chip-border);
    color: var(--plana-chip-text);
    font-size: 0.78rem;
    font-weight: 700;
}

.monitor-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    margin-top: 16px;
}

.monitor-grid.cols-1 {
    grid-template-columns: repeat(1, minmax(0, 1fr));
}

.monitor-grid.cols-2 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
}

.monitor-grid.cols-3 {
    grid-template-columns: repeat(3, minmax(0, 1fr));
}

.monitor-grid.cols-4 {
    grid-template-columns: repeat(4, minmax(0, 1fr));
}

.monitor-card {
    padding: 16px;
    border-radius: 18px;
    background: var(--plana-surface-bg);
    border: 1px solid var(--plana-surface-border);
}

.monitor-title {
    min-width: 0;
}

.monitor-link {
    color: inherit;
    text-decoration: none;
}

.monitor-link:hover {
    text-decoration: underline;
}

.monitor-side {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 8px;
}

.monitor-bottom {
    margin-top: 12px;
}

.section-metric {
    text-align: right;
    min-width: 84px;
}

.section-metric span {
    display: block;
    color: var(--plana-muted-strong);
    font-size: 0.85rem;
}

.section-metric strong {
    font-size: 1.4rem;
}

.status-pill {
    display: inline-flex;
    align-items: center;
    padding: 4px 10px;
    border-radius: 999px;
    font-size: 0.78rem;
    font-weight: 700;
}

.status-up {
    border-color: rgba(34, 197, 94, 0.24);
}

.status-pill.status-up {
    background: rgba(34, 197, 94, 0.12);
    color: #15803d;
}

.status-down {
    border-color: rgba(239, 68, 68, 0.22);
}

.status-pill.status-down {
    background: rgba(239, 68, 68, 0.12);
    color: #b91c1c;
}

.status-pending {
    border-color: rgba(245, 158, 11, 0.22);
}

.status-pill.status-pending {
    background: rgba(245, 158, 11, 0.14);
    color: #b45309;
}

.status-maintenance {
    border-color: rgba(168, 85, 247, 0.22);
}

.status-pill.status-maintenance {
    background: rgba(168, 85, 247, 0.12);
    color: #7e22ce;
}

.status-unknown {
    border-color: rgba(100, 116, 139, 0.18);
}

.status-pill.status-unknown {
    background: rgba(100, 116, 139, 0.12);
    color: #475569;
}

.fallback-section summary {
    cursor: pointer;
    font-weight: 700;
}

.fallback-grid {
    margin-top: 16px;
}

@media (max-width: 1400px) {
    .monitor-grid.cols-3,
    .monitor-grid.cols-4 {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }
}

@media (max-width: 1100px) {
    .featured-grid,
    .hero-metrics,
    .monitor-grid {
        grid-template-columns: 1fr;
    }
}
</style>

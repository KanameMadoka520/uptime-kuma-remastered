<template>
    <div class="showcase-editor">
        <div class="my-3 form-check form-switch">
            <input
                id="plana-showcase-enabled"
                v-model="config.enabled"
                class="form-check-input"
                type="checkbox"
            />
            <label class="form-check-label" for="plana-showcase-enabled">
                使用自定义展示层覆盖原版监控列表
            </label>
            <div class="form-text">
                关闭后，公开状态页会恢复成原版 Uptime Kuma 的分组列表显示方式。
            </div>
        </div>

        <div class="my-3 form-check form-switch">
            <input
                id="plana-showcase-summary"
                v-model="config.showSummaryCards"
                class="form-check-input"
                type="checkbox"
            />
            <label class="form-check-label" for="plana-showcase-summary">
                显示顶部汇总卡片
            </label>
        </div>

        <div class="my-3 form-check form-switch">
            <input
                id="plana-showcase-unassigned"
                v-model="config.showUnassignedMonitors"
                class="form-check-input"
                type="checkbox"
            />
            <label class="form-check-label" for="plana-showcase-unassigned">
                显示未归类节点
            </label>
        </div>

        <div class="editor-actions">
            <button type="button" class="btn btn-sm btn-outline-secondary me-2" @click="resetToDefaultTemplate">
                重置为当前测试模板
            </button>
        </div>

        <div class="editor-block">
            <div class="block-header">
                <div>
                    <div class="block-title">推荐入口卡片</div>
                    <div class="block-desc">这些卡片会显示在状态页顶部，用来给玩家推荐当前更适合的线路。</div>
                </div>
                <button type="button" class="btn btn-sm btn-outline-primary" @click="addFeaturedRoute">
                    新增卡片
                </button>
            </div>

            <div v-for="(card, index) in config.featuredRoutes" :key="card.id" class="editor-card">
                <div class="row g-2">
                    <div class="col-12">
                        <div class="form-check form-switch">
                            <input
                                :id="`featured-enabled-${index}`"
                                v-model="card.enabled"
                                class="form-check-input"
                                type="checkbox"
                            />
                            <label class="form-check-label" :for="`featured-enabled-${index}`">
                                此卡片展示在公开页面
                            </label>
                        </div>
                    </div>
                    <div class="col-12 col-xl-4">
                        <label class="form-label">小标题</label>
                        <input v-model="card.kicker" type="text" class="form-control" />
                    </div>
                    <div class="col-12 col-xl-8">
                        <label class="form-label">卡片标题</label>
                        <input v-model="card.title" type="text" class="form-control" />
                    </div>
                    <div class="col-12">
                        <label class="form-label">说明文案</label>
                        <textarea v-model="card.description" rows="2" class="form-control"></textarea>
                    </div>
                    <div class="col-12">
                        <label class="form-label">卡片配色</label>
                        <div class="theme-picker">
                            <button
                                v-for="theme in themeOptions"
                                :key="`featured-theme-${card.id}-${theme.value}`"
                                type="button"
                                class="theme-choice"
                                :class="{ active: (card.theme || 'neutral') === theme.value }"
                                :style="themePreviewStyle(theme.value)"
                                :aria-pressed="(card.theme || 'neutral') === theme.value"
                                @click="setTheme(card, theme.value)"
                            >
                                <span class="theme-choice-accent"></span>
                                <span class="theme-choice-label">{{ theme.label }}</span>
                            </button>
                        </div>
                        <div class="form-text">这些玻璃配色来自你前面那几张提示卡的风格，现在可以手动切换，不再写死。</div>
                    </div>
                    <div class="col-12">
                        <label class="form-label">包含哪些节点</label>
                        <VueMultiselect
                            :model-value="monitorsByIds(card.monitorIds)"
                            :options="monitorOptions"
                            :multiple="true"
                            label="name"
                            track-by="id"
                            placeholder="选择已加入状态页的节点"
                            @update:modelValue="updateMonitorIds(card, $event)"
                        />
                    </div>
                    <div class="col-12 col-xl-6">
                        <label class="form-label">主展示节点（可选）</label>
                        <VueMultiselect
                            :model-value="monitorById(card.highlightMonitorId)"
                            :options="monitorsByIds(card.monitorIds)"
                            :multiple="false"
                            label="name"
                            track-by="id"
                            placeholder="不选则自动挑选"
                            @update:modelValue="card.highlightMonitorId = $event ? $event.id : null"
                        />
                        <div class="form-text">
                            不指定时，会按当前状态和手动顺序自动挑选最适合展示的节点。
                        </div>
                    </div>
                </div>

                <div class="card-actions">
                    <button type="button" class="btn btn-sm btn-outline-danger" @click="removeFeaturedRoute(index)">
                        删除卡片
                    </button>
                </div>
            </div>
        </div>

        <div class="editor-block">
            <div class="block-header">
                <div>
                    <div class="block-title">展示分区</div>
                    <div class="block-desc">把节点重新划入你想给玩家看到的分类，不影响原始编辑模式和手动拖拽顺序。</div>
                </div>
                <button type="button" class="btn btn-sm btn-outline-primary" @click="addSection">
                    新增分区
                </button>
            </div>

            <div v-for="(section, index) in config.sections" :key="section.id" class="editor-card">
                <div class="row g-2">
                    <div class="col-12 col-xl-3">
                        <div class="form-check form-switch">
                            <input
                                :id="`section-enabled-${index}`"
                                v-model="section.enabled"
                                class="form-check-input"
                                type="checkbox"
                            />
                            <label class="form-check-label" :for="`section-enabled-${index}`">
                                此分区展示在公开页面
                            </label>
                        </div>
                    </div>
                    <div class="col-12 col-xl-2">
                        <label class="form-label">大屏列数</label>
                        <select v-model.number="section.columns" class="form-select">
                            <option :value="1">1 列</option>
                            <option :value="2">2 列</option>
                            <option :value="3">3 列</option>
                            <option :value="4">4 列</option>
                        </select>
                    </div>
                    <div class="col-12 col-xl-3">
                        <label class="form-label">小标题</label>
                        <input v-model="section.kicker" type="text" class="form-control" />
                    </div>
                    <div class="col-12 col-xl-4">
                        <label class="form-label">分区标题</label>
                        <input v-model="section.title" type="text" class="form-control" />
                    </div>
                    <div class="col-12">
                        <label class="form-label">分区说明</label>
                        <textarea v-model="section.description" rows="2" class="form-control"></textarea>
                    </div>
                    <div class="col-12">
                        <label class="form-label">分区配色</label>
                        <div class="theme-picker">
                            <button
                                v-for="theme in themeOptions"
                                :key="`section-theme-${section.id}-${theme.value}`"
                                type="button"
                                class="theme-choice"
                                :class="{ active: (section.theme || 'neutral') === theme.value }"
                                :style="themePreviewStyle(theme.value)"
                                :aria-pressed="(section.theme || 'neutral') === theme.value"
                                @click="setTheme(section, theme.value)"
                            >
                                <span class="theme-choice-accent"></span>
                                <span class="theme-choice-label">{{ theme.label }}</span>
                            </button>
                        </div>
                    </div>
                    <div class="col-12">
                        <label class="form-label">本分区节点</label>
                        <VueMultiselect
                            :model-value="monitorsByIds(section.monitorIds)"
                            :options="monitorOptions"
                            :multiple="true"
                            label="name"
                            track-by="id"
                            placeholder="选择已加入状态页的节点"
                            @update:modelValue="updateMonitorIds(section, $event)"
                        />
                    </div>
                </div>

                <div class="card-actions">
                    <button type="button" class="btn btn-sm btn-outline-danger" @click="removeSection(index)">
                        删除分区
                    </button>
                </div>
            </div>
        </div>

        <div class="editor-block">
            <div class="block-header">
                <div>
                    <div class="block-title">节点标签与备注</div>
                    <div class="block-desc">
                        你之前说的“海外推荐、国内首选、高防推荐、观察中”等都从这里手动配置。
                        这些内容只会显示在我们自定义的展示层卡片里，不会覆盖原版 Uptime Kuma 的默认分组列表。
                    </div>
                </div>
                <button type="button" class="btn btn-sm btn-outline-primary" @click="addMonitorMetaEntry">
                    新增标签配置
                </button>
            </div>

            <div v-for="(entry, index) in config.monitorMetaEntries" :key="entry.id || `meta-${index}`" class="editor-card">
                <div class="row g-2">
                    <div class="col-12 col-xl-4">
                        <label class="form-label">节点</label>
                        <VueMultiselect
                            :model-value="monitorById(entry.monitorId)"
                            :options="monitorOptions"
                            :multiple="false"
                            label="name"
                            track-by="id"
                            placeholder="选择节点"
                            @update:modelValue="entry.monitorId = $event ? $event.id : null"
                        />
                    </div>
                    <div class="col-12 col-xl-3">
                        <label class="form-label">标签文字</label>
                        <input v-model="entry.badge" type="text" class="form-control" placeholder="例如：国内首选" />
                    </div>
                    <div class="col-12 col-xl-5">
                        <label class="form-label">备注说明</label>
                        <input v-model="entry.note" type="text" class="form-control" placeholder="例如：适合大陆玩家优先尝试" />
                    </div>
                </div>

                <div class="card-actions">
                    <button type="button" class="btn btn-sm btn-outline-danger" @click="removeMonitorMetaEntry(index)">
                        删除标签配置
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import VueMultiselect from "vue-multiselect";
import { createDefaultPlanaShowcaseConfig } from "../config/plana-status-showcase";
import {
    getPlanaShowcaseThemeStyle,
    planaShowcaseThemeOptions,
} from "../config/plana-showcase-themes";

export default {
    components: {
        VueMultiselect,
    },
    props: {
        config: {
            type: Object,
            required: true,
        },
        monitorOptions: {
            type: Array,
            required: true,
        },
    },
    computed: {
        themeOptions() {
            return planaShowcaseThemeOptions;
        },
    },
    methods: {
        monitorsByIds(ids) {
            return (ids || []).map((id) => this.monitorOptions.find((monitor) => monitor.id === id)).filter(Boolean);
        },

        monitorById(id) {
            return this.monitorOptions.find((monitor) => monitor.id === id) || null;
        },

        updateMonitorIds(target, selectedMonitors) {
            target.monitorIds = selectedMonitors.map((monitor) => monitor.id);
        },

        setTheme(target, theme) {
            target.theme = theme;
        },

        themePreviewStyle(theme) {
            return getPlanaShowcaseThemeStyle(theme);
        },

        addFeaturedRoute() {
            this.config.featuredRoutes.push({
                id: `featured-${Date.now()}-${this.config.featuredRoutes.length}`,
                enabled: true,
                kicker: "新卡片",
                title: "新的推荐入口",
                description: "",
                theme: "neutral",
                monitorIds: [],
                highlightMonitorId: null,
            });
        },

        removeFeaturedRoute(index) {
            this.config.featuredRoutes.splice(index, 1);
        },

        addSection() {
            this.config.sections.push({
                id: `section-${Date.now()}-${this.config.sections.length}`,
                enabled: true,
                kicker: "状态分区",
                title: "新分区",
                description: "",
                theme: "neutral",
                monitorIds: [],
                columns: 3,
            });
        },

        removeSection(index) {
            this.config.sections.splice(index, 1);
        },

        addMonitorMetaEntry() {
            this.config.monitorMetaEntries.push({
                id: `meta-${Date.now()}-${this.config.monitorMetaEntries.length}`,
                monitorId: null,
                badge: "",
                note: "",
            });
        },

        removeMonitorMetaEntry(index) {
            this.config.monitorMetaEntries.splice(index, 1);
        },

        resetToDefaultTemplate() {
            Object.assign(this.config, createDefaultPlanaShowcaseConfig());
        },
    },
};
</script>

<style lang="scss" scoped>
.showcase-editor {
    display: grid;
    gap: 18px;
}

.editor-actions {
    display: flex;
    justify-content: flex-start;
}

.editor-block {
    padding: 16px;
    border-radius: 16px;
    background: rgba(248, 250, 252, 0.88);
    border: 1px solid rgba(148, 163, 184, 0.16);
}

.block-header {
    display: flex;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 14px;
}

.block-title {
    font-weight: 700;
}

.block-desc {
    margin-top: 4px;
    color: #64748b;
    font-size: 0.92rem;
    line-height: 1.45;
}

.editor-card {
    padding: 14px;
    border-radius: 14px;
    background: rgba(255, 255, 255, 0.9);
    border: 1px solid rgba(148, 163, 184, 0.16);
    margin-bottom: 12px;
}

.editor-card:last-child {
    margin-bottom: 0;
}

.theme-picker {
    display: grid;
    gap: 10px;
    grid-template-columns: repeat(auto-fit, minmax(96px, 1fr));
}

.theme-choice {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
    width: 100%;
    padding: 12px;
    border-radius: 14px;
    text-align: left;
    font: inherit;
    cursor: pointer;
    appearance: none;
    background: var(--plana-card-bg);
    border: 1px solid var(--plana-card-border);
    box-shadow: var(--plana-card-shadow);
    color: var(--plana-card-text);
    transition: transform 0.16s ease, box-shadow 0.16s ease;
}

.theme-choice:hover {
    transform: translateY(-1px);
}

.theme-choice.active {
    outline: 2px solid var(--plana-accent-strong);
    outline-offset: 2px;
}

.theme-choice-accent {
    width: 100%;
    height: 10px;
    border-radius: 999px;
    background: var(--plana-chip-bg);
    border: 1px solid var(--plana-chip-border);
}

.theme-choice-label {
    font-size: 0.88rem;
    font-weight: 700;
    color: var(--plana-accent-strong);
}

.card-actions {
    margin-top: 12px;
}
</style>

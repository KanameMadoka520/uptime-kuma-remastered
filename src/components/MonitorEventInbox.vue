<template>
    <div v-if="$root.loggedIn" class="monitor-event-inbox">
        <transition name="inbox-fade">
            <section v-if="$root.monitorEventInboxOpen" class="inbox-panel shadow-box">
                <header class="inbox-header">
                    <div>
                        <div class="inbox-title">{{ $t("monitorEventInboxLabel") }}</div>
                        <div class="inbox-summary">
                            <span class="summary-item down">
                                <font-awesome-icon icon="arrow-down" />
                                {{ $t("Down") }} {{ unreadDown }}
                            </span>
                            <span class="summary-item up">
                                <font-awesome-icon icon="arrow-up" />
                                {{ $t("Up") }} {{ unreadUp }}
                            </span>
                        </div>
                    </div>

                    <div class="inbox-actions">
                        <button type="button" class="btn btn-sm btn-outline-secondary" @click="$root.markMonitorEventsRead()">
                            {{ $t("monitorEventInboxMarkRead") }}
                        </button>
                        <button type="button" class="btn btn-sm btn-outline-danger" @click="$root.clearMonitorEventInbox()">
                            {{ $t("monitorEventInboxClear") }}
                        </button>
                        <button
                            type="button"
                            class="btn btn-sm btn-outline-secondary"
                            :aria-label="$t('Close')"
                            @click="$root.toggleMonitorEventInbox(false)"
                        >
                            <font-awesome-icon icon="times" />
                        </button>
                    </div>
                </header>

                <div v-if="$root.monitorEventInbox.length === 0" class="inbox-empty">
                    {{ $t("monitorEventInboxEmpty") }}
                </div>

                <div v-else class="inbox-list">
                    <article
                        v-for="event in $root.monitorEventInbox"
                        :key="event.id"
                        class="inbox-item"
                        :class="[event.statusType, { unread: !event.read }]"
                    >
                        <div class="item-top">
                            <div class="item-title">
                                <span class="status-badge" :class="event.statusType">
                                    {{ statusLabel(event) }}
                                </span>
                                <strong>{{ event.monitorName }}</strong>
                            </div>
                            <span class="item-time">{{ $root.datetime(event.time) }}</span>
                        </div>

                        <div class="item-message">
                            {{ event.msg }}
                        </div>
                    </article>
                </div>
            </section>
        </transition>

        <button
            type="button"
            class="btn btn-primary inbox-toggle"
            :class="{ active: $root.monitorEventInboxOpen }"
            :aria-label="$t('monitorEventInboxOpen')"
            @click="$root.toggleMonitorEventInbox()"
        >
            <font-awesome-icon icon="folder-open" class="me-2" />
            <span class="toggle-text">{{ $t("monitorEventInboxLabel") }}</span>
            <span class="toggle-divider"></span>
            <span class="toggle-count down">
                <font-awesome-icon icon="arrow-down" />
                {{ unreadDown }}
            </span>
            <span class="toggle-count up">
                <font-awesome-icon icon="arrow-up" />
                {{ unreadUp }}
            </span>
            <span v-if="unreadTotal > 0" class="toggle-badge">
                {{ unreadTotal }}
            </span>
        </button>
    </div>
</template>

<script>
import { DOWN, UP } from "../util.ts";

export default {
    computed: {
        unreadDown() {
            return this.$root.monitorEventUnreadCounts.down;
        },

        unreadUp() {
            return this.$root.monitorEventUnreadCounts.up;
        },

        unreadTotal() {
            return this.unreadDown + this.unreadUp + this.$root.monitorEventUnreadCounts.other;
        },
    },
    methods: {
        /**
         * Human-readable label for each monitor event entry.
         * @param {object} event Inbox event
         * @returns {string} Localized label
         */
        statusLabel(event) {
            if (event.status === DOWN) {
                return this.$t("monitorEventDown");
            }

            if (event.status === UP) {
                return this.$t("monitorEventRecovered");
            }

            return this.$t("Status");
        },
    },
};
</script>

<style lang="scss" scoped>
@import "../assets/vars.scss";

.monitor-event-inbox {
    position: fixed;
    right: 24px;
    bottom: 24px;
    z-index: 1200;
}

.inbox-panel {
    position: absolute;
    right: 0;
    bottom: 72px;
    width: min(420px, calc(100vw - 32px));
    max-height: min(70vh, 720px);
    display: flex;
    flex-direction: column;
    padding: 0;
    overflow: hidden;
    border-radius: 18px;
    background: rgba(255, 255, 255, 0.96);
    border: 1px solid rgba(15, 23, 42, 0.08);
    box-shadow: 0 24px 60px rgba(15, 23, 42, 0.18);

    .dark & {
        background: rgba(32, 42, 58, 0.96);
        border-color: rgba(148, 163, 184, 0.18);
        box-shadow: 0 24px 60px rgba(0, 0, 0, 0.35);
    }
}

.inbox-header {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    padding: 16px 16px 12px;
    border-bottom: 1px solid rgba(148, 163, 184, 0.18);
}

.inbox-title {
    font-size: 1rem;
    font-weight: 700;
}

.inbox-summary {
    display: flex;
    gap: 12px;
    margin-top: 6px;
    font-size: 0.88rem;
}

.summary-item {
    display: inline-flex;
    align-items: center;
    gap: 6px;
}

.summary-item.down,
.toggle-count.down,
.status-badge.down {
    color: #dc2626;
}

.summary-item.up,
.toggle-count.up,
.status-badge.up {
    color: #059669;
}

.inbox-actions {
    display: flex;
    gap: 8px;
    align-items: flex-start;
}

.inbox-list {
    overflow-y: auto;
    padding: 12px 16px 16px;
}

.inbox-empty {
    padding: 24px 16px 28px;
    text-align: center;
    color: #64748b;
}

.inbox-item {
    padding: 12px 14px;
    border-radius: 14px;
    margin-bottom: 10px;
    background: rgba(248, 250, 252, 0.9);
    border: 1px solid rgba(148, 163, 184, 0.18);

    .dark & {
        background: rgba(15, 23, 42, 0.52);
        border-color: rgba(148, 163, 184, 0.18);
    }
}

.inbox-item.unread {
    box-shadow: inset 3px 0 0 #2563eb;
}

.inbox-item.down {
    border-color: rgba(220, 38, 38, 0.2);
}

.inbox-item.up {
    border-color: rgba(5, 150, 105, 0.22);
}

.item-top {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 8px;
}

.item-title {
    display: flex;
    gap: 10px;
    align-items: center;
    min-width: 0;
}

.item-time {
    color: #64748b;
    font-size: 0.8rem;
    white-space: nowrap;
}

.item-message {
    color: inherit;
    word-break: break-word;
    line-height: 1.45;
}

.status-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 2px 8px;
    border-radius: 999px;
    font-size: 0.78rem;
    font-weight: 700;
    background: rgba(148, 163, 184, 0.12);
}

.inbox-toggle {
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: 10px;
    min-height: 48px;
    padding: 10px 16px;
    border-radius: 999px;
    box-shadow: 0 14px 36px rgba(37, 99, 235, 0.24);
}

.inbox-toggle.active {
    background-color: #1d4ed8;
    border-color: #1d4ed8;
}

.toggle-divider {
    width: 1px;
    height: 18px;
    background: rgba(255, 255, 255, 0.35);
}

.toggle-count {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    color: #fff;
    font-size: 0.86rem;
}

.toggle-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 20px;
    height: 20px;
    padding: 0 6px;
    border-radius: 999px;
    background: #0f172a;
    color: #fff;
    font-size: 0.75rem;
    font-weight: 700;
}

.inbox-fade-enter-active,
.inbox-fade-leave-active {
    transition: opacity 0.18s ease, transform 0.18s ease;
}

.inbox-fade-enter-from,
.inbox-fade-leave-to {
    opacity: 0;
    transform: translateY(12px);
}

@media (max-width: 767px) {
    .monitor-event-inbox {
        right: 12px;
        left: 12px;
        bottom: calc(72px + env(safe-area-inset-bottom));
    }

    .inbox-panel {
        width: 100%;
    }

    .inbox-toggle {
        width: 100%;
        justify-content: center;
    }

    .toggle-text {
        flex: 0 0 auto;
    }
}
</style>

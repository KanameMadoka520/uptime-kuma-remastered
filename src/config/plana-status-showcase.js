function clone(value) {
    return JSON.parse(JSON.stringify(value));
}

export const defaultPlanaShowcaseConfig = {
    enabled: true,
    showSummaryCards: false,
    showUnassignedMonitors: false,
    featuredRoutes: [],
    sections: [],
    monitorMetaEntries: [],
};

export function createDefaultPlanaShowcaseConfig() {
    return clone(defaultPlanaShowcaseConfig);
}

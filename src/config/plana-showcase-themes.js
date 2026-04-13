export const defaultPlanaShowcaseTheme = "neutral";

export const planaShowcaseThemePresets = {
    neutral: {
        label: "晶白",
        cardBg: "rgba(255, 255, 255, 0.78)",
        cardBorder: "rgba(255, 255, 255, 0.72)",
        cardShadow: "0 8px 24px rgba(15, 23, 42, 0.06)",
        textColor: "#0f172a",
        mutedText: "#475569",
        mutedStrong: "#64748b",
        accentStrong: "#2563eb",
        chipBg: "rgba(37, 99, 235, 0.10)",
        chipBorder: "rgba(37, 99, 235, 0.18)",
        chipText: "#1d4ed8",
        surfaceBg: "rgba(248, 250, 252, 0.86)",
        surfaceBorder: "rgba(148, 163, 184, 0.16)",
    },
    emerald: {
        label: "翡翠",
        cardBg: "rgba(240, 253, 244, 0.78)",
        cardBorder: "rgba(134, 239, 172, 0.54)",
        cardShadow: "0 8px 24px rgba(21, 128, 61, 0.08)",
        textColor: "#14532d",
        mutedText: "#166534",
        mutedStrong: "#15803d",
        accentStrong: "#15803d",
        chipBg: "rgba(34, 197, 94, 0.12)",
        chipBorder: "rgba(34, 197, 94, 0.22)",
        chipText: "#15803d",
        surfaceBg: "rgba(255, 255, 255, 0.76)",
        surfaceBorder: "rgba(134, 239, 172, 0.34)",
    },
    rose: {
        label: "绯红",
        cardBg: "rgba(254, 242, 242, 0.80)",
        cardBorder: "rgba(252, 165, 165, 0.52)",
        cardShadow: "0 8px 24px rgba(185, 28, 28, 0.08)",
        textColor: "#7f1d1d",
        mutedText: "#991b1b",
        mutedStrong: "#b91c1c",
        accentStrong: "#b91c1c",
        chipBg: "rgba(239, 68, 68, 0.12)",
        chipBorder: "rgba(239, 68, 68, 0.22)",
        chipText: "#b91c1c",
        surfaceBg: "rgba(255, 255, 255, 0.78)",
        surfaceBorder: "rgba(252, 165, 165, 0.30)",
    },
    amber: {
        label: "琥珀",
        cardBg: "rgba(255, 247, 237, 0.80)",
        cardBorder: "rgba(253, 186, 116, 0.56)",
        cardShadow: "0 8px 24px rgba(194, 65, 12, 0.08)",
        textColor: "#7c2d12",
        mutedText: "#9a3412",
        mutedStrong: "#c2410c",
        accentStrong: "#c2410c",
        chipBg: "rgba(249, 115, 22, 0.12)",
        chipBorder: "rgba(249, 115, 22, 0.22)",
        chipText: "#ea580c",
        surfaceBg: "rgba(255, 255, 255, 0.78)",
        surfaceBorder: "rgba(253, 186, 116, 0.34)",
    },
    sky: {
        label: "天青",
        cardBg: "rgba(239, 246, 255, 0.80)",
        cardBorder: "rgba(147, 197, 253, 0.56)",
        cardShadow: "0 8px 24px rgba(29, 78, 216, 0.08)",
        textColor: "#1e3a8a",
        mutedText: "#1d4ed8",
        mutedStrong: "#2563eb",
        accentStrong: "#1d4ed8",
        chipBg: "rgba(59, 130, 246, 0.12)",
        chipBorder: "rgba(59, 130, 246, 0.22)",
        chipText: "#1d4ed8",
        surfaceBg: "rgba(255, 255, 255, 0.78)",
        surfaceBorder: "rgba(147, 197, 253, 0.34)",
    },
    slate: {
        label: "石墨",
        cardBg: "rgba(248, 250, 252, 0.84)",
        cardBorder: "rgba(148, 163, 184, 0.36)",
        cardShadow: "0 8px 24px rgba(15, 23, 42, 0.08)",
        textColor: "#0f172a",
        mutedText: "#334155",
        mutedStrong: "#475569",
        accentStrong: "#0f172a",
        chipBg: "rgba(51, 65, 85, 0.08)",
        chipBorder: "rgba(51, 65, 85, 0.16)",
        chipText: "#0f172a",
        surfaceBg: "rgba(255, 255, 255, 0.80)",
        surfaceBorder: "rgba(148, 163, 184, 0.24)",
    },
};

export const planaShowcaseThemeOptions = Object.entries(planaShowcaseThemePresets).map(([value, preset]) => ({
    value,
    label: preset.label,
}));

export function normalizePlanaShowcaseTheme(theme) {
    return planaShowcaseThemePresets[theme] ? theme : defaultPlanaShowcaseTheme;
}

export function getPlanaShowcaseTheme(theme) {
    return planaShowcaseThemePresets[normalizePlanaShowcaseTheme(theme)];
}

export function getPlanaShowcaseThemeStyle(theme) {
    const preset = getPlanaShowcaseTheme(theme);

    return {
        "--plana-card-bg": preset.cardBg,
        "--plana-card-border": preset.cardBorder,
        "--plana-card-shadow": preset.cardShadow,
        "--plana-card-text": preset.textColor,
        "--plana-muted-text": preset.mutedText,
        "--plana-muted-strong": preset.mutedStrong,
        "--plana-accent-strong": preset.accentStrong,
        "--plana-chip-bg": preset.chipBg,
        "--plana-chip-border": preset.chipBorder,
        "--plana-chip-text": preset.chipText,
        "--plana-surface-bg": preset.surfaceBg,
        "--plana-surface-border": preset.surfaceBorder,
    };
}

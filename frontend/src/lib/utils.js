export function formatDate(date) {
    return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

export function dateFromYMD(ymd) {
    if (typeof ymd !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(ymd)) return null;
    const [y, m, d] = ymd.split('-').map(Number);
    const dt = new Date(y, m - 1, d);
    return Number.isNaN(dt.getTime()) ? null : dt;
}

export function formatYMD(ymd, locale = 'en-US', options) {
    const dt = dateFromYMD(ymd);
    if (!dt) return ymd;
    const fmt = options || { month: 'short', day: 'numeric', year: 'numeric' };
    return dt.toLocaleDateString(locale, fmt);
}

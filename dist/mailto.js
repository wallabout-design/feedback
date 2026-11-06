// Builds the "send feedback" mailto:. The subject tag tells the feedback routine
// which site and page the note is about (wallabout-design/standards,
// standards/feedback.md).
/** Where notes go unless a site overrides it. */
export const FEEDBACK_ADDRESS = 'feedback@wallabout.design';
/** The highlighted text is cut to this many characters. */
export const MAX_SELECTION = 500;
/** Two decimals at most: Firefox zoom reports ratios like 1.8181818181818181. */
export const roundDpr = (dpr) => Math.round(dpr * 100) / 100;
export function feedbackMailto(c, { siteId, address = FEEDBACK_ADDRESS }) {
    const subject = `[${siteId}] ${c.path}`;
    const quote = c.selection?.trim().slice(0, MAX_SELECTION);
    const body = [
        ...(quote ? ['about this text:', ...quote.split(/\r?\n/).map((l) => `> ${l}`), ''] : []),
        'what to change (a screenshot helps):',
        '',
        '',
        '',
        '--- page details, please leave ---',
        `url: ${c.url}`,
        `viewport: ${c.viewport} @${roundDpr(c.dpr)}x`,
        `browser: ${c.ua}`,
        `build: ${c.build}`,
    ].join('\r\n'); // RFC 6068: CRLF line breaks in mailto: bodies
    return `mailto:${address}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

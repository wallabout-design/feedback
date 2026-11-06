/** Where notes go unless a site overrides it. */
export declare const FEEDBACK_ADDRESS = "feedback@wallabout.design";
/** The highlighted text is cut to this many characters. */
export declare const MAX_SELECTION = 500;
export interface FeedbackOptions {
    /** Short site ID for the subject tag, such as `wallabout` or `rr`. */
    siteId: string;
    /** Defaults to `feedback@wallabout.design`. */
    address?: string;
}
export interface FeedbackContext {
    url: string;
    path: string;
    viewport: string;
    dpr: number;
    ua: string;
    build: string;
    /** Text the reviewer had highlighted, if any. */
    selection?: string;
}
/** Two decimals at most: Firefox zoom reports ratios like 1.8181818181818181. */
export declare const roundDpr: (dpr: number) => number;
export declare function feedbackMailto(c: FeedbackContext, { siteId, address }: FeedbackOptions): string;

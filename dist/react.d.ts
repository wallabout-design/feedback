import { type FeedbackOptions } from './mailto.js';
export interface FeedbackLinkProps extends FeedbackOptions {
    /** Each site styles the link with its own tokens. */
    className?: string;
}
export declare function FeedbackLink({ siteId, address, className }: FeedbackLinkProps): import("react").JSX.Element;

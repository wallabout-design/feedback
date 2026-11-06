import { type FeedbackOptions } from './mailto.js';
/**
 * Turns `link` into the feedback link if this browser has opted in, and returns a
 * function that removes its listeners (for React effects and StrictMode).
 */
export declare function initFeedbackLink(link: HTMLAnchorElement, options: FeedbackOptions): () => void;

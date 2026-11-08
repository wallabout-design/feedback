// Shows and fills a "send feedback" link. Hidden until a visit with ?feedback turns
// it on for this browser (?feedback=off turns it off), so ordinary visitors never see it.
import { feedbackId, feedbackMailto, type FeedbackOptions } from './mailto.js';

const KEY = 'feedback';
/** Text deselected this recently still counts as highlighted. */
const SELECTION_GRACE_MS = 3000;

function feedbackEnabled(): boolean {
  const flag = new URLSearchParams(location.search).get('feedback');
  try {
    if (flag === 'off') localStorage.removeItem(KEY);
    else if (flag !== null) localStorage.setItem(KEY, '1');
  } catch {
    // Storage blocked (private mode in some browsers): show it for this page only.
  }
  if (flag !== null) return flag !== 'off';
  try {
    return localStorage.getItem(KEY) === '1';
  } catch {
    return false;
  }
}

/**
 * Turns `link` into the feedback link if this browser has opted in, and returns a
 * function that removes its listeners (for React effects and StrictMode).
 */
export function initFeedbackLink(link: HTMLAnchorElement, options: FeedbackOptions): () => void {
  if (!feedbackEnabled()) return () => {};

  // Remember the last highlighted text. Tapping the link can clear the selection
  // first (phones especially), so text deselected in the last few seconds counts.
  let selected = '';
  let clearedAt = 0;
  const onSelectionChange = () => {
    const text = getSelection()?.toString().trim() ?? '';
    if (text) {
      selected = text;
      clearedAt = 0;
    } else if (selected && !clearedAt) {
      clearedAt = Date.now();
    }
  };
  const currentSelection = () => (clearedAt && Date.now() - clearedAt > SELECTION_GRACE_MS ? '' : selected);

  // Refresh on click, so the viewport is the one the reviewer is looking at, and each
  // email gets its own subject code.
  const update = () => {
    link.href = feedbackMailto(
      {
        url: location.href,
        path: location.pathname,
        viewport: `${innerWidth}x${innerHeight}`,
        dpr: devicePixelRatio,
        ua: navigator.userAgent,
        build: document.querySelector<HTMLMetaElement>('meta[name="build"]')?.content ?? '',
        selection: currentSelection(),
        id: feedbackId(),
      },
      options,
    );
  };

  document.addEventListener('selectionchange', onSelectionChange);
  link.addEventListener('click', update);
  update();
  // Open the mail app from this tab. A mailto: in a new tab (target="_blank") counts
  // as a pop-up in some browsers and gets blocked, so drop it from older markup too.
  link.removeAttribute('target');
  link.hidden = false;
  return () => {
    document.removeEventListener('selectionchange', onSelectionChange);
    link.removeEventListener('click', update);
  };
}

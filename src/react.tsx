// The feedback link as a React component. It renders hidden, and initFeedbackLink
// shows it after mount, from the bundle, so it needs no inline script under a CSP.
import { useEffect, useRef } from 'react';
import { initFeedbackLink } from './link.js';
import { FEEDBACK_ADDRESS, type FeedbackOptions } from './mailto.js';

export interface FeedbackLinkProps extends FeedbackOptions {
  /** Each site styles the link with its own tokens. */
  className?: string;
}

export function FeedbackLink({ siteId, address, className }: FeedbackLinkProps) {
  const ref = useRef<HTMLAnchorElement>(null);
  useEffect(() => (ref.current ? initFeedbackLink(ref.current, { siteId, address }) : undefined), [siteId, address]);
  return (
    <a ref={ref} className={className} href={`mailto:${address ?? FEEDBACK_ADDRESS}`} hidden>
      send feedback
    </a>
  );
}

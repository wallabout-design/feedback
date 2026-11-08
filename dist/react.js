import { jsx as _jsx } from "react/jsx-runtime";
// The feedback link as a React component. It renders hidden, and initFeedbackLink
// shows it after mount, from the bundle, so it needs no inline script under a CSP.
import { useEffect, useRef } from 'react';
import { initFeedbackLink } from './link.js';
import { FEEDBACK_ADDRESS } from './mailto.js';
export function FeedbackLink({ siteId, address, className }) {
    const ref = useRef(null);
    useEffect(() => (ref.current ? initFeedbackLink(ref.current, { siteId, address }) : undefined), [siteId, address]);
    return (_jsx("a", { ref: ref, className: className, href: `mailto:${address ?? FEEDBACK_ADDRESS}`, hidden: true, children: "send feedback" }));
}

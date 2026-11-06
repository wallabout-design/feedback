import { initFeedbackLink } from '/dist/index.js';

const options = { siteId: 'test' };
const address = new URLSearchParams(location.search).get('address');
if (address) options.address = address;
window.feedbackCleanup = initFeedbackLink(document.querySelector('[data-feedback-link]'), options);

// The React component's markup (server render, no browser). Its behaviour is
// initFeedbackLink's, covered by link.spec.ts.
import { test, expect } from '@playwright/test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { FeedbackLink } from '../dist/react.js';

test('renders a hidden link marked data-feedback-link, like the plain markup', () => {
  const html = renderToStaticMarkup(createElement(FeedbackLink, { siteId: 'rr', className: 'feedback' }));
  expect(html).toBe(
    '<a class="feedback" href="mailto:feedback@wallabout.design" hidden="" data-feedback-link="">send feedback</a>',
  );
});

test('uses the address override', () => {
  const html = renderToStaticMarkup(createElement(FeedbackLink, { siteId: 'rr', address: 'notes@example.com' }));
  expect(html).toContain('href="mailto:notes@example.com"');
});

// Unit tests for the mailto: builder (no browser).
import { test, expect } from '@playwright/test';
import { FEEDBACK_ADDRESS, MAX_SELECTION, feedbackMailto, roundDpr, type FeedbackContext } from '../dist/index.js';

const context: FeedbackContext = {
  url: 'https://example.com/stay?x=1',
  path: '/stay',
  viewport: '390x844',
  dpr: 3,
  ua: 'TestBrowser/1.0',
  build: 'abc1234',
};

const read = (href: string) => {
  const mail = new URL(href);
  return { to: mail.pathname, subject: mail.searchParams.get('subject')!, body: mail.searchParams.get('body')! };
};

test('subject is [site] /path, sent to the default address', () => {
  const mail = read(feedbackMailto(context, { siteId: 'rr' }));
  expect(mail.to).toBe(FEEDBACK_ADDRESS);
  expect(FEEDBACK_ADDRESS).toBe('feedback@wallabout.design');
  expect(mail.subject).toBe('[rr] /stay');
});

test('the address can be overridden', () => {
  expect(read(feedbackMailto(context, { siteId: 'rr', address: 'notes@example.com' })).to).toBe('notes@example.com');
});

test('body uses CRLF line breaks and carries the page details', () => {
  const { body } = read(feedbackMailto(context, { siteId: 'rr' }));
  expect(body).toBe(
    [
      'what to change (a screenshot helps):',
      '',
      '',
      '',
      '--- page details, please leave ---',
      'url: https://example.com/stay?x=1',
      'viewport: 390x844 @3x',
      'browser: TestBrowser/1.0',
      'build: abc1234',
    ].join('\r\n'),
  );
  expect(body.replaceAll('\r\n', '')).not.toContain('\n');
});

test('highlighted text is quoted line by line', () => {
  const { body } = read(feedbackMailto({ ...context, selection: '  first line\nsecond line\r\nthird  ' }, { siteId: 'rr' }));
  expect(body.startsWith('about this text:\r\n> first line\r\n> second line\r\n> third\r\n\r\nwhat to change')).toBe(true);
});

test('the quote is cut to 500 characters', () => {
  const { body } = read(feedbackMailto({ ...context, selection: 'a'.repeat(MAX_SELECTION + 100) }, { siteId: 'rr' }));
  expect(MAX_SELECTION).toBe(500);
  expect(body).toContain(`> ${'a'.repeat(500)}\r\n`);
  expect(body).not.toContain('a'.repeat(501));
});

test('blank selection adds no quote', () => {
  expect(read(feedbackMailto({ ...context, selection: '  \n ' }, { siteId: 'rr' })).body.startsWith('what to change')).toBe(true);
});

test('device pixel ratio is rounded to two decimals', () => {
  expect(roundDpr(1.8181818181818181)).toBe(1.82);
  expect(roundDpr(2)).toBe(2);
  expect(roundDpr(1.25)).toBe(1.25);
  expect(read(feedbackMailto({ ...context, dpr: 1.8181818181818181 }, { siteId: 'rr' })).body).toContain('viewport: 390x844 @1.82x\r\n');
});

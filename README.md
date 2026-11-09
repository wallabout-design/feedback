# feedback

Hidden "send feedback" link for wallabout sites: a prefilled email with the page, viewport, build and highlighted text.

Ordinary visitors never see it. A visit with `?feedback` turns it on for that browser (stored as `localStorage` `feedback=1`), and `?feedback=off` turns it off. The link is a `mailto:` to `feedback@wallabout.design` with the subject `[<siteId>] <path> #<id>`, where `<id>` is a fresh 4-character code on each click (no look-alike characters), so every note gets its own thread in the inbox and can be named in a reply. It quotes any highlighted text (up to 500 characters, and still counted for 3 s after the selection clears) and adds the URL, viewport, device pixel ratio, browser and build (from `<meta name="build">`). Nothing is sent until the reviewer sends the email. The feedback routine is described in `standards/feedback.md` in `wallabout-design/standards`.

## install

```sh
npm install github:wallabout-design/feedback#v0.3.0
```

## use

Any site, from a bundled script (not an inline one, so a CSP that blocks inline scripts is fine):

```html
<a href="mailto:feedback@wallabout.design" hidden data-feedback-link>send feedback</a>
```

```ts
import { initFeedbackLink } from '@wallabout-design/feedback';

const link = document.querySelector<HTMLAnchorElement>('[data-feedback-link]');
if (link) initFeedbackLink(link, { siteId: 'wallabout' });
```

Nothing runs at import time. `initFeedbackLink` returns a function that removes its listeners. Pass `address` to send notes somewhere else.

The link opens the mail app from the same tab. Don't give it `target="_blank"`: some browsers block a `mailto:` in a new tab as a pop-up. `initFeedbackLink` removes the attribute from older markup anyway.

React (React is an optional peer dependency):

```tsx
import { FeedbackLink } from '@wallabout-design/feedback/react';

<FeedbackLink siteId="rr" className="feedback-link" />;
```

It renders `<a hidden data-feedback-link>send feedback</a>` and calls `initFeedbackLink` in `useEffect`, so it's safe under StrictMode. Style it through `className` with the site's own tokens. Remember the `[hidden] { display: none }` rule if the class sets `display`.

## reserving space at the bottom of the page

The package ships no styles for the link itself. Sites usually fix it at the bottom right of the viewport, where it covers whatever the footer has in that corner once you scroll to the bottom. Import the optional `reserve.css` to keep that corner clear:

```ts
import '@wallabout-design/feedback/reserve.css';
```

While the link is shown (any `[data-feedback-link]` without `hidden`, which both the plain markup and `FeedbackLink` render), it pads the bottom of `<body>` by `--feedback-reserve`, 64px by default: the link's height plus its offset from the bottom. If the site's link is taller or sits higher, set the variable, for example `:root { --feedback-reserve: 80px; }`. Ordinary visitors never see the link, so their pages are unchanged.

Import it whenever the link is fixed over the page. The rule keys on the `hidden` attribute, so keep `[hidden] { display: none }` working: if the site's link styles set `display`, add that rule too, or the link shows for every visitor while no space is reserved.

## why built JS from a git tag

Sites install a tag from GitHub, with no registry and no token (the repo is public). npm installs a git dependency as it is, unless the package has a `prepare` script, in which case npm installs its dev dependencies and builds it on every site's `npm ci`. That is slow, and rr only allows install scripts it lists. TypeScript source wouldn't work either, because Node won't strip types inside `node_modules` for a server render.

So `dist/` (plain ES modules and `.d.ts` files, built by `tsc`) is committed, and CI fails if it doesn't match `src/`. Sites need no build step for this package: Astro (site) and React Router with Vite (rr) bundle `dist/` like any other dependency.

## develop

Node 24 (`.nvmrc`).

- `npm run build`: compile `src/` to `dist/` and copy `src/reserve.css` there. Commit `dist/` with the change.
- `npm run check`: type check the source and tests.
- `npm test`: build, then run the unit tests (`test/mailto.spec.ts`, `test/react.spec.ts`) and the browser tests on fixture pages (`test/link.spec.ts`, Chromium and WebKit; first run `npx playwright install chromium webkit`).

## release

1. Merge the change to `main` (PR, squash; `main` is protected).
2. Bump `version` in `package.json` in that PR.
3. Tag the merged commit with an **annotated** tag, push it, and add a GitHub release for it:
   ```sh
   git fetch origin
   git tag -a v0.3.0 -m "v0.3.0: <one line on what changed>" origin/main
   git cat-file -t v0.3.0   # must print "tag", not "commit"
   git push origin v0.3.0
   gh release create v0.3.0 --verify-tag --generate-notes
   ```
   Don't use a plain `git tag v0.3.0`, and don't let `gh release create` make the tag itself: both make a lightweight tag. Dependabot missed the lightweight `v0.2.0` and opened site#99 to "bump" sites from v0.2.0 back down to v0.1.0.
4. In each site, install the new tag. Dependabot also opens a PR for it within the week.

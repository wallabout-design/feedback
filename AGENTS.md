# Agent guidelines

`@wallabout-design/feedback` is the npm package behind the hidden "send feedback" link on wallabout sites. Read `README.md` first. The org-wide guidelines are in `~/dev/AGENTS.md`.

## Checking a change

Run `npm run verify` (type check, build, unit and end-to-end tests). `dist/` is committed: rebuild it with `npm run build` and commit it with the change, because CI fails if it differs from `src/`.

## Releases

Merging to `main` changes no site: sites pin a version tag. Never tag a release or bump a site's version unless the issue asks. The release steps are in the README ("release").

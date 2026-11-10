# open items: things only JJ can do

Decisions, accounts and secrets. Build work goes in GitHub issues instead.

- [ ] **Choose a licence.** `package.json` says `"license": "UNLICENSED"` and there is no `LICENSE` file, but the org profile lists this repo under "Open source" (https://github.com/wallabout-design/.github/blob/main/profile/README.md). Either add a licence (MIT is the usual choice: a `LICENSE` file and `"license": "MIT"`), or change that heading. (Cross-repo audit, 2026-11-10.)
- [ ] **Should `?feedback=<any value>` turn the link on?** Today only `?feedback=off` turns it off; `?feedback=0`, `?feedback=false` and `?feedback=no` turn it on (`feedbackEnabled()` in `src/link.ts`). Either treat those as off too, or keep it and say so in the README. (Cross-repo audit, 2026-11-10.)

# Deployment

## Automatic GitHub Pages deployment

1. Push the repository to `main`.
2. Open **Settings → Pages**.
3. Set **Build and deployment → Source** to **GitHub Actions**.
4. Re-run **Actions → Deploy Ranch Life to GitHub Pages**.

The one-time setting is required because GitHub does not allow the workflow's
`GITHUB_TOKEN` to create the first Pages site. The workflow detects a missing
site, writes the exact setup step to its job summary, and skips deployment
instead of publishing an empty site.

Expected URL:

```text
https://naturezhanghn.github.io/ranch_life/
```

## Local check

```bash
npm run check
npm test
npm run story-paths
npm run balance
npm run serve
```

No build output is required. The repository root is the Pages artifact.

# Deployment

## Automatic GitHub Pages deployment

1. Push the repository to `main`.
2. Open **Settings → Pages**.
3. Set **Build and deployment → Source** to **GitHub Actions** if it was not enabled automatically.
4. Check **Actions → Deploy Ranch Life to GitHub Pages**.

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

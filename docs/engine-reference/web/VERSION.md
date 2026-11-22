# Web — Ranch Life Version Reference

This existing project uses a dependency-free web runtime rather than the CCGS
Vite scaffold.

| Field | Value |
| --- | --- |
| Engine | Web |
| **Engine Version** | Canvas 2D / ES Modules |
| Runtime | Native Canvas 2D, DOM/CSS, ES Modules and Web Audio |
| **Installed at pin time** | Native runtime already present in this repository |
| Bundler | None |
| Build | `npm run build` |
| Test | `npm test` |
| Run | `npm run serve` |
| Browser target | Current Chromium, Firefox and Safari versions with Canvas 2D and ES Modules |

The optional Phaser bridge is kept as a local compatibility layer. It is not
required by the default renderer or the release check.

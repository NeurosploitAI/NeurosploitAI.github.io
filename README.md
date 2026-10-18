# NeurosploitAI.github.io

Marketing site and documentation for **[NeuroSploit](https://github.com/JoasASantos/NeuroSploit)** — the autonomous, multi-model penetration-testing harness.

Static site, built for GitHub Pages. No build step, no dependencies.

## Structure

```
index.html          # landing page (animated hero, pipeline, modes, features, agents)
docs.html           # full tutorial & user guide (docs.strix.ai-style layout)
assets/
  css/styles.css    # landing styles
  css/docs.css      # docs styles
  js/main.js        # neural canvas, terminal typing, counters, reveal-on-scroll
  js/docs.js        # sidebar scroll-spy, TOC, search, mobile nav
  favicon.svg
.nojekyll           # serve asset paths as-is (no Jekyll processing)
```

## Local preview

```bash
python3 -m http.server 8777
# → http://localhost:8777/index.html
```

## Deploy

Pushing to the default branch publishes via GitHub Pages (root). Settings → Pages → Branch: `main` / root.

## Credits

Design & content by inspiration from leading security-AI product sites. NeuroSploit by **Joas A Santos & Red Team Leaders** — MIT.

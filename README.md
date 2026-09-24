# Yumin Huang · Plant Genomics

Personal academic website for Yumin Huang, Professor at Fujian Agriculture and Forestry University.

## Site structure

- `index.html` — Home and biography
- `research/index.html` — Research program
- `publications/index.html` — Complete publication record
- `software/index.html` — Software and computational resources
- `lab-docs/index.html` — Lab documentation and training principles
- `site.css` — Shared visual system and responsive layout
- `site.js` — Language switcher, navigation, and small UI behaviors

## Local preview

From the repository root:

```bash
python3 -m http.server 8000
```

Then open <http://localhost:8000>.

## Routine maintenance

1. Edit the relevant page or shared stylesheet.
2. Preview locally and check both English and Chinese modes.
3. Commit and push to `master`.
4. GitHub Pages publishes the updated static site automatically.

The site is intentionally framework-free: no build step, package manager, or generated bundle is required.

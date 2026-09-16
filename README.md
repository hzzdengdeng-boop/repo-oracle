# Repo Oracle

Your GitHub repo has a destiny.

Repo Oracle is a funny-but-useful GitHub repo growth analyzer. Paste a public
repository URL and it reads the repo's first impression, predicts star
potential, roasts the README, and suggests the next three moves.

## Why This Exists

Most README checkers are polite and forgettable. Repo Oracle is built to be
shareable: it gives a playful fortune report first, then practical advice a
maintainer can act on in ten minutes.

## Try It Locally

Open `index.html` in a browser, or serve the folder with any static server:

```bash
python -m http.server 8080
```

Then visit:

```text
http://localhost:8080
```

## What It Checks

- clear one-line positioning
- install and quickstart sections
- usage examples
- screenshots, GIFs, or demo links
- license, topics, stars, issues, and recent updates
- README length and first-screen clarity
- shareable personality and growth advice

## Project Shape

```text
repo-oracle/
  index.html
  styles.css
  src/
    app.js
    analyzer.js
    fortunes.js
  examples/
    sample-report.md
```

## Roadmap

- Generate PNG share cards
- Add CLI mode: `npx repo-oracle owner/repo`
- Add GitHub Action comments for README reviews
- Add AI-assisted deep reviews as an optional mode
- Build a public gallery of memorable repo fortunes

## License

MIT

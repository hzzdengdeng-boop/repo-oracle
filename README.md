# Repo Oracle

Your GitHub repo has a destiny.

Repo Oracle is a funny-but-useful GitHub repo growth analyzer. Paste a public
repository URL and it reads the repo's first impression, predicts star
potential, roasts the README, and suggests the next three moves.

When hosted, every result gets a shareable URL, so maintainers can send the
same repo report to teammates without asking them to paste the repository again.
You can also download a 1200 x 630 PNG fortune card for social posts.
If GitHub's API is rate-limited, the app switches to a clearly labeled
README-only reading instead of guessing at unavailable repo statistics.

![Example Repo Oracle fortune card](examples/fortune-card.png)

[Try Repo Oracle](https://hzzdengdeng-boop.github.io/repo-oracle/) with any public GitHub repository.

## Why This Exists

Most README checkers are polite and forgettable. Repo Oracle is built to be
shareable: it gives a playful fortune report first, then practical advice a
maintainer can act on in ten minutes.

## Run It Locally

Open `index.html` in a browser, or serve the folder with any static server:

```bash
python -m http.server 8080
```

Then visit:

```text
http://localhost:8080
```

Run the analyzer checks with `node --test`.

## What It Checks

- clear one-line positioning
- install and quickstart sections
- usage examples
- screenshots, GIFs, or demo links
- license, topics, stars, issues, and recent updates
- README length and first-screen clarity
- shareable personality and growth advice
- permalinked reports with native device sharing
- downloadable fortune cards

## Project Shape

```text
repo-oracle/
  index.html
  styles.css
  src/
    app.js
    analyzer.js
    fortunes.js
    share-card.js
  examples/
    fortune-card.png
    sample-report.md
```

## Roadmap

- Add CLI mode: `npx repo-oracle owner/repo`
- Add GitHub Action comments for README reviews
- Add AI-assisted deep reviews as an optional mode
- Build a public gallery of memorable repo fortunes

## License

MIT

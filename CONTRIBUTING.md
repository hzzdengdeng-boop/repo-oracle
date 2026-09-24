# Contributing to Repo Oracle

Small, sharp improvements are welcome. Good first contributions include:

- new fortunes that are funny without being vague
- checks that lead to a concrete README fix
- accessibility and mobile layout improvements
- tests for edge cases in repository URLs or GitHub responses

## Make a Change

1. Fork the repository and create a focused branch.
2. Serve the folder locally with `python -m http.server 8080`.
3. Run `node --test` before opening a pull request.
4. Explain the user-visible change in the pull request description.

Keep product copy concise and in English. Avoid adding dependencies unless the
benefit clearly outweighs the cost for this browser-only app.

## Add a Fortune

Fortunes live in `src/fortunes.js`. Aim for one vivid sentence. A roast should
point at something the maintainer can improve, not mock the person who built it.

## Report a Bug

Include the public repository URL you tested, what you expected, and what Repo
Oracle displayed. Do not share private repository URLs or access tokens.

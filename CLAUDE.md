@AGENTS.md

## Git workflow

- User reviews every change on the local dev server (`npm run dev`, http://localhost:3000) themselves before it ships. Do not commit or push until the user explicitly says so (e.g. "可以commit了") — implementing + verifying build/lint locally is not itself approval to commit.
- Once approved, each change gets its own commit, then push to GitHub (`origin/master`).
- Commit message format: `[Type] short description` — types: `Added`, `Fixed`, `Updated`, `Removed`, `Docs`, `Chore`.
- Keep a persistent `npm run dev` background task running for the user's live preview across the session; if it dies/gets killed, restart it proactively.
- Never run `rm -rf .next` (or otherwise delete the build cache) while that dev server is running — Turbopack's persistent cache gets corrupted (repeated panics, stuck "Compiling" state) and the server needs a full stop + restart to recover. Stop the dev task first, then clear cache, then restart.


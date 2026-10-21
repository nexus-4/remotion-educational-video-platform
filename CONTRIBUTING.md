# Contributing

## Development workflow

1. Create a focused branch from `main`.
2. Copy `.env.example` to `.env` and provide only local credentials.
3. Run migrations and start the web server, Vite, and queue worker.
4. Make the smallest change that preserves the existing Laravel, Inertia, and Remotion
   boundaries.
5. Add or update PHPUnit coverage for behavior changes.
6. Run the checks relevant to the changed area before opening a pull request.

## Quality checks

```bash
vendor/bin/pint --dirty --format agent
php artisan test --compact
npm run lint:check
npm run format:check
npm run types:check
```

For a focused backend change, run the affected test file first:

```bash
php artisan test --compact tests/Feature/EducationalVideoGenerationPipelineTest.php
```

Do not commit generated videos, uploaded files, `public/build`, `node_modules`,
`vendor`, `.env`, local SQLite databases, or IDE metadata.

## Commit conventions

Use short, imperative commit subjects with a clear scope:

```text
feat(video): add interactive remediation rendering
fix(video): isolate remediation assets from main render
test(video): cover storyboard confirmation flow
docs: describe educational video architecture
chore(repo): ignore local IDE database
```

Keep commits reviewable. Separate behavior, tests, documentation, and repository
hygiene when they can be reviewed independently. Avoid rewriting already-published
history; if a local series needs cleanup, use interactive rebase only before sharing
the branch.

## Pull requests

Describe:

- the user-visible behavior;
- the architectural boundary changed;
- migrations, environment variables, or queue requirements;
- tests and checks run;
- screenshots or rendered examples for UI/video changes.

Never include API keys or generated personal media in a pull request.

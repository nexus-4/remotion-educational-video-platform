# Educational Video Generator

An AI-assisted educational video generator built with Laravel, Inertia React, and
Remotion. A user provides a topic and optional source material, reviews the generated
storyboard, and receives a narrated, illustrated MP4 with optional interactive
checkpoints and a companion worksheet.

The project is designed as a portfolio-quality demonstration of a full-stack media
pipeline: structured AI output, asynchronous jobs, user review, deterministic video
composition, and persistent media assets.

## What it demonstrates

- Laravel 13 application architecture with actions, queued jobs, form requests, enums,
  and Eloquent persistence.
- Laravel AI integration for storyboard and worksheet generation.
- A human-in-the-loop workflow: AI drafts a storyboard, then the user confirms or edits
  it before expensive media generation continues.
- Text-to-speech narration, generated illustrations, optional user photos and branding.
- Remotion compositions with reusable slide layouts and animation styles.
- Interactive video checkpoints with a separately rendered remediation clip.
- Inertia React screens for creating, reviewing, tracking, and watching videos.
- Automated feature coverage for the controller and generation pipeline.

## Architecture at a glance

```text
Browser (Inertia React)
        |
        v
EducationalVideoController
        |
        v
EducationalVideo model + database
        |
        +--> QueueVideoGenerationAction
        |        |
        |        +--> GenerateStoryboardJob --> Laravel AI storyboard
        |                                      |
        |                                      v
        |                              User review/edit step
        |
        +--> ContinueVideoGenerationAction
                 |
                 +--> NarrateSlidesJob
                 +--> IllustrateSlidesJob
                 +--> BuildRenderManifestJob
                 +--> RenderEducationalVideoJob
                 |        |
                 |        +--> Remotion composition
                 |              --> MP4 + thumbnail
                 |
                 +--> GenerateRemediationVideoJob (interactive videos only)
```

See [`docs/architecture.md`](docs/architecture.md) for the full component map,
pipeline states, data boundaries, and extension points.

## Stack

| Area | Technology |
| --- | --- |
| Backend | PHP 8.3+, Laravel 13 |
| AI | Laravel AI with OpenAI |
| Frontend | React 19, Inertia 3, TypeScript |
| Video | Remotion 4 |
| Styling | Tailwind CSS 4 |
| Persistence | SQLite by default, database-backed queues |
| Quality | PHPUnit, PHPStan/Larastan, Pint, ESLint, Prettier, TypeScript |

## Local setup

### Requirements

- PHP 8.3 or newer
- Composer
- Node.js and npm
- FFmpeg (required by the media tooling used by the video pipeline)
- An OpenAI API key for storyboard, worksheet, narration, and/or illustration features

### Install

```bash
composer install
cp .env.example .env
php artisan key:generate
touch database/database.sqlite
php artisan migrate
npm install
npm run build
php artisan storage:link
```

Set `OPENAI_API_KEY` in `.env`. The default configuration uses SQLite, local storage,
and database queues, so no external database or Redis instance is required for a
development setup.

The Remotion renderer uses `remotion/` by default. Set `REMOTION_PROJECT_PATH` only
when the Remotion project lives elsewhere. `REMOTION_RENDER_TIMEOUT` can be increased
for larger videos.

### Run the application

Use separate terminals for the web server, frontend bundler, and queue worker:

```bash
php artisan serve
npm run dev
php artisan queue:work
```

Open `http://localhost:8000`. Authenticate, create an educational video, review the
generated storyboard, and confirm it to continue the pipeline.

## Useful commands

```bash
# Full application checks
composer test

# Frontend checks
npm run lint:check
npm run format:check
npm run types:check

# Generate visual reference assets
php artisan videos:generate-scene-previews
php artisan videos:generate-illustration-style-previews
php artisan videos:generate-animation-style-previews
```

The exact command options are available through `php artisan list`. Generated media,
build output, local credentials, and local databases should not be committed.

## Project map

```text
app/
  Actions/EducationalVideo/  Pipeline orchestration and media stages
  Ai/Agents/                 Structured AI writers
  Jobs/EducationalVideo/     Queueable pipeline stages
  Models/                    Persistent domain models
  Enums/                     Video and rendering vocabulary
remotion/
  src/                       Compositions, layouts, themes, and animations
resources/js/
  pages/educational-videos/  Inertia pages and user-facing workflow
routes/                      HTTP route definitions
database/                    Migrations and factories
tests/Feature/               End-to-end application behavior
docs/                        Architecture and contributor documentation
```

## Portfolio notes

This is an evolving project rather than a hosted SaaS product. External AI keys,
generated media, and local runtime state are intentionally not part of the repository.
The codebase is the reproducible implementation; reviewers can inspect the pipeline,
run the test suite, and use their own provider credentials locally.

## License

The project is released under the MIT license, as declared in `composer.json`.

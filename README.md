# GymBuddy

Version 0.1 — initial HTML foundation.

GymBuddy is a beginner-friendly fitness app for Next Chapter Week 4
and the foundation of a future AI-powered personal trainer.
The immediate presentation goal is a functional Workout Builder.

## Technology

HTML, CSS, and vanilla JavaScript, using the ExerciseDB public API.
This starter uses HTML only. No framework, package installation,
API key, or build step is required for the initial form.

## App areas

1. **My Profile** — planned; not implemented in this starter.
2. **Workout Builder** — the initial form is available; generation is not implemented yet.
3. **Nutrition & Meal Plans** — Coming Soon.
4. **AI Personal Trainer** — Coming Soon.

## Open locally

Open [index.html](./index.html) in a browser, for example by double-clicking
it in File Explorer. Select a fitness goal, experience level, and equipment.
The Generate workout button is intentionally disabled until JavaScript
workout generation is added.

The current page does not fetch exercises or display workout cards.
An internet connection will be needed when API integration is implemented.

## Project files

- [index.html](./index.html) contains the commented page structure and form.
- [README.md](./README.md) explains the project and how to open it.
- [PROMPT_LOG.md](./PROMPT_LOG.md) records prompt summaries, corrections, approvals, and verified results.

Planned files for later steps: `styles.css`, `script.js`,
`CODE_EXPLAINED.md`, and `DECISION_LOG.md`.
The explanation and decision logs will document the code as it grows.

## Exercise data

Exercise data will come from [AscendAPI / ExerciseDB](https://ascendapi.com).
The public endpoint is https://oss.exercisedb.dev/api/v1/exercises.
See the [API documentation](https://oss.exercisedb.dev/docs).

The API supplies names, instructions, equipment labels, and demonstration
GIF URLs. It does not supply goal, difficulty, sets, or reps fields.
We will explain our workout rules when we implement them. An exercise
labeled bodyweight can still need equipment, so matching needs care.

## Development process

- Preview changes before applying them and keep each step small.
- Include beginner-friendly comments and test each completed feature.
- Record actual work and results; do not invent approvals or test outcomes.
- Show the Git diff and wait for approval before committing.
- Use small commits with descriptive messages.
- Wait for separate approval before pushing to GitHub.

Repository: [GymBuddy on GitHub](https://github.com/barrin5514-ship-it/GymBuddy).

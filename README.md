# GymBuddy

Version 0.1 — workout preferences foundation.

GymBuddy is a beginner-friendly fitness app for Next Chapter Week 4
and the foundation of a future AI-powered personal trainer.
The immediate presentation goal is a functional Workout Builder.

## Technology

HTML, CSS, and vanilla JavaScript, using the ExerciseDB public API.
The preference form now uses HTML, a small stylesheet, and JavaScript.
No framework, package installation, API key, or build step is required.

## App areas

1. **My Profile** — planned; not implemented in this starter.
2. **Workout Builder** — the initial form is available; generation is not implemented yet.
3. **Nutrition & Meal Plans** — Coming Soon.
4. **AI Personal Trainer** — Coming Soon.

## Open locally

For the verified local preview, open a terminal in the project folder and
use Python's built-in web server (Python is already installed on this machine):

```powershell
py -m http.server 8765 --bind 127.0.0.1
```

Open [GymBuddy locally](http://127.0.0.1:8765/index.html) in your browser.
Keep the terminal running while using the app; press Ctrl+C there to stop
the server. It listens only on this computer and needs no package installation.

Keep the HTML, CSS, and JavaScript files together in the project folder.
The integrated browser failed to load the linked CSS and JavaScript through
a direct file URL; the local-server preview loaded them successfully.

The form offers ten fitness goals and three experience levels. Check all
equipment available to you. Selecting No Equipment / Bodyweight clears the
other choices, and clearing the last equipment choice restores No Equipment.
Select Other Equipment to enter custom details; temporarily hiding the
field preserves its text but excludes it from the active form data.
These interactions run locally and require JavaScript to be enabled.

Gym Membership is currently a checkbox only. Gym choices and equipment
suggestions will be added in the next stage.

The Generate workout button is intentionally disabled until JavaScript
workout generation is added.

The current page does not fetch exercises or display workout cards.
An internet connection will be needed when API integration is implemented.

## Project files

- [index.html](./index.html) contains the commented page structure and form.
- [styles.css](./styles.css) provides spacing and narrow-screen sizing for equipment controls.
- [script.js](./script.js) manages equipment selections and the custom equipment field.
- [README.md](./README.md) explains the project and how to open it.
- [PROMPT_LOG.md](./PROMPT_LOG.md) records prompt summaries, corrections, approvals, and verified results.
- [CODE_EXPLAINED.md](./CODE_EXPLAINED.md) explains how the current code works.
- [DECISION_LOG.md](./DECISION_LOG.md) records implementation decisions and their reasons.

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

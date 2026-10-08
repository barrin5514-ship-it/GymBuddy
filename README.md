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
After editing CSS or JavaScript, use your browser's hard-refresh option
if the page still behaves like the previous version because of cached files.

The form follows this order: Fitness Goal, Experience Level, Gym Membership,
then Available Equipment when applicable. The ten goals and three experience
levels are unchanged. Height, weight, and BMI belong to a future stage.

Answer **Do you have a gym membership?** with Yes or No. No is the default
and immediately shows the equipment selector. Yes reveals a gym
dropdown: Planet Fitness, Crunch Fitness, LA Fitness, or Other Gym. The
equipment selector appears after you choose a gym.

Available Equipment starts collapsed. Click its header (or use Enter/Space)
to open the existing multi-select checklist. The closed header shows the
selected equipment name or a count. Click the header again or press Escape
inside the dropdown to close it. Closing it preserves choices, custom text,
and active equipment form data.

A named gym shows a suggested equipment list. Use **Add suggested equipment**
if it matches your location, then open Available Equipment to adjust the choices. Adding
suggestions preserves existing choices. Changing gyms or switching Yes/No
does not erase your equipment selections.

Other Gym reveals a name field and lets you choose equipment manually.
Selecting No hides and disables gym-specific fields without erasing the
selected gym or typed name. Hidden equipment fields are also disabled while
Yes is selected without a gym choice, so inactive values are excluded from form data.

No Equipment / Bodyweight is exclusive to other equipment choices. It does
not change your membership answer: a gym member can choose bodyweight only.
Clearing the last equipment choice restores No Equipment. Other Equipment
reveals a custom text field; hidden text is retained but excluded from form data.
These interactions run locally and require JavaScript to be enabled.

Gym suggestions are partial starting lists: equipment varies by location.
The lists are stored in JavaScript and need no gym API or internet request.
Their sources and limitations are recorded in [DECISION_LOG.md](./DECISION_LOG.md).

The Generate workout button is intentionally disabled until JavaScript
workout generation is added.

The current page does not fetch exercises or display workout cards.
An internet connection will be needed when API integration is implemented.

## Project files

- [index.html](./index.html) contains the commented page structure and form.
- [styles.css](./styles.css) provides spacing and narrow-screen sizing for equipment and gym controls.
- [script.js](./script.js) manages equipment selections, gym suggestions, and custom fields.
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

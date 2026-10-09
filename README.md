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
Available Equipment when applicable, then one compact Estimated BMI section.
The ten goals and three experience levels are unchanged.

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

The opt-in Exercise library now fetches real exercise data. An internet
connection is required for browsing; workout generation remains disabled.

## Estimated BMI

The compact Estimated BMI section contains Age Category, Height, Weight,
Calculate BMI, and the result, in that order. The age options are mutually
exclusive: Under 20 or 20 and Older. Neither is assumed on first load.
Under 20 reveals an exact-age input in years, accepting 1 to less than 20
(including decimals such as 1.5). Switching to the adult option hides and
disables exact age without erasing it.

For Feet and Inches, two small native scrolling dropdowns share one compact
height area. Choose feet and inches, including 0 inches for an exact foot.
Centimeters replaces those dropdowns with one input in the same area. Valid
measurements convert when switching units. A fractional-inch option marked
"converted" is added when a centimeter height is not a whole inch, preserving
accuracy instead of rounding it to a standard dropdown choice.

The existing pounds/kilograms weight input, unit switching, and validation
are preserved. Height accepts 50–300 cm total; weight accepts 10–700 kg or
converted pounds. These are broad app input limits, not healthy-weight ranges.
Invalid or missing values are rejected; an invalid unit switch clears the
destination rather than reinterpreting the same number. Inactive height and
age fields are hidden, disabled, and excluded from form data.

Click **Calculate BMI**, or press Enter in a BMI input control. This never
submits or reloads the Workout Builder. Changing an input clears the previous
result until you calculate again. BMI is kilograms divided by meters squared,
displayed to one decimal place (175 cm and 70 kg gives 22.9).

For adults, categories use the unrounded result: below 18.5 Underweight;
18.5 to below 25 Healthy weight; 25 to below 30 Overweight; 30 or more Obesity.
A result can round to a boundary on screen while remaining below it.
For under-20 users, only numerical BMI is shown. Pediatric interpretation
requires age- and sex-specific growth charts; no percentile is invented.
For ages 1 to below 2, the result explains that standard BMI-for-age categories
do not apply and weight-for-length growth charts are typically used instead.

BMI is informational only, does not directly measure body fat, and is not used
alone to recommend workouts. This app neither stores nor transmits measurements
or age to APIs. Limitations: no age below 1, no pediatric percentile/chart engine,
and measurements must remain within the preserved input ranges above.

Sources: [CDC adult categories](https://www.cdc.gov/bmi/adult-calculator/bmi-categories.html),
[CDC about BMI](https://www.cdc.gov/bmi/about/),
[CDC pediatric screening](https://www.cdc.gov/growth-chart-training/hcp/using-bmi/screening-measure.html),
and [CDC guidance below age 2](https://www.cdc.gov/growth-chart-training/hcp/using-growth-charts/who-using.html).

## Project files

- [index.html](./index.html) contains the commented page structure and form.
- [styles.css](./styles.css) provides spacing and narrow-screen sizing for equipment, gym, and measurement controls.
- [script.js](./script.js) manages equipment, gyms, measurement validation, unit conversions, and local BMI.
- [exercise-api.js](./exercise-api.js) loads and displays real ExerciseDB records with guarded pagination and errors.
- [README.md](./README.md) explains the project and how to open it.
- [PROMPT_LOG.md](./PROMPT_LOG.md) records prompt summaries, corrections, approvals, and verified results.
- [CODE_EXPLAINED.md](./CODE_EXPLAINED.md) explains how the current code works.
- [DECISION_LOG.md](./DECISION_LOG.md) records implementation decisions and their reasons.

## ExerciseDB integration — checkpoint 5A

Open the collapsed **Exercise library**, optionally enter an exercise name,
and choose **Load exercises** (or Enter in the search field). Open an exercise
name for equipment, body parts, target/secondary muscles, and instructions.
Use **Next page** or **First page** to browse; changing the search term requires
a new load. Pagination stays attached to the last loaded search.

These records are browsing data, not exercise recommendations. They are not
matched to available equipment or experience yet. Do not assume a bodyweight
label means no support equipment: API instructions can require benches, bars,
or other supports. Quick Workout matching/generation belongs to checkpoint 5B;
weekly plans and per-day regeneration belong to 5C. Both await separate approval.

Verified live on 2026-10-08:
- Endpoint: [public exercises API](https://oss.exercisedb.dev/api/v1/exercises),
  HTTP 200 without a key, browser CORS allowed.
- Response: success, meta, data; 1,500 records reported at verification time.
- Default page size 10; limit accepts up to 25 (larger requested limits return 25).
- Forward pagination sends after=meta.nextCursor. A cursor parameter is ignored.
- Records have exerciseId, name, equipments, bodyParts, targetMuscles,
  secondaryMuscles, instructions arrays, and gifUrl. No difficulty, goal,
  sets, reps, or rest fields were present in the live records/schema.
- Official [API docs](https://oss.exercisedb.dev/docs) and
  [live OpenAPI schema](https://oss.exercisedb.dev/swagger) were checked.

GymBuddy requests only ten records at a time and never downloads the entire
catalog automatically. Loading disables request buttons and announces status.
Empty search results, missing fields, unusable/duplicate records, invalid JSON,
HTTP errors, offline/CORS failures, and a ten-second timeout get useful messages.
Retry uses Load exercises. A failed request retains the previously loaded page;
an actual empty result clears it. Missing fields say they were not supplied.
Missing pagination metadata disables Next rather than inventing a cursor.

Only limit, optional exercise name, and optional after cursor go to ExerciseDB.
No height, weight, age, BMI, goal, gym, equipment choices, cookies, credentials,
or page referrer are sent. There are no API keys, server proxy, stored exercise
cache, or fabricated production fallback records. Provider text is rendered as
plain text. GIFs are not loaded in this checkpoint; textual instructions are
available. API availability and data quality can vary.

Verification: 89 controlled API checks using a genuine captured response plus
explicit failure injection; live HTTP 200 display/next/first-page browser test;
228 BMI and 97 existing-feature regression checks. Desktop/mobile checked at
1280x800, 375x812, 320x568. Failure injections intentionally simulate service
errors; they are confined to test scripts outside this repository.

## Development process

- Preview changes before applying them and keep each step small.
- Include beginner-friendly comments and test each completed feature.
- Record actual work and results; do not invent approvals or test outcomes.
- Show the Git diff and wait for approval before committing.
- Use small commits with descriptive messages.
- Wait for separate approval before pushing to GitHub.

Repository: [GymBuddy on GitHub](https://github.com/barrin5514-ship-it/GymBuddy).

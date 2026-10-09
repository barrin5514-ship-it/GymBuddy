# MVP release verification — October 9, 2026

The user authorized final verification, commit, and a normal push to origin/main,
and reported that their manual verification of the limitation fix passed.
That manual result is user-reported, not an additional agent-run browser test.

Release preflight: local main and remote main both matched
0a4e63f57c1bc1bd739f832f2743c4d198c240c1. Reviewed the complete pending MVP diff
and untracked modules, tests, documentation and assets. A scan of all 26 project
files found no credential-pattern matches or generated caches/temporary artifacts.
The retained unused gym-hero.webp and its undocumented provenance are already
disclosed in assets/PHOTO-LICENSE.md; the application uses the licensed training-hero.jpg.

Fresh release checks passed: 16 API/error/cache checks, 219 generation/BMI/style/
layout checks, 128 MVP duration/media checks, and 200 duplicate/stretching/media
checks (563 total). All JavaScript/test files passed syntax checks. Git whitespace
checks passed. No application code was changed during release finalization.

Reused unchanged-code evidence from the movement audit below: 2,160 profiles,
51 controlled browser scenarios and 20 final live checks with 9 HTTP 200 responses.
No new live API test was run in this release step; the previous initial timeout
and successful retries remain documented. No current regression failed.

PROMPT_LOG.md and this verification report are included in the release staging
scope. Earlier “uncommitted/no push” statements describe their historical checkpoint.
The release commit and push are authorized after this preflight; their actual result
will be checked using Git after execution rather than asserted in advance here.
Conservative matching, bounded provider coverage, variable media availability and
potentially long recovery blocks remain the documented MVP limitations.

---

# Movement limitations audit — October 9, 2026

This audit is the latest verification. Earlier entries below remain historical.

## Reproduction and root causes

Reproduced the reported Advanced / Solo / 30-minute Quick Workout / knee restriction
using genuine previously captured ExerciseDB records and the pre-edit engine snapshot.
Unspecified fields were assumed: age 30, Auto style, general fitness, no equipment.
The same pool generated without the knee restriction. This does not claim recovery
of the user's exact unspecified selections.

The knee regex rejected every mention of “knee,” including the stationary starting
position in floor-crunch instructions. The remaining candidates were push-up
variants; movement-pattern diversity reduced them to one, below the two-movement
minimum. ID/name deduplication was not itself erroneous in that reproduction.

Separately confirmed: eligibility ran after deduplication, so an unsuitable record
could hide a suitable same-ID/name record. Supersets demanded four exercises even
though two form a complete pair. Conservative back/wrist/shoulder/balance rules
missed some explicit loading/support cues. A fresh live “glute bridge march” record
incorrectly survived the back filter despite hip/trunk-loading instructions.

## Changes

- A narrow knee-position exception for real record TFqbd8t (“crunch floor”) checks
  its ID, name, bodyweight equipment, abdominal target metadata, secondary muscles,
  and complete reviewed instruction text. Both inspected historical/current versions
  describe stationary knees and trunk motion. Name alone is insufficient. Unknown
  or changed instructions, missing instructions, or conflicting metadata are excluded.
  This classifies the described movement, not medical suitability for a knee injury.
- Filter eligibility before deduplicating main exercises, replacements, and provider
  cooldown stretches. Retain ID/name uniqueness and movement-pattern variety.
- Permit one complete superset pair. Retain the two-distinct-movement minimum, existing
  age/volume caps, sets/rest rules and honest duration accounting. Do not manufacture
  volume with duplicate movements or relax restrictions to fill a session.
- Exclude explicit spinal/trunk loading, bridge/extension/arching, hand/wall/shoulder
  support, wrist/palm/fist loading and dynamic/standing balance cues. Unknown
  restriction values fail closed, including in authored preparation guides.
- Wall-supported hip preparation now excludes wrist/shoulder limitations. Shoulder-blade
  glides specify seated performance instead of offering standing under balance restrictions.
- Insufficient results state the number of distinct movements in the fetched pool,
  retain restrictions, suggest another style or actually available equipment, and
  preserve the old plan. Recovery/empty-phase wording avoids unverified substitutes.

## Fresh test results

| Test category | Executed result |
| --- | --- |
| Controlled engine matrix | 17,604 assertions passed across 2,160 profiles: 774 generated; 1,386 intentionally insufficient |
| Weekly engine generation | 2,322 training-day selections verified within that matrix |
| Replacement candidates | 551 checked against every selected restriction and existing session identities |
| Controlled browser | 127 checks passed across 51 scenarios: 37 generated, 14 expected blocks, 24 replacements; no runtime errors |
| Existing regression suites | 16 API + 219 general/BMI/style + 128 MVP + 200 completion checks passed freshly during this audit |
| Final live browser | 20 checks passed; 9 real API requests, all HTTP 200; 200 real records; no runtime errors |
| Syntax / whitespace | Changed JavaScript parsed successfully; git diff --check passed |
| Manual browser interaction | Not performed; browser interactions were automated. A live desktop screenshot was visually reviewed |

Matrix coverage: all seven individual restrictions; knee+low-impact, knee+balance,
back+knee, shoulder+wrist, knee+wrist+balance; all ten styles; Beginner/Intermediate/
Advanced; 30/45/60-minute windows; bodyweight-only and dumbbell equipment profiles.
All successful profiles test Solo/Partner/Both preparation and cooldown filtering.
Tests include independent negative cases for changed instructions, conflicting
metadata, same-name unknown IDs, missing evidence and back/balance bridge exclusions.
The larger matrix verifies rule consistency; it is not clinical validation of every
provider exercise. Controlled browser scenarios cover every individual/combined
restriction in Quick and Weekly modes plus all experience/duration/stretch choices
for the reported knee case. UI blocks preserve prior results.

Controlled matrix/browser tests use genuine captured records; browser tests replace
the loader explicitly. Existing API failure suites inject errors and existing media
suites use test-only images. No fixture or mock is used by production.

Live: the first attempt failed on the provider's timeout, so it did not verify
generation. A retry passed; after final back/balance corrections, another fresh
live run also passed. Final live successes include knee Quick/Weekly/replacement,
30/45/60 minutes, Solo/Partner/Both, low-impact, wrist, balance, and knee+low-impact.
Back, shoulder, other, knee+balance, back+knee, shoulder+wrist and knee+wrist+balance
correctly blocked with explanations for this Auto/bodyweight profile. Those are
insufficient-match outcomes, not claims that a workout was generated.

## Remaining limitations

- Fetches remain bounded. An insufficient result does not prove the whole provider
  catalog lacks a match. Conservative rules can exclude potentially suitable options;
  unknown injuries remain blocked. No condition-specific medical clearance is offered.
- The reviewed knee exception deliberately rejects unreviewed provider instruction
  changes. Broadening it requires evidence, not just another exercise name.
- Fewer qualifying movements can mean a large rest/recovery share of a 45/60-minute
  window. The UI shows this explicitly; it does not promise continuous exercise.
- Provider availability/media vary. The initial live timeout is recorded rather than
  hidden; final live availability is a point-in-time result.

## Scope, reproduction, Git

Modified this task: workout-engine.js, stretching.js, workout-ui.js, VERIFICATION.md,
PROMPT_LOG.md. Added tests/limitations.cjs, tests/limitations-browser.cjs,
tests/limitations-live.cjs. No redesign or asset changes. Existing BMI script.js,
ExerciseDB transport, media module, index.html and styles.css were not edited in
this task; their earlier local changes remain preserved.

Set GYMBUDDY_LIMITATION_FIXTURE to a genuine captured ExerciseDB JSON array and
PLAYWRIGHT_MODULE to the installed Playwright module. Run node tests/limitations.cjs
and node tests/limitations-browser.cjs. With the existing preview on port 8879,
node tests/limitations-live.cjs uses the actual service. GYMBUDDY_URL overrides the
preview address. Live reports/captured records are saved in TEMP.

The working tree was already dirty. It still contains modified tracked files and
untracked presentation assets/modules/tests. No reset, discard, commit or push.

---

# Current completion verification — October 9, 2026

This section supersedes earlier status summaries below, which are retained as history.

## Fresh live checks

- Quick Workout, seven-day Weekly Plan, single-exercise replacement, and equipment
  matching passed against ExerciseDB with no interception (`tests/live.cjs`).
- 13 actual API calls returned HTTP 200; 294 genuine records; no runtime errors.
- Observed D9qe7CM and vpleANJ sharing the name “pelvic tilt into bridge,” confirming
  why ID-only deduplication was insufficient. Their identities remain separate.
- Dedicated live media check using D9qe7CM, vpleANJ, TFqbd8t: two exact-ID GIFs
  loaded (HTTP 200); one record had no usable media and displayed fallback text.
  The first workout run's lazy-media snapshot reported zero loaded; that snapshot
  did not scroll unloaded placeholders, so the dedicated check supplies media evidence.
- Live availability is verified for this run, not guaranteed for future provider calls.

## Fresh controlled checks — 574 passed

- 16 API failure/cache/validation checks (`tests/api-failures.cjs`).
- 219 existing generation, styles, age, equipment, weekly/replacement, BMI,
  responsive layout, photo-loading and error-preservation checks (`tests/verify.cjs`).
- 128 duration, limitation, media and layout checks (`tests/mvp.cjs`).
- 200 ID/name deduplication, movement-pattern variety, replacement, all-style phase
  accounting, stretching preferences/limitations and shared-media checks
  (`tests/completion.cjs`). Uses bounded query pools of genuine historical records;
  duplicate-name mutations reproduce the observed live issue. Test-only GIF responses
  are synthetic 1px images, never production demonstrations.
- 11 stretching selection/rendering checks using freshly captured real records
  (`tests/stretch-ui.cjs`): all three choices, warm-up cards, expanded cooldown
  instructions and desktop/mobile width checks. The loader is explicitly replaced
  for this controlled test; it does not certify live API availability.
- Desktop/mobile screenshots reviewed, including expanded stretch instructions.
  Original `script.js` has no diff; existing BMI calculations remain preserved.
- JavaScript syntax and Git diff whitespace checks passed.

Test corrections: cached stretch results meant the failure test needed an uncached
isometric query to trigger its intended simulated 503. Media assertions now target
main exercise cards and wait for lazy loading. Session durations are estimates:
the test checks all phase totals and the requested minimum rather than claiming an
exact timer. A new test caught the engine's missing explicit Solo default; fixed
and all 200 focused assertions then passed. Large whole-dataset test pools were
replaced with production-sized bounded query pools to avoid redundant slow runs.

## Limits and preserved work

- Existing layout, licensed local gym photograph, original BMI/equipment controls,
  meal-plan placeholder, stack and local changes are preserved.
- Local GymBuddy warm-up/partner guides are labeled coaching, not fabricated
  ExerciseDB records. They provide written instructions and an honest missing-demo
  fallback. Matching is conservative, not medical clearance; some combinations
  have no suitable alternatives. No partner movement is selected without opt-in.
- API outages still prevent new uncached generation; existing plans are preserved.
- Prompt-log recovery includes accessible recent VS Code-origin and desktop work,
  not every historical interaction. No exact duplicate sections found. No automatic
  project logger found or installed. See PROMPT_LOG.md for source identifiers/gaps.
- PROMPT_LOG.md is tracked. Remote main remains 0a4e63f57c1bc1bd739f832f2743c4d198c240c1.
  Current changes are local; no commit or push was made.

To reproduce additional checks after setting the fixture/Playwright environment
variables documented below, run `node tests/completion.cjs`. With the local preview
on port 8879, run `node tests/live.cjs`, then `node tests/live-media.cjs` and
`node tests/stretch-ui.cjs`; the latter two read the live-record capture in TEMP.

---

# Final MVP verification — October 8, 2026

## Live browser tests — passed

No API interception or historical data was used in `tests/live.cjs`.
- Quick Workout, Weekly Plan (seven days), individual exercise replacement, and equipment-appropriate dumbbell/bodyweight generation passed.
- 11 browser API requests returned HTTP 200; 247 genuine exercise records received. Only query terms and cursors were sent. Session cache served repeated searches.
- Initial quick-workout IDs: I4hDWkc, u0cNiij, TFqbd8t, NCmbLCw. Replacement changed exactly one exercise ID.
- Two exact-ID GIFs loaded. Two unavailable media files displayed the clean fallback, with text instructions retained. No JavaScript runtime errors.
- DNS resolved to 172.67.128.217 and 104.21.2.66; HTTP response included Access-Control-Allow-Origin: *. Browser fetch from the local app succeeded.

## Diagnosis and minimal fix

The endpoint and response schema were correct. Previous observed code 1015 means upstream rate limiting; 1102 means the provider's Cloudflare Worker exceeded CPU or memory limits. Which resource was exhausted cannot be determined without provider logs. The current provider has recovered; this is not a claim that client code repaired its servers.

Official error references:
https://developers.cloudflare.com/support/troubleshooting/http-status-codes/cloudflare-1xxx-errors/error-1015/
https://developers.cloudflare.com/support/troubleshooting/http-status-codes/cloudflare-1xxx-errors/error-1102/

The client now distinguishes these errors, honors Retry-After, keeps cached successful searches usable during cooldown, and avoids automatic retry storms. Ten-second request timeouts, bounded pagination, manual retry, and preservation of existing workouts remain. No endpoint replacement or paid service.

## Controlled tests — executed again on this implementation

- 219 existing engine/browser assertions passed: all styles, quick/weekly generation, replacement, day preservation, all 127 weekly schedules, age safeguards, equipment/gym controls, BMI calculations/conversions, and responsive layouts.
- 128 new MVP assertions passed: every style at 30/45/60 minutes, time accounting, volume caps, complete superset pairs, exact duration options, accessible limitation disclosure, retained selections and filtering, exact-ID/lazy media, replacement media updates, URL validation, and missing/broken media fallback. Widths: 1280, 375, 320 pixels.
- 16 API failure/cache assertions passed, covering HTTP errors, 1015/1102, Retry-After cooldown, usable cache during outages, timeout, invalid JSON/envelope, duplicates, empty records, pagination, and network failure.
- Controlled fixtures are genuine historical ExerciseDB records; the media test uses a clearly test-only 1-pixel GIF. None is shipped as production exercise data.
- A separate console check observed a transient ERR_CONNECTION_RESET for the local preview hero image; the same unchanged file decoded successfully on a fresh loopback preview at port 8879. The earlier Python preview had intermittent connection resets. GIFs now show loading text and a 12-second visible-image fallback deadline.
- Additional targeted media check passed: visible loading message, 12-second hung-image fallback, no JavaScript runtime errors, and preserved hero decoding on the fresh preview.
- The preserved hero image decoded at 1920px and was visually checked; no change to the photograph or original BMI `script.js`.

## Reproduce

Use the environment variables and fixture setup described in the historical section below. Start the local app with `py -m http.server 8878 --bind 127.0.0.1`.

```powershell
node tests/api-failures.cjs
node tests/verify.cjs
node tests/mvp.cjs
node tests/live.cjs
```

`mvp.cjs` and `live.cjs` use GYMBUDDY_URL if set, otherwise http://127.0.0.1:8878. `live.cjs` makes real upstream requests; do not run repeatedly during rate limits. Its report, genuine response records, and screenshot are written to the temporary folder. Historical fixtures stay outside the production app.

## Remaining limitations

No current blocker to live generation was observed. Upstream availability can change; some GIFs remain unavailable and fall back correctly. Duration estimates include an explicit easy-movement block and depend on pace. No medical-safety guarantee is made. No commits or pushes performed.

---

# Historical verification (earlier checkpoint)

# Verification — October 8, 2026

230 assertions passed: 219 engine/browser assertions and 11 API failure/cache checks.

- Quick and weekly generation with genuine historical ExerciseDB records.
- Each of the ten style options, including Auto, through the browser controls.
- Individual replacement changes only one exercise; day regeneration preserves other days.
- Recovery spacing for all 127 non-empty weekly day selections, including Sunday/Monday.
- Under-13 activity guidance without API calls; supervision requirement; teen bodyweight adaptation; no age-only downgrade for older adults.
- Goal/style conflict adaptation, confirmed equipment, hidden bench requirements, limitation filters, equipment exclusivity, and retained gym selections.
- Adult BMI at 175 cm / 70 kg = 22.9, imperial conversion preservation, pediatric and under-2 interpretation, invalid measurement rejection.
- 1440px, 375px, and 320px widths without horizontal overflow. Desktop and mobile screenshots visually reviewed; locally saved 1920px photograph decoded successfully.
- No browser runtime errors. Public Exercise Library removed; ten style options present.
- HTTP 401/429/503, offline, timeout, invalid JSON, invalid envelope, empty response, malformed/duplicate records, repeating pagination cursor, session cache reuse, retry, and preservation of existing results after failure.

## Important distinction

Browser generation tests intercepted ExerciseDB requests using a genuine historical 1,500-record dataset. Pagination was simulated with those genuine records. This validates local logic, rendering, and error handling; it does **not** certify current live API availability or current provider dataset coverage. No test fixture is used as production data.

The live endpoint returned HTTP 200 initially, then rate-limit error 1015 and upstream error 1102. End-to-end **live** generation remains unverified pending provider recovery. The application reports service errors without manufacturing a workout.

## Reproduce

Requires Node.js and Playwright with Chromium available. Keep the historical fixture outside the project; download it from:
https://raw.githubusercontent.com/bootstrapping-lab/exercisedb-api/main/src/data/exercises.json

From PowerShell in GymBuddy:

```powershell
$env:GYMBUDDY_FIXTURE = 'C:\path\to\provider-fixture.json'
# If Playwright is not resolvable from this folder, set its installed module path:
$env:PLAYWRIGHT_MODULE = 'C:\path\to\node_modules\playwright'
node tests/api-failures.cjs
node tests/verify.cjs
```

The browser test starts a loopback-only server on port 8876 and closes it when done. Screenshots go to the Windows temporary folder. Network failures are explicitly injected by tests, never by production code.

No commits or pushes were made.

# GymBuddy Prompt Log

Entries below summarize the conversation; they are not verbatim prompts.
Approvals, completed work, and test results are recorded separately.

## 2026-10-07 — Initial request and inspection

- Request summary: Build a beginner-friendly GymBuddy workout generator
  for Next Chapter Week 4 using HTML, CSS, vanilla JavaScript, and ExerciseDB.
- Initial scope: Inspect the project and propose a structure and plan.
  Do not create or modify files before approval.
- Inspection found an empty project directory with no Git repository.
- A structure and development plan were proposed. No project files were created.

## 2026-10-07 — Codex error #1: premature approval claim

- The earlier proposed prompt log incorrectly stated that the plan had
  already been approved.
- The user corrected this: that approval had not happened yet.
- This was an error in the proposed log text; the proposed file had not
  been written to the project.
- Correction: Remove the premature approval claim and record approval only
  for the specific work the user explicitly authorizes.

## 2026-10-07 — Read-only API verification

- The exercises endpoint returned HTTP 200 with exercise data.
- Observed fields included exerciseId, name, gifUrl, bodyParts, equipments,
  targetMuscles, secondaryMuscles, and instructions.
- A request with Origin http://localhost:8000 returned
  Access-Control-Allow-Origin: *. This was a response-header check,
  not a completed local-app integration test.
- The documentation specifies a maximum page size of 25. Browser testing
  confirmed that the after parameter advances to a different page.
- One demonstration GIF loaded in the browser at 180 by 180 pixels.
- No goal, difficulty, sets, or reps fields were observed.
- These checks verified the API separately; workout generation is not built.

## 2026-10-07 — Current starter authorization and work

- Request summary: Establish version 0.1, configure the supplied GitHub
  repository as origin, preserve existing files and history, and build
  toward My Profile, Workout Builder, Nutrition & Meal Plans, and
  AI Personal Trainer. Only Workout Builder needs to function for the presentation.
- Explicit authorization in this request: Create index.html, README.md,
  and PROMPT_LOG.md; add beginner-friendly HTML comments; test the form;
  review the diff; update this log; and report results.
- Commit approval: Not granted. Wait for the user's review and approval.
- Push approval: Not granted. Do not push.
- Git setup checks: The local folder was still empty and was not a Git
  repository. A successful git ls-remote check reported no remote branches.
- Git setup completed: Initialized main and configured origin as
  https://github.com/barrin5514-ship-it/GymBuddy.git.
- Setup environment: Git configuration needed permission outside the
  sandbox. A trust exception limited to this command and project resolved
  the Windows ownership mismatch; no global Git setting was changed.
- Starter files created: Commented HTML form, project README, and this log.
- The form contains goal, experience, and equipment selectors. Generation
  remains disabled until its implementation.
- CODE_EXPLAINED.md and DECISION_LOG.md are requested documentation for
  later steps; they are not part of this three-file starter change.
- Initial HTML testing completed in the integrated browser using the local
  file URL. Sixteen checks passed for the title, three labeled selectors,
  default values, all nine options, disabled button, and empty results area.
- The first keyboard test used ArrowDown, Enter, then Tab and failed the
  expected-focus assertion. Re-running with ArrowDown and Tab passed;
  no HTML changes were made to obtain the passing result.
- Ten subsequent keyboard and label checks passed: Labels focused their
  selectors, arrow keys changed choices, Tab followed the expected order
  and skipped the disabled button, and interactions did not navigate away.
- Reload monitoring found no console errors, page errors, or failed requests.
  Only the local HTML file was requested; there are no scripts, stylesheets,
  images, or exercise API requests in this starter.
- Reviewed the full new-file Git diffs and completed a separate read-only
  review of the HTML and documentation. No blocking findings were reported.
- At the end of the starter step, Git status confirmed main had no commits
  and only the three intended new files were present. Origin matched the
  supplied repository URL.
- Current limitation: This is a static form; API integration, styling,
  workout generation, and the other app areas remain to be implemented.
- No commits or pushes had been made by Codex at the end of that step.

## 2026-10-07 — Initial commit approved

- User message (verbatim): "commit approved".
- Authorized action: Commit the reviewed starter files locally.
- Approved commit message: Add initial GymBuddy form and project notes.
- This log update records the approval and clarifies the previous Git
  status as historical. The HTML and README are unchanged from review.
- The previously recorded browser test results apply to the unchanged
  HTML. No new feature tests were run for this documentation-only update.
- Push approval: Not granted. Do not push to GitHub.

## 2026-10-07 — Expand workout preferences: fitness goals stage

- Instructions received (summary): Expand the goal dropdown to ten choices;
  retain the experience levels; add multiple equipment selections with
  exclusive No Equipment and custom Other Equipment; add optional gym
  selections with editable equipment suggestions; and add validated height,
  weight, unit conversions, and an informational adult BMI calculator.
- The user specified that BMI must not determine workout recommendations,
  all calculations must stay local, and workout generation must remain disabled.
- Requested testing covers each stage's inputs, validation, conversions,
  BMI accuracy/categories, keyboard access, mobile layout, console errors,
  and preservation of existing behavior. Later-stage tests will be run only
  when those features have been implemented.
- Work must proceed in separate goal, equipment, gym, and measurement/BMI
  stages, with tests, diff review, and explicit commit approval for each.
  The next stage must wait until the preceding commit is approved and made.
- Pre-change checks: Confirmed starter commit be6f647 with message
  "Add initial GymBuddy form and project notes" and a clean working tree.
- This stage implements only the ten requested fitness goals, in the
  requested order, with General Fitness first/default. Existing values
  general-fitness, muscle, and strength are preserved.
- Added one HTML comment explaining default selection and option values.
  Experience levels, the current equipment dropdown, and the disabled
  Generate workout button are unchanged.
- README remains accurate for this small change and was not edited.
- Browser option/regression testing: All 26 checks passed, including exact
  goal labels/order/values, the default goal, selection of all ten goals,
  all three experience levels, the existing equipment choices, the disabled
  Generate workout button, empty results, and the unchanged page title.
- Keyboard testing: All 14 checks passed. The goal label focuses its
  selector, Home and ArrowDown reach every goal, and Tab continues through
  experience and equipment to the attribution link, skipping the disabled button.
- Layout checks passed at 1280 by 800, 375 by 812, and 320 by 568 pixels:
  every selector was visible and within the viewport, with no horizontal overflow.
- Reload monitoring found no console errors, page errors, or failed requests.
  Only the local HTML file was requested. General Fitness remained selected
  and Generate workout remained disabled after reload.
- Reviewed the Git diff: Only the goal options/comment and this log changed.
  git diff --check reported no whitespace errors.
- Mistakes encountered in this stage: None identified. No corrective code
  changes were needed after testing.
- Commit approval for this stage: Not granted. Await the user's review.
- Push approval: Not granted. Do not push to GitHub.

## 2026-10-08 — Fitness goals commit approved

- User message (verbatim): "commit".
- Authorized action: Commit the reviewed fitness-goal stage locally with
  message "Expand fitness goal options".
- The HTML diff is unchanged from the tested and reviewed version.
  This log entry records the approval; no new feature tests were needed.
- The earlier staged plan permits proceeding to equipment after this commit.
  The equipment stage will require its own review and commit approval.
- Push approval: Not granted. Do not push to GitHub.

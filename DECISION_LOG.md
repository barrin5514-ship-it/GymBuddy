# GymBuddy Decision Log

This file records implementation choices and their reasons.
Entries describe decisions at that stage; the layout correction at the end
supersedes the earlier membership-checkbox design.

## 2026-10-08 — Equipment preference controls

- **Use native checkboxes.** Users can see and select several equipment
  types without learning the keyboard shortcuts of a multi-select dropdown.
  A fieldset, legend, and labels provide the group structure.
- **Keep No Equipment exclusive.** Selecting it clears the other boxes.
  Selecting another box clears it. Removing the final equipment selection
  restores it, so the form always describes an available-equipment choice.
- **Show custom details only when relevant.** Other Equipment reveals a
  text field. Hiding the field retains the text but disables the input,
  excluding it from focus and form data. Checking Other again restores it.
- **Use small local files.** Plain JavaScript handles the selection rules;
  a small stylesheet handles checkbox spacing and narrow-screen sizing.
  No dependencies, external requests, or saved preference storage were added.
- **Keep equipment identifiers separate from API matching.** Choices such
  as Gym Membership describe preferences rather than exact API equipment labels.
  No Equipment also cannot mean every API exercise labeled bodyweight.
- **Keep the agreed stage boundaries.** Gym Membership is selectable now,
  while gym dropdowns and equipment suggestions belong to the next stage.
  Measurements, BMI, and workout generation are outside this equipment change.
- **Keep Generate workout disabled.** Selecting preferences must not imply
  that workout generation is already implemented.

## 2026-10-08 — Gym membership options

- **Offer suggestions before selecting equipment.** A named gym displays
  a starting list. The user clicks Add suggested equipment to select those
  items, then adjusts the normal checkboxes. Changing gyms does not silently
  replace choices, and adding suggestions preserves existing selections.
- **Let Other Gym remain manual.** Show a name field and let users describe
  available equipment themselves, including the existing Other Equipment field.
- **Hide and disable inactive fields.** Unchecking Gym Membership excludes
  gym details from form data and keyboard focus while retaining entered text.
  Selecting No Equipment continues to clear the Gym Membership checkbox.
- **Keep everything local.** The app uses static suggestion arrays, no gym
  API, no geolocation, no accounts, and no external requests for this feature.
- **Keep presets partial and editable.** They are a starting subset of the
  app's equipment categories, not a complete or verified location inventory.
  The interface tells users to confirm their location's equipment.

### Preset choices and sources

Reviewed on October 8, 2026. These mappings are implementation choices
informed by the following official descriptions; availability varies.

| Gym | Starting suggestions | Source |
| --- | --- | --- |
| Planet Fitness | Dumbbells, Weight Bench, Cardio Equipment | [Club equipment overview](https://www.planetfitness.com/our-clubs) lists free weights, Fitbench, and cardio equipment. |
| LA Fitness | Dumbbells, Barbells and Weight Plates, Weight Bench, Cardio Equipment | [Equipment overview](https://welcome.lafitness.com/equipment/) describes dumbbells, barbells, benches, and cardio machines. |
| Crunch Fitness | Dumbbells, Barbells and Weight Plates, Kettlebells, Cardio Equipment | [Class equipment](https://www.crunch.com/thehub/push-the-perimeter/) and [example club offerings](https://info.crunch.com/founding500-monroe-0) inform this partial list; the example club is not a guarantee for other locations. |

## 2026-10-08 — Correct Stage 3 membership layout

- **Separate membership from equipment.** The user requires the order Goal,
  Experience, Gym Membership, then conditional Available Equipment. Use native
  Yes/No radios after Experience and remove the membership equipment checkbox.
- **Default to No.** This preserves the starter's visible equipment checklist.
  Yes reveals the four requested gym choices; equipment appears after selection.
- **Reuse the existing checklist and presets.** Keep all ten non-membership
  choices, the suggestion lists and Add button, and both custom text fields.
  Radio or gym changes preserve choices rather than replacing the form.
- **Keep bodyweight independent of membership.** No Equipment remains exclusive
  to other equipment boxes, but a gym member can still select bodyweight only.
- **Exclude hidden data.** Disable hidden gym inputs and the equipment fieldset
  while Yes has no gym selection. Retain values for switching back.
- **Do not expand scope.** Height, weight, BMI, and generation remain future work.

## 2026-10-08 — Stage 4 Part A: collapsible equipment

- **Reuse the checklist inside native details/summary.** Start closed and
  keep the existing checkboxes, custom text, and selection rules. Native
  Enter/Space behavior avoids implementing a custom keyboard widget.
- **Summarize active choices.** Show the single equipment name or a count;
  refresh it for manual choices and the existing gym-suggestion Add action.
- **Keep collapse separate from applicability.** Closing the dropdown must
  not disable active equipment or remove it from form data. The membership
  rules still hide and disable equipment until a gym is chosen when needed.
- **Support Escape and narrow screens.** Escape closes and restores summary
  focus. Scoped styling gives the header a 44-pixel minimum height and wraps text.
- **Keep the requested commit boundary.** Part B measurements and BMI will
  wait for approval and completion of the Part A commit. No generation logic.


## 2026-10-08 — Stage 4 Part B: local measurements and informational BMI

- **Preserve form order and existing behavior.** Append measurements and BMI
  after the equipment dropdown. Generation remains disabled.
- **Use explicit independent unit selectors.** Default to feet/inches and pounds;
  support centimeters and kilograms. Inches may be fractional; feet are whole.
- **Keep conversion precision in metric values.** Store current meters and
  kilograms in memory and convert from them on switches. Round only converted
  height controls; keep full converted weight precision at validity boundaries.
- **Validate before displaying BMI.** Require all active fields. Reject missing,
  nonnumeric, nonfinite, zero/negative totals, invalid feet/inches, and values
  outside height 50–300 cm or weight 10–700 kg. These broad app guardrails reduce
  accidental entries, are disclosed on the form, and are not clinical cutoffs.
  Invalid unit switches clear destination fields and do not reinterpret a number.
- **Keep adult interpretation optional.** Require confirmation of age 20+ before
  showing the standard adult category. No birthdate or child/teen classification.
  Apply 18.5/25/30 thresholds to unrounded BMI, display one decimal, and explain
  that rounding can visually cross a category boundary.
- **Use local calculation only.** No API request, browser storage, recommendation,
  or workout decision uses these measurements. BMI does not directly measure
  body fat and is informational, not a health diagnosis.
- **Use accessible native inputs.** Labels, linked errors, aria-invalid, native
  keyboard controls, and a polite status result support use without a mouse.
  Disable and hide inactive height inputs; scoped CSS preserves hidden on flex.
- Sources: [CDC adult BMI categories](https://www.cdc.gov/bmi/adult-calculator/bmi-categories.html)
  and [CDC about BMI](https://www.cdc.gov/bmi/about/), reviewed 2026-10-08.
- **Maintain the approval boundary.** Part B is left uncommitted for user review.


## 2026-10-08 — Part B UI corrections requested after review

These decisions supersede the initial Part B interface decisions above.

- **One compact Estimated BMI group.** Move age, height, preserved weight,
  calculation, and result into one borderless fieldset in that order. Reduce
  outer spacing; no unrelated redesign or nested cards.
- **Replace the checkbox with two exclusive age choices.** Under 20 requires
  exact age from 1 to below 20 years (decimals allowed); 20 and Older needs no
  exact age. Require a deliberate category choice instead of assuming adult.
- **Respect pediatric limits.** Show numerical BMI without adult categories.
  Explain age/sex growth charts and, under age 2, that standard BMI-for-age
  categories do not apply. No sex collection, chart download, or invented
  percentiles; numerical BMI is not a pediatric health classification.
- **Use paired native height dropdowns.** Feet and inches share a compact area;
  centimeters replaces them in the same area. Retain exact metric values and
  add a converted fractional-inch option as needed for accurate unit switching.
- **Preserve working weight controls.** Keep pounds/kilograms input, unit
  conversion, original validation, and 44px dimensions. Only outer spacing changes.
  Preserved app measurement limits remain 50–300 cm and 10–700 kg; therefore
  some smaller children's measurements are outside the accepted calculator range.
- **Calculate on request.** A type=button Calculate BMI action and scoped Enter
  handling prevent page submission/reload. Clear stale results after input edits.
  Keep one-decimal display and unrounded adult category thresholds.
- **Keep data local and informational.** No API transmission, storage, or workout
  recommendation logic. All existing preference/equipment features are preserved.
- Pediatric sources: [CDC BMI screening](https://www.cdc.gov/growth-chart-training/hcp/using-bmi/screening-measure.html)
  and [CDC growth-chart guidance below 2](https://www.cdc.gov/growth-chart-training/hcp/using-growth-charts/who-using.html),
  reviewed 2026-10-08.
- No commit or push until user approval. Suggested message remains
  "Refine BMI interface and height controls".

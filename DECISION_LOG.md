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

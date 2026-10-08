# GymBuddy Decision Log

This file records implementation choices and their reasons.

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

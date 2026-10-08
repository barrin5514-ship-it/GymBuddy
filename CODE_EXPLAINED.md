# GymBuddy Code Explained

This guide describes the current preference form. Workout generation,
measurements, and BMI are not implemented yet.

## HTML: the page and its controls

[index.html](./index.html) contains the page header, preference form,
empty workout results area, and exercise-data attribution.

- A `select` shows a dropdown for goals or experience. The first option
  is the default; each option's `value` identifies the selected choice.
- A separate Gym Membership fieldset follows Experience Level. Its Yes/No
  radios share a name, so selecting one automatically deselects the other.
  No is the default; membership is no longer an equipment checkbox.
- The equipment `fieldset` groups related checkboxes. Its `legend` names
  the group, and each label makes its checkbox easier to identify and click.
- Inside it, `details` and `summary` provide a native collapsible dropdown.
  Omitting the `open` attribute makes it start closed; Enter/Space toggles it.
- Checkboxes share `name="equipment"` because they belong to the same group.
  Unlike a dropdown, several of these boxes can be checked at once.
- The Other Equipment text field starts hidden and disabled. `hidden`
  hides its container; `disabled` excludes the input from focus and form data.
- The Generate workout button remains disabled until generation is built.
- The script's `defer` attribute waits for the HTML to be ready before
  JavaScript looks up the controls.

## CSS: small layout adjustments

[styles.css](./styles.css) spaces the checkbox labels into separate rows.
Clicking anywhere on a label toggles its checkbox. The fieldset can shrink
on narrow screens, and the custom text field never exceeds its container.
The rest of the page keeps its existing appearance and browser focus indicators.

## JavaScript: keeping equipment choices consistent

[script.js](./script.js) stores references to the equipment controls using
`querySelector` and `querySelectorAll`.

`updateEquipmentSelection` runs when a checkbox changes:

1. If No Equipment was just checked, clear all other equipment boxes.
2. Use `some()` to check whether any other box is checked. If none are,
   check No Equipment; otherwise, uncheck it. The `!` symbol means "not".
3. Update the dropdown summary with one selected name or a selection count.
4. Update gym and equipment visibility to match the membership answer and gym choice.
   Show and enable custom equipment text only when that choice is visible and checked.

The function also runs once when the page opens to synchronize the controls.
The `change` event works for mouse and keyboard use. Hiding custom details
does not erase their text, but the disabled field is not included in form data.

The script does not fetch data, save preferences, or generate workouts.
Equipment values are app identifiers; future API matching must account
for the API's actual labels and any additional equipment an exercise needs.

## Gym membership and suggestions

`gymEquipmentSuggestions` is a JavaScript object containing a small array
of equipment values for each named gym. These are local suggestions and
are not a live inventory of any location.

`updateGymDetails` keeps the membership question visible and shows gym details
only for Yes. It shows the shared equipment selector for No, or for Yes after
a gym is chosen. Hidden inputs are disabled to exclude inactive values from
form data while preserving the user's entries for later.

When a named gym is selected, it builds a suggested list with the same text
as the equipment labels. `textContent` adds plain text to each list item;
`replaceChildren()` clears the old list before rebuilding it.

The **Add suggested equipment** button checks the matching equipment boxes
while preserving everything the user already selected. It then synchronizes
No Equipment and the conditional fields. A `role="status"` message announces
the update without moving keyboard focus.

Selecting Other Gym shows its name field and no suggested list. Hidden
custom fields keep their text but are disabled, so unused details are not
included in form data. Changing gyms never automatically changes equipment.
The user can adjust the equipment checkboxes whenever the checklist is shown.
No Equipment only affects equipment checkboxes, so it never changes the
separate Yes/No answer or hides an already selected gym.

## Collapsing the equipment checklist

Closing the dropdown only changes what is visible. Its checked inputs and
active custom text still belong to the form; they are not disabled just
because the dropdown is closed. The existing conditional rules still disable
equipment when membership is Yes without a selected gym.

The Escape key closes an open dropdown and moves focus to its summary.
When the equipment section becomes inapplicable, JavaScript also closes the
dropdown so it returns compactly when shown again. Adding gym suggestions
updates the summary even when the dropdown stays closed.

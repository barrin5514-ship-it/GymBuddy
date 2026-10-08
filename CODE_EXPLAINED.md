# GymBuddy Code Explained

This guide describes the current preference form. Workout generation,
gym suggestions, measurements, and BMI are not implemented yet.

## HTML: the page and its controls

[index.html](./index.html) contains the page header, preference form,
empty workout results area, and exercise-data attribution.

- A `select` shows a dropdown for goals or experience. The first option
  is the default; each option's `value` identifies the selected choice.
- The equipment `fieldset` groups related checkboxes. Its `legend` names
  the group, and each label makes its checkbox easier to identify and click.
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
3. Show and enable the custom text field only when Other Equipment is checked.

The function also runs once when the page opens to synchronize the controls.
The `change` event works for mouse and keyboard use. Hiding custom details
does not erase their text, but the disabled field is not included in form data.

The script does not fetch data, save preferences, or generate workouts.
Equipment values are app identifiers; future API matching must account
for the API's actual labels and any additional equipment an exercise needs.

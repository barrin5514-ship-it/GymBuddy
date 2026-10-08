// Find the equipment controls once so the rest of the code can use clear names.
const equipmentGroup = document.querySelector("#equipment-options");
const equipmentCheckboxes = equipmentGroup.querySelectorAll('input[name="equipment"]');
const noEquipment = document.querySelector("#equipment-none");
const otherEquipment = document.querySelector("#equipment-other");
const otherEquipmentDetails = document.querySelector("#other-equipment-details");
const otherEquipmentInput = document.querySelector("#other-equipment");

function updateEquipmentSelection(changedCheckbox) {
  // Choosing No Equipment clears every other choice, including Gym Membership.
  if (changedCheckbox === noEquipment && noEquipment.checked) {
    equipmentCheckboxes.forEach((checkbox) => {
      if (checkbox !== noEquipment) {
        checkbox.checked = false;
      }
    });
  }

  // some() is true if at least one equipment choice is checked.
  // If none are checked, restore No Equipment rather than leaving an empty choice.
  const hasEquipment = Array.from(equipmentCheckboxes).some((checkbox) => {
    return checkbox !== noEquipment && checkbox.checked;
  });
  noEquipment.checked = !hasEquipment;

  // Keep typed details when hiding them, but exclude the disabled input from form data.
  otherEquipmentDetails.hidden = !otherEquipment.checked;
  otherEquipmentInput.disabled = !otherEquipment.checked;
}

// The change event works with both mouse clicks and keyboard selection.
equipmentCheckboxes.forEach((checkbox) => {
  checkbox.addEventListener("change", () => {
    updateEquipmentSelection(checkbox);
  });
});

// Synchronize the controls when the page first opens, including restored selections.
updateEquipmentSelection();

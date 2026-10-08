// Find the equipment controls once so the rest of the code can use clear names.
const equipmentGroup = document.querySelector("#equipment-options");
const equipmentCheckboxes = equipmentGroup.querySelectorAll('input[name="equipment"]');
const noEquipment = document.querySelector("#equipment-none");
const otherEquipment = document.querySelector("#equipment-other");
const otherEquipmentDetails = document.querySelector("#other-equipment-details");
const otherEquipmentInput = document.querySelector("#other-equipment");

const gymMembershipYes = document.querySelector("#gym-membership-yes");
const gymMembershipChoices = document.querySelectorAll('input[name="gym-membership"]');
const gymDetails = document.querySelector("#gym-membership-details");
const gymSelect = document.querySelector("#gym");
const otherGymDetails = document.querySelector("#other-gym-details");
const otherGymName = document.querySelector("#other-gym-name");
const gymSuggestions = document.querySelector("#gym-suggestions");
const gymEquipmentList = document.querySelector("#gym-equipment-list");
const addGymEquipment = document.querySelector("#add-gym-equipment");
const gymStatus = document.querySelector("#gym-status");

// These local starting lists are suggestions, not guarantees about a location.
// Sources and the reasons for these choices are recorded in DECISION_LOG.md.
const gymEquipmentSuggestions = {
  "planet-fitness": ["dumbbell", "weight-bench", "cardio-equipment"],
  "la-fitness": ["dumbbell", "barbell", "weight-bench", "cardio-equipment"],
  "crunch-fitness": ["dumbbell", "barbell", "kettlebell", "cardio-equipment"]
};

function updateEquipmentSelection(changedCheckbox) {
  // No Equipment clears the other equipment choices, but not the membership answer.
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

  updateGymDetails();
}

function updateGymDetails() {
  // Membership is separate from equipment, so a gym member can choose bodyweight only.
  const hasMembership = gymMembershipYes.checked;
  gymDetails.hidden = !hasMembership;
  gymSelect.disabled = !hasMembership;

  // With Yes, wait for a gym choice before showing the shared equipment checklist.
  const showEquipment = !hasMembership || gymSelect.value !== "";
  equipmentGroup.hidden = !showEquipment;
  equipmentGroup.disabled = !showEquipment;
  otherEquipmentDetails.hidden = !showEquipment || !otherEquipment.checked;
  otherEquipmentInput.disabled = !showEquipment || !otherEquipment.checked;

  const isOtherGym = hasMembership && gymSelect.value === "other";
  otherGymDetails.hidden = !isOtherGym;
  otherGymName.disabled = !isOtherGym;

  // An unselected gym or Other Gym has no automatic equipment suggestions.
  const suggestions = gymEquipmentSuggestions[gymSelect.value] || [];
  gymSuggestions.hidden = !hasMembership || suggestions.length === 0;
  addGymEquipment.disabled = !hasMembership || suggestions.length === 0;
  gymEquipmentList.replaceChildren();
  gymStatus.textContent = "";

  if (hasMembership) {
    equipmentCheckboxes.forEach((checkbox) => {
      if (suggestions.includes(checkbox.value)) {
        const item = document.createElement("li");
        // Reuse the checkbox label so the suggested list uses the same names.
        item.textContent = checkbox.labels[0].textContent.trim();
        gymEquipmentList.append(item);
      }
    });
  }
}

// The change event works with both mouse clicks and keyboard selection.
equipmentCheckboxes.forEach((checkbox) => {
  checkbox.addEventListener("change", () => {
    updateEquipmentSelection(checkbox);
  });
});

gymMembershipChoices.forEach((choice) => {
  choice.addEventListener("change", updateGymDetails);
});
gymSelect.addEventListener("change", updateGymDetails);

addGymEquipment.addEventListener("click", () => {
  const suggestions = gymEquipmentSuggestions[gymSelect.value] || [];
  // Add suggestions without removing equipment the user has already selected.
  equipmentCheckboxes.forEach((checkbox) => {
    if (suggestions.includes(checkbox.value)) {
      checkbox.checked = true;
    }
  });
  updateEquipmentSelection();
  gymStatus.textContent = "Suggested equipment added. Adjust the equipment checkboxes below to match your gym.";
});

// Synchronize the controls when the page first opens, including restored selections.
updateEquipmentSelection();

// Find the equipment controls once so the rest of the code can use clear names.
const equipmentGroup = document.querySelector("#equipment-options");
const equipmentDropdown = document.querySelector("#equipment-dropdown");
const equipmentToggle = document.querySelector("#equipment-toggle");
const equipmentSummary = document.querySelector("#equipment-summary");
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

  // Keep the closed dropdown useful: show a single choice or the selected count.
  const selectedEquipment = Array.from(equipmentCheckboxes).filter((checkbox) => checkbox.checked);
  equipmentSummary.textContent = selectedEquipment.length === 1
    ? selectedEquipment[0].labels[0].textContent.trim()
    : selectedEquipment.length + " items selected";

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
  if (!showEquipment) {
    equipmentDropdown.open = false;
  }
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

// Native summary handles Enter and Space; Escape also closes and restores focus.
equipmentDropdown.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && equipmentDropdown.open) {
    equipmentDropdown.open = false;
    equipmentToggle.focus();
    event.preventDefault();
  }
});

addGymEquipment.addEventListener("click", () => {
  const suggestions = gymEquipmentSuggestions[gymSelect.value] || [];
  // Add suggestions without removing equipment the user has already selected.
  equipmentCheckboxes.forEach((checkbox) => {
    if (suggestions.includes(checkbox.value)) {
      checkbox.checked = true;
    }
  });
  updateEquipmentSelection();
  gymStatus.textContent = "Suggested equipment added. Open Available Equipment below to review or adjust your choices.";
});

// Synchronize the controls when the page first opens, including restored selections.
updateEquipmentSelection();

// BMI stays local. Full-precision metric values prevent unit-switch rounding drift.
const bmiSection = document.querySelector("#bmi-section");
const heightUnit = document.querySelector("#height-unit");
const weightUnit = document.querySelector("#weight-unit");
const heightFeet = document.querySelector("#height-feet");
const heightInches = document.querySelector("#height-inches");
const heightCm = document.querySelector("#height-cm");
const weightInput = document.querySelector("#weight");
const ageChoices = document.querySelectorAll('input[name="age-category"]');
const exactAge = document.querySelector("#exact-age");
const ageError = document.querySelector("#age-error");
const bmiResult = document.querySelector("#bmi-result");
const heightError = document.querySelector("#height-error");
const weightError = document.querySelector("#weight-error");
const poundsToKg = 0.45359237;
let currentHeightUnit = heightUnit.value;
let currentWeightUnit = weightUnit.value;
let heightMeters = null;
let weightKg = null;

function readMeasurement(input) {
  if (input.validity.badInput || input.value.trim() === "") return null;
  // Selects do not have valueAsNumber; convert their complete option value.
  const value = input.tagName === "SELECT" ? Number(input.value) : input.valueAsNumber;
  return Number.isFinite(value) ? value : null;
}

function readHeight() {
  if (currentHeightUnit === "cm") {
    const cm = readMeasurement(heightCm);
    return cm !== null && cm >= 50 && cm <= 300 ? cm / 100 : null;
  }
  const feet = readMeasurement(heightFeet);
  const inches = readMeasurement(heightInches);
  if (feet === null || inches === null || !Number.isInteger(feet) || feet < 0 || inches < 0 || inches >= 12) return null;
  const meters = (feet * 12 + inches) * 0.0254;
  return meters >= 0.5 && meters <= 3 ? meters : null;
}

// Preserve the existing pounds/kilograms conversion and validation.
function readWeight() {
  const value = readMeasurement(weightInput);
  if (value === null) return null;
  const kg = currentWeightUnit === "lb" ? value * poundsToKg : value;
  return kg >= 10 && kg <= 700 ? kg : null;
}

function showMeasurementError(inputs, message, target) {
  target.textContent = message;
  inputs.forEach((input) => {
    input.setCustomValidity(message);
    input.setAttribute("aria-invalid", String(message !== ""));
  });
}

// Changes clear previous results, so an old BMI never describes new entries.
function clearBmiResult() {
  showMeasurementError([heightFeet, heightInches, heightCm], "", heightError);
  showMeasurementError([weightInput], "", weightError);
  showMeasurementError([exactAge], "", ageError);
  document.querySelector("#age-category").removeAttribute("aria-invalid");
  bmiResult.textContent = "Choose an age category and enter measurements, then calculate.";
}

function selectedAgeCategory() {
  return document.querySelector('input[name="age-category"]:checked')?.value || "";
}

function updateAgeControls() {
  const under20 = selectedAgeCategory() === "under20";
  document.querySelector("#exact-age-details").hidden = !under20;
  exactAge.disabled = !under20;
  clearBmiResult();
}

function calculateBmi() {
  const categoryChoice = selectedAgeCategory();
  const age = categoryChoice === "under20" ? readMeasurement(exactAge) : null;
  const ageValid = categoryChoice === "adult" || (categoryChoice === "under20" && age !== null && age >= 1 && age < 20);
  const activeHeight = currentHeightUnit === "cm" ? [heightCm] : [heightFeet, heightInches];
  const ageMessage = categoryChoice === "" ? "Choose an age category." : !ageValid ? "Enter an exact age from 1 to less than 20 years." : "";
  showMeasurementError(exactAge.disabled ? [] : [exactAge], ageMessage, ageError);
  document.querySelector("#age-category").setAttribute("aria-invalid", String(!ageValid));
  showMeasurementError(activeHeight, heightMeters === null ? "Enter a valid height (50–300 cm); choose both feet and inches when using those units." : "", heightError);
  showMeasurementError([weightInput], weightKg === null ? "Enter a valid weight from 10 to 700 kg (about 22–1543 lb)." : "", weightError);
  if (!ageValid || heightMeters === null || weightKg === null) {
    bmiResult.textContent = "Check the highlighted age or measurements, then calculate again.";
    return;
  }
  const bmi = weightKg / (heightMeters * heightMeters);
  if (!Number.isFinite(bmi) || bmi <= 0) {
    bmiResult.textContent = "Check your measurements before calculating.";
    return;
  }
  let interpretation;
  if (categoryChoice === "adult") {
    // Compare the full value; round only the displayed number.
    const category = bmi < 18.5 ? "Underweight" : bmi < 25 ? "Healthy weight" : bmi < 30 ? "Overweight" : "Obesity";
    interpretation = "Adult category: " + category + ".";
  } else if (age < 2) {
    interpretation = "For children under 2, standard BMI-for-age categories do not apply. Pediatric interpretation requires age- and sex-specific growth charts, typically weight-for-length at this age. No category or percentile is calculated.";
  } else {
    interpretation = "Pediatric BMI interpretation requires age- and sex-specific growth charts. No adult category or pediatric percentile is calculated.";
  }
  bmiResult.textContent = "Estimated BMI: " + bmi.toFixed(1) + " — " + interpretation;
}

function displayHeight(value) {
  return String(Number(value.toFixed(6)));
}

// Standard dropdown choices are whole inches. A converted fractional choice
// is added only when needed, so centimeters are never silently rounded away.
function setConvertedInches(inches) {
  heightInches.querySelectorAll("option[data-converted]").forEach((option) => option.remove());
  const value = displayHeight(inches);
  if (!Number.isInteger(Number(value))) {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value + " (converted)";
    option.dataset.converted = "true";
    heightInches.append(option);
  }
  heightInches.value = value;
}

function syncHeightVisibility() {
  const metric = currentHeightUnit === "cm";
  document.querySelector("#height-metric").hidden = !metric;
  document.querySelector("#height-imperial").hidden = metric;
  [heightFeet, heightInches].forEach((input) => input.disabled = metric);
  heightCm.disabled = !metric;
}

heightUnit.addEventListener("change", () => {
  currentHeightUnit = heightUnit.value;
  syncHeightVisibility();
  if (heightMeters !== null) {
    if (currentHeightUnit === "cm") heightCm.value = displayHeight(heightMeters * 100);
    else {
      const totalInches = Number((heightMeters / 0.0254).toFixed(6));
      const feet = Math.floor(totalInches / 12);
      heightFeet.value = String(feet);
      setConvertedInches(totalInches - feet * 12);
    }
  } else {
    (currentHeightUnit === "cm" ? [heightCm] : [heightFeet, heightInches]).forEach((input) => input.value = "");
  }
  clearBmiResult();
});

weightUnit.addEventListener("change", () => {
  currentWeightUnit = weightUnit.value;
  const metric = currentWeightUnit === "kg";
  document.querySelector("#weight-label").textContent = metric ? "Weight (kg)" : "Weight (lb)";
  weightInput.min = metric ? "10" : String(10 / poundsToKg);
  weightInput.max = metric ? "700" : String(700 / poundsToKg);
  weightInput.value = weightKg === null ? "" : String(metric ? weightKg : weightKg / poundsToKg);
  clearBmiResult();
});

[heightFeet, heightInches].forEach((input) => input.addEventListener("change", () => {
  heightMeters = readHeight(); clearBmiResult();
}));
heightCm.addEventListener("input", () => { heightMeters = readHeight(); clearBmiResult(); });
weightInput.addEventListener("input", () => { weightKg = readWeight(); clearBmiResult(); });
exactAge.addEventListener("input", clearBmiResult);
ageChoices.forEach((choice) => choice.addEventListener("change", updateAgeControls));
document.querySelector("#calculate-bmi").addEventListener("click", calculateBmi);
bmiSection.addEventListener("keydown", (event) => {
  // Prevent implicit form submission only for the BMI input controls.
  if (event.key === "Enter" && event.target.matches("input, select")) {
    event.preventDefault();
    calculateBmi();
  }
});
weightInput.min = currentWeightUnit === "kg" ? "10" : String(10 / poundsToKg);
weightInput.max = currentWeightUnit === "kg" ? "700" : String(700 / poundsToKg);
syncHeightVisibility();
heightMeters = readHeight();
weightKg = readWeight();
updateAgeControls();

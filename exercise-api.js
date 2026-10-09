// Checkpoint 5A only: browse genuine API records, without generating workouts.
const exerciseEndpoint = "https://oss.exercisedb.dev/api/v1/exercises";
const exerciseSearch = document.querySelector("#exercise-search");
const loadExercisesButton = document.querySelector("#load-exercises");
const firstExercisesButton = document.querySelector("#first-exercises");
const nextExercisesButton = document.querySelector("#next-exercises");
const exerciseStatus = document.querySelector("#exercise-status");
const exerciseList = document.querySelector("#exercise-list");
let exerciseLoading = false;
let exerciseNextCursor = null;
let exerciseCurrentCursor = null;
let loadedExerciseSearch = "";
let exercisePageLoaded = false;

// Ignore unexpected array entries rather than inventing missing provider data.
function exerciseTextList(value) {
  return Array.isArray(value) ? value.filter((item) => typeof item === "string" && item.trim() !== "") : [];
}

function createExerciseRow(label, values) {
  const row = document.createElement("p");
  row.textContent = label + ": " + (values.length ? values.join(", ") : "Not supplied by ExerciseDB");
  return row;
}

function renderExercisePage(records) {
  const fragment = document.createDocumentFragment();
  const seenIds = new Set();
  let skipped = 0;
  for (const record of records) {
    // A stable genuine ID lets us ignore malformed or duplicate records safely.
    if (!record || typeof record.exerciseId !== "string" || !record.exerciseId.trim() || seenIds.has(record.exerciseId)) {
      skipped += 1;
      continue;
    }
    seenIds.add(record.exerciseId);
    const details = document.createElement("details");
    details.dataset.exerciseId = record.exerciseId;
    const summary = document.createElement("summary");
    summary.textContent = typeof record.name === "string" && record.name.trim() ? record.name : "Name not supplied by ExerciseDB";
    details.append(summary);
    details.append(createExerciseRow("Equipment", exerciseTextList(record.equipments)));
    details.append(createExerciseRow("Body parts", exerciseTextList(record.bodyParts)));
    details.append(createExerciseRow("Target muscles", exerciseTextList(record.targetMuscles)));
    details.append(createExerciseRow("Secondary muscles", exerciseTextList(record.secondaryMuscles)));
    const instructions = exerciseTextList(record.instructions);
    if (instructions.length) {
      const list = document.createElement("ol");
      for (const instruction of instructions) {
        const item = document.createElement("li");
        // Provider text is always textContent, never executable HTML.
        item.textContent = instruction.replace(/^Step:\s*\d+\s*/i, "");
        list.append(item);
      }
      details.append(list);
    } else {
      const missing = document.createElement("p");
      missing.textContent = "Instructions not supplied by ExerciseDB.";
      details.append(missing);
    }
    fragment.append(details);
  }
  exerciseList.replaceChildren(fragment);
  return { count: seenIds.size, skipped };
}

function updateExerciseButtons() {
  loadExercisesButton.disabled = exerciseLoading;
  firstExercisesButton.disabled = exerciseLoading || !exercisePageLoaded || exerciseCurrentCursor === null;
  nextExercisesButton.disabled = exerciseLoading || !exerciseNextCursor;
  exerciseList.setAttribute("aria-busy", String(exerciseLoading));
}

async function loadExercisePage(cursor = null, search = exerciseSearch.value.trim()) {
  if (exerciseLoading) return;
  exerciseLoading = true;
  updateExerciseButtons();
  exerciseStatus.textContent = "Loading exercises from ExerciseDB…";
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  try {
    // Only exercise browsing terms go to the API: never form data or BMI/age.
    const url = new URL(exerciseEndpoint);
    url.searchParams.set("limit", "10");
    if (search) url.searchParams.set("name", search);
    if (cursor) url.searchParams.set("after", cursor);
    const response = await fetch(url, { signal: controller.signal, credentials: "omit", referrerPolicy: "no-referrer" });
    if (!response.ok) {
      const failure = new Error("HTTP " + response.status);
      failure.status = response.status;
      throw failure;
    }
    const payload = await response.json();
    if (!payload || payload.success !== true || !Array.isArray(payload.data)) {
      throw new Error("Unexpected ExerciseDB response");
    }
    const rendered = renderExercisePage(payload.data);
    exerciseCurrentCursor = cursor;
    loadedExerciseSearch = search;
    exercisePageLoaded = true;
    // The API returns nextCursor, but the request parameter is named after.
    const next = payload.meta?.nextCursor;
    exerciseNextCursor = payload.meta?.hasNextPage === true && typeof next === "string" && next.trim() && next !== cursor ? next : null;
    const total = payload.meta?.total;
    const totalLabel = Number.isInteger(total) && total >= rendered.count ? " of " + total + " matching records" : "";
    if (payload.data.length === 0) {
      exerciseNextCursor = null;
      exerciseStatus.textContent = "No matching exercises. Try a different name or clear the search.";
    } else if (rendered.count === 0) {
      exerciseNextCursor = null;
      exerciseStatus.textContent = "ExerciseDB returned no usable exercise records. Try loading again.";
    } else {
      exerciseStatus.textContent = "Showing " + rendered.count + " exercises" + totalLabel + ". Open a name for equipment, muscles, and instructions.";
      if (rendered.skipped) exerciseStatus.textContent += " Skipped " + rendered.skipped + " incomplete or duplicate records.";
      if (payload.meta?.hasNextPage === true && !exerciseNextCursor) exerciseStatus.textContent += " Further pagination is unavailable in this response.";
    }
  } catch (error) {
    let message;
    if (error.name === "AbortError") message = "ExerciseDB took too long to respond. Try loading again.";
    else if (error.status === 429) message = "ExerciseDB is receiving too many requests. Wait a little, then retry.";
    else if (error.status === 401 || error.status === 403) message = "ExerciseDB denied access. Try again later; no API key is stored in GymBuddy.";
    else if (error.status) message = "ExerciseDB could not load exercises (HTTP " + error.status + "). Try again later.";
    else if (error instanceof SyntaxError || error.message === "Unexpected ExerciseDB response") message = "ExerciseDB returned an unreadable response. Try loading again.";
    else message = "Unable to reach ExerciseDB. Check your connection and try loading again.";
    exerciseStatus.textContent = message + (exercisePageLoaded ? " The previously loaded page is still shown." : "");
  } finally {
    clearTimeout(timeout);
    exerciseLoading = false;
    updateExerciseButtons();
  }
}

loadExercisesButton.addEventListener("click", () => loadExercisePage());
firstExercisesButton.addEventListener("click", () => loadExercisePage(null, loadedExerciseSearch));
nextExercisesButton.addEventListener("click", () => loadExercisePage(exerciseNextCursor, loadedExerciseSearch));
exerciseSearch.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    loadExercisePage();
  }
});
updateExerciseButtons();

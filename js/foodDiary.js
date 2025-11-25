// js/foodDiary.js
// Food Diary logic + USDA nutrition lookup + presets + edit/delete + servings scaling + autocomplete + row delete

document.addEventListener("DOMContentLoaded", () => {
  // ====== YOUR USDA API KEY ======
  // Replace this with your real key:
  const USDA_API_KEY = "VBnemukw6NKi7945s5cRUu3su6swzguub4XMZ6tc";

  // USDA nutrient IDs
  const NUTRIENT_ENERGY  = "208"; // kcal
  const NUTRIENT_PROTEIN = "203";
  const NUTRIENT_CARBS   = "205";
  const NUTRIENT_FAT     = "204";

  // ----- DOM ELEMENTS -----
  const presetSelect      = document.getElementById("preset");
  const mealTypeSelect    = document.getElementById("meal-type");
  const foodNameInput     = document.getElementById("food-name");
  const caloriesInput     = document.getElementById("calories");
  const proteinInput      = document.getElementById("protein");
  const carbsInput        = document.getElementById("carbs");
  const fatInput          = document.getElementById("fat");
  const servingsInput     = document.getElementById("servings");

  const lookupBtn         = document.getElementById("lookup-btn");
  const savePresetBtn     = document.getElementById("save-preset-btn");
  const updatePresetBtn   = document.getElementById("update-preset-btn");
  const deletePresetBtn   = document.getElementById("delete-preset-btn");

  const suggestionsList   = document.getElementById("food-suggestions");

  const messageDiv        = document.getElementById("message");
  const totalsDiv         = document.getElementById("totals");
  const mealsTbody        = document.getElementById("meals-tbody");

  const addBtn            = document.getElementById("add-btn");
  const clearAllBtn       = document.getElementById("clear-all-btn");

  // ----- PRESETS STATE -----
  const CUSTOM_PRESETS_KEY = "calpal_custom_presets_v1";
  const BASE_PRESETS = (typeof PRESET_FOODS !== "undefined") ? PRESET_FOODS : [];
  let allPresets = [];

  // ----- TOTALS STATE -----
  let totals = { calories: 0, protein: 0, carbs: 0, fat: 0 };

  // ----- MEALS STATE -----
  // Load meals from localStorage or use empty array
  let meals = JSON.parse(localStorage.getItem('dailyMeals')) || [];

  // =========================
  // HELPERS: MEALS STORAGE
  // =========================
  function saveMeals() {
    localStorage.setItem('dailyMeals', JSON.stringify(meals));
  }

  // =========================
  // HELPERS: PRESETS STORAGE
  // =========================
  function loadCustomPresets() {
    const raw = localStorage.getItem(CUSTOM_PRESETS_KEY);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch (e) {
      console.error("Bad custom preset JSON:", e);
      return [];
    }
  }

  function saveCustomPresets(list) {
    localStorage.setItem(CUSTOM_PRESETS_KEY, JSON.stringify(list));
  }

  function buildPresetList() {
    allPresets = [...BASE_PRESETS, ...loadCustomPresets()];
  }

  function refreshPresetSelect() {
    buildPresetList();

    // Rebuild dropdown
    presetSelect.innerHTML = '<option value="">-- Select a preset food --</option>';
    allPresets.forEach((food, i) => {
      const opt = document.createElement("option");
      opt.value = i;
      opt.textContent = food.name;
      presetSelect.appendChild(opt);
    });

    // Rebuild autocomplete suggestions
    if (suggestionsList) {
      suggestionsList.innerHTML = "";
      allPresets.forEach(food => {
        const opt = document.createElement("option");
        opt.value = food.name;
        suggestionsList.appendChild(opt);
      });
    }
  }

  // =========================
  // UI MESSAGE HELPER
  // =========================
  function showMessage(msg, type = "info") {
    messageDiv.textContent = msg;
    messageDiv.className = "message " + type;
  }

  // =========================
  // USDA HELPERS
  // =========================
  function getNutrient(foodNutrients, id) {
    if (!Array.isArray(foodNutrients)) return null;
    const found = foodNutrients.find(n =>
      String(n.nutrientNumber) === id ||
      String(n.number) === id ||
      String(n.nutrientId) === id
    );
    return found ? found.value : null;
  }

  async function lookupNutrition(query) {
    if (!query || !query.trim()) {
      showMessage("Enter a food name first.", "error");
      return;
    }

    if (!USDA_API_KEY || USDA_API_KEY === "YOUR_USDA_API_KEY_HERE") {
      showMessage("Add your USDA API key in foodDiary.js first.", "error");
      return;
    }

    showMessage("Searching USDA database...", "info");

    const url =
      `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(query)}` +
      `&pageSize=1&api_key=${USDA_API_KEY}`;

    try {
      const res = await fetch(url);
      if (!res.ok) {
        console.error("USDA HTTP error:", res.status);
        showMessage("USDA API error. Check your key or network.", "error");
        return;
      }

      const data = await res.json();
      if (!data.foods || data.foods.length === 0) {
        showMessage("No USDA results found.", "error");
        return;
      }

      const food = data.foods[0];
      const nutrients = food.foodNutrients || [];

      const kcal  = getNutrient(nutrients, NUTRIENT_ENERGY);
      const prot  = getNutrient(nutrients, NUTRIENT_PROTEIN);
      const carbs = getNutrient(nutrients, NUTRIENT_CARBS);
      const fat   = getNutrient(nutrients, NUTRIENT_FAT);

      if (kcal  != null) caloriesInput.value = Math.round(kcal);
      if (prot  != null) proteinInput.value  = prot.toFixed(1);
      if (carbs != null) carbsInput.value    = carbs.toFixed(1);
      if (fat   != null) fatInput.value      = fat.toFixed(1);

      // Reset servings to 1 whenever new macros are loaded
      servingsInput.value = "1";

      if (!foodNameInput.value.trim() && food.description) {
        foodNameInput.value = food.description;
      }

      showMessage(`Loaded nutrition for: ${food.description}`, "success");
    } catch (err) {
      console.error("USDA fetch error:", err);
      showMessage("USDA API error. Try again.", "error");
    }
  }

  // =========================
  // APPLY PRESET BY NAME (for autocomplete)
  // =========================
  function applyPresetByName(name) {
    if (!name) return false;
    const lower = name.toLowerCase();
    const match = allPresets.find(f => f.name.toLowerCase() === lower);
    if (!match) return false;

    foodNameInput.value = match.name;
    caloriesInput.value = match.calories || 0;
    proteinInput.value  = match.protein || 0;
    carbsInput.value    = match.carbs || 0;
    fatInput.value      = match.fat || 0;
    servingsInput.value = "1";

    showMessage("Preset loaded by name.", "info");
    return true;
  }

  // =========================
  // DIARY: ADD CURRENT MEAL
  // =========================
  function attachDeleteHandler(row) {
    const btn = row.querySelector(".delete-row-btn");
    if (!btn) return;

    btn.addEventListener("click", () => {
      const index = parseInt(row.dataset.index);
      
      // Remove from meals array
      if (!isNaN(index) && index >= 0 && index < meals.length) {
        const meal = meals[index];
        
        // Subtract from totals
        totals.calories = Math.max(0, totals.calories - (Number(meal.calories) || 0));
        totals.protein  = Math.max(0, totals.protein  - (Number(meal.protein) || 0));
        totals.carbs    = Math.max(0, totals.carbs    - (Number(meal.carbs) || 0));
        totals.fat      = Math.max(0, totals.fat      - (Number(meal.fat) || 0));

        // Remove meal from array
        meals.splice(index, 1);
        saveMeals();
      }

      row.remove();

      if (mealsTbody.children.length === 0) {
        addPlaceholderRow();
      }
      
      // Re-render to fix indices
      renderMealsTable();
      updateTotals();
      showMessage("Meal removed.", "info");
    });
  }

  function addCurrentMealToDiary(showMessages = true) {
    const name     = foodNameInput.value.trim();
    const calories = Number(caloriesInput.value);
    const protein  = Number(proteinInput.value) || 0;
    const carbs    = Number(carbsInput.value)   || 0;
    const fat      = Number(fatInput.value)     || 0;
    const servings = parseFloat(servingsInput.value) || 1;

    if (!name || calories <= 0 || servings <= 0) {
      if (showMessages) {
        showMessage("Enter food name, calories, and servings > 0.", "error");
      }
      return false;
    }

    const scaledCalories = Math.round(calories * servings);
    const scaledProtein  = +(protein * servings).toFixed(1);
    const scaledCarbs    = +(carbs * servings).toFixed(1);
    const scaledFat      = +(fat * servings).toFixed(1);

    // Add meal to array
    const meal = {
      mealType: mealTypeSelect.value,
      name: name,
      servings: servings,
      calories: scaledCalories,
      protein: scaledProtein,
      carbs: scaledCarbs,
      fat: scaledFat
    };
    
    meals.push(meal);
    saveMeals();

    totals.calories += scaledCalories;
    totals.protein  += scaledProtein;
    totals.carbs    += scaledCarbs;
    totals.fat      += scaledFat;

    renderMealsTable();
    updateTotals();
    
    if (showMessages) {
      showMessage("Meal added!", "success");
    }
    return true;
  }

  // =========================
  // TOTALS DISPLAY
  // =========================
  function addPlaceholderRow() {
    mealsTbody.innerHTML = `
      <tr data-placeholder="true">
        <td colspan="7" style="text-align:center;color:#aaa;">
          No meals logged yet.
        </td>
      </tr>
    `;
  }

  function renderMealsTable() {
    if (meals.length === 0) {
      addPlaceholderRow();
      return;
    }

    mealsTbody.innerHTML = "";

    meals.forEach((meal, index) => {
      const row = document.createElement("tr");
      row.dataset.index = index;
      
      row.innerHTML = `
        <td>${meal.mealType}</td>
        <td>${meal.name} (${meal.servings}x)</td>
        <td>${meal.calories}</td>
        <td>${meal.protein}</td>
        <td>${meal.carbs}</td>
        <td>${meal.fat}</td>
        <td><button type="button" class="delete-row-btn btn-secondary">Delete</button></td>
      `;

      mealsTbody.appendChild(row);
      attachDeleteHandler(row);
    });
  }

  function updateTotals() {
    const t = totals;
    if (t.calories === 0) {
      totalsDiv.textContent = "No meals logged yet.";
      return;
    }
    totalsDiv.textContent =
      `Total: ${t.calories} kcal | ` +
      `P: ${t.protein.toFixed(1)} g | ` +
      `C: ${t.carbs.toFixed(1)} g | ` +
      `F: ${t.fat.toFixed(1)} g`;
  }

  function recalculateTotals() {
    totals = { calories: 0, protein: 0, carbs: 0, fat: 0 };
    meals.forEach(meal => {
      totals.calories += Number(meal.calories) || 0;
      totals.protein  += Number(meal.protein) || 0;
      totals.carbs    += Number(meal.carbs) || 0;
      totals.fat      += Number(meal.fat) || 0;
    });
  }

  // =========================
  // EVENT HANDLERS
  // =========================

  // Quick Add preset select
  presetSelect.addEventListener("change", () => {
    const index = presetSelect.value;
    if (index === "") return;

    const f = allPresets[index];
    if (!f) return;

    foodNameInput.value = f.name;
    caloriesInput.value = f.calories || 0;
    proteinInput.value  = f.protein || 0;
    carbsInput.value    = f.carbs || 0;
    fatInput.value      = f.fat || 0;
    servingsInput.value = "1";

    showMessage("Preset loaded.", "info");
  });

  // Autocomplete: when food name changes, try to match preset
  foodNameInput.addEventListener("change", () => {
    applyPresetByName(foodNameInput.value.trim());
  });

  // USDA lookup
  lookupBtn.addEventListener("click", () => {
    lookupNutrition(foodNameInput.value);
  });

  foodNameInput.addEventListener("keydown", e => {
    if (e.key === "Enter") {
      e.preventDefault();
      lookupNutrition(foodNameInput.value);
    }
  });

  // Add to diary using current data
  addBtn.addEventListener("click", () => {
    addCurrentMealToDiary(true);
  });

  // Clear diary
  clearAllBtn.addEventListener("click", () => {
    meals = [];
    totals = { calories: 0, protein: 0, carbs: 0, fat: 0 };
    saveMeals();
    addPlaceholderRow();
    updateTotals();
    showMessage("Diary cleared.", "success");
  });

  // Save as NEW preset and also add to diary
  savePresetBtn.addEventListener("click", () => {
    const name     = foodNameInput.value.trim();
    const calories = Number(caloriesInput.value);

    if (!name || calories <= 0) {
      showMessage("Enter valid food + calories before saving.", "error");
      return;
    }

    const newPreset = {
      name,
      calories,
      protein: Number(proteinInput.value) || 0,
      carbs:   Number(carbsInput.value)   || 0,
      fat:     Number(fatInput.value)     || 0
    };

    const customList = loadCustomPresets();
    customList.push(newPreset);
    saveCustomPresets(customList);
    refreshPresetSelect();

    const added = addCurrentMealToDiary(false);
    if (added) {
      showMessage(`"${name}" saved to presets and added to diary!`, "success");
    } else {
      showMessage(`"${name}" saved to presets, but could not add to diary (check servings).`, "info");
    }
  });

  // Update selected preset
  updatePresetBtn.addEventListener("click", () => {
    const selectedIndex = presetSelect.value;
    if (selectedIndex === "") {
      showMessage("Select a preset to update.", "error");
      return;
    }

    const idx = parseInt(selectedIndex, 10);

    const name     = foodNameInput.value.trim();
    const calories = Number(caloriesInput.value);
    const protein  = Number(proteinInput.value) || 0;
    const carbs    = Number(carbsInput.value)   || 0;
    const fat      = Number(fatInput.value)     || 0;

    if (!name || calories <= 0) {
      showMessage("Enter valid name + calories before updating.", "error");
      return;
    }

    const customList = loadCustomPresets();

    if (idx < BASE_PRESETS.length) {
      // Base preset: can't directly modify, so create a custom copy
      customList.push({ name, calories, protein, carbs, fat });
      saveCustomPresets(customList);
      refreshPresetSelect();
      showMessage("Base preset can't be edited, but a custom copy was saved.", "success");
    } else {
      // Custom preset: update in place
      const customIndex = idx - BASE_PRESETS.length;
      if (customIndex < 0 || customIndex >= customList.length) {
        showMessage("Could not locate custom preset to update.", "error");
        return;
      }
      customList[customIndex] = { name, calories, protein, carbs, fat };
      saveCustomPresets(customList);
      refreshPresetSelect();
      showMessage("Custom preset updated.", "success");
    }
  });

  // Delete selected preset
  deletePresetBtn.addEventListener("click", () => {
    const selectedIndex = presetSelect.value;
    if (selectedIndex === "") {
      showMessage("Select a preset to delete.", "error");
      return;
    }

    const idx = parseInt(selectedIndex, 10);
    const customList = loadCustomPresets();

    if (idx < BASE_PRESETS.length) {
      showMessage("You can't delete built-in presets.", "error");
      return;
    }

    const customIndex = idx - BASE_PRESETS.length;
    if (customIndex < 0 || customIndex >= customList.length) {
      showMessage("Could not locate custom preset to delete.", "error");
      return;
    }

    const deleted = customList[customIndex];
    customList.splice(customIndex, 1);
    saveCustomPresets(customList);
    refreshPresetSelect();
    presetSelect.value = "";
    showMessage(`Deleted custom preset: "${deleted.name}".`, "success");
  });

  // =========================
  // INITIALIZATION
  // =========================
  recalculateTotals();
  renderMealsTable();
  refreshPresetSelect();
  updateTotals();
});

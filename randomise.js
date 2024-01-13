// Function to randomise parameters
export function randomiseParameters(
  sliderInfo,
  sliderProperties,
  flowerColourPickers
) {
  // Randomise resolution only if "Keep Resolution" is not checked
  const keepResolutionCheck = getCheckboxValue("keepResolutionCheckbox");
  if (!keepResolutionCheck) {
    if (!getCheckboxValue("verticalResolutionCheck")) {
      randomiseSliderValue(
        "verticalResolutionSlider",
        sliderInfo.verticalResolution.minValue,
        sliderInfo.verticalResolution.maxValue
      );
    }
    if (!getCheckboxValue("radialResolutionCheck")) {
      randomiseSliderValue(
        "radialResolutionSlider",
        sliderInfo.radialResolution.minValue,
        sliderInfo.radialResolution.maxValue
      );
    }
  }

  // Randomise other sliders
  sliderProperties.forEach((property) => {
    const checkboxId = `${property}Check`;
    if (!getCheckboxValue(checkboxId)) {
      randomiseSliderValue(
        `${property}Slider`,
        sliderInfo[property].minValue,
        sliderInfo[property].maxValue
      );
    }
  });

  flowerColourPickers.forEach((colourPicker) => {
    const checkboxId = `${colourPicker}Check`;
    if (!getCheckboxValue(checkboxId)) {
      randomiseColourPicker(colourPicker);
    }
  });
}

// Helper function to randomise the value of a colour picker
function randomiseColourPicker(colourPickerId) {
  const colourPicker = document.getElementById(colourPickerId);
  const randomColour = getRandomColour();
  colourPicker.value = randomColour;
  colourPicker.dispatchEvent(new Event("input"));
}

// Helper function to randomise colour
function getRandomColour() {
  return "#" + Math.floor(Math.random() * 16777215).toString(16);
}

// Helper function to get the checked status of a checkbox
function getCheckboxValue(checkboxId) {
  const checkbox = document.getElementById(checkboxId);
  return checkbox.checked;
}

// Helper function to randomise the value of a slider
function randomiseSliderValue(sliderId, minValue, maxValue) {
  const slider = document.getElementById(sliderId);
  slider.value = Math.random() * (maxValue - minValue + 1) + minValue;
  slider.nextElementSibling.textContent = slider.value;
}

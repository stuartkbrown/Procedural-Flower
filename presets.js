// Preset configurations
const presets = {
  hibiscus: {
    verticalResolution: 60,
    radialResolution: 360,
    petalNumber: 5,
    petalLength: 200,
    diameter: 60,
    petalSharpness: 0.4,
    height: 300,
    curvature1: 0.8,
    curvature2: 0.2,
    bumpiness: 2.5,
    bumpNumber: 12,
    color1: "#87CEEB",
    color2: "#CC3168",
  },
  forgetMeNot: {
    verticalResolution: 60,
    radialResolution: 360,
    petalNumber: 5,
    petalLength: 110,
    diameter: 130,
    petalSharpness: 1,
    height: 30,
    curvature1: 2.7,
    curvature2: 0.4,
    bumpiness: 5,
    bumpNumber: 8,
    color1: "#6495ED",
    color2: "#00FFFF",
  },
  morningGlory: {
    verticalResolution: 60,
    radialResolution: 360,
    petalNumber: 6,
    petalLength: 80,
    diameter: 130,
    petalSharpness: 1.4,
    height: 500,
    curvature1: 0.5,
    curvature2: 0.3,
    bumpiness: 1.5,
    bumpNumber: 12,
    color1: "#4169E1",
    color2: "#87CEEB",
  },
  lily: {
    verticalResolution: 60,
    radialResolution: 360,
    petalNumber: 5,
    petalLength: 140,
    diameter: 20,
    petalSharpness: 3,
    height: 400,
    curvature1: 0.6,
    curvature2: 0.2,
    bumpiness: 1.5,
    bumpNumber: 12,
    color1: "#8B008B",
    color2: "#FFFF00",
  },
  buttercup: {
    verticalResolution: 60,
    radialResolution: 360,
    petalNumber: 5,
    petalLength: 160,
    diameter: 40,
    petalSharpness: 0.8,
    height: 20,
    curvature1: 2.9,
    curvature2: 0.0,
    bumpiness: 1.5,
    bumpNumber: 8,
    color1: "#FFD700",
    color2: "#FF8C00",
  },
};

export function loadFlowerFromPreset(
  presetName,
  sliderProperties,
  flowerColourPickers
) {
  const preset = presets[presetName];
  if (preset) {
    updateSlidersFromPreset(preset, sliderProperties);
    updateColourPickersFromPreset(preset, flowerColourPickers);
  } else {
    console.error(`Preset '${presetName}' not found.`);
  }
}

export function loadFlowerFromJSON(
  jsonData,
  sliderProperties,
  flowerColourPickers
) {
  // Parse the JSON data
  const flowerData = JSON.parse(jsonData, (key, value) => {
    if (typeof key === "string" && key.startsWith('"') && key.endsWith('"')) {
      // Remove double quotes from property names
      key = key.slice(1, -1);
    }

    if (
      typeof value === "string" &&
      value.startsWith('"') &&
      value.endsWith('"')
    ) {
      // Remove double quotes from string property values
      value = value.slice(1, -1);
    }

    return value;
  });

  // Check if the required properties are present
  if (!flowerData || !flowerData.proceduralFlower) {
    console.error("Invalid JSON format. Missing 'proceduralFlower' property.");
    return;
  }

  // Update UI elements with the values from the JSON
  updateSlidersFromPreset(flowerData.proceduralFlower, sliderProperties);
  updateColourPickersFromPreset(
    flowerData.proceduralFlower,
    flowerColourPickers
  );
}

function updateSlidersFromPreset(preset, sliderProperties) {
  sliderProperties.forEach((property) => {
    const slider = document.getElementById(`${property}Slider`);
    const inputValue = preset[property];
    slider.value = inputValue;
    slider.nextElementSibling.textContent = inputValue;
  });
}

function updateColourPickersFromPreset(preset, flowerColourPickers) {
  flowerColourPickers.forEach((colourPicker, index) => {
    const colourPickerElement = document.getElementById(colourPicker);
    const presetColor = index === 0 ? preset.color1 : preset.color2;
    colourPickerElement.value = presetColor;
    colourPickerElement.dispatchEvent(new Event("input"));
  });
}

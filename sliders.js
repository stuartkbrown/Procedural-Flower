// Initialize sliders and color pickers
export const sliderInfo = {
  verticalResolution: {
    id: "verticalResolutionSlider",
    minValue: 10,
    maxValue: 100,
  },
  radialResolution: {
    id: "radialResolutionSlider",
    minValue: 45,
    maxValue: 720,
  },
  petalNumber: { id: "petalNumberSlider", minValue: 1, maxValue: 20 },
  diameter: { id: "diameterSlider", minValue: 20, maxValue: 250 },
  petalLength: { id: "petalLengthSlider", minValue: 0, maxValue: 300 },
  petalSharpness: { id: "petalSharpnessSlider", minValue: 0.0, maxValue: 10.0 },
  height: { id: "heightSlider", minValue: 0, maxValue: 600 },
  curvature1: { id: "curvature1Slider", minValue: 0.0, maxValue: 4.0 },
  curvature2: { id: "curvature2Slider", minValue: 0.0, maxValue: 1.0 },
  bumpiness: { id: "bumpinessSlider", minValue: 0.0, maxValue: 5.0 },
  bumpNumber: { id: "bumpNumberSlider", minValue: 0, maxValue: 20 },
};

// Extract slider IDs and properties
export const sliders = Object.values(sliderInfo).map((info) => info.id);
export const sliderProperties = Object.keys(sliderInfo);

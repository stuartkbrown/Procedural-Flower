import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

// Parameters
let numThetaSteps; // vertical resolution
let numPhiSteps; // radial resolution

let petalNumber;
let petalLength;
let diameter;
let petalSharpness;
let height;
let curvature1;
let curvature2;
let bumpiness;
let bumpNumber;

// Scene
const scene = new THREE.Scene();

// Create Buffer Geometry
const geometry = new THREE.BufferGeometry();

// Define arrays to hold vertex positions
const positions = [];
const colors = [];

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

// Initialize sliders and color pickers
const sliders = [
  "verticalResolution",
  "radialResolution",
  "petalNumber",
  "petalLength",
  "diameter",
  "petalSharpness",
  "height",
  "curvature1",
  "curvature2",
  "bumpiness",
  "bumpNumber",
];
const colorPickers = ["flowerColourPicker", "flowerColourPicker2"];

// Axes helpers
const cartesianAxesHelper = new THREE.AxesHelper(300);
const radialAxesHelper = createRadialAxesHelper(300, 64);

// Sizes
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

// Camera
const camera = initCamera();

// Renderer
const renderer = initRenderer();

// Controls
const controls = initControls();

// Event listeners
initEventListeners();

// Animation
animate();

function initRadialAxesVisibility() {
  radialAxesHelper.circle.visible = !radialAxesHelper.circle.visible;
  radialAxesHelper.yAxis.visible = !radialAxesHelper.yAxis.visible;
}

function initControls() {
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  return controls;
}

function initCamera() {
  const camera = new THREE.PerspectiveCamera(
    75,
    sizes.width / sizes.height,
    0.1,
    8000
  );
  camera.position.z = 550;
  return camera;
}

function initRenderer() {
  const canvas = document.querySelector(".webgl");
  const renderer = new THREE.WebGLRenderer({ canvas });
  renderer.setSize(sizes.width, sizes.height);
  return renderer;
}

function initEventListeners() {
  window.addEventListener("resize", onWindowResize);
  sliders.forEach((slider) => {
    const sliderElement = document.getElementById(`${slider}Slider`);
    sliderElement.addEventListener("input", updateParameters);
  });
  colorPickers.forEach((colorPicker) => {
    const colorPickerElement = document.getElementById(colorPicker);
    colorPickerElement.addEventListener("input", createVertices);
  });
}

function onWindowResize() {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();
  renderer.setSize(sizes.width, sizes.height);
}

function createRadialAxesHelper(size, segments) {
  const diameter = size * 2;
  const points = [];

  // Generate points for the circle
  for (let i = 0; i <= segments; i++) {
    const theta = (i / segments) * Math.PI * 2;
    const x = (Math.cos(theta) * diameter) / 2;
    const z = (Math.sin(theta) * diameter) / 2;
    points.push(new THREE.Vector3(x, 0, z));
  }

  // Create the circle on the XZ plane
  const circleGeometry = new THREE.BufferGeometry().setFromPoints(points);
  const circleMaterial = new THREE.LineBasicMaterial({ color: 0xffa500 });
  const circle = new THREE.Line(circleGeometry, circleMaterial);
  circle.rotation.x = Math.PI / 2; // Rotate to be on the XZ plane
  scene.add(circle);

  // Create the Y-axis with length 300
  const yAxisMaterial = new THREE.LineBasicMaterial({ color: 0x0000ff });
  const yAxisGeometry = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 0, size),
  ]);
  const yAxis = new THREE.Line(yAxisGeometry, yAxisMaterial);
  scene.add(yAxis);

  // Return the helper objects so that we can toggle their visibility
  return { circle, yAxis };
}

function updateParameters() {
  numThetaSteps = parseFloat(verticalResolutionSlider.value);
  numPhiSteps = parseFloat(radialResolutionSlider.value);

  petalNumber = parseFloat(petalNumberSlider.value);
  petalLength = parseFloat(petalLengthSlider.value);
  diameter = parseFloat(diameterSlider.value);
  petalSharpness = parseFloat(petalSharpnessSlider.value);
  height = parseFloat(heightSlider.value);
  curvature1 = parseFloat(curvature1Slider.value);
  curvature2 = parseFloat(curvature2Slider.value);
  bumpiness = parseFloat(bumpinessSlider.value);
  bumpNumber = parseFloat(bumpNumberSlider.value);

  createVertices(); // Recreate vertices based on updated parameters
}

// Function to calculate vertex position based on parameters
function calculateVertex(theta, phi) {
  const normalizedPhi = (phi / numPhiSteps) * 2 * Math.PI;
  const r =
    (((petalLength *
      Math.pow(
        Math.abs(Math.sin((normalizedPhi * petalNumber) / 2)),
        petalSharpness
      ) +
      diameter) *
      theta) /
      numThetaSteps /
      60) *
    60;
  const x = r * Math.cos(normalizedPhi);
  const y = r * Math.sin(normalizedPhi);

  const z =
    vShape(height, r / 100, curvature1, curvature2) -
    200 +
    perturbation(bumpiness, r / 100, bumpNumber, normalizedPhi);

  return new THREE.Vector3(x, y, z);
}

// Functions from p5.js code
function vShape(A, r, a, b) {
  return (
    A *
    Math.pow(Math.E, -b * Math.pow(Math.abs(r), 1.5)) *
    Math.pow(Math.abs(r), a)
  );
}

function perturbation(A, r, p, angle) {
  return 1 + A * Math.pow(r, 2) * Math.sin(p * angle);
}

function createVertices() {
  positions.length = 0;
  colors.length = 0;

  // Get the colors from the color pickers
  const flowerColorPicker = document.getElementById("flowerColourPicker");
  const color1 = new THREE.Color(flowerColorPicker.value);

  const flowerColorPicker2 = document.getElementById("flowerColourPicker2");
  const color2 = new THREE.Color(flowerColorPicker2.value);

  for (let theta = 0; theta < numThetaSteps; theta += 1) {
    for (let phi = 0; phi < numPhiSteps; phi += 1) {
      const vertex = calculateVertex(theta, phi);
      positions.push(vertex.x, vertex.y, vertex.z);

      // Adjust the interpolation parameter based on the loop indices
      const t = theta / numThetaSteps; // Normalize phi to [0, 1]
      const lerpedColor = color1.clone().lerp(color2, t);
      colors.push(lerpedColor.r, lerpedColor.g, lerpedColor.b);
    }
  }

  // Update BufferGeometry attributes
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3)
  );
  geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
}

// Function to randomize parameters
function randomiseParameters() {
  // Helper function to get the checked status of a checkbox
  function getCheckboxValue(checkboxId) {
    const checkbox = document.getElementById(checkboxId);
    return checkbox.checked;
  }

  // Get the checked status for each checkbox
  const keepResolutionCheck = getCheckboxValue("keepResolutionCheckbox");
  const flowerColour1Check = getCheckboxValue("flowerColour1Check");
  const flowerColour2Check = getCheckboxValue("flowerColour2Check");
  const verticalResolutionCheck = getCheckboxValue("verticalResolutionCheck");
  const radialResolutionCheck = getCheckboxValue("radialResolutionCheck");
  const petalNumberCheck = getCheckboxValue("petalNumberCheck");
  const diameterCheck = getCheckboxValue("diameterCheck");
  const petalLengthCheck = getCheckboxValue("petalLengthCheck");
  const petalSharpnessCheck = getCheckboxValue("petalSharpnessCheck");
  const heightCheck = getCheckboxValue("heightCheck");
  const curvature1Check = getCheckboxValue("curvature1Check");
  const curvature2Check = getCheckboxValue("curvature2Check");
  const bumpinessCheck = getCheckboxValue("bumpinessCheck");
  const bumpNumberCheck = getCheckboxValue("bumpNumberCheck");

  // Randomize resolution only if "Keep Resolution" is not checked
  if (!keepResolutionCheck) {
    if (!verticalResolutionCheck) {
      document.getElementById("verticalResolutionSlider").value = Math.floor(
        Math.random() * (100 - 10 + 1) + 10
      );
    }
    if (!radialResolutionCheck) {
      document.getElementById("radialResolutionSlider").value = Math.floor(
        Math.random() * (720 - 45 + 1) + 45
      );
    }
  }
  if (!petalNumberCheck) {
    document.getElementById("petalNumberSlider").value = Math.floor(
      Math.random() * (20 - 1 + 1) + 1
    );
  }
  if (!diameterCheck) {
    document.getElementById("diameterSlider").value = Math.floor(
      Math.random() * (250 - 20 + 1) + 20
    );
  }
  if (!petalLengthCheck) {
    document.getElementById("petalLengthSlider").value = Math.floor(
      Math.random() * (300 - 0 + 1)
    );
  }
  if (!petalSharpnessCheck) {
    document.getElementById("petalSharpnessSlider").value =
      Math.random() * (10.0 - 0.0) + 0.0;
  }
  if (!heightCheck) {
    document.getElementById("heightSlider").value = Math.floor(
      Math.random() * (600 - 0 + 1)
    );
  }
  if (!curvature1Check) {
    document.getElementById("curvature1Slider").value =
      Math.random() * (4.0 - 0.0) + 0.0;
  }
  if (!curvature2Check) {
    document.getElementById("curvature2Slider").value =
      Math.random() * (1.0 - 0.0) + 0.0;
  }
  if (!bumpinessCheck) {
    document.getElementById("bumpinessSlider").value =
      Math.random() * (5.0 - 0.0) + 0.0;
  }
  if (!bumpNumberCheck) {
    document.getElementById("bumpNumberSlider").value = Math.floor(
      Math.random() * (20 - 0 + 1)
    );
  }

  // Set the values of the output elements
  document.getElementById(
    "verticalResolutionSlider"
  ).nextElementSibling.textContent = document.getElementById(
    "verticalResolutionSlider"
  ).value;
  document.getElementById(
    "radialResolutionSlider"
  ).nextElementSibling.textContent = document.getElementById(
    "radialResolutionSlider"
  ).value;
  document.getElementById("petalNumberSlider").nextElementSibling.textContent =
    document.getElementById("petalNumberSlider").value;
  document.getElementById("diameterSlider").nextElementSibling.textContent =
    document.getElementById("diameterSlider").value;
  document.getElementById("petalLengthSlider").nextElementSibling.textContent =
    document.getElementById("petalLengthSlider").value;
  document.getElementById(
    "petalSharpnessSlider"
  ).nextElementSibling.textContent = document.getElementById(
    "petalSharpnessSlider"
  ).value;
  document.getElementById("heightSlider").nextElementSibling.textContent =
    document.getElementById("heightSlider").value;
  document.getElementById("curvature1Slider").nextElementSibling.textContent =
    document.getElementById("curvature1Slider").value;
  document.getElementById("curvature2Slider").nextElementSibling.textContent =
    document.getElementById("curvature2Slider").value;
  document.getElementById("bumpinessSlider").nextElementSibling.textContent =
    document.getElementById("bumpinessSlider").value;
  document.getElementById("bumpNumberSlider").nextElementSibling.textContent =
    document.getElementById("bumpNumberSlider").value;

  // Trigger the input event to update the visuals
  updateParameters();

  // Randomize color values for the color pickers
  if (!flowerColour1Check) {
    const randomColor1 = getRandomColor();
    document.getElementById("flowerColourPicker").value = randomColor1;
    document
      .getElementById("flowerColourPicker")
      .dispatchEvent(new Event("input"));
  }

  if (!flowerColour2Check) {
    const randomColor2 = getRandomColor();
    document.getElementById("flowerColourPicker2").value = randomColor2;
    document
      .getElementById("flowerColourPicker2")
      .dispatchEvent(new Event("input"));
  }
}

function getRandomColor() {
  return "#" + Math.floor(Math.random() * 16777215).toString(16);
}

function loadFlowerFromPreset(presetName) {
  const preset = presets[presetName];
  if (preset) {
    // Declare flowerColorPicker and flowerColorPicker2 variables
    const flowerColorPicker = document.getElementById("flowerColourPicker");
    const flowerColorPicker2 = document.getElementById("flowerColourPicker2");

    // Set slider values
    verticalResolutionSlider.value = preset.verticalResolution;
    radialResolutionSlider.value = preset.radialResolution;
    petalNumberSlider.value = preset.petalNumber;
    petalLengthSlider.value = preset.petalLength;
    diameterSlider.value = preset.diameter;
    petalSharpnessSlider.value = preset.petalSharpness;
    heightSlider.value = preset.height;
    curvature1Slider.value = preset.curvature1;
    curvature2Slider.value = preset.curvature2;
    bumpinessSlider.value = preset.bumpiness;
    bumpNumberSlider.value = preset.bumpNumber;

    // Update input elements
    verticalResolutionSlider.nextElementSibling.textContent =
      verticalResolutionSlider.value;
    radialResolutionSlider.nextElementSibling.textContent =
      radialResolutionSlider.value;
    petalNumberSlider.nextElementSibling.textContent = petalNumberSlider.value;
    diameterSlider.nextElementSibling.textContent = diameterSlider.value;
    petalLengthSlider.nextElementSibling.textContent = petalLengthSlider.value;
    petalSharpnessSlider.nextElementSibling.textContent =
      petalSharpnessSlider.value;
    heightSlider.nextElementSibling.textContent = heightSlider.value;
    curvature1Slider.nextElementSibling.textContent = curvature1Slider.value;
    curvature2Slider.nextElementSibling.textContent = curvature2Slider.value;
    bumpinessSlider.nextElementSibling.textContent = bumpinessSlider.value;
    bumpNumberSlider.nextElementSibling.textContent = bumpNumberSlider.value;

    // Set color picker values
    flowerColorPicker.value = preset.color1;
    flowerColorPicker2.value = preset.color2;

    // Trigger input events to update visuals
    updateParameters();
    flowerColorPicker.dispatchEvent(new Event("input"));
    flowerColorPicker2.dispatchEvent(new Event("input"));
  } else {
    console.error(`Preset '${presetName}' not found.`);
  }
}

function resetCamera() {
  camera.position.set(0, 0, 550); // Set the initial camera position
  camera.lookAt(0, 0, 0); // Look at the center of the scene
  controls.reset(); // Reset controls to their initial state
}

function toggleCartesianAxesVisibility() {
  cartesianAxesHelper.visible = !cartesianAxesHelper.visible;
}

function toggleRadialAxesVisibility() {
  radialAxesHelper.circle.visible = !radialAxesHelper.circle.visible;
  radialAxesHelper.yAxis.visible = !radialAxesHelper.yAxis.visible;
}

function toggleControls() {
  controlsContainer.classList.toggle("hidden");
}

function animate() {
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

// Function to set up sliders and add event listeners
function setupSliders() {
  const sliders = [
    "verticalResolutionSlider",
    "radialResolutionSlider",
    "petalNumberSlider",
    "petalLengthSlider",
    "diameterSlider",
    "petalSharpnessSlider",
    "heightSlider",
    "curvature1Slider",
    "curvature2Slider",
    "bumpinessSlider",
    "bumpNumberSlider",
  ];

  sliders.forEach((slider) => {
    const sliderElement = document.getElementById(`${slider}`);
    sliderElement.addEventListener("input", updateParameters);
  });
}

// Function to set up color pickers and add event listeners
function setupColorPickers() {
  const colorPickers = ["flowerColourPicker", "flowerColourPicker2"];

  colorPickers.forEach((colorPicker) => {
    const colorPickerElement = document.getElementById(colorPicker);
    colorPickerElement.addEventListener("input", createVertices);
  });
}

// Function to set up buttons and add event listeners
function setupButtons() {
  const buttons = {
    resetCameraButton,
    randomiseButton,
    toggleAxesButton,
    toggleRadialAxesButton,
    toggleControlsButton,
    hibiscusButton,
    forgetMeNotButton,
    lilyButton,
    morningGloryButton,
    buttercupButton,
  };

  Object.entries(buttons).forEach(([buttonId, buttonElement]) => {
    if (buttonElement) {
      buttonElement.addEventListener("click", () =>
        handleButtonClick(buttonId)
      );
    }
  });
}

// Function to handle button clicks
function handleButtonClick(buttonId) {
  const buttonActions = {
    resetCameraButton: resetCamera,
    randomiseButton: randomiseParameters,
    toggleAxesButton: toggleCartesianAxesVisibility,
    toggleRadialAxesButton: toggleRadialAxesVisibility,
    toggleControlsButton: toggleControls,
    hibiscusButton: () => loadFlowerFromPreset("hibiscus"),
    forgetMeNotButton: () => loadFlowerFromPreset("forgetMeNot"),
    lilyButton: () => loadFlowerFromPreset("lily"),
    morningGloryButton: () => loadFlowerFromPreset("morningGlory"),
    buttercupButton: () => loadFlowerFromPreset("buttercup"),
  };

  const buttonAction = buttonActions[buttonId];
  if (buttonAction) {
    buttonAction();
  } else {
    console.error(`Action for button '${buttonId}' not defined.`);
  }
}

// Set up sliders, color pickers, and buttons
setupSliders();
setupColorPickers();
setupButtons();

// Initial setup
toggleCartesianAxesVisibility();
initRadialAxesVisibility();
resetCamera();
updateParameters();
createVertices();

// Create material
const material = new THREE.PointsMaterial({ size: 1, vertexColors: true });

// Create mesh with BufferGeometry and material
const points = new THREE.Points(geometry, material);
scene.add(points);
scene.add(cartesianAxesHelper);

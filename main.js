import * as THREE from "three";
import { exportOBJ } from "./export.js";
import { presets } from "./presets.js";
import { createVerticesAndTriangles } from "./geometry.js";
import { initControls, initCamera, initRenderer } from "./initView.js";
import { randomiseParameters } from "./randomise.js";

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

// Create wireframe geometry
let currentWireframe = null;

// Initialize sliders and color pickers
const sliderInfo = {
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
const sliders = Object.values(sliderInfo).map((info) => info.id);
const sliderProperties = Object.keys(sliderInfo);

const flowerColourPickers = ["flowerColourPicker", "flowerColourPicker2"];

const buttonActions = {
  resetCameraButton: resetCamera,
  resetDefaultButton: () => location.reload(),
  randomiseButton: randomiseAndUpdateParameters,
  toggleAxesButton: toggleCartesianAxesVisibility,
  toggleRadialAxesButton: toggleRadialAxesVisibility,
  toggleControlsButton: toggleControls,
  exportOBJButton: () => exportOBJ(mesh),
  hibiscusButton: () => loadFlowerFromPreset("hibiscus"),
  forgetMeNotButton: () => loadFlowerFromPreset("forgetMeNot"),
  lilyButton: () => loadFlowerFromPreset("lily"),
  morningGloryButton: () => loadFlowerFromPreset("morningGlory"),
  buttercupButton: () => loadFlowerFromPreset("buttercup"),
};
const buttons = Object.keys(buttonActions);

// Axes helpers
const cartesianAxesHelper = new THREE.AxesHelper(300);
const radialAxesHelper = createRadialAxesHelper(300, 64);

// Sizes
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

// Camera
const camera = initCamera(sizes);

// Renderer
const renderer = initRenderer(sizes);

// Controls
const controls = initControls(camera, renderer);

// Event listeners
initEventListeners();

// Animation
loop();

function initEventListeners() {
  window.addEventListener("resize", onWindowResize);

  sliders.forEach((slider) => {
    const sliderElement = document.getElementById(`${slider}`);
    sliderElement.addEventListener("input", updateParameters);
  });

  flowerColourPickers.forEach((colorPicker) => {
    const colorPickerElement = document.getElementById(colorPicker);
    colorPickerElement.addEventListener("input", updateFlowerGeometry);
  });

  document
    .getElementById("backgroundColorPicker")
    .addEventListener("input", changeBackgroundColor);

  document
    .getElementById("displayModeDropdown")
    .addEventListener("change", switchDisplayMode);

  buttons.forEach((button) => {
    const buttonElement = document.getElementById(`${button}`);
    buttonElement.addEventListener("click", () => handleButtonClick(button));
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

  updateFlowerGeometry(); // Recreate vertices based on updated parameters
}

function updateFlowerGeometry() {
  createVerticesAndTriangles(
    geometry,
    numThetaSteps,
    numPhiSteps,
    petalNumber,
    petalLength,
    diameter,
    petalSharpness,
    height,
    curvature1,
    curvature2,
    bumpiness,
    bumpNumber
  );
  const dropdown = document.getElementById("displayModeDropdown");
  const selectedValue = dropdown.value;
  if (selectedValue === "wireframe") {
    updateWireframeGeometry(geometry);
  }
}

function randomiseAndUpdateParameters() {
  randomiseParameters(sliderInfo, sliderProperties);
  updateParameters();
}

function loadFlowerFromPreset(presetName) {
  const preset = presets[presetName];
  if (preset) {
    updateSlidersAndInputs(preset);
    updateColorPickers(preset);
    updateParameters();
    triggerInputEvents();
  } else {
    console.error(`Preset '${presetName}' not found.`);
  }
}

function updateSlidersAndInputs(preset) {
  sliderProperties.forEach((property) => {
    const slider = document.getElementById(`${property}Slider`);
    const inputValue = preset[property];
    slider.value = inputValue;
    slider.nextElementSibling.textContent = inputValue;
  });
}

function updateColorPickers(preset) {
  const flowerColorPicker = document.getElementById("flowerColourPicker");
  const flowerColorPicker2 = document.getElementById("flowerColourPicker2");

  flowerColorPicker.value = preset.color1;
  flowerColorPicker2.value = preset.color2;
}

function triggerInputEvents() {
  const flowerColorPicker = document.getElementById("flowerColourPicker");
  const flowerColorPicker2 = document.getElementById("flowerColourPicker2");

  flowerColorPicker.dispatchEvent(new Event("input"));
  flowerColorPicker2.dispatchEvent(new Event("input"));
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
  const controlsContainer = document.querySelector(".container");
  controlsContainer.classList.toggle("hidden");
}

function loop() {
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(loop);
}

// Function to change the background color
function changeBackgroundColor() {
  const color = backgroundColorPicker.value;
  renderer.setClearColor(new THREE.Color(color), 1);
}

// Function to handle button clicks
function handleButtonClick(buttonId) {
  const buttonAction = buttonActions[buttonId];
  if (buttonAction) {
    buttonAction();
  } else {
    console.error(`Action for button '${buttonId}' not defined.`);
  }
}

function updateWireframeGeometry(geometry) {
  // Remove the existing wireframe if there is one
  if (currentWireframe !== null) {
    scene.remove(currentWireframe);
  }

  // Create a new wireframe
  const wireframeGeometry = new THREE.WireframeGeometry(geometry);
  const wireframe = new THREE.LineSegments(wireframeGeometry);
  wireframe.material.depthTest = false;
  wireframe.material.opacity = 0.25;
  wireframe.material.transparent = true;

  // Add the new wireframe to the scene
  scene.add(wireframe);

  // Update the currentWireframe variable
  currentWireframe = wireframe;
}

// Initial setup
toggleCartesianAxesVisibility();
toggleRadialAxesVisibility();
resetCamera();
updateParameters();
updateFlowerGeometry();

// Create material
const material = new THREE.MeshBasicMaterial({
  vertexColors: true,
  side: THREE.DoubleSide,
});
const pointsMaterial = new THREE.PointsMaterial({
  size: 1,
  vertexColors: true,
});

// Create mesh with BufferGeometry and material
const mesh = new THREE.Mesh(geometry, material);
const points = new THREE.Points(geometry, pointsMaterial);
scene.add(mesh);
scene.add(points);
points.visible = false;
scene.add(cartesianAxesHelper);

// Function to switch between display modes
function switchDisplayMode() {
  const dropdown = document.getElementById("displayModeDropdown");
  const selectedValue = dropdown.value;

  // Toggle visibility of mesh and points
  if (selectedValue === "triangles") {
    mesh.visible = true;
    points.visible = false;
    if (currentWireframe != null) {
      currentWireframe.visible = false;
    }
  } else if (selectedValue === "points") {
    mesh.visible = false;
    points.visible = true;
    if (currentWireframe != null) {
      currentWireframe.visible = false;
    }
  } else if (selectedValue === "wireframe") {
    mesh.visible = false;
    points.visible = false;
    updateWireframeGeometry(geometry);
  }
}

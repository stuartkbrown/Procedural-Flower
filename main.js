import * as THREE from "three";
import { initControls, initCamera, initRenderer } from "./initView.js";
import { createRadialAxesHelper } from "./radialAxesHelper.js";
import { createVerticesAndTriangles } from "./geometry.js";
import { randomiseParameters } from "./randomise.js";
import { loadFlowerFromPreset, loadFlowerFromJSON } from "./presets.js";
import { exportOBJ, exportJSON } from "./export.js";
import { sliderInfo, sliders, sliderProperties } from "./sliders.js";

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

// Create Wireframe Geometry
let currentWireframe = null;

// Create Axes helpers
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

// Animation
loop();

// Initial setup
toggleCartesianAxesVisibility();
toggleRadialAxesVisibility();
resetCamera();
updateParameters();
updateFlowerGeometry();

// Create materials
const material = new THREE.MeshBasicMaterial({
  vertexColors: true,
  side: THREE.DoubleSide,
});
const pointsMaterial = new THREE.PointsMaterial({
  size: 1,
  vertexColors: true,
});

// Create meshes with BufferGeometry and materials
const mesh = new THREE.Mesh(geometry, material);
const points = new THREE.Points(geometry, pointsMaterial);
points.visible = false;

// Add to the scene
scene.add(mesh);
scene.add(points);
scene.add(cartesianAxesHelper);
scene.add(radialAxesHelper.circle);
scene.add(radialAxesHelper.yAxis);

// UI Elements
const flowerColourPickers = ["flowerColourPicker", "flowerColourPicker2"];

const buttonActions = {
  resetCameraButton: resetCamera,
  resetDefaultButton: () => location.reload(),
  randomiseButton: updateRandomisedParameters,
  toggleAxesButton: toggleCartesianAxesVisibility,
  toggleRadialAxesButton: toggleRadialAxesVisibility,
  toggleUIButton: toggleUI,
  exportOBJButton: () => exportOBJ(mesh),
  importJSONButton: () => {
    document.getElementById("fileInput").click();
  },
  exportJSONButton: () => {
    const color1 = document.getElementById("flowerColourPicker").value;
    const color2 = document.getElementById("flowerColourPicker2").value;
    exportJSON(
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
      bumpNumber,
      color1,
      color2
    );
  },
  hibiscusButton: () => updateFlowerFromPreset("hibiscus"),
  forgetMeNotButton: () => updateFlowerFromPreset("forgetMeNot"),
  lilyButton: () => updateFlowerFromPreset("lily"),
  morningGloryButton: () => updateFlowerFromPreset("morningGlory"),
  buttercupButton: () => updateFlowerFromPreset("buttercup"),
};
const buttons = Object.keys(buttonActions);

// Event listeners
initEventListeners();

// Functions
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

  document
    .getElementById("fileInput")
    .addEventListener("change", handleFileSelect);

  buttons.forEach((button) => {
    const buttonElement = document.getElementById(`${button}`);
    buttonElement.addEventListener("click", () => handleButtonClick(button));
  });
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

function handleFileSelect(event) {
  const fileInput = event.target;
  const file = fileInput.files[0];

  if (file) {
    // Read the contents of the selected file
    const reader = new FileReader();

    reader.onload = function (e) {
      const jsonData = e.target.result;
      // Call the function to load flower from JSON
      updateFlowerFromJSON(jsonData, sliderProperties, flowerColourPickers);
    };

    reader.readAsText(file);
  }
}

// Function to switch between display modes
function switchDisplayMode() {
  const selectedValue = getDropdownValue();

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

function getDropdownValue() {
  const dropdown = document.getElementById("displayModeDropdown");
  return dropdown.value;
}

function onWindowResize() {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();
  renderer.setSize(sizes.width, sizes.height);
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
  const selectedValue = getDropdownValue();
  if (selectedValue === "wireframe") {
    updateWireframeGeometry(geometry);
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

function updateRandomisedParameters() {
  randomiseParameters(sliderInfo, sliderProperties, flowerColourPickers);
  updateParameters();
}

function updateFlowerFromPreset(presetName) {
  loadFlowerFromPreset(presetName, sliderProperties, flowerColourPickers);
  updateParameters();
}

function updateFlowerFromJSON(jsonData) {
  loadFlowerFromJSON(jsonData, sliderProperties, flowerColourPickers);
  updateParameters();
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

function toggleUI() {
  const controlsContainer = document.querySelector(".container");
  controlsContainer.classList.toggle("hidden");
}

// Function to change the background color
function changeBackgroundColor() {
  const color = backgroundColorPicker.value;
  renderer.setClearColor(new THREE.Color(color), 1);
}

function loop() {
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(loop);
}

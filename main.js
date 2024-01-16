import * as THREE from "three";
import { initControls, initCamera, initRenderer } from "./initView.js";
import { createRadialAxesHelper } from "./radialAxesHelper.js";
import { createVerticesAndTriangles } from "./geometry.js";
import { randomiseParameters } from "./randomise.js";
import { loadFlowerFromPreset, loadFlowerFromJSON } from "./presets.js";
import { exportOBJ, exportJSON } from "./export.js";
import { sliderInfo, sliders, sliderProperties } from "./sliders.js";

// Parameters
let parameters = {
  numThetaSteps: 0,
  numPhiSteps: 0,
  petalNumber: 0,
  petalLength: 0,
  diameter: 0,
  petalSharpness: 0,
  height: 0,
  curvature1: 0,
  curvature2: 0,
  bumpiness: 0,
  bumpNumber: 0,
};

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

// Initial setup
toggleCartesianAxesVisibility();
toggleRadialAxesVisibility();
resetCamera();
updateParameters();
updateFlowerGeometry();

// Create materials
const basicMaterial = new THREE.MeshBasicMaterial({
  vertexColors: true,
  side: THREE.DoubleSide,
});
const pointsMaterial = new THREE.PointsMaterial({
  size: 1,
  vertexColors: true,
});
const phongMaterial = new THREE.MeshPhongMaterial({
  vertexColors: true,
  side: THREE.DoubleSide,
});
const standardMaterial = new THREE.MeshStandardMaterial({
  vertexColors: true,
  side: THREE.DoubleSide,
});

// Create meshes with BufferGeometry and materials
const triangles = new THREE.Mesh(geometry, basicMaterial);
const points = new THREE.Points(geometry, pointsMaterial);
const phong = new THREE.Mesh(geometry, phongMaterial);
const standard = new THREE.Mesh(geometry, standardMaterial);
points.visible = false;
phong.visible = false;
standard.visible = false;

// Create lights
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(1, 1, 1).normalize();
const ambientLight = new THREE.AmbientLight(0x404040);
directionalLight.visible = false;
ambientLight.visible = false;

// Add to the scene
scene.add(triangles);
scene.add(points);
scene.add(phong);
scene.add(standard);
scene.add(cartesianAxesHelper);
scene.add(radialAxesHelper.circle);
scene.add(radialAxesHelper.yAxis);
scene.add(directionalLight);
scene.add(ambientLight);

// UI Elements
const flowerColourPickers = ["flowerColourPicker", "flowerColourPicker2"];

const buttonActions = {
  resetCameraButton: resetCamera,
  resetDefaultButton: () => location.reload(),
  randomiseButton: updateRandomisedParameters,
  toggleAxesButton: toggleCartesianAxesVisibility,
  toggleRadialAxesButton: toggleRadialAxesVisibility,
  toggleUIButton: toggleUI,
  exportOBJButton: () => exportOBJ(triangles),
  importJSONButton: () => {
    document.getElementById("fileInput").click();
  },
  exportJSONButton: () => {
    const color1 = document.getElementById("flowerColourPicker").value;
    const color2 = document.getElementById("flowerColourPicker2").value;
    exportJSON(parameters, color1, color2);
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

// Animation
animate();

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

  if (selectedValue === "triangles") {
    triangles.visible = true;
    points.visible = false;
    if (currentWireframe != null) {
      currentWireframe.visible = false;
    }
    phong.visible = false;
    directionalLight.visible = false;
    ambientLight.visible = false;
    standard.visible = false;
  } else if (selectedValue === "points") {
    triangles.visible = false;
    points.visible = true;
    if (currentWireframe != null) {
      currentWireframe.visible = false;
    }
    phong.visible = false;
    directionalLight.visible = false;
    ambientLight.visible = false;
    standard.visible = false;
  } else if (selectedValue === "wireframe") {
    triangles.visible = false;
    points.visible = false;
    updateWireframeGeometry(geometry);
    phong.visible = false;
    directionalLight.visible = false;
    ambientLight.visible = false;
    standard.visible = false;
  } else if (selectedValue === "phong") {
    triangles.visible = false;
    points.visible = false;
    if (currentWireframe != null) {
      currentWireframe.visible = false;
    }
    directionalLight.visible = true;
    ambientLight.visible = true;
    phong.visible = true;
    standard.visible = false;
  } else if (selectedValue === "standard") {
    triangles.visible = false;
    points.visible = false;
    if (currentWireframe != null) {
      currentWireframe.visible = false;
    }
    directionalLight.visible = true;
    ambientLight.visible = true;
    phong.visible = false;
    standard.visible = true;
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
  parameters.numThetaSteps = parseFloat(verticalResolutionSlider.value);
  parameters.numPhiSteps = parseFloat(radialResolutionSlider.value);
  parameters.petalNumber = parseFloat(petalNumberSlider.value);
  parameters.petalLength = parseFloat(petalLengthSlider.value);
  parameters.diameter = parseFloat(diameterSlider.value);
  parameters.petalSharpness = parseFloat(petalSharpnessSlider.value);
  parameters.height = parseFloat(heightSlider.value);
  parameters.curvature1 = parseFloat(curvature1Slider.value);
  parameters.curvature2 = parseFloat(curvature2Slider.value);
  parameters.bumpiness = parseFloat(bumpinessSlider.value);
  parameters.bumpNumber = parseFloat(bumpNumberSlider.value);
  updateFlowerGeometry();
}

function updateFlowerGeometry() {
  createVerticesAndTriangles(geometry, parameters);
  const selectedValue = getDropdownValue();
  if (selectedValue === "wireframe") {
    updateWireframeGeometry(geometry);
  }
}

function updateWireframeGeometry(geometry) {
  if (currentWireframe !== null) {
    scene.remove(currentWireframe);
  }
  const wireframeGeometry = new THREE.WireframeGeometry(geometry);
  const wireframe = new THREE.LineSegments(wireframeGeometry);
  wireframe.material.depthTest = false;
  wireframe.material.opacity = 0.25;
  wireframe.material.transparent = true;
  scene.add(wireframe);
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
  camera.position.set(0, 0, 550);
  camera.lookAt(0, 0, 0);
  controls.reset();
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

function changeBackgroundColor() {
  const color = backgroundColorPicker.value;
  renderer.setClearColor(new THREE.Color(color), 1);
}

function animate() {
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

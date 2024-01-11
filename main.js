import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { exportOBJ } from "./export.js";
import { presets } from "./presets.js";

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

// Define arrays to hold vertex positions
const positions = [];
const colors = [];

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
  randomiseButton: randomiseParameters,
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
const camera = initCamera();

// Renderer
const renderer = initRenderer();

// Controls
const controls = initControls();

// Event listeners
initEventListeners();

// Animation
animate();

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
    const sliderElement = document.getElementById(`${slider}`);
    sliderElement.addEventListener("input", updateParameters);
  });
  flowerColourPickers.forEach((colorPicker) => {
    const colorPickerElement = document.getElementById(colorPicker);
    colorPickerElement.addEventListener("input", createVerticesAndTriangles);
  });
  const backgroundColorPicker = document.getElementById(
    "backgroundColorPicker"
  );
  backgroundColorPicker.addEventListener("input", changeBackgroundColor);
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

  createVerticesAndTriangles(); // Recreate vertices based on updated parameters
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

function createVerticesAndTriangles() {
  createVertices();
  createTriangles();
  const dropdown = document.getElementById("displayModeDropdown");
  const selectedValue = dropdown.value;
  if (selectedValue === "wireframe") {
    updateWireframeGeometry(geometry);
  }
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

function createTriangles() {
  // Assuming numThetaSteps and numPhiSteps are defined globally
  const indices = [];

  // Define a helper function to get the index of a vertex in the grid
  function getIndex(theta, phi) {
    return theta * numPhiSteps + phi;
  }

  // Create triangles by connecting vertices
  for (let theta = 0; theta < numThetaSteps - 1; theta += 1) {
    for (let phi = 0; phi < numPhiSteps - 1; phi += 1) {
      // Define the vertices of the current quad
      const v1 = getIndex(theta, phi);
      const v2 = getIndex(theta + 1, phi);
      const v3 = getIndex(theta + 1, phi + 1);
      const v4 = getIndex(theta, phi + 1);

      // Create two triangles from the quad
      indices.push(v1, v2, v3); // Triangle 1
      indices.push(v1, v3, v4); // Triangle 2
    }

    // Connect the last and first columns
    const lastColumnV1 = getIndex(theta, numPhiSteps - 1);
    const lastColumnV2 = getIndex(theta + 1, numPhiSteps - 1);
    const firstColumnV1 = getIndex(theta, 0);
    const firstColumnV2 = getIndex(theta + 1, 0);

    // Create triangles to connect last and first columns
    indices.push(lastColumnV1, lastColumnV2, firstColumnV1);
    indices.push(lastColumnV2, firstColumnV1, firstColumnV2);
  }

  // Now you have the indices for the triangles
  // You can use these indices to create faces in your BufferGeometry
  geometry.setIndex(indices);
}

// Function to randomize parameters
function randomiseParameters() {
  // Helper function to get the checked status of a checkbox
  function getCheckboxValue(checkboxId) {
    const checkbox = document.getElementById(checkboxId);
    return checkbox.checked;
  }

  // Helper function to randomize the value of a slider
  function randomizeSliderValue(sliderId, minValue, maxValue) {
    const slider = document.getElementById(sliderId);
    slider.value = Math.random() * (maxValue - minValue + 1) + minValue;
    slider.nextElementSibling.textContent = slider.value;
  }

  // Randomize resolution only if "Keep Resolution" is not checked
  const keepResolutionCheck = getCheckboxValue("keepResolutionCheckbox");
  if (!keepResolutionCheck) {
    if (!getCheckboxValue("verticalResolutionCheck")) {
      randomizeSliderValue(
        "verticalResolutionSlider",
        sliderInfo.verticalResolution.minValue,
        sliderInfo.verticalResolution.maxValue
      );
    }
    if (!getCheckboxValue("radialResolutionCheck")) {
      randomizeSliderValue(
        "radialResolutionSlider",
        sliderInfo.radialResolution.minValue,
        sliderInfo.radialResolution.maxValue
      );
    }
  }

  // Randomize other sliders
  sliderProperties.forEach((property) => {
    const checkboxId = `${property}Check`;
    if (!getCheckboxValue(checkboxId)) {
      randomizeSliderValue(
        `${property}Slider`,
        sliderInfo[property].minValue,
        sliderInfo[property].maxValue
      );
    }
  });

  // Trigger input events to update visuals
  updateParameters();

  // Randomize color values for the color pickers
  const flowerColour1Check = getCheckboxValue("flowerColour1Check");
  const flowerColour2Check = getCheckboxValue("flowerColour2Check");

  if (!flowerColour1Check) {
    randomizeColorPicker("flowerColourPicker");
  }

  if (!flowerColour2Check) {
    randomizeColorPicker("flowerColourPicker2");
  }
}

// Helper function to randomize the value of a color picker
function randomizeColorPicker(colorPickerId) {
  const colorPicker = document.getElementById(colorPickerId);
  const randomColor = getRandomColour();
  colorPicker.value = randomColor;
  colorPicker.dispatchEvent(new Event("input"));
}

function getRandomColour() {
  return "#" + Math.floor(Math.random() * 16777215).toString(16);
}

function loadFlowerFromPreset(presetName) {
  const preset = presets[presetName];
  if (preset) {
    updateSlidersAndInputs(preset);
    updateColorPickers(preset);
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
  updateParameters();

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

function animate() {
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
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
createVerticesAndTriangles();
geometry.computeVertexNormals();

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

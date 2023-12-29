import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

// Scene
const scene = new THREE.Scene();

// Create Buffer Geometry
const geometry = new THREE.BufferGeometry();

// Define arrays to hold vertex positions
const positions = [];
const colors = [];

// Create 3D cartesian axes helper
const cartesianAxesHelper = new THREE.AxesHelper(300);

// Function to toggle the visibility of the 3D axes helper
function toggleCartesianAxesVisibility() {
  cartesianAxesHelper.visible = !cartesianAxesHelper.visible;
}

toggleCartesianAxesVisibility();

// Create 3D radial axes helper
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

// Call the function to create the radial axes helper
const radialAxesHelper = createRadialAxesHelper(300, 64);

function toggleRadialAxesVisibility() {
  radialAxesHelper.circle.visible = !radialAxesHelper.circle.visible;
  radialAxesHelper.yAxis.visible = !radialAxesHelper.yAxis.visible;
}

toggleRadialAxesVisibility();

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

// Create vertices
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

// Set up sliders
const verticalResolutionSlider = document.getElementById(
  "verticalResolutionSlider"
);
const radialResolutionSlider = document.getElementById(
  "radialResolutionSlider"
);

const petalNumberSlider = document.getElementById("petalNumberSlider");
const petalLengthSlider = document.getElementById("petalLengthSlider");
const diameterSlider = document.getElementById("diameterSlider");
const petalSharpnessSlider = document.getElementById("petalSharpnessSlider");
const heightSlider = document.getElementById("heightSlider");
const curvature1Slider = document.getElementById("curvature1Slider");
const curvature2Slider = document.getElementById("curvature2Slider");
const bumpinessSlider = document.getElementById("bumpinessSlider");
const bumpNumberSlider = document.getElementById("bumpNumberSlider");

// Set up colour pickers
const flowerColorPicker = document.getElementById("flowerColourPicker");
const flowerColorPicker2 = document.getElementById("flowerColourPicker2");

// Set up background color picker
const backgroundColorPicker = document.getElementById("backgroundColorPicker");

// Function to change the background color
function changeBackgroundColor() {
  const color = backgroundColorPicker.value;
  renderer.setClearColor(new THREE.Color(color), 1);
}

// Set up buttons
const resetCameraButton = document.getElementById("resetCameraButton");
const randomiseButton = document.getElementById("randomiseButton");

const toggleAxesButton = document.getElementById("toggleAxesButton");
const toggleRadialAxesButton = document.getElementById(
  "toggleRadialAxesButton"
);

const toggleControlsButton = document.getElementById("toggleControlsButton");
const controlsContainer = document.querySelector(".container");

// Function to toggle the visibility of the controls
function toggleControls() {
  controlsContainer.classList.toggle("hidden");
}

const hibiscusButton = document.getElementById("hibiscusButton");
const forgetMeNotButton = document.getElementById("forgetMeNotButton");
const lilyButton = document.getElementById("lilyButton");
const morningGloryButton = document.getElementById("morningGloryButton");
const buttercupButton = document.getElementById("buttercupButton");

// Function to update parameters based on slider values
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

// Function to randomize parameters
function randomiseParameters() {
  document.getElementById("verticalResolutionSlider").value = Math.floor(
    Math.random() * (100 - 10 + 1) + 10
  );
  document.getElementById("radialResolutionSlider").value = Math.floor(
    Math.random() * (720 - 45 + 1) + 45
  );
  document.getElementById("petalNumberSlider").value = Math.floor(
    Math.random() * (20 - 1 + 1) + 1
  );
  document.getElementById("diameterSlider").value = Math.floor(
    Math.random() * (250 - 20 + 1) + 20
  );
  document.getElementById("petalLengthSlider").value = Math.floor(
    Math.random() * (300 - 0 + 1)
  );
  document.getElementById("petalSharpnessSlider").value =
    Math.random() * (10.0 - 0.0) + 0.0;
  document.getElementById("heightSlider").value = Math.floor(
    Math.random() * (600 - 0 + 1)
  );
  document.getElementById("curvature1Slider").value =
    Math.random() * (4.0 - 0.0) + 0.0;
  document.getElementById("curvature2Slider").value =
    Math.random() * (1.0 - 0.0) + 0.0;
  document.getElementById("bumpinessSlider").value =
    Math.random() * (5.0 - 0.0) + 0.0;
  document.getElementById("bumpNumberSlider").value = Math.floor(
    Math.random() * (20 - 0 + 1)
  );

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
  const randomColor1 = getRandomColor();
  const randomColor2 = getRandomColor();

  document.getElementById("flowerColourPicker").value = randomColor1;
  document.getElementById("flowerColourPicker2").value = randomColor2;

  // Trigger the input event for color pickers to update the visuals
  document
    .getElementById("flowerColourPicker")
    .dispatchEvent(new Event("input"));
  document
    .getElementById("flowerColourPicker2")
    .dispatchEvent(new Event("input"));
}

// Function to get a random color in hex format
function getRandomColor() {
  return "#" + Math.floor(Math.random() * 16777215).toString(16);
}

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

// Function to load flower from a preset
function loadFlowerFromPreset(presetName) {
  const preset = presets[presetName];
  if (preset) {
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

// Add event listeners for slider changes
verticalResolutionSlider.addEventListener("input", updateParameters);
radialResolutionSlider.addEventListener("input", updateParameters);

petalNumberSlider.addEventListener("input", updateParameters);
petalLengthSlider.addEventListener("input", updateParameters);
diameterSlider.addEventListener("input", updateParameters);
petalSharpnessSlider.addEventListener("input", updateParameters);
heightSlider.addEventListener("input", updateParameters);
curvature1Slider.addEventListener("input", updateParameters);
curvature2Slider.addEventListener("input", updateParameters);
bumpinessSlider.addEventListener("input", updateParameters);
bumpNumberSlider.addEventListener("input", updateParameters);

// Add event listener for colour pickers
flowerColorPicker.addEventListener("input", createVertices);
flowerColorPicker2.addEventListener("input", createVertices);

// Add event listener for the background color picker
backgroundColorPicker.addEventListener("input", changeBackgroundColor);

// Add event listener for the buttons
document
  .getElementById("resetDefaultButton")
  .addEventListener("click", function () {
    location.reload();
  });
resetCameraButton.addEventListener("click", resetCamera);
randomiseButton.addEventListener("click", randomiseParameters);
toggleAxesButton.addEventListener("click", toggleCartesianAxesVisibility);
toggleRadialAxesButton.addEventListener("click", toggleRadialAxesVisibility);

toggleControlsButton.addEventListener("click", toggleControls);

hibiscusButton.addEventListener("click", () =>
  loadFlowerFromPreset("hibiscus")
);
forgetMeNotButton.addEventListener("click", () =>
  loadFlowerFromPreset("forgetMeNot")
);
lilyButton.addEventListener("click", () => loadFlowerFromPreset("lily"));
morningGloryButton.addEventListener("click", () =>
  loadFlowerFromPreset("morningGlory")
);
buttercupButton.addEventListener("click", () =>
  loadFlowerFromPreset("buttercup")
);

// Sizes
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

// Camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  8000
);
camera.position.z = 550;

// Function to reset camera position and orientation
function resetCamera() {
  camera.position.set(0, 0, 550); // Set the initial camera position
  camera.lookAt(0, 0, 0); // Look at the center of the scene
  controls.reset(); // Reset controls to their initial state
}

// Renderer
const canvas = document.querySelector(".webgl");
const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(sizes.width, sizes.height);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.08;

// Resize
window.addEventListener("resize", () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  renderer.setSize(sizes.width, sizes.height);
});

// Animation
const animate = () => {
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
};

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

// Initial creation of vertices
updateParameters();
createVertices();

// Create material
const material = new THREE.PointsMaterial({ size: 1, vertexColors: true });

// Create mesh with BufferGeometry and material
const points = new THREE.Points(geometry, material);
scene.add(points);
scene.add(cartesianAxesHelper);

// Start the animation loop
animate();

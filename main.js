import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

// Scene
const scene = new THREE.Scene();

// Create Buffer Geometry
const geometry = new THREE.BufferGeometry();

// Define arrays to hold vertex positions
const positions = [];
const colors = [];

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

// Set up buttons
const resetCameraButton = document.getElementById("resetCameraButton");
const randomiseButton = document.getElementById("randomiseButton");

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

// Add event listener for the buttons
resetCameraButton.addEventListener("click", resetCamera);
randomiseButton.addEventListener("click", randomiseParameters);

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

// Start the animation loop
animate();

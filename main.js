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

  for (let theta = 0; theta < numThetaSteps; theta += 1) {
    for (let phi = 0; phi < numPhiSteps; phi += 1) {
      const vertex = calculateVertex(theta, phi);
      positions.push(vertex.x, vertex.y, vertex.z);

      // Color based on z-coordinate
      const color = new THREE.Color(0xffffff);
      color.setRGB((vertex.z + 200) / 400, 0, 1 - (vertex.z + 200) / 400);
      colors.push(color.r, color.g, color.b);
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
  1000
);
camera.position.z = 700;

// Renderer
const canvas = document.querySelector(".webgl");
const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(sizes.width, sizes.height);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

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
const material = new THREE.PointsMaterial({ size: 0.1, vertexColors: true });

// Create mesh with BufferGeometry and material
const points = new THREE.Points(geometry, material);
scene.add(points);

// Start the animation loop
animate();

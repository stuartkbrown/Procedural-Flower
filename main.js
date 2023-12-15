import * as THREE from "three";
import "/style.css";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

// Scene
const scene = new THREE.Scene();

// Create Buffer Geometry
const geometry = new THREE.BufferGeometry();

// Define arrays to hold vertex positions
const positions = [];
const colors = [];

// Parameters
const numThetaSteps = 60;
const numPhiSteps = 360;

// Function to calculate vertex position based on parameters
function calculateVertex(theta, phi) {
  const r =
    ((70 * Math.pow(Math.abs(Math.sin(phi * 3)), 1) + 225) * theta) / 60;
  const x = r * Math.cos(phi);
  const y = r * Math.sin(phi);

  const z =
    vShape(350, r / 100, 0.8, 0.15) - 200 + perturbation(1.5, r / 100, 12, phi);

  return new THREE.Vector3(x, y, z);
}

// Create vertices
for (let theta = 0; theta < numThetaSteps; theta += 1) {
  for (let phi = 0; phi < numPhiSteps; phi += 2) {
    const vertex = calculateVertex(theta, phi);
    positions.push(vertex.x, vertex.y, vertex.z);

    // Color based on z-coordinate
    const color = new THREE.Color(0xffffff);
    color.setRGB((vertex.z + 200) / 400, 0, 1 - (vertex.z + 200) / 400);
    colors.push(color.r, color.g, color.b);
  }
}

// Set attributes to BufferGeometry
geometry.setAttribute(
  "position",
  new THREE.Float32BufferAttribute(positions, 3)
);
geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));

// Create material
const material = new THREE.PointsMaterial({ size: 0.1, vertexColors: true });

// Create mesh with BufferGeometry and material
const points = new THREE.Points(geometry, material);
scene.add(points);

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

animate();

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

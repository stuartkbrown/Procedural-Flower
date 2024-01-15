import * as THREE from "three";

export function createVerticesAndTriangles(geometry, parameters) {
  createVertices(geometry, parameters);
  createTriangles(geometry, parameters.numThetaSteps, parameters.numPhiSteps);
  geometry.computeVertexNormals();
}

function createTriangles(geometry, numThetaSteps, numPhiSteps) {
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

function createVertices(geometry, parameters) {
  let positions = [];
  let colors = [];

  // Get the colors from the color pickers
  const flowerColorPicker = document.getElementById("flowerColourPicker");
  const color1 = new THREE.Color(flowerColorPicker.value);

  const flowerColorPicker2 = document.getElementById("flowerColourPicker2");
  const color2 = new THREE.Color(flowerColorPicker2.value);

  for (let theta = 0; theta < parameters.numThetaSteps; theta += 1) {
    for (let phi = 0; phi < parameters.numPhiSteps; phi += 1) {
      const vertex = calculateVertex(theta, phi, parameters);
      positions.push(vertex.x, vertex.y, vertex.z);

      // Adjust the interpolation parameter based on the loop indices
      const t = theta / parameters.numThetaSteps; // Normalize phi to [0, 1]
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

// Function to calculate vertex position based on parameters
function calculateVertex(theta, phi, parameters) {
  const normalizedPhi = (phi / parameters.numPhiSteps) * 2 * Math.PI;
  const r =
    (((parameters.petalLength *
      Math.pow(
        Math.abs(Math.sin((normalizedPhi * parameters.petalNumber) / 2)),
        parameters.petalSharpness
      ) +
      parameters.diameter) *
      theta) /
      parameters.numThetaSteps /
      60) *
    60;
  const x = r * Math.cos(normalizedPhi);
  const y = r * Math.sin(normalizedPhi);

  const z =
    vShape(
      parameters.height,
      r / 100,
      parameters.curvature1,
      parameters.curvature2
    ) -
    200 +
    perturbation(
      parameters.bumpiness,
      r / 100,
      parameters.bumpNumber,
      normalizedPhi
    );

  return new THREE.Vector3(x, y, z);
}

// Math functions
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

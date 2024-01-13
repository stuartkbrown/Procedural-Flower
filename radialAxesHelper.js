import * as THREE from "three";

export function createRadialAxesHelper(size, segments) {
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

  // Create the Y-axis with length 300
  const yAxisMaterial = new THREE.LineBasicMaterial({ color: 0x0000ff });
  const yAxisGeometry = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 0, size),
  ]);
  const yAxis = new THREE.Line(yAxisGeometry, yAxisMaterial);

  // Return the helper objects so that we can toggle their visibility
  return { circle, yAxis };
}

import { OBJExporter } from "three/addons/exporters/OBJExporter.js";

export function exportOBJ(mesh) {
  const exporter = new OBJExporter();
  const result = exporter.parse(mesh);
  saveString(result, "ProceduralFlower.obj");
}

function saveString(text, filename) {
  const blob = new Blob([text], { type: "text/plain" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
}

export function exportJSON(
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
) {
  // Create the JSON string manually
  const jsonString = `proceduralFlower: {
    verticalResolution: ${numThetaSteps},
    radialResolution: ${numPhiSteps},
    petalNumber: ${petalNumber},
    petalLength: ${petalLength},
    diameter: ${diameter},
    petalSharpness: ${petalSharpness},
    height: ${height},
    curvature1: ${curvature1},
    curvature2: ${curvature2},
    bumpiness: ${bumpiness},
    bumpNumber: ${bumpNumber},
    color1: "${color1}",
    color2: "${color2}",
  }`;

  // Create a Blob from the JSON string
  const blob = new Blob([jsonString], { type: "application/json" });

  // Create a download link
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);

  // Set the filename for the download
  link.download = "proceduralFlowerParameters.json";

  // Append the link to the document
  document.body.appendChild(link);

  // Trigger a click on the link to initiate the download
  link.click();

  // Remove the link from the document
  document.body.removeChild(link);
}

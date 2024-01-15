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

export function exportJSON(parameters, color1, color2) {
  // Create the JSON string
  const data = {
    proceduralFlower: {
      verticalResolution: parameters.numThetaSteps,
      radialResolution: parameters.numPhiSteps,
      petalNumber: parameters.petalNumber,
      petalLength: parameters.petalLength,
      diameter: parameters.diameter,
      petalSharpness: parameters.petalSharpness,
      height: parameters.height,
      curvature1: parameters.curvature1,
      curvature2: parameters.curvature2,
      bumpiness: parameters.bumpiness,
      bumpNumber: parameters.bumpNumber,
      color1: color1,
      color2: color2,
    },
  };

  const jsonString = JSON.stringify(data, null, 2);

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

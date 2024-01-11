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

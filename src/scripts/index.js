import * as THREE from "three";
import WindowResize from "three-window-resize";
import random from "lodash.random";
import FontCache from "./font-cache";
import ModelCache from "./model-cache";
import SoundCache from "./sound-cache";

const appEl = document.querySelector(".app");
const loadingEl = appEl.querySelector(".loading");
const color = new THREE.Color(getComputedStyle(appEl).getPropertyValue("color"));
const material = new THREE.MeshToonMaterial({ color });
const fieldOfView = 55;
const drawDistance = 1000;
const gridSize = 10000;
const gridDivisions = 140;
const fontCache = new FontCache();
const modelCache = new ModelCache();
const soundCache = new SoundCache();

let renderer, camera, scene, text, gridTop, gridBottom, spotlight, notes;

init().then(render);

function init() {
  return Promise
  .resolve()
  .then(() => {
    loadingEl.innerHTML = "Loading fonts...";
    return fontCache.init(["Righteous_Regular"]);
  }).then(() => {
    loadingEl.innerHTML = "Loading models...";
    return modelCache.init(["note1", "note2", "note3", "note4"]);
  }).then(() => {
    loadingEl.innerHTML = "Loading sounds...";
    return soundCache.init(["1", "2", "3", "4", "5"]);
  }).then(() => {
    loadingEl.remove();

    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    appEl.appendChild(renderer.domElement);

    camera = new THREE.PerspectiveCamera(fieldOfView, window.innerWidth / window.innerHeight, 1, drawDistance);
    camera.position.x = 0;
    camera.position.y = 0;
    camera.position.z = drawDistance;

    WindowResize(renderer, camera); // Automatically handle window resize events.

    scene = new THREE.Scene();

    let font = fontCache.get("Righteous_Regular");
    let geometry = new THREE.TextGeometry("SYNTH MOOD", { font, size: 110, height: 1 });
    geometry.computeBoundingBox(); // Compute bounding box so that text can be centered.
    text = new THREE.Mesh(geometry, material);
    text.position.x = geometry.boundingBox.min.x - geometry.boundingBox.max.x / 2;
    text.position.y = geometry.boundingBox.min.y - geometry.boundingBox.max.y / 2;
    text.position.z = camera.position.z + 250;
    scene.add(text);

    gridTop = new THREE.GridHelper(gridSize, gridDivisions);
    gridTop.position.x = 0;
    gridTop.position.y = 125;
    gridTop.position.z = 0;
    gridTop.material = material;
    scene.add(gridTop);

    gridBottom = new THREE.GridHelper(gridSize, gridDivisions);
    gridBottom.position.x = 0;
    gridBottom.position.y = -125;
    gridBottom.position.z = 0;
    gridBottom.material = material;
    scene.add(gridBottom);

    spotlight = new THREE.SpotLight();
    spotlight.position.x = 0;
    spotlight.position.y = 0;
    spotlight.position.z = -700;
    spotlight.distance = drawDistance + Math.abs(spotlight.position.z) - 100;
    spotlight.intensity = 2;
    spotlight.decay = 0.7;
    spotlight.color = color;
    spotlight.target = camera;
    scene.add(spotlight);

    notes = [];
  });
}

function render() {
  requestAnimationFrame(render);

  // Move grids closer to the camera.
  // To make grids appear "infinite", reset their position once they have travelled one grid row of distance.
  gridTop.position.z += gridTop.position.z < gridSize / gridDivisions ? 1 : -gridTop.position.z;
  gridBottom.position.z += gridBottom.position.z < gridSize / gridDivisions ? 1 : -gridBottom.position.z;

  if (text.position.z > 0) {
    // Move text away from the camera until it reaches its resting position.
    text.position.z = Math.max(text.position.z - 5, 0);
  } else {
    // Move notes closer to the camera.
    // Destroy notes once they have travelled past the camera.
    notes.forEach(note => {
      if (note.position.z < camera.position.z) {
        note.position.z += 4;
      } else {
        notes.shift();
        scene.remove(note);
      }
    });

    // Spawn a new note?
    let previousNote = notes[notes.length - 1];
    if (!previousNote || previousNote.position.z > text.position.z + 60) {
      let models = Array.from(modelCache.values());
      let note = models[random(0, models.length - 1)].clone();
      note.position.x = previousNote && previousNote.position.y === gridBottom.position.y ? -previousNote.position.x : random(text.position.x, text.position.x + text.geometry.boundingBox.max.x - text.geometry.boundingBox.min.x);
      note.position.y = previousNote && previousNote.position.y === gridBottom.position.y ? gridTop.position.y : gridBottom.position.y;
      note.position.z = text.position.z;
      note.scale.x = note.scale.y = note.scale.z = 15;
      note.traverse(child => Object.assign(child, { material }));
      notes.push(note);
      scene.add(note);
    }

    // Spawn a new sound?
    let sounds = Array.from(soundCache.values());
    let mutedSounds = sounds.filter(sound => sound.playState === 0);
    if (sounds.length === mutedSounds.length || random(0, 1000) === 0) {
      let sound = mutedSounds[random(0, mutedSounds.length - 1)];
      // if (sound) sound.play();
    }
  }

  // Render the scene!
  renderer.render(scene, camera);
}

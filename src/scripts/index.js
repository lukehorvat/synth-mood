import * as THREE from "three";
import OBJLoader from "three-obj-loader";
import WindowResize from "three-window-resize";
import random from "lodash.random";
import { soundManager } from "soundmanager2";

soundManager.setup({
  debugMode: false,
  onready: () => ["1.mp3", "2.mp3", "3.mp3", "4.mp3", "5.mp3"].forEach(sound => (
    soundManager.createSound({
      id: sound,
      url: `sounds/${sound}`,
      autoLoad: true,
      onload: () => {
        // TODO.
      }
    })
  ))
});

OBJLoader(THREE);

const backgroundColor = new THREE.Color(0x111111);
const foregroundColor = new THREE.Color(0x3700FF);
const lightColor = new THREE.Color(0xFFFFFF);
const material = new THREE.MeshToonMaterial({ color: foregroundColor, transparent: true, opacity: 0.85 });
const fieldOfView = 45;
const drawDistance = 1000;
const gridSize = 10000;
const gridDivisions = 150;

let renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

let scene = new THREE.Scene();
scene.background = backgroundColor;

let camera = new THREE.PerspectiveCamera(fieldOfView, window.innerWidth / window.innerHeight, 1, drawDistance);
camera.position.x = 0;
camera.position.y = 0;
camera.position.z = drawDistance;

let ambientLight = new THREE.AmbientLight(lightColor);
scene.add(ambientLight);

let fontLoader = new THREE.FontLoader();
fontLoader.load("fonts/Righteous_Regular.json", font => {
  let geometry = new THREE.TextGeometry("SYNTH MOOD", { font, size: 85, height: 1 });
  let text = new THREE.Mesh(geometry, material);

  // Center text.
  geometry.computeBoundingBox();
  text.position.x = geometry.boundingBox.min.x - geometry.boundingBox.max.x / 2;
  text.position.y = geometry.boundingBox.min.y - geometry.boundingBox.max.y / 2;
  text.position.z = 0;

  scene.add(text);
});

let gridBottom = new THREE.GridHelper(gridSize, gridDivisions);
gridBottom.position.x = 0;
gridBottom.position.y = -100;
gridBottom.position.z = 0;
gridBottom.material = material;
gridBottom.userData = { type: "grid" };
scene.add(gridBottom);

let gridTop = new THREE.GridHelper(gridSize, gridDivisions);
gridTop.position.x = 0;
gridTop.position.y = 100;
gridTop.position.z = 0;
gridTop.material = material;
gridTop.userData = { type: "grid" };
scene.add(gridTop);

let objLoader = new THREE.OBJLoader();
objLoader.setPath("models/");

let t = 0;

function render() {
  requestAnimationFrame(render);

  // Update all objects in the scene.
  let childrenToRemove = new Set();
  scene.traverse(child => {
    switch (child.userData.type) {
      case "grid":
        if (child.position.z < gridSize / gridDivisions)
          // Move grid closer to the camera.
          child.position.z += 1;
        else
          // To make grid appear "infinite", reset its position once it has travelled one grid row of distance.
          child.position.z = 0;
        break;
      case "note":
        if (child.position.z < camera.position.z)
          // Move note closer to the camera.
          child.position.z += 3;
        else
          // Destroy note once it has travelled past the camera.
          childrenToRemove.add(child);
        // child.rotation.y += 0.02;
        break;
    }
  });

  // Destroy scene objects.
  childrenToRemove.forEach(::scene.remove);

  // Spawn a new note.
  if (t % 15 === 0) {
    objLoader.load(`note${random(1, 4)}.obj`, note => {
      note.position.x = random(-380, 380);
      note.position.y = random(gridBottom.position.y, gridTop.position.y);
      note.position.z = 0;
      note.scale.x = note.scale.y = note.scale.z = 10;
      note.userData = { type: "note" };
      note.traverse(child => {
        if (child instanceof THREE.Mesh) {
          child.material = material;
        }
      });

      scene.add(note);
    });
  }

  // Spawn a new sound.
  if (t % 1000 === 0) {
    // soundManager.getSoundById(`${random(1, 5)}.mp3`).play();
  }

  // Render the scene!
  renderer.render(scene, camera);

  t++;
}

render();

WindowResize(renderer, camera); // Automatically handle window resize events.

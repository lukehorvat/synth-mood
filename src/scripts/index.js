import * as THREE from "three";
import OBJLoader from "three-obj-loader";
import WindowResize from "three-window-resize";
import random from "lodash.random";

OBJLoader(THREE);

const backgroundColor = new THREE.Color(0x111111);
const foregroundColor = new THREE.Color(0x3700FF);
const lightColor = new THREE.Color(0xFFFFFF);
const fieldOfView = 45;
const drawDistance = 1000;
const gridSize = 10000;
const gridDivisions = 150;

let renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

let scene = new THREE.Scene();
scene.background = backgroundColor;

let ambientLight = new THREE.AmbientLight(lightColor);
scene.add(ambientLight);

let camera = new THREE.PerspectiveCamera(fieldOfView, window.innerWidth / window.innerHeight, 1, drawDistance);
camera.position.x = 0;
camera.position.y = 0;
camera.position.z = drawDistance;

let gridBottom = new THREE.GridHelper(gridSize, gridDivisions, foregroundColor, foregroundColor);
gridBottom.position.x = 0;
gridBottom.position.y = -100;
gridBottom.position.z = 0;
gridBottom.userData.type = "grid";
scene.add(gridBottom);

let gridTop = new THREE.GridHelper(gridSize, gridDivisions, foregroundColor, foregroundColor);
gridTop.position.x = 0;
gridTop.position.y = 100;
gridTop.position.z = 0;
gridTop.userData.type = "grid";
scene.add(gridTop);

let objLoader = new THREE.OBJLoader();
objLoader.setPath("models/");

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
      case "item":
        if (child.position.z < camera.position.z)
          // Move item closer to the camera.
          child.position.z += 1;
        else
          // Destroy item once it has travelled past the camera.
          childrenToRemove.add(child);
        break;
    }
  });

  // Destroy scene objects.
  childrenToRemove.forEach(::scene.remove);

  // Spawn a new item.
  if (random(0, 1000) < 10) {
    objLoader.load(`item${random(1, 2)}.obj`, item => {
      item.position.x = random(-1000, 1000, true);
      item.position.y = gridBottom.position.y;
      item.position.z = 0;
      item.scale.x = 30;
      item.scale.y = 30;
      item.scale.z = 30;
      item.userData.type = "item";
      item.traverse(child => {
        if (child instanceof THREE.Mesh) {
          child.material = new THREE.MeshLambertMaterial({ color: foregroundColor, transparent: true, opacity: 0.8 });
        }
      });

      scene.add(item);
    });
  }

  // Render the scene!
  renderer.render(scene, camera);
}

render();

WindowResize(renderer, camera); // Automatically handle window resize events.

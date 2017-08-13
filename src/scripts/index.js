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

let loader = new THREE.OBJLoader();

loader.load("models/building1.obj", object => {
  object.position.x = random(-1000, 1000, true);
  object.position.y = gridBottom.position.y;
  object.position.z = 0;
  object.scale.x = 30;
  object.scale.y = 30;
  object.scale.z = 30;
  object.userData.type = "item";

  object.traverse(child => {
    if (child instanceof THREE.Mesh) {
      child.material = new THREE.MeshLambertMaterial({ color: foregroundColor, transparent: true, opacity: 0.8 });
    }
  });

  scene.add(object);
});

function render() {
  requestAnimationFrame(render);

  scene.traverse(child => {
    switch (child.userData.type) {
      case "grid":
        // Move grid closer to the camera.
        // To make grid appear "infinite", reset its position once it has travelled one grid row of distance.
        child.position.z = child.position.z < gridSize / gridDivisions ? child.position.z + 1 : 0;
        break;
      case "item":
        // Move item closer to the camera.
        // Reset its position once it has travelled past the camera.
        child.position.z = child.position.z < camera.position.z ? child.position.z + 1 : 0;
        break;
    }
  });

  // Render the scene!
  renderer.render(scene, camera);
}

render();

WindowResize(renderer, camera); // Automatically handle window resize events.

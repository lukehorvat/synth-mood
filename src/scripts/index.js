import * as THREE from "three";
import WindowResize from "three-window-resize";
import random from "lodash.random";
import sample from "lodash.sample";
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

let renderer, camera, scene, text, gridTop, gridBottom, spotlight, models, sounds;

init().then(render);

function init() {
  return Promise
  .resolve()
  .then(() => {
    loadingEl.innerHTML = "Loading fonts...";
    return fontCache.init(["Righteous_Regular"]);
  }).then(() => {
    loadingEl.innerHTML = "Loading models...";
    return modelCache.init(Array.from({ length: 4 }, (_, n) => `${n + 1}`));
  }).then(() => {
    loadingEl.innerHTML = "Loading sounds...";
    return soundCache.init(Array.from({ length: 26 }, (_, n) => `${n + 1}`));
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

    models = [];
    sounds = [];
  });
}

function render() {
  // Queue up the next render.
  setTimeout(render, 16);

  // Move grids closer to the camera.
  // To make grids appear "infinite", reset their position once they have travelled one grid row of distance.
  gridTop.position.z += gridTop.position.z < gridSize / gridDivisions ? 1 : -gridTop.position.z;
  gridBottom.position.z += gridBottom.position.z < gridSize / gridDivisions ? 1 : -gridBottom.position.z;

  if (text.position.z > 0) {
    // Move text away from the camera until it reaches its resting position.
    text.position.z = Math.max(text.position.z - 5, 0);
  } else {
    // Move models closer to the camera.
    // Destroy models once they have travelled past the camera.
    models.forEach(model => {
      if (model.position.z < camera.position.z) {
        model.position.z += 4;
      } else {
        models.shift();
        scene.remove(model);
      }
    });

    // Spawn a new model?
    let lastModel = models[models.length - 1];
    if (!lastModel || lastModel.position.z > text.position.z + 60) {
      let model = sample(Array.from(modelCache.values())).clone();
      model.position.x = lastModel && lastModel.position.y === gridBottom.position.y ? -lastModel.position.x : random(text.position.x, text.position.x + text.geometry.boundingBox.max.x - text.geometry.boundingBox.min.x);
      model.position.y = lastModel && lastModel.position.y === gridBottom.position.y ? gridTop.position.y : gridBottom.position.y;
      model.position.z = text.position.z;
      model.scale.x = model.scale.y = model.scale.z = 15;
      model.children.filter(child => child instanceof THREE.Mesh).forEach(mesh => Object.assign(mesh, { material }));
      models.push(model);
      scene.add(model);
    }

    // Spawn a new sound?
    let lastSound = sounds[sounds.length - 1];
    if (!lastSound || lastSound.position > lastSound.duration * 0.65) {
      let sound = sample(Array.from(soundCache.values()).filter(sound => !sounds.includes(sound)));
      sound.repeats = random(0, 4);
      sound.onPosition(sound.duration * 0.95, () => {
        if (sound.repeats > 0) {
          sound.repeats--;
          sound.setPosition(0);
        }
      });
      sound.play({ onfinish: ::sounds.shift });
      sounds.push(sound);
    }
  }

  // Render the scene!
  renderer.render(scene, camera);
}

// Google Analytics.
(function(i,s,o,g,r,a,m){i["GoogleAnalyticsObject"]=r;i[r]=i[r]||function(){
(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
})(window,document,"script","https://www.google-analytics.com/analytics.js","ga");
ga("create", "UA-24505142-6", "auto");
ga("send", "pageview");

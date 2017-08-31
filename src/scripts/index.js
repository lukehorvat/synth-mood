import * as THREE from "three";
import WindowResize from "three-window-resize";
import random from "lodash.random";
import sample from "lodash.sample";
import each from "promise-each";
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
const fontFilenames = ["Righteous_Regular.json"];
const modelFilenames = Array.from({ length: 4 }, (_, index) => `${index + 1}.obj`);
const soundFilenames = Array.from({ length: 26 }, (_, index) => `${index + 1}.ogg`);
const fontCache = new FontCache("fonts");
const modelCache = new ModelCache("models");
const soundCache = new SoundCache("sounds");

let renderer, camera, scene, description, title, gridTop, gridBottom, spotlight, models, sounds;

init().then(render);

function init() {
  return Promise
  .resolve()
  .then(() => (
    Promise.resolve(fontFilenames).then(each((fontFilename, index) => {
      loadingEl.innerHTML = `Loading font ${index + 1}/${fontFilenames.length}...`;
      return fontCache.set(fontFilename);
    }))
  )).then(() => (
    Promise.resolve(modelFilenames).then(each((modelFilename, index) => {
      loadingEl.innerHTML = `Loading model ${index + 1}/${modelFilenames.length}...`;
      return modelCache.set(modelFilename);
    }))
  )).then(() => (
    Promise.resolve(soundFilenames).then(each((soundFilename, index) => {
      loadingEl.innerHTML = `Loading sound ${index + 1}/${soundFilenames.length}...`;
      return soundCache.set(soundFilename);
    }))
  )).then(() => {
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

    let font = fontCache.get("Righteous_Regular.json");
    description = new THREE.Mesh(new THREE.TextGeometry("SLEEP, STUDY, AND RELAX WITH THE SOUND OF SYNTHESIZERS!", { font, size: 35, height: 1 }));
    description.material = Object.assign(material.clone(), { transparent: true });
    description.geometry.computeBoundingBox(); // Compute bounding box so that text can be centered.
    description.position.x = description.geometry.boundingBox.min.x - description.geometry.boundingBox.max.x / 2;
    description.position.y = description.geometry.boundingBox.min.y - description.geometry.boundingBox.max.y / 2;
    description.position.z = camera.position.z + 250;
    scene.add(description);

    title = new THREE.Mesh(new THREE.TextGeometry("SYNTH MOOD", { font, size: 110, height: 1 }));
    title.material = material;
    title.geometry.computeBoundingBox(); // Compute bounding box so that text can be centered.
    title.position.x = title.geometry.boundingBox.min.x - title.geometry.boundingBox.max.x / 2;
    title.position.y = title.geometry.boundingBox.min.y - title.geometry.boundingBox.max.y / 2;
    title.position.z = camera.position.z + 1250;
    scene.add(title);

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

  if (description.position.z > 0) {
    // Move description away from the camera until it reaches its resting position.
    description.position.z = Math.max(description.position.z - 5, 0);
  } else if (title.position.z > 0) {
    // Move title away from the camera until it reaches its resting position.
    title.position.z = Math.max(title.position.z - 5, 0);

    // Fade-out description once title enters the picture.
    if (title.position.z < camera.position.z) {
      description.material.opacity -= 0.008;
    }
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
    if (!lastModel || lastModel.position.z > title.position.z + 60) {
      let model = sample(Array.from(modelCache.values())).clone();
      model.position.x = lastModel && lastModel.position.y === gridBottom.position.y ? -lastModel.position.x : random(title.position.x, title.position.x + title.geometry.boundingBox.max.x - title.geometry.boundingBox.min.x);
      model.position.y = lastModel && lastModel.position.y === gridBottom.position.y ? gridTop.position.y : gridBottom.position.y;
      model.position.z = title.position.z;
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

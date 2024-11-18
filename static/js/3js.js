import * as THREE from '/static/js/libs/three.module.js';
import { GLTFLoader } from '/static/js/libs/GLTFLoader.js';
import { OrbitControls } from '/static/js/libs/OrbitControls.js';

const scene = new THREE.Scene();

// Créer une caméra
const camera = new THREE.PerspectiveCamera(75, (window.innerWidth) / (window.innerHeight/2), 0.1, 1000);
camera.position.z = 5;

camera.position.set(-3.5, 3.5, -3.5); // Positionner la caméra pour avoir une vue claire
camera.lookAt(0, 1, 0);

// Créer un renderer et l'ajouter à la page
const renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight / 2);

const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });

const loader = new GLTFLoader();

loader.load('../media/models/desk2.glb', (gltf) => {
    const model = gltf.scene;
    scene.add(model);
    model.position.set(0, 0, 1);
    model.scale.set(1, 1, 1);
}, undefined, (error) => {
    console.error(error, "Error on loading of gltf model");

});

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 1, 0); // Point vers lequel la caméra regarde
controls.enableDamping = true; // Ajoute une inertie
controls.dampingFactor = 0.05; // Facteur d'inertie
controls.rotateSpeed = 0.5; // Vitesse de rotation
controls.enablePan = false; // Désactiver le déplacement latéral
controls.enableZoom = true; // Autoriser le zoom
controls.minDistance = 4; // Distance minimale de la caméra par rapport à l'objet
controls.maxDistance = 10; // Distance maximale de la caméra par rapport à l'objet
// Désactiver le zoom
// controls.enableZoom = false;

// // Désactiver le pan (déplacement latéral de la caméra)
// controls.enablePan = false;

const lightRight = new THREE.DirectionalLight(0xffffff, 1.5);
lightRight.position.set(8, 8, 8);
const lightLeft = new THREE.DirectionalLight(0xffffff, 1.5);
lightLeft.position.set(-8, 8, -8);
scene.add(lightLeft, lightRight);

const ambientLight = new THREE.AmbientLight(0xf0e4c2); // lumière d'ambiance
scene.add(ambientLight);

scene.background = null;
// Animation
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

const container = document.getElementById('threejs-container');
container.appendChild(renderer.domElement);

animate();
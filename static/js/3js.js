import * as THREE from '/static/js/libs/three.module.js';
import { GLTFLoader } from '/static/js/libs/GLTFLoader.js';
import { OrbitControls } from '/static/js/libs/OrbitControls.js';

const scene = new THREE.Scene();

const aspect = window.innerWidth / window.innerHeight;
const d = 8;
let camera = new THREE.OrthographicCamera(- d * aspect, d * aspect, d, - d, 1, 1000);
camera.position.set(-50, 50, -50);
camera.lookAt(scene.position);
camera.zoom = 20;

const renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 1, 0);
controls.enableDamping = true; // Ajoute inertie
controls.dampingFactor = 0.05;
controls.rotateSpeed = 0.5;
controls.enablePan = false; // Désactiver le déplacement latéral
controls.enableZoom = false;
controls.minzoom = 2;
controls.maxZoom = 20; // ????? marche pas
controls.minPolarAngle = Math.PI / 3; // Verrouiller la caméra à 60°
controls.maxPolarAngle = Math.PI / 3;

const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
dirLight.position.set(8, 12, 15);
dirLight.target.position.set(0, 0, 0);
dirLight.castShadow = true;
dirLight.shadow.camera.left = -10;
dirLight.shadow.camera.right = 10;
dirLight.shadow.camera.top = 10;
dirLight.shadow.camera.near = 5;
dirLight.shadow.camera.far = 30;
dirLight.shadow.mapSize.width = 2048;
dirLight.shadow.mapSize.height = 2048;
dirLight.shadow.bias = -0.005;
scene.add(dirLight);

const helper = new THREE.CameraHelper(dirLight.shadow.camera);
// scene.add(helper);

const ambientLight = new THREE.AmbientLight(0xd9d4c5);
scene.add(ambientLight);
scene.background = null;

function updateWallVisibility(visibleWalls) {
    walls.forEach((wall, index) => {
        wall.visible = visibleWalls[index];
    });
    if (walls[3].visible)
        curtain.visible = true;
    else
        curtain.visible = false;
}

function onCameraRotate() {
    let a = new THREE.Vector3();
    camera.getWorldDirection(a);
    if (a.x <= 0 && a.z <= 0)
        updateWallVisibility([false, false, true, true]) // nord
    else if (a.x > 0 && a.z <= 0)
        updateWallVisibility([true, false, false, true]) // est
    else if (a.x > 0 && a.z > 0)
        updateWallVisibility([true, true, false, false]) //sud
    else
        updateWallVisibility([false, true, true, false]) // ouest
}

const loader = new GLTFLoader();

loader.load('../media/models/desk2.glb', (gltf) => {
    const desk = gltf.scene;
    gltf.scene.traverse(function (node) {
        if (node.isMesh) {
            node.castShadow = true;
            node.receiveShadow = true;
        }
    });
    scene.add(desk);
    desk.position.set(0, 0, 1);
    desk.scale.set(1, 1, 1);
}, undefined, (error) => {
    console.error(error, "Error on loading of gltf desk");
});

let walls = [];
loader.load('../media/models/wall.glb', (gltf) => {
    walls[0] = gltf.scene;
    gltf.scene.traverse(function (node) {
        if (node.isMesh) {
            node.castShadow = true;
        }
    });
    for (let i = 0; i < 4; i++) {

        walls[i] = walls[0].clone();
        const angle = (Math.PI / 2) * i;
        walls[i].rotation.y = angle;
        walls[i].position.set(Math.cos(angle) * 4, 0, Math.sin(angle) * 4);
        scene.add(walls[i]);
    }
    walls[2].visible = false;
    walls[3].visible = false;
    controls.addEventListener('change', onCameraRotate);

}, undefined, (error) => {
    console.error(error, "Error on loading of gltf walls");
});

let curtain;
loader.load('../media/models/curtain3.glb', (gltf) => {
    curtain = gltf.scene;
    gltf.scene.traverse(function (node) {
        if (node.isMesh) {
            node.castShadow = true;
        }
    });
    scene.add(curtain);
    curtain.position.set(1.5, 0, -3.82);
    curtain.scale.set(.9, .9, .9);
    curtain.rotation.y = Math.PI / 2;
    curtain.visible = false;
}, undefined, (error) => {
    console.error(error, "Error on loading of gltf curtain");
});

const geometry = new THREE.BoxGeometry(8, .1, 8);
const material = new THREE.MeshStandardMaterial({ color: 0xA2AEE7 });
const ground = new THREE.Mesh(geometry, material);
ground.receiveShadow = true;
scene.add(ground);


function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

const container = document.getElementById('threejs-container');
container.appendChild(renderer.domElement);

animate();
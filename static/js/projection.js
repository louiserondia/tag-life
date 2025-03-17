import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { Raycaster, Vector2 } from 'three';
import { RectAreaLightHelper } from 'three/addons/helpers/RectAreaLightHelper.js';

const raycaster = new Raycaster();
const objects = [];
let walls;

const scene = new THREE.Scene();
let scaleFactor = window.innerWidth > 700 ? 1 : window.innerWidth / 700;

const aspect = window.innerWidth / (window.innerHeight * scaleFactor);
const d = 6;

const globalCameraPosition = new THREE.Vector3(10, 10, 10);
const recordCameraPosition = new THREE.Vector3(10, 10, 1);
const globalCameraLookAt = new THREE.Vector3(0, 3, 0);
const recordCameraLookAt = new THREE.Vector3(0, 3.5, 2.4);

let camera = new THREE.OrthographicCamera(- d * aspect, d * aspect, d, - d, 0.1, 1000);
camera.position.copy(globalCameraPosition);
camera.lookAt(globalCameraLookAt);
camera.zoom = 0.75;
camera.updateProjectionMatrix();

const renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setSize(window.innerWidth , window.innerHeight  * scaleFactor);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const container = document.getElementById('threejsContainer');
container.appendChild(renderer.domElement);

const rotating = new THREE.Group();
scene.add(rotating);

const dirLight = new THREE.DirectionalLight(0xffc95e, 8);
dirLight.position.set(12, 8, -6);
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

const counterLight = new THREE.DirectionalLight(0xffc95e, 1.25);
counterLight.position.set(-5, 8, -10);
counterLight.target.position.set(0, 0, 0);
counterLight.castShadow = true;
counterLight.shadow.camera.left = -10;
counterLight.shadow.camera.right = 10;
counterLight.shadow.camera.top = 10;
counterLight.shadow.camera.near = 5;
counterLight.shadow.camera.far = 30;
counterLight.shadow.mapSize.width = 2048;
counterLight.shadow.mapSize.height = 2048;
counterLight.shadow.bias = -0.005;
scene.add(counterLight);

const shadowLight = new THREE.DirectionalLight(0xffc95e, 0.5);
shadowLight.position.set(5, 20, -10);
shadowLight.target.position.set(0, 0, 0);
shadowLight.castShadow = true;
shadowLight.shadow.camera.left = -10;
shadowLight.shadow.camera.right = 10;
shadowLight.shadow.camera.top = 10;
shadowLight.shadow.camera.near = 5;
shadowLight.shadow.camera.far = 30;
shadowLight.shadow.mapSize.width = 2048;
shadowLight.shadow.mapSize.height = 2048;
shadowLight.shadow.bias = -0.005;
shadowLight.visible = false;
scene.add(shadowLight);
rotating.add(shadowLight);

const deskLight = new THREE.SpotLight(0xa67717, 10);
deskLight.position.set( 2.15, 1.2, -2.15 );
deskLight.visible = false;
deskLight.decay = 1.2;

const projLight = new THREE.RectAreaLight(0xf0e7c9, 1, 3, 2);
projLight.position.set(-0.5, 3, -1.5);
projLight.lookAt(-10, 3, -25);

scene.add(deskLight, projLight);
rotating.add(deskLight, projLight);

const dhelper = new THREE.PointLightHelper( deskLight, 0.2 );
const phelper = new RectAreaLightHelper( projLight, 0.2 );
// scene.add(dhelper);

const orange = 0xffd085;
const blue = 0x7f89db

const ambientLight = new THREE.AmbientLight(0xf5e5c6, 1);
scene.add(ambientLight);
scene.background = null;

const loader = new GLTFLoader();

let projectionRoom;
loader.load('../media/models/projection_room_2.glb', (gltf) => {
    projectionRoom = gltf.scene;
    scene.add(projectionRoom);
    rotating.add(projectionRoom);
    projectionRoom.scale.set(2, 2, 2);
    projectionRoom.castShadow = true;
    projectionRoom.receiveShadow = true;
    projectionRoom.traverse(function (node) {
        if (node.isMesh) {
            node.castShadow = true;
            node.receiveShadow = true;
            objects.push(node);
            if (node.name === "walls") {
                walls = node;
                walls.material.transparent = true;
                console.log(walls)
            }
        }
    });
}, undefined, (error) => {
    console.error(error, "Error on loading of gltf projectionRoom");
});

// -----------------------------------
// ---------- RAYCASTING -------------
// -----------------------------------

let dezoom = false;
let zoomOnRecord = false;

// Gérer le clic de la souris
window.addEventListener('click', (event) => {
    const rect = renderer.domElement.getBoundingClientRect();
    const coords = new THREE.Vector2(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -(((event.clientY - rect.top) / rect.height) * 2 - 1)
    );

    raycaster.setFromCamera(coords, camera);
    const intersects = raycaster.intersectObjects(objects, true);

    if (intersects.length > 0) {
        const selectedObject = intersects[0].object;
        console.log('Objet sélectionné :', selectedObject.name);
        if (selectedObject.name.startsWith('record'))
            zoomOnRecord = true;
        else
            dezoom = true;
    }
});

const rayHelper = new THREE.ArrowHelper(raycaster.ray.direction, raycaster.ray.origin, 5, 0xff0000);
// scene.add(rayHelper);

let isDragging = false;
let prevMousePosX = 0;
let velocity = 0;

window.addEventListener('mousedown', (e) => {
    isDragging = true;
    prevMousePosX = e.clientX;
});

window.addEventListener('mouseup', () => isDragging = false);

window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;

    const deltaX = e.clientX - prevMousePosX;
    velocity = deltaX * 0.0025;

    prevMousePosX = e.clientX;
});

window.addEventListener('resize', () => {
    const w = window.innerWidth ;
    const h = window.innerHeight ;
    scaleFactor = window.innerWidth > 700 ? 1 : window.innerWidth / 700;

    const a = w / (h * scaleFactor);
    camera.left = -d * a;
    camera.right = d * a;
    camera.top = d;
    camera.bottom = -d;
    camera.updateProjectionMatrix();

    renderer.setSize(w, h * scaleFactor);
    renderer.setPixelRatio(window.devicePixelRatio);
});
let elapsed = 0;

let isDarkMode = localStorage.getItem("dark-mode") === "true";
if (isDarkMode) {
    dirLight.visible = false;
    counterLight.visible = false;
    shadowLight.visible = true;
    // wallLight.visible = true;
    deskLight.visible = true;
    ambientLight.color.setHex(blue);
}

const switchMode = document.getElementById("switchMode");
switchMode.addEventListener("click", () => {
  isDarkMode = !isDarkMode;
  dirLight.visible = !dirLight.visible;
  counterLight.visible = !counterLight.visible;
  shadowLight.visible = !shadowLight.visible;
//   wallLight.visible = !wallLight.visible;
  deskLight.visible = !deskLight.visible;
  ambientLight.color.setHex(isDarkMode ? blue : orange);
});


function animate() {
    if (zoomOnRecord) {
        // camera.position.lerpVectors(start, end, elapsed);
        const lookAt = new THREE.Vector3().lerpVectors(globalCameraLookAt, recordCameraLookAt, elapsed);
        camera.lookAt(lookAt);
        camera.zoom = 0.75 + 3 * elapsed;
        camera.updateProjectionMatrix();
        walls.material.opacity = 1 - elapsed;

        if (elapsed < 1)
            elapsed += 1 / 120;
        else
            zoomOnRecord = false;
    }
    if (dezoom) {
        const lookAt = new THREE.Vector3().lerpVectors(recordCameraLookAt, globalCameraLookAt, 1 - elapsed);
        camera.lookAt(lookAt);
        camera.zoom = 0.75 + 3 * elapsed;
        camera.updateProjectionMatrix();
        walls.material.opacity = 1 - elapsed;
        
        if (elapsed > 0)
            elapsed -= 1 / 120;
        else
            dezoom = false;
    }
    requestAnimationFrame(animate);
    rotating.rotation.y += velocity;
    velocity *= 0.95;
    renderer.render(scene, camera);
}

animate();
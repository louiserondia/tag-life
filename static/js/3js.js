import * as THREE from '/static/js/libs/three.module.js';
import { GLTFLoader } from '/static/js/libs/GLTFLoader.js';

const scene = new THREE.Scene();
let scaleFactor = window.innerWidth > 700 ? 1 : window.innerWidth / 700;

const aspect = window.innerWidth / (window.innerHeight * 0.75 * scaleFactor);
const d = 6;

let camera = new THREE.OrthographicCamera(- d * aspect, d * aspect, d, - d, 1, 1000);
camera.position.set(-10, 10, -10);
camera.lookAt(new THREE.Vector3(0, 3, 0));

const renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight * 0.75 * scaleFactor);
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

const counterLight = new THREE.DirectionalLight(0xffc95e, 0.6);
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

const deskLight = new THREE.SpotLight( 0xf2bb4e );
deskLight.position.set( 2.2, 2.45, -2.4 );
deskLight.castShadow = true;
scene.add(deskLight);
rotating.add(deskLight);

const wallLight = new THREE.PointLight( 0xf2bb4e, 1, 100 );
wallLight.position.set( 1.7, 4.65, 2.35 );
scene.add(wallLight);
rotating.add(wallLight);

const dhelper = new THREE.PointLightHelper( deskLight, 0.2 );
const whelper = new THREE.PointLightHelper( wallLight, 0.2 );
const helper = new THREE.CameraHelper(dirLight.shadow.camera);
// scene.add(dhelper);

const ambientLight = new THREE.AmbientLight(0xfcedbb, 1.4);
scene.add(ambientLight);
scene.background = null;

const loader = new GLTFLoader();

let miniRoom;
loader.load('../media/models/mini_room.glb', (gltf) => {
    miniRoom = gltf.scene;
    scene.add(miniRoom);
    rotating.add(miniRoom);
    miniRoom.scale.set(2, 2, 2);
    miniRoom.rotation.y = Math.PI
    miniRoom.castShadow = true;
    miniRoom.receiveShadow = true;
    miniRoom.traverse(function (node) {
        if (node.isMesh) {
            node.castShadow = true;
            node.receiveShadow = true;
        }
    });
}, undefined, (error) => {
    console.error(error, "Error on loading of gltf miniRoom");
});

let isDragging = false;
let prevMousePosX = 0;
let velocity = 0;

window.addEventListener('mousedown', (e) => {
    isDragging = true;
    prevMousePosX = e.clientX;
});

window.addEventListener('mouseup', () => {
    isDragging = false;
});

window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;

    const deltaX = e.clientX - prevMousePosX;
    velocity = deltaX * 0.005;
    
    prevMousePosX = e.clientX;
});

window.addEventListener('resize', () => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    scaleFactor = w > 700 ? 1 : w / 700;
    
    const a = w / (h * 0.75 * scaleFactor);
    camera.left = -d * a;
    camera.right = d * a;
    camera.top = d;
    camera.bottom = -d;
    camera.updateProjectionMatrix();
    
    renderer.setSize(w, h * 0.75 * scaleFactor);
    renderer.setPixelRatio(window.devicePixelRatio);
});


function animate() {
    requestAnimationFrame(animate);
    rotating.rotation.y += velocity;
    velocity *= 0.95;
    renderer.render(scene, camera);
}

animate();
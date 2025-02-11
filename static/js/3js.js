import * as THREE from '/static/js/libs/three.module.js';
import { GLTFLoader } from '/static/js/libs/GLTFLoader.js';
import { OrbitControls } from '/static/js/libs/OrbitControls.js';

const scene = new THREE.Scene();

const aspect = window.innerWidth / (window.innerHeight * 0.75);
const d = 6;
let camera = new THREE.OrthographicCamera(- d * aspect, d * aspect, d, - d, 1, 1000);
camera.position.set(-1, 50, -1);
camera.lookAt(scene.position);

const renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight * 0.75);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 3, 0);
controls.enableDamping = true; // Ajoute inertie
controls.dampingFactor = 0.05;
controls.rotateSpeed = 0.5;
controls.enablePan = false; // Désactiver le déplacement latéral
controls.enableZoom = false;
controls.minzoom = 2;
controls.maxZoom = 20; // ????? marche pas
controls.minPolarAngle = Math.PI / 3; // Verrouiller la caméra à 60°
controls.maxPolarAngle = Math.PI / 3;

const dirLight = new THREE.DirectionalLight(0xffc95e, 8);
dirLight.position.set(8, 8, 10);
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

const secondLight = new THREE.DirectionalLight(0xffc95e, 2);
secondLight.position.set(4, 4, 5);
secondLight.target.position.set(0, 0, 0);
secondLight.castShadow = true;
secondLight.shadow.camera.left = -10;
secondLight.shadow.camera.right = 10;
secondLight.shadow.camera.top = 10;
secondLight.shadow.camera.near = 5;
secondLight.shadow.camera.far = 30;
secondLight.shadow.mapSize.width = 2048;
secondLight.shadow.mapSize.height = 2048;
secondLight.shadow.bias = -0.005;
scene.add(secondLight);

const counterLight = new THREE.DirectionalLight(0xffc95e, 0.8);
counterLight.position.set(5, 8, -10);
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
scene.add( deskLight );

const wallLight = new THREE.PointLight( 0xf2bb4e, 1, 100 );
wallLight.position.set( 1.7, 4.65, 2.35 );
scene.add( wallLight );

const dhelper = new THREE.PointLightHelper( deskLight, 0.2 );
// scene.add( dhelper );

const whelper = new THREE.PointLightHelper( wallLight, 0.2 );
// scene.add( whelper );

const helper = new THREE.CameraHelper(dirLight.shadow.camera);
// scene.add(helper);

const ambientLight = new THREE.AmbientLight(0xfcedbb, 1.4);
scene.add(ambientLight);
scene.background = null;

const loader = new GLTFLoader();

let mini_room;
loader.load('../media/models/mini_room.glb', (gltf) => {
    mini_room = gltf.scene;
    scene.add(mini_room);
    mini_room.scale.set(2, 2, 2);
    mini_room.rotation.y = Math.PI
    mini_room.castShadow = true;
    mini_room.receiveShadow = true;
    mini_room.traverse(function (node) {
        if (node.isMesh) {
            node.castShadow = true;
            node.receiveShadow = true;
        }
    });
}, undefined, (error) => {
    console.error(error, "Error on loading of gltf mini_room");
});

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

const container = document.getElementById('threejsContainer');
container.appendChild(renderer.domElement);

window.addEventListener('resize', () => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    
    let scaleFactor = 1;
    if (w < 700)
        scaleFactor = w / 700;
    
    const a = w / (h * 0.75 * scaleFactor);
    camera.left = -d * a;
    camera.right = d * a;
    camera.top = d;
    camera.bottom = -d;
    camera.updateProjectionMatrix();

    renderer.setSize(w, h * 0.75 * scaleFactor);
    renderer.setPixelRatio(window.devicePixelRatio);
});


animate();
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';
import { Raycaster } from 'three';

const scene = new THREE.Scene();

function scaleFactorFormula(w, h) {
    const widthFactor = w > 700 ? 1.1 : 1.1 * (w / 700 + (700 - w) / 4 / 700); // augmenter le /4 pour que ça dezoom + vite
    const heightFactor = h > 700 ? 1 : 1 + (700 - h) / 500; // Ajuster /500 pour doser (+ on divise, moins ça zoom)

    return widthFactor * heightFactor;
}

let scaleFactor = scaleFactorFormula(window.innerWidth, window.innerHeight);

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

const deskLight = new THREE.SpotLight(0xeb9617, 2);
deskLight.position.set(2.2, 2.45, -2.4);
scene.add(deskLight);
rotating.add(deskLight);
deskLight.visible = false;

const wallLight = new THREE.SpotLight(0xeb9617, 4);
wallLight.position.set(1.7, 4.65, 2.35);
wallLight.target.position.set(1.7, 0, 2.35);
wallLight.penumbra = 0.05;
wallLight.decay = 1;
scene.add(wallLight);
scene.add(wallLight.target);
rotating.add(wallLight);
rotating.add(wallLight.target);
wallLight.visible = false;

const dhelper = new THREE.PointLightHelper(deskLight, 0.2);
const whelper = new THREE.PointLightHelper(wallLight, 0.2);
const helper = new THREE.CameraHelper(dirLight.shadow.camera);
// scene.add(whelper);

const orange = 0xffd085;
const blue = 0x7f89db

const ambientLight = new THREE.AmbientLight(orange, 0.8);
scene.add(ambientLight);
scene.background = null;

const loader = new GLTFLoader();

let leftCurtain, rightCurtain, plant;

function mergeMeshesFromGroup(group) {
    const geometries = [];

    group.traverse((child) => {
        if (child.isMesh && child.geometry) {
            // IMPORTANT : Appliquer les transformations à la géométrie
            child.updateWorldMatrix(true, false);
            const geom = child.geometry.clone();
            geom.applyMatrix4(child.matrixWorld);

            geometries.push(geom);
        }
    });

    if (geometries.length === 0) return null;

    const mergedGeometry = BufferGeometryUtils.mergeGeometries(geometries, false);
    const mergedMesh = new THREE.Mesh(mergedGeometry);
    mergedMesh.name = group.name;
    return mergedMesh;
}

function assignMesh(node) {
    // const merged = mergeMeshesFromGroup(node);
    node.geometry.computeVertexNormals();
    node.geometry.attributes.position.originalPosition = node.geometry.attributes.position.array.slice();
    // console.log(node);
    return node;
}

let miniRoom;
loader.load('../static/models/mini_room_2.glb', (gltf) => {
    miniRoom = gltf.scene;
    scene.add(miniRoom);
    rotating.add(miniRoom);
    miniRoom.scale.set(2, 2, 2);
    miniRoom.rotation.y = Math.PI;
    miniRoom.castShadow = true;
    miniRoom.receiveShadow = true;
    miniRoom.traverse(function (node) {
        if (node.isMesh) {
            node.castShadow = true;
            node.receiveShadow = true;
        }
        if (node.name == "curtain") leftCurtain = assignMesh(node);
        else if (node.name == "curtain001") rightCurtain = assignMesh(node);
        else if (node.name == "monstera") plant = assignMesh(node);

    });
}, undefined, (error) => {
    console.error(error, "Error on loading of gltf miniRoom");
});

// switch lights when switching to dark/lightmode
let isDarkMode = localStorage.getItem("dark-mode") === "true";
if (isDarkMode) {
    dirLight.visible = false;
    counterLight.visible = false;
    shadowLight.visible = true;
    wallLight.visible = true;
    deskLight.visible = true;
    ambientLight.color.setHex(blue);
}

const switchMode = document.getElementById("switchMode");
switchMode.addEventListener("click", () => {
    isDarkMode = !isDarkMode;
    dirLight.visible = !dirLight.visible;
    counterLight.visible = !counterLight.visible;
    shadowLight.visible = !shadowLight.visible;
    wallLight.visible = !wallLight.visible;
    deskLight.visible = !deskLight.visible;
    ambientLight.color.setHex(isDarkMode ? blue : orange);
});

let isDragging = false;
let prevMousePosX;
let velocity = 0;
let scheduled = false;

window.addEventListener('mousedown', (e) => {
    isDragging = true;
    prevMousePosX = e.clientX;
});

window.addEventListener('mouseup', () => isDragging = false);

window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;

    if (!scheduled) {
        scheduled = true;
        setTimeout(function () {
            scheduled = false;
            const deltaX = e.clientX - prevMousePosX;
            velocity = -deltaX * 0.0015; // vérifier si ça marche sur tous les devices
        }, 10); // fix la différence de rotation entre souris / trackpad et ordis
    }
    prevMousePosX = e.clientX;
});

window.addEventListener('resize', () => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    scaleFactor = scaleFactorFormula(w, h);

    const a = w / (h * 0.75 * scaleFactor);
    camera.left = -d * a;
    camera.right = d * a;
    camera.top = d;
    camera.bottom = -d;
    camera.updateProjectionMatrix();

    renderer.setSize(w, h * 0.75 * scaleFactor);
    renderer.setPixelRatio(window.devicePixelRatio);
});

const clock = new THREE.Clock();

function curtainWave(mesh) {
    if (mesh) {
        const positionAttr = mesh.geometry.attributes.position;
        const original = positionAttr.originalPosition;
        const time = clock.getElapsedTime();

        if (!mesh.geometry.boundingBox)
            mesh.geometry.computeBoundingBox();

        const bounds = mesh.geometry.boundingBox;
        const minX = bounds.min.x, maxX = bounds.max.x, minY = bounds.min.y, maxY = bounds.max.y, minZ = bounds.min.z, maxZ = bounds.max.z;
        const rangeX = maxX - minX, rangeY = maxY - minY, rangeZ = maxZ - minZ;

        for (let i = 0; i < positionAttr.count; i++) {
            const [x, y, z] = [original[i * 3], original[i * 3 + 1], original[i * 3 + 2]];

            const weightY = (y - maxY) / rangeY;
            const weightZ = mesh.name == "curtain" ? (z - maxZ) / rangeZ : (z - minZ) / rangeZ;

            // ajuster la fréquence et amplitude + poids permet de faire moins d'un côté 
            const wavelength = 5;
            const frequency = 1.5;
            const width = 0.1;

            let wave = Math.sin(z * wavelength + time * frequency);
            wave = mesh.name == "curtain" ? (wave + 1) / 2 : (wave - 1) / 2;
            wave *= width * weightY * weightZ;
            positionAttr.array[i * 3] = x + wave; // onde sur x
        }
        positionAttr.needsUpdate = true;
    }
}


function windEffect(mesh) {
    if (mesh) {
        const positionAttr = mesh.geometry.attributes.position;
        const original = positionAttr.originalPosition;
        const time = clock.getElapsedTime();

        if (!mesh.geometry.boundingBox)
            mesh.geometry.computeBoundingBox();

        const bounds = mesh.geometry.boundingBox;
        const minX = bounds.min.x, maxX = bounds.max.x, minY = bounds.min.y, maxY = bounds.max.y, minZ = bounds.min.z, maxZ = bounds.max.z;
        const rangeX = maxX - minX, rangeY = maxY - minY, rangeZ = maxZ - minZ;


        for (let i = 0; i < positionAttr.count; i++) {

            const [x, y, z] = [original[i * 3], original[i * 3 + 1], original[i * 3 + 2]];
            const [weightX, weightY, weightZ] = [(x - minX) / rangeX, (y - minY) / rangeY, (z - minZ) / rangeZ];

            const xProgress = (x - minX) / rangeX;
            const delay = xProgress * 1.2;
            const delayedPhase = y * 2 + (time - delay) * 2;
            const phase = y * 2 + time * 2;

            const dx = x - (minX + rangeX / 2);
            const dz = z - (minZ + rangeZ / 2);
            const distXZ = Math.sqrt(dx * dx + dz * dz); // distance du centre
            const maxDist = Math.sqrt((rangeX / 2) ** 2 + (rangeZ / 2) ** 2);
            const edgeWeight = Math.pow(distXZ / maxDist, 6); // exponentiel pour que ce soit l'effet que au bout

            let waveX = (
                Math.sin(phase) * 0.02 +
                Math.sin(phase * 0.5 + 5) * 0.015
            ) * weightY * 0.8;

            let waveY = (
                Math.sin(delayedPhase) * 0.02 +
                Math.sin(delayedPhase * 0.5 + 5) * 0.015
            ) * edgeWeight * 2.5;

            let waveZ = (
                Math.sin(phase) * 0.015 +
                Math.sin(phase * 0.5 + 5) * 0.02
            ) * weightY;

            positionAttr.array[i * 3] = x - waveX; // onde sur x
            positionAttr.array[i * 3 + 1] = y + waveY;
            positionAttr.array[i * 3 + 2] = z - waveZ * 0.8;
        }
        positionAttr.needsUpdate = true;
    }
}

function animate() {
    curtainWave(leftCurtain);
    curtainWave(rightCurtain);
    windEffect(plant);

    requestAnimationFrame(animate);
    rotating.rotation.y += velocity;
    velocity *= 0.95;
    renderer.render(scene, camera);
}

animate();
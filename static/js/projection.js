import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { Raycaster, Vector2 } from 'three';
import { RectAreaLightHelper } from 'three/addons/helpers/RectAreaLightHelper.js';

const raycaster = new Raycaster();
const objects = new Map();
let objectsArray;

const scene = new THREE.Scene();
let w = window.innerWidth;
let h = window.innerHeight;
let scaleFactor = w > 700 ? 1 : w / 700;

const aspect = w / h;
const d = 6;

const globalCameraPos = new THREE.Vector3(10, 10, 10);
const globalCameraLookAt = new THREE.Vector3(0, 3, 0);
let currentCameraZoom = 0.75;

let camera = new THREE.OrthographicCamera(- d * aspect, d * aspect, d, - d, 0.1, 1000);
camera.position.copy(globalCameraPos);
camera.lookAt(globalCameraLookAt);
camera.zoom = currentCameraZoom * scaleFactor;
camera.updateProjectionMatrix();

const renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setSize(w, h);
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
deskLight.position.set(2.15, 1.2, -2.15);
deskLight.visible = false;
deskLight.decay = 1.2;

const projLight = new THREE.RectAreaLight(0xf0e7c9, 1, 3, 2);
projLight.position.set(-0.5, 3, -1.5);
projLight.lookAt(-10, 3, -25);

scene.add(deskLight, projLight);
rotating.add(deskLight, projLight);

const dhelper = new THREE.PointLightHelper(deskLight, 0.2);
const phelper = new RectAreaLightHelper(projLight, 0.2);
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
            objects.set(node.name, node);
            // if (node.name === "walls")
                node.material.transparent = true;
        }
    });
    objectsArray = Array.from(objects.values());
    // console.log(objects)
}, undefined, (error) => {
    console.error(error, "Error on loading of gltf projectionRoom");
});

// -----------------------------------
// ------------- ZOOM ----------------
// -----------------------------------
let x1 = 1.2;
let x2 = 2.5;

const recordCameraPos = new THREE.Vector3(10, 10, 10);
const recordCameraLookAt = new THREE.Vector3(0, 3.5, 2.4);
let screenCameraPos = new THREE.Vector3(w < 900 ? x1 : x2, w < 900 ? 2 : 2.5, 3);
let screenCameraLookAt = new THREE.Vector3(-10, 2.5, -25);

let elapsed = 0;

function startsWithAnyOf(object, names) {
    return names.some(name => object.startsWith(name));
}

function zoomOn(pos, lookAt, zoom, dezoom, name) {
    const r = rotating.rotation.y;
    function animateZoom() {
        if ((!dezoom && elapsed < 1) || (dezoom && elapsed > 0)) {
            camera.position.lerpVectors(pos[0], pos[1], dezoom ? 1 - elapsed : elapsed);
            const nlookAt = new THREE.Vector3().lerpVectors(lookAt[0], lookAt[1], dezoom ? 1 - elapsed : elapsed);
            camera.lookAt(nlookAt);
            camera.zoom += (zoom[1] - zoom[0]) * scaleFactor * (dezoom ? -0.01 : 0.01);
            camera.updateProjectionMatrix();
            rotating.rotation.y = r - r * elapsed;
            if (name == 'record') {
                objects.forEach((o) => {
                    if (!startsWithAnyOf(o.name, ['record', 'turntable', 'table']) && elapsed < 0.8)
                           o.material.opacity = 1 - elapsed; // ça enlève les materiaux communs, mat uniques ?
                });
            }

            currentCameraZoom = dezoom ? zoom[0] : zoom[1];
            elapsed += dezoom ? -0.01 : 0.01;
            requestAnimationFrame(animateZoom);
        }
    }
    requestAnimationFrame(animateZoom);
}

let zoomInfos = [globalCameraPos, globalCameraLookAt, 0.75, 'dezoom'];

window.addEventListener('click', (event) => {

    if ( event.target.tagName == "IMG"
        || event.target.tagName == "P"
        || event.target.id.includes("escription")
        || event.target.id == "thumbnailsContainer") return; // si je clique sur un élément html devant le canvas

    const rect = renderer.domElement.getBoundingClientRect();
    const coords = new THREE.Vector2(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -(((event.clientY - rect.top) / rect.height) * 2 - 1)
    );

    raycaster.setFromCamera(coords, camera);
    const intersects = raycaster.intersectObjects(objectsArray, true);

        // console.log(objects.values())
    if (intersects.length > 0 && (elapsed <= 0 || elapsed >= 1)) {
        const selectedObject = intersects[0].object;

        if (selectedObject.name.startsWith('record'))
            zoomInfos = [recordCameraPos, recordCameraLookAt, 3, 'record'];
        else if (selectedObject.name.startsWith('screen')) {
            screenPresOn();
            zoomInfos = [screenCameraPos, screenCameraLookAt, 2, 'screen'];
        }
        else { // dezoom
            zoomOn(
                [zoomInfos[0], globalCameraPos],
                [zoomInfos[1], globalCameraLookAt],
                [0.75, zoomInfos[2]],
                true, 
                zoomInfos[3]
            );
            zoomInfos = [globalCameraPos, globalCameraLookAt, 0.75, 'dezoom'];
            screenPresOff();
        }

        if (zoomInfos[0] != globalCameraPos) // zoom
            zoomOn(
                [globalCameraPos, zoomInfos[0]],
                [globalCameraLookAt, zoomInfos[1]],
                [0.75, zoomInfos[2]],
                false, 
                zoomInfos[3]
            );
    }
});

// -----------------------------------
// --------- ORBIT CONTROL -----------
// -----------------------------------


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


// -----------------------------------
// ------------- RESIZE---------------
// -----------------------------------

const video = document.getElementById('video');
video.style.width = `${400 * scaleFactor}px`;
video.style.height = `${275 * scaleFactor}px`;

window.addEventListener('resize', () => {
    w = window.innerWidth;
    h = window.innerHeight;
    scaleFactor = w > 700 ? 1 : w / 700;

    const aspect = w / h;
    camera.left = -d * aspect;
    camera.right = d * aspect;
    camera.top = d;
    camera.bottom = -d;

    camera.zoom = currentCameraZoom * scaleFactor;

    video.style.width = `${400 * scaleFactor}px`;
    video.style.height = `${275 * scaleFactor}px`;

    if (w < 900 && screenCameraPos.x != x1 && currentCameraZoom == 2) {
        screenCameraPos.x = x1;
        screenCameraPos.y = 2;
        camera.position.set(screenCameraPos.x, screenCameraPos.y, screenCameraPos.z);
    }
    else if (w >= 900 && screenCameraPos.x != x2 && currentCameraZoom == 2) {
        screenCameraPos.x = x2;
        screenCameraPos.y = 2.5;
        camera.position.set(screenCameraPos.x, screenCameraPos.y, screenCameraPos.z);
    }
    if (descriptionOn)
        handleThumbnailsHidden();

    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
    renderer.setPixelRatio(window.devicePixelRatio);

});

// -----------------------------------
// ------ SCREEN PRESENTATION --------
// -----------------------------------

const screenPresBox = document.getElementById("screenPresentation");

function screenPresOn() {
    screenPresBox.classList.add("active");
}

function screenPresOff() {
    screenPresBox.classList.remove("active");
}

// -----------------------------------
// ------- DISPLAY DESCRIPTION -------
// -----------------------------------

const thumbnails = document.querySelectorAll(".thumbnail");
const thumbnailDescriptions = document.querySelectorAll(".thumbnailDescription");
let descriptionOn = false;

function toggleShowDescription(description) {
    document.querySelectorAll(".thumbnailDescription").forEach(d => {
        if (d != description)
            d.classList.remove("show"); // ferme si autre description déjà ouverte
    });
    description.classList.toggle("show");
    descriptionOn = !descriptionOn;

    

    if (w < 900) // cache les thumbnails mais si on resize, c'est dans la partie resize qu'on les réaffiche
        thumbnails.forEach(t => t.classList.toggle("hidden"));
}

function handleThumbnailsHidden() {
    if (w < 900)
        thumbnails.forEach(t => t.classList.add("hidden"));
    else
        thumbnails.forEach(t => t.classList.remove("hidden"));
}

thumbnails.forEach(thumbnail => {
    thumbnail.addEventListener("click", (event) => {
        let description = document.getElementById(event.currentTarget.id + 'Description')
        if (description) toggleShowDescription(description);
        if (!video.children[0].src.includes(thumbnail.id)) {
            video.children[0].setAttribute('src', '/static/videos/' + thumbnail.id + '.mp4');
            video.load();
        }
    });
});

thumbnailDescriptions.forEach(description => {
    description.addEventListener("click", (event) => { toggleShowDescription(event.target) });
});


// -----------------------------------
// ------------ DARKMODE -------------
// -----------------------------------

let isDarkMode = localStorage.getItem("dark-mode") === "true";
if (isDarkMode) {
    dirLight.visible = false;
    counterLight.visible = false;
    shadowLight.visible = true;
    deskLight.visible = true;
    ambientLight.color.setHex(blue);
}

const switchMode = document.getElementById("switchMode");
switchMode.addEventListener("click", () => {
    isDarkMode = !isDarkMode;
    dirLight.visible = !dirLight.visible;
    counterLight.visible = !counterLight.visible;
    shadowLight.visible = !shadowLight.visible;
    deskLight.visible = !deskLight.visible;
    ambientLight.color.setHex(isDarkMode ? blue : orange);
});

// -----------------------------------
// ------------- ANIMATE -------------
// -----------------------------------

function animate() {
    if (elapsed <= 0) { // pas de rotation de la scène si on est dans le zoom
        rotating.rotation.y += velocity;
        velocity *= 0.95;
    }
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

animate();
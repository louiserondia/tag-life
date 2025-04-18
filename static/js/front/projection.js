import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { Raycaster } from 'three';
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
const smallScreenSize = 750;

const hits = document.getElementById('hits');
const books = document.getElementById('books');
const calendar = document.getElementById('calendar');
const screenPresBox = document.getElementById("screenPresentation");

const globalCameraPos = new THREE.Vector3(10, 10, 10);
const globalCameraLookAt = new THREE.Vector3(0, 3, 0);
let currentCameraZoom = 0.75;

let camera = new THREE.OrthographicCamera(- d * aspect, d * aspect, d, - d, -10, 1000);
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


const orange = 0xffd085;
const blue = 0x7f89db
const yellow = 0xffe099;
const lightBlue = 0xe3fffd;
const darkBlue = '#080126';
const colors = [
    '#deb583', // orange
    '#d2de83', // jaune pale
    '#e8db4d', // jaune petant
    '#dec983', // jaune orange
    '#7ebf85', // vert
    '#9dc284', // vert pale un peu kaki 
    '#b6c9cf', // blue clair
    '#83a4de', // bleu pale
    '#595fb3', // bleu foncé
    '#8392de', // bleu mauve
    '#9d88d1', // rose mauve
    '#e0b5f5', // rose clair
    '#f3defc', // rose très clair
    '#b35959', // rouge
];

const dirLight = new THREE.DirectionalLight(yellow, 3);
dirLight.position.set(12, 8, -2);
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

const counterLight = new THREE.DirectionalLight(orange, .5);
counterLight.position.set(-5, 100, -10);
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

const deskLight = new THREE.SpotLight(0xa67717, 5);
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
const chelper = new THREE.DirectionalLightHelper(counterLight, 0.2);
// scene.add(chelper);

const axisHelper = new THREE.AxesHelper(5);
// scene.add(axisHelper);

const ambientLight = new THREE.AmbientLight(lightBlue, 1.5);
scene.add(ambientLight);
scene.background = null;

const loader = new GLTFLoader();

let screenMesh;

let projectionRoom;
loader.load('../static/models/projection_room_4.glb', (gltf) => {
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
            node.material.transparent = true;
            if (node.name === "screen_1")
                screenMesh = node;
        }
    });
    objectsArray = Array.from(objects.values());
}, undefined, (error) => {
    console.error(error, "Error on loading of gltf projectionRoom");
});


// -----------------------------------
// ------------- ZOOM ----------------
// -----------------------------------

const recordCameraPos = new THREE.Vector3(10, 10, 10);
const recordCameraLookAt = new THREE.Vector3(0, 3.5, 2.4);
let screenCameraPos = new THREE.Vector3(1.2, 2, 3);
let screenCameraLookAt = new THREE.Vector3(-10, 2.5, -25);
let booksCameraPos = new THREE.Vector3(10, 10, 10);
let booksCameraLookAt = new THREE.Vector3(0, 5, 3);
let calendarCameraPos = new THREE.Vector3(5, 4, 3);
let calendarCameraLookAt = new THREE.Vector3(-2, 1.75, -12);

let isZooming = false;

function zoomOn(pos, lookAt, zoom, name) {
    function easeInOutSine(x) {
        return -(Math.cos(Math.PI * x) - 1) / 2;
    }

    if (name == 'dezoom') {
        hits.classList.remove("active");
        books.classList.remove("active");
        calendar.classList.remove("active");
        screenPresBox.classList.remove("active");
    }

    const startTime = performance.now();
    const duration = name == 'calendar' ? 1250 : 1000;
    const r = rotating.rotation.y;

    function animateZoom() {
        const elapsed = performance.now() - startTime;
        let t = Math.min(elapsed / duration, 1);
        if (name == 'dezoom') t = 1 - t;
        const easedT = easeInOutSine(t);

        camera.position.lerpVectors(pos[0], pos[1], easedT);
        const nlookAt = new THREE.Vector3().lerpVectors(lookAt[0], lookAt[1], easedT);
        camera.lookAt(nlookAt);
        camera.zoom = (zoom[0] + (zoom[1] - zoom[0]) * easedT) * scaleFactor;
        camera.updateProjectionMatrix();
        rotating.rotation.y = r - r * easedT;
        currentCameraZoom = zoomInfos[3] == 'dezoom' ? zoom[0] : zoom[1];

        if ((name == 'screen' || scene.position.x < 0) && w >= smallScreenSize)
            scene.position.set((-1.2 * easedT), (-0.5 * easedT), 0);

        if (t > 0 && t < 1)
            requestAnimationFrame(animateZoom);
        else {
            const mid = getScreenMiddle(screenMesh);
            video.style.transform = `translate(-50%, -50%) translate(${mid.x}px, ${mid.y}px)`;
            video.style.position = 'absolute';

            if (name == 'record') hits.classList.add("active");
            if (name == 'books') books.classList.add("active");
            if (name == 'calendar') calendar.classList.add("active");
            else if (name == 'screen') screenPresBox.classList.add("active");
            else if (name == 'dezoom') video.pause();
            isZooming = false;
        }
    }
    requestAnimationFrame(animateZoom);
}

// -----------------------------------
// ----------- RAYCASTER -------------
// -----------------------------------

function isHtml(e) {
    return (e.nodeName != "CANVAS" && e.id != "hits" && e.id != "calendar" && e.id != "books" && e.id != "screenPresentation");
}

let zoomInfos = [globalCameraPos, globalCameraLookAt, 0.75, 'dezoom'];

function clickToZoom(event) {

    if (isHtml(event.target) || isZooming) return; // si je clique sur un élément html devant le canvas ou que je suis déjà entrain de zoomer

    const rect = renderer.domElement.getBoundingClientRect();
    const coords = new THREE.Vector2(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -(((event.clientY - rect.top) / rect.height) * 2 - 1)
    );
    raycaster.setFromCamera(coords, camera);
    const intersects = raycaster.intersectObjects(objectsArray, true);

    if (intersects.length > 0) {
        const selectedObject = intersects[0].object;

        if (selectedObject.name.startsWith('record') && zoomInfos[3] == 'dezoom')
            zoomInfos = [recordCameraPos, recordCameraLookAt, 3, 'record'];
        else if (selectedObject.name.startsWith('screen') && zoomInfos[3] == 'dezoom')
            zoomInfos = [screenCameraPos, screenCameraLookAt, 2, 'screen'];
        else if (selectedObject.name.startsWith('calendar') && zoomInfos[3] == 'dezoom')
            zoomInfos = [calendarCameraPos, calendarCameraLookAt, 5, 'calendar'];
        else if (selectedObject.name.startsWith('books') && zoomInfos[3] == 'dezoom')
            zoomInfos = [booksCameraPos, booksCameraLookAt, 3, 'books'];
        else if (!selectedObject.name.startsWith(zoomInfos[3]) && zoomInfos[3] != 'dezoom')
            zoomInfos[3] = 'dezoom';
        else {
            return;
        }

        isZooming = true;
        zoomOn(
            [globalCameraPos, zoomInfos[0]],
            [globalCameraLookAt, zoomInfos[1]],
            [0.75, zoomInfos[2]],
            zoomInfos[3]
        );
    }
}


// -----------------------------------
// -------- SCREEN TRACKER -----------
// -----------------------------------


function getScreenCorners(mesh, camera, canvas) {
    const box = new THREE.Box3().setFromObject(mesh);
    const points = [
        new THREE.Vector3(box.min.x, box.min.y, box.min.z),
        new THREE.Vector3(box.min.x, box.min.y, box.max.z),
        new THREE.Vector3(box.min.x, box.max.y, box.min.z),
        new THREE.Vector3(box.min.x, box.max.y, box.max.z),
        new THREE.Vector3(box.max.x, box.min.y, box.min.z),
        new THREE.Vector3(box.max.x, box.min.y, box.max.z),
        new THREE.Vector3(box.max.x, box.max.y, box.min.z),
        new THREE.Vector3(box.max.x, box.max.y, box.max.z),
    ];

    const projectionMatrix = camera.projectionMatrix;
    const modelViewMatrix = camera.matrixWorldInverse;
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;

    points.forEach(p => {
        p.applyMatrix4(modelViewMatrix); // Transformation en espace de la caméra
        p.applyMatrix4(projectionMatrix); // Projection 3D -> 2D

        const x = (p.x * 0.5 + 0.5) * canvas.clientWidth;
        const y = (1 - (p.y * 0.5 + 0.5)) * canvas.clientHeight;

        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
    });

    return {
        topLeft: { x: minX, y: minY },
        bottomRight: { x: maxX, y: maxY }
    };
}

function getScreenMiddle(mesh) {
    const corners = getScreenCorners(mesh, camera, container);

    const midX = corners.topLeft.x + ((corners.bottomRight.x - corners.topLeft.x) / 2);
    const midY = corners.topLeft.y + ((corners.bottomRight.y - corners.topLeft.y) / 2);

    return { x: midX, y: midY };
}


// -----------------------------------
// --------- ORBIT CONTROL -----------
// -----------------------------------

const VELOCITY_THRESHOLD = 0.01;

let isDragging = false;
let prevMousePosX = 0;
let velocity = 0;

window.addEventListener('mousedown', (e) => {
    isDragging = true;
    prevMousePosX = e.clientX;
});

window.addEventListener('mouseup', (e) => {
    if (Math.abs(velocity) < VELOCITY_THRESHOLD) clickToZoom(e);
    isDragging = false;
});

window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;

    const deltaX = e.clientX - prevMousePosX;
    velocity = deltaX * 0.0025;

    prevMousePosX = e.clientX;
});


// -----------------------------------
// ------------- RESIZE --------------
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

    if (zoomInfos[3] == 'screen') {
        if (w < smallScreenSize) scene.position.set(0, 0, 0)
        else scene.position.set(-1.2, -0.5, 0)
    }

    if (descriptionOn)
        handleThumbnailsHidden();

    const mid = getScreenMiddle(screenMesh);
    video.style.transform = `translate(-50%, -50%) translate(${mid.x}px, ${mid.y}px)`;
    video.style.position = 'absolute';

    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
    renderer.setPixelRatio(window.devicePixelRatio);

});

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

    if (w < smallScreenSize) // cache les thumbnails mais si on resize, c'est dans la partie resize qu'on les réaffiche
        thumbnails.forEach(t => t.classList.toggle("hidden"));
}

function handleThumbnailsHidden() {
    if (w < smallScreenSize)
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
// ---- DISPLAY AUDIO DESCRIPTION ----
// -----------------------------------

function toggleAudioDescription(target) {
    while (!target.classList.contains("hits-row"))
        target = target.parentElement;

    hitsRows.forEach(r => {
        if (r != target)
            r.classList.remove("active");
    });
    target.classList.toggle("active");
}

const hitsRows = document.querySelectorAll('.hits-row');
hitsRows.forEach(r => {
    r.addEventListener('click', (e) => { toggleAudioDescription(e.target) });
});

// -----------------------------------
// ------------ DARKMODE -------------
// -----------------------------------

const body = document.querySelector('body');
let prevIndex = Math.floor(Math.random() * colors.length);
body.style.backgroundColor = colors[prevIndex];

let isDarkMode = localStorage.getItem("dark-mode") === "true";
if (isDarkMode) {
    dirLight.visible = false;
    counterLight.visible = false;
    deskLight.visible = true;
    ambientLight.color.setHex(blue);
    body.style.backgroundColor = darkBlue;
}

const switchMode = document.getElementById("switchMode");
switchMode.addEventListener("click", () => {
    isDarkMode = !isDarkMode;
    dirLight.visible = !dirLight.visible;
    counterLight.visible = !counterLight.visible;
    deskLight.visible = !deskLight.visible;
    ambientLight.color.setHex(isDarkMode ? blue : lightBlue);

    if (isDarkMode)
        body.style.backgroundColor = darkBlue;
    else {
        let colorIndex = prevIndex;
        while (colorIndex == prevIndex)
            colorIndex = Math.floor(Math.random() * colors.length);
        prevIndex = colorIndex;
        body.style.backgroundColor = colors[colorIndex];
    }
});

// -----------------------------------
// ------------- ANIMATE -------------
// -----------------------------------

function animate() {
    if (zoomInfos[3] == 'dezoom') { // pas de rotation de la scène si on est dans le zoom
        rotating.rotation.y += velocity;
        velocity *= 0.95;
    }
    if (Math.abs(velocity) < VELOCITY_THRESHOLD) velocity = 0;
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

animate();
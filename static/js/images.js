let imagesData;
let imageList;
let currentBatch = 1;
let prevBatch;
let imagesToLoad;
let lastColumn = 0;
let prevLastColumn;
let hasShuffled = false;
const batchSize = 30;
const loadedImages = new Set();
let loadedImagesCopy;
export let edit = false;
import { checkedTags, editCheckedTags } from "./tags.js";

async function fetchImagesData() {
  try {
    const response = await fetch("/api/images_data/");
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await response.json();
    return data.images_data;
  } catch (error) {
    console.error("Erreur lors de la récupération des images:", error);
  }
}

function shuffle(src) {
  let images = [...src];

  for (let i = images.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [images[i], images[j]] = [images[j], images[i]];
  }
  return images;
}

async function init() {
  imagesData = await fetchImagesData();
  const listFromLocalStorage = localStorage.getItem("imageList");
  if (!listFromLocalStorage) {
    imageList = shuffle(imagesData);
    localStorage.setItem("imageList", JSON.stringify(imageList));
  } else {
    imageList = JSON.parse(listFromLocalStorage);
  }
  if (imageList && imageList.length) {
    updateColumns();
    setupInfiniteScroll();
  } else {
    console.error("Erreur: Aucun image disponible");
  }
}

// ---------------------------
//   CREATING ALL THE STUFF
// ---------------------------

function resetColumns() {
  if (checkedTags.size || hasShuffled) {
    loadedImagesCopy = new Set(loadedImages);
    loadedImages.clear();
    prevBatch = currentBatch;
    currentBatch = 1;
    prevLastColumn = lastColumn;
    lastColumn = 0;
  } else {
    loadedImages = new Set(loadedImagesCopy);
    loadedImagesCopy.clear();
    currentBatch = prevBatch;
    lastColumn = prevLastColumn;
  }
}

// Create images' boxes and their title and tags, which appear when clicked on

function createImg(image, box) {
  const img = document.createElement("img");
  img.src = image.path;
  img.id = `${image.title}`;
  img.onclick = () => lightBoxOn(img);
  // img.onclick = () => toggleImageInfos(image.title);
  box.appendChild(img);
  img.addEventListener("load", () => {
    requestIdleCallback(() => {
      imageLoaded();
    });
  });
}

function createTitle(name, box) {
  const title = document.createElement("h2");
  title.id = `title-${name}`;
  title.hidden = true;
  title.textContent = name;
  box.appendChild(title);
}

export function addTagsToTagContainer(tags, tagsContainer) {
  const prev = [...tagsContainer.children];
  tags.forEach((tag) => {
    if (prev.some((p) => p.innerHTML === tag)) return;
    const t = document.createElement("h3");
    t.textContent = tag;
    tagsContainer.appendChild(t);
  });
}

function createTagsContainer(name, box, tags) {
  const tagsContainer = document.createElement("div");
  tagsContainer.classList.add("tags-container");
  tagsContainer.id = `tags-${name}`;
  tagsContainer.hidden = true;
  addTagsToTagContainer(tags, tagsContainer);
  box.appendChild(tagsContainer);
}

function toggleImageInfos(id) {
  if (edit) return;
  const title = document.getElementById("title-" + id);
  title.toggleAttribute("hidden");
  const tags = document.getElementById("tags-" + id);
  tags.toggleAttribute("hidden");
}

// -------------------------
//   INIT / CREATE COLUMNS
// -------------------------

function initializeColumns(images, nColumns) {
  const container = document.getElementById("images");
  container.innerHTML = "";

  for (let i = 0; i < nColumns; i++) {
    const column = document.createElement("div");
    column.classList.add("column");
    container.appendChild(column);
  }

  if (loadedImages.size) {
    createColumns(loadedImages);
  } else {
    createColumns(images.slice(0, batchSize));
  }
}

function createColumns(images) {
  const container = document.getElementById("images");
  const nColumns = container.children.length;
  imagesToLoad = Math.min(batchSize, images.length);

  images.forEach((image) => {
    const column = container.children[lastColumn];
    const box = document.createElement("div");

    box.classList.add("box");

    createTitle(image.title, box);
    createImg(image, box);
    createTagsContainer(image.title, box, image.tags);

    column.appendChild(box);
    loadedImages.add(image);
    lastColumn = (lastColumn + 1) % nColumns;
  });
}

// -------------------------
//      UPDATE COLUMNS
// -------------------------

function getNumberOfColumns() {
  if (window.matchMedia("(max-width: 600px)").matches) return 2;
  if (window.matchMedia("(max-width: 900px)").matches) return 3;
  if (window.matchMedia("(max-width: 1200px)").matches) return 4;
  return 5;
}

function updateColumns() {
  lastColumn = 0;
  const nColumns = getNumberOfColumns();
  initializeColumns(imageList, nColumns);
  hasShuffled = false;
}

function imageLoaded() {
  imagesToLoad--;
  if (!imagesToLoad) {
    const logo = document.getElementById("loadingLogo");
    logo.style.display = "none";
  }
}

// -----------------------
//    INFINITE SCROLL
// -----------------------

function loadNextBatch() {
  const start = currentBatch * batchSize;
  const end = start + batchSize;
  const images = imageList.slice(start, end);

  if (!images.length) return;

  createColumns(images);

  currentBatch++;
}

function setupInfiniteScroll() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && imageList.length != loadedImages.size) {
        const logo = document.getElementById("loadingLogo");
        logo.style.display = "block";
        loadNextBatch();
      }
    });
  });

  const sentinel = document.getElementById("scrollAnchor");
  observer.observe(sentinel);
}

// ---------------------
//   UPDATE IMAGES URL
// ---------------------

export function updateImagesAndUrl() {
  const clientUrl = new URL("/", window.location.origin);
  const url = new URL("/api/images/", window.location.origin);
  for (const tag of checkedTags) {
    if (tag.length === 0) continue;
    url.searchParams.append("tag", tag);
    clientUrl.searchParams.append("tag", tag);
  }
  window.history.pushState({}, "", clientUrl);
  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      resetColumns();
      imageList = data.images;
      updateColumns();
    })
    .catch((error) => {
      console.error("error dans updateImagesAndUrl : " + error);
    });
}

// ------------------
//    EDIT BUTTON
// ------------------

// créer une liste des tags a cocher quand on edit, pour ajouter sur image
// donc quand on click sur edit ça décoche visuellement ceux qui étaient cochés pour le tri
// puis quand on valide on vide la edit liste et on recoche les éléments de checkedTags qui sont pour le tri

document.addEventListener("DOMContentLoaded", () => {
  const editButton = document.getElementById("edit");
  editButton.addEventListener("click", () => {
    let tags = document.querySelectorAll(".tag-box");
    if (edit) {
      const selectedImgs = document.querySelectorAll("img.selected");
      selectedImgs.forEach((i) => {
        i.classList.remove("selected");
      });
      editCheckedTags.clear();
      tags.forEach((tag) => {
        if (checkedTags.has(tag.id)) {
          setTimeout(() => {
            tag.classList.add("active");
          }, 10);
        }
      });
    }
    else {
      tags.forEach((tag) => {
        tag.classList.remove("active");
      });
    }
    edit = !edit;
  });
});

// ------------------
//     BUTTON
// ------------------

document.addEventListener("DOMContentLoaded", () => {
  const shuffleButton = document.getElementById("shuffle");
  shuffleButton.addEventListener("click", () => {
    hasShuffled = true;
    imageList = shuffle(imagesData);
    localStorage.setItem("imageList", JSON.stringify(imageList));
    resetColumns();
    updateColumns();
  });
});

// ------------------
//      LIGHTBOX
// ------------------

const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightbox-img");
const closeLightbox = document.getElementById("closeLightbox");

function lightBoxOn(image) {
  lightbox.classList.add("active");
  lightboxImg.src = image.src;
}

closeLightbox.addEventListener("click", () => {
  lightbox.classList.remove("active");
});

lightbox.addEventListener("click", (e) => {
  if (e.target !== lightboxImg) {
    lightbox.classList.remove("active");
  }
});

// ------------------
//   INITIALISATION
// ------------------

window.addEventListener("resize", updateColumns);
window.addEventListener("DOMContentLoaded", init);

let imageList = imagesData;
let currentBatch = 1;
const batchSize = 10;
const loadedImages = new Set();
let imagesToLoad;
let lastColumn = 0;
let edit = false;

// ---------------------------
//   CREATING ALL THE STUFF
// ---------------------------

function resetEverything() {
  loadedImages.clear();
  currentBatch = 1;
  lastColumn = 0;
}

function createTitle(name, box) {
  const title = document.createElement("h2");
  title.id = `title-${name}`;
  title.hidden = true;
  title.textContent = name;
  box.appendChild(title);
}

function createImg(image, box) {
  const img = document.createElement("img");
  img.src = image.path;
  img.id = `${image.title}`;
  img.onclick = () => displayImageInfos(image.title);
  box.appendChild(img);
  img.addEventListener("load", () => {
    requestIdleCallback(() => {
      imageLoaded();
    });
  });
}

function createTagsContainer(name, box, tags) {
  const tagsContainer = document.createElement("div");
  tagsContainer.classList.add("tags-container");
  tagsContainer.id = `tags-${name}`;
  tagsContainer.hidden = true;
  tags.forEach((tag) => {
    const t = document.createElement("h3");
    t.textContent = tag;
    tagsContainer.appendChild(t);
  });
  box.appendChild(tagsContainer);
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

  if (loadedImages.size) createColumns(loadedImages, 0);
  else createColumns(images.slice(0, batchSize), lastColumn);
}

function createColumns(images, startIndex) {
  const container = document.getElementById("images");
  const nColumns = container.children.length;
  imagesToLoad = batchSize;

  images.forEach((image, index) => {
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
}

function imageLoaded() {
  imagesToLoad--;
  if (!imagesToLoad) {
    setTimeout(() => {
      const logo = document.getElementById("loadingLogo");
      logo.style.display = "none";
    }, 500);
  }
}

// -----------------------
//    INFINITE SCROLL
// -----------------------

function loadNextBatch() {
  const start = currentBatch * batchSize;
  const end = start + batchSize;
  const imagesToLoad = imageList.slice(start, end);

  if (!imagesToLoad.length) return;

  createColumns(imagesToLoad, lastColumn);

  currentBatch++;
}

function setupInfiniteScroll() {
  const observer = new IntersectionObserver((entries, observer) => {
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

// ------------------
//      FILTERS
// ------------------

document.addEventListener("DOMContentLoaded", function () {
  const tagBoxes = document.querySelectorAll(".tag-box");

  tagBoxes.forEach(function (box) {
    box.addEventListener("click", function () {
      box.classList.toggle("active");
      const content = box.id;
      if (checkedTags.has(content)) {
        checkedTags.delete(content);
      } else {
        checkedTags.add(content);
      }
      if (!edit)
        updateImagesAndUrl();
    });
  });
});

function updateImagesAndUrl() {
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
      resetEverything();
      imageList = data.images;
      updateColumns();
    })
    .catch((error) => {
      console.error("error quand je fetch les images : " + error);
    });
}

// ------------------
//    EDIT BUTTON
// ------------------

document.addEventListener("DOMContentLoaded", () => {
  const editButton = document.getElementById("edit");
  editButton.addEventListener("click", function () {
    if (edit) { // si on valide l'edit, on décoche tous les tags
      checkedTags.clear();
      updateImagesAndUrl();
    }
    edit = !edit;
  });
});

// ------------------
//   INITIALISATION
// ------------------

window.addEventListener("resize", updateColumns);
updateColumns();
window.addEventListener("load", () => {
  setupInfiniteScroll();
});

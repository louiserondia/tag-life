const imageList = imagesData;
let currentBatch = 1;
const batchSize = 10;
const loadedImages = new Set();
let imagesToLoad;
let lastColumn = 0;

// ---------------------------
//   CREATING ALL THE STUFF
// ---------------------------

function createTitle(name, box) {
  const title = document.createElement("h2");
  title.id = `title-${name}`;
  title.hidden = true;
  title.textContent = name;
  box.appendChild(title);
}

function createImg(name, box) {
  const img = document.createElement("img");
  img.src = "../../media/images/" + name;
  img.loading = "lazy";
  img.id = `img-${name}`;
  img.onclick = () => displayImageInfos(name);
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
    createImg(image.title, box);
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
  if (window.matchMedia("(max-width: 600px)").matches) {
    return 2;
  } else if (window.matchMedia("(max-width: 900px)").matches) {
    return 3;
  } else if (window.matchMedia("(max-width: 1200px)").matches) {
    return 4;
  } else {
    return 5;
  }
}

function updateColumns() {
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
//    LOAD NEXT BATCH
// -----------------------

function loadNextBatch() {
  const start = currentBatch * batchSize;
  const end = start + batchSize;
  const imagesToLoad = imageList.slice(start, end);

  if (!imagesToLoad.length) return;

  createColumns(imagesToLoad, lastColumn);

  currentBatch++;

}

// ---------------
//    LAZY LOAD
// ---------------

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
//   INITIALISATION
// ------------------

window.addEventListener("resize", updateColumns);
updateColumns();
window.addEventListener("load", () => {
  setupInfiniteScroll();
});

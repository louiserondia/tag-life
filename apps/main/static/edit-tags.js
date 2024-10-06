import { getCookie } from "./get-cookie.js";
import { toggleSet } from "./utils.js";
import { createTagsContainer } from "../../../static/js/images.js";

let edit = false;
let checkedImages = new Set();
let tags = new Set();

function updateTagsContainers(images, tags) {
  images.forEach((image) => {
    const imageEl = document.getElementById(image);
    const box = imageEl.parentElement;

    createTagsContainer(image, box, tags);
  });
}

async function tryAddTagListToImageListRequest() {
  try {
    const response = await fetch(`/add_tag_list_to_image_list/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": getCookie("csrftoken"),
      },
      body: JSON.stringify({ tags: [...tags], images: [...checkedImages] }),
    });

    const data = await response.json();
    updateTagsContainers(data.images, data.tags); // doit utiliser autre chose que add new tag
    // parce que là j'ajoute à la liste de tags de tags-container pas à la liste
    // des tags a cocher

    if (!response.ok) throw new Error("Failed to add tags : ");
  } catch (error) {
    console.error(error);
  }
}

function checkImages(event) {
  if (edit) {
    const i = event.target;
    i.classList.toggle("selected");
    toggleSet(checkedImages, i.id);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const editButton = document.getElementById("edit");
  editButton.addEventListener("click", function () {
    editButton.classList.toggle("off");
    editButton.classList.toggle("on");
    edit = !edit;
    if (!edit) {
      const activeTags = document.querySelectorAll(".tag-box.active");
      activeTags.forEach((t) => tags.add(t.id));
      tryAddTagListToImageListRequest();
      editButton.style.backgroundColor = "revert-layer";
      activeTags.forEach((t) => {
        t.classList.remove("active");
      });
    } else {
      const images = document.getElementById("images");
      images.addEventListener("click", checkImages);
      editButton.style.backgroundColor = "red";
    }
  });
});

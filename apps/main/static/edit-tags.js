import { getCookie } from "./get-cookie.js";
import { toggleSet } from "./utils.js";
import { addTagsToTagContainer } from "../../../static/js/images.js";

let edit = false;
let checkedImages = new Set();
let tags = new Set();

function updateTagsContainers(images, newTags) {
  images.forEach((image) => {
    const imageEl = document.getElementById(image);
    const ctn = imageEl.nextElementSibling;

    addTagsToTagContainer(newTags, ctn);
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
    updateTagsContainers(data.images, data.tags);

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
  function reset(e, activeTags) {
    e.style.backgroundColor = "revert-layer";
    activeTags.forEach((t) => {
      t.classList.remove("active");
    });
    checkedImages.clear();
    tags.clear();
  }

  const e = document.getElementById("edit");
  e.addEventListener("click", function () {
    edit = !edit;
    if (!edit) {
      const activeTags = document.querySelectorAll(".tag-box.active");

      activeTags.forEach((t) => tags.add(t.id));
      tryAddTagListToImageListRequest();
      reset(e, activeTags);
    } else {
      const i = document.getElementById("images");

      i.addEventListener("click", checkImages);
      e.style.backgroundColor = "red";
    }
  });
});

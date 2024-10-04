import { getCookie } from "./get_cookie.js";

let edit = false;
let checkedImages = new Set();
let tags = checkedTags; // récupérer les checked tags

function toggleSet(s, o) {
  if (s.has(o)) s.delete(o);
  else s.add(o);
}

function updateTags(tags, newTags) {
  tags.innerHTML = "";

  newTags.forEach((newTag) => {
    const tagElem = document.createElement("h3");
    tagElem.textContent = newTag;
    tags.appendChild(tagElem);
  });
}

async function tryAddTagListToImageListRequest(buttonClicked) {
  try {
    const response = await fetch(
      `/add_tag_list_to_image_list/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": getCookie("csrftoken"),
        },
        body: JSON.stringify({ tags: [...tags], images: [...checkedImages] }),
      }
    );

    if (!response.ok) throw new Error("Failed to add tags : ");
  } catch (error) {
    console.error(error);
  }
}

function checkImages(event) {
  const i = event.target;
  i.classList.toggle("selected");
  toggleSet(checkedImages, i.id);
}

document.addEventListener("DOMContentLoaded", () => {
  const editButton = document.getElementById("edit");
  editButton.addEventListener("click", function () {
    editButton.classList.toggle("off");
    editButton.classList.toggle("on");
    if (edit) {
      tryAddTagListToImageListRequest(this);
      editButton.style.backgroundColor = "inherit";
    } else {
      const images = document.getElementById("images");
      images.addEventListener("click", checkImages);
      editButton.style.backgroundColor = "red";
    }
    edit = !edit;
  });
});

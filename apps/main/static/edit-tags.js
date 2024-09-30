import { getCookie } from "./get_cookie.js";

let edit = false;
let images = [];
let tags = []; // récupérer les checked tags

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
    const response = await fetch(`/add_tag_list_to_image_list/${tags}/${images}/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": getCookie("csrftoken"),
      },
      body: JSON.stringify({ tags, images }),
    });

    if (!response.ok) throw new Error("Failed to add tag.s : ");

    const data = await response.json();
    const tags = buttonClicked.nextElementSibling;
    updateTags(tags, data.tags);
  } catch (error) {
    console.error(error);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const editButton = document.getElementById("edit");
  editButton.addEventListener("click", function () {
    edit = !edit;
    if (edit) 
        tryAddTagListToImageListRequest(this);
      else {
        //ajouter les images dans une liste et tags qui sont sélectionnés
      }
  });
});

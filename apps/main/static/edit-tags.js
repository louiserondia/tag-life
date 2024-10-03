import { getCookie } from "./get_cookie.js";

let edit = false;
let images = new Set();
let tags = checkedTags; // récupérer les checked tags

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
      `/add_tag_list_to_image_list/${tags}/${images}/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": getCookie("csrftoken"),
        },
        body: JSON.stringify({ tags, images }),
      }
    );

    if (!response.ok) throw new Error("Failed to add tag.s : ");

    const data = await response.json();
    // const tags = buttonClicked.nextElementSibling;
    // updateTags(tags, data.tags);
  } catch (error) {
    console.error(error);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const editButton = document.getElementById("edit");
  editButton.addEventListener("click", function () {
    if (edit) { // si on valide l'edit, on add les tags
      // console.log(images);
      tryAddTagListToImageListRequest(this);
      editButton.classList.toggle('off');
      editButton.classList.toggle('on');
      editButton.style.backgroundColor = 'inherit';
    }
    else {
      // maintenant il faut cocher les images, faire que ça affiche pas les infos quand edit on
      // dans images.js et ici ajouter à un set pour envoyer au backend
      editButton.classList.toggle('off');
      editButton.classList.toggle('on');
      editButton.style.backgroundColor = 'red';
    }
    edit = !edit;
  });
});

import { getCookie } from "./get_cookie.js";

function updateTags(tags, newTags) {
  tags.innerHTML = "";

  newTags.forEach((newTag) => {
    const tagElem = document.createElement("h3");
    tagElem.textContent = newTag;
    tags.appendChild(tagElem);
  });
}

async function tryAddRandomTagRequest(buttonClicked) {
  const imageId = buttonClicked.dataset.imageId;
  try {
    const response = await fetch(`/add_random_tag/${imageId}/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": getCookie("csrftoken"),
      },
      body: JSON.stringify({ imageId }),
    });

    if (!response.ok) throw new Error("Failed to add tag");

    const data = await response.json();
    const tags = buttonClicked.nextElementSibling;
    updateTags(tags, data.tags);
    console.log(buttonClicked.nextElementSibling);
  } catch (error) {
    console.error("Error adding random tag:", error);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const buttons = document.querySelectorAll(".add-random-tag-button");

  buttons.forEach((button) => {
    button.addEventListener("click", function () {
      tryAddRandomTagRequest(this);
    });
  });
});
import { getCookie } from "./get-cookie.js";
import { updateTagList } from "../../../static/js/tags.js";


async function tryAddNewTagRequest() {
  const input = document.getElementById("add-new-tag-input");
  if (!input) return;
  try {
    const response = await fetch(`/add_new_tag/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": getCookie("csrftoken"),
      },
      body: JSON.stringify({ tag: input.value }),
    });

    if (!response.ok) throw new Error("Failed to add tag");

    const data = await response.json();
    updateTagList(data.tag);
    input.value = "";

    const event = new CustomEvent("tagAdded", { detail: { tag: data.tag } });
    document.dispatchEvent(event);
  } catch (error) {
    console.error("Error adding new tag:", error);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const button = document.getElementById("add-new-tag-button");

  button.addEventListener("click", function () {
    tryAddNewTagRequest();
  });
});

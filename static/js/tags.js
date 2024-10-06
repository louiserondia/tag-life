let tagBoxes;
export let checkedTags = new Set();
import { edit, updateImagesAndUrl } from "./images.js";

document.addEventListener("load", () => {
  const tags = document.querySelectorAll(".tax-box.active");
  tags.forEach((tag) => {
    checkedTags.add(tag);
  });
});

function addEventToCheckedTags(tag) {
  tag.addEventListener("click", function () {
    tag.classList.toggle("active");
    const content = tag.id;
    if (checkedTags.has(content)) {
      checkedTags.delete(content);
    } else {
      checkedTags.add(content);
    }
    if (!edit) updateImagesAndUrl();
  });
}

document.addEventListener("DOMContentLoaded", function () {
  tagBoxes = document.querySelectorAll(".tag-box");

  tagBoxes.forEach(function (box) {
    addEventToCheckedTags(box);
  });
});

export function updateTagList(newTag) {
  tagBoxes = document.querySelectorAll(".tag-box");
  const tagsGrid = document.getElementById("tags-grid");

  const tag = document.createElement("div");
  tag.textContent = newTag;
  tag.classList.add("tag-box");
  if (tagsGrid.classList.contains("dark-mode")) {
    tag.classList.add("dark-mode");
  }
  tag.id = newTag;
  tagsGrid.appendChild(tag);
  addEventToCheckedTags(tag);
}

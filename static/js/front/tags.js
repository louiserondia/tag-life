let tagBoxes;
export let checkedTags = new Set();
export let editCheckedTags = new Set();
import { edit, updateImagesAndUrl } from "./images.js";

document.addEventListener("DOMContentLoaded", () => {
  const tags = document.querySelectorAll(".tag-box.active");
  
   tags.forEach((tag) => {
    checkedTags.add(tag.id);
  });
});
  
  // Adds an event listener to tag we checked and toggles it
  function addEventToCheckedTags(tag) {
    tag.addEventListener("click", function () {
      tag.classList.toggle("active");
      const content = tag.id;
      if (edit) {
        if (editCheckedTags.has(content)) {
       editCheckedTags.delete(content);
      } else {
        editCheckedTags.add(content);
      }
    }
    else {
      if (checkedTags.has(content)) {
        checkedTags.delete(content);
      } else {
        checkedTags.add(content);
      }
      updateImagesAndUrl();
    }
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

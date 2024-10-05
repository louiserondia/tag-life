// import { createTagsContainer } from "../../../static/js/images";

export function updateTagsContainers(images, tags) {
  images.forEach((image) => {
    const imageEl = document.getElementById(image);
    const box = imageEl.parentElement;

    // createTagsContainer(image, box, tags);
  });
}


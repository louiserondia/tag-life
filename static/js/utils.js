function displayImageInfos(id) {
    const title = document.getElementById("title-" + id);
    title.toggleAttribute("hidden");
    const tags = document.getElementById("tags-" + id);
    tags.toggleAttribute("hidden");
  }
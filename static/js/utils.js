function displayImageInfos(id) {
    const title = document.getElementById("title-" + id);
    const img = document.getElementById("img-" + id);
    console.log(title)
    // console.log(id)
    // console.log(img)
    title.toggleAttribute("hidden");
    const tags = document.getElementById("tags-" + id);
    tags.toggleAttribute("hidden");
  }
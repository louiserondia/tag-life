document.addEventListener("DOMContentLoaded", function () {
  window.scroll(0, window.innerHeight / 3);

  function parallax(element, ratio, tx, sign) {
    const sy = window.scrollY;
    const start = document
      .getElementById("title")
      .getBoundingClientRect().bottom;
    const ty = Math.abs(sy - start) * ratio;
    element.style.transform = `translate(${tx}, ${sign}${ty}px)`;
  }

  function updateTitlePosition() {
    const part1 = document.getElementById("part1");
    const part3 = document.getElementById("images");
    parallax(part1, 0.2, "0", "+");
    parallax(part3, 0.2, "0", "-");
  }

  // window.addEventListener("scroll", updateTitlePosition);
  // updateTitlePosition();
});

document.addEventListener("DOMContentLoaded", function () {
  const tagBoxes = document.querySelectorAll(".tag-box");

  tagBoxes.forEach(function (box) {
    box.addEventListener("click", function () {
      box.classList.toggle("active");
      const content = box.id;
      console.log(content);
      if (tagsChecked.has(content)) {
        tagsChecked.delete(content);
      } else {
        tagsChecked.add(content);
      }
      refresh();
    });
  });
});

function refresh() {
  const clientUrl = new URL("/", window.location.origin)
  const url = new URL("/api/images/", window.location.origin)
  for (const tag of tagsChecked) {
    if (tag.length === 0) continue
    url.searchParams.append("tag", tag)
    clientUrl.searchParams.append("tag", tag)
  }
  window.history.pushState({}, "", clientUrl)
  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      resetEverything();
      imageList = data.images;
      updateColumns();
    })
    .catch((error) => {
      console.error("error quand je fetch les images : " + error);
    });
}
